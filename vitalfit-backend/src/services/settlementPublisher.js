// src/services/settlementPublisher.js
const dayjs = require('dayjs');
const { Op, fn, col } = require('sequelize');
const {
  sequelize,
  MonthlySettlement,
  Payment,
  PTSession,
  User,
  Position,
  CommissionRate,
  BonusRule,
  Team,
  JobRun,
} = require('../models');

/**
 * payments 테이블 실제 컬럼명이 아래 기본값과 다르면 .env로 지정하세요.
 *   PAYMENT_USER_COL=trainer_id
 *   PAYMENT_CENTER_COL=center_id
 *   PAYMENT_DATE_COL=payment_date      // 결제일자 컬럼
 *   PAYMENT_AMOUNT_COL=payment_amount  // 결제금액 컬럼
 */
const USER_COL = process.env.PAYMENT_USER_COL || 'trainer_id';
const CENTER_COL = process.env.PAYMENT_CENTER_COL || 'center_id';
const DATE_COL = process.env.PAYMENT_DATE_COL || 'payment_date';
const AMOUNT_COL = process.env.PAYMENT_AMOUNT_COL || 'payment_amount'; // 기본은 payment_amount

/** 입력이 없으면 지난달 'YYYY-MM' */
function resolveTargetPeriodYm(inputYm) {
  if (inputYm) return inputYm; // 'YYYY-MM'
  return dayjs().subtract(1, 'month').format('YYYY-MM');
}

/** 월 범위: [해당월 1일 00:00, 다음달 1일 00:00) */
function monthRange(periodYm) {
  const start = dayjs(`${periodYm}-01`).startOf('month');
  const end = start.add(1, 'month'); // 배타 upper-bound
  return { start: start.toDate(), end: end.toDate() };
}

/** 전월 이월금(remaining_amount) 조회 */
async function getPrevCarryover(userId, prevYm, t) {
  const prev = await MonthlySettlement.findOne({
    where: {
      user_id: userId,
      settlement_year: Number(prevYm.slice(0, 4)),
      settlement_month: Number(prevYm.slice(5, 7)),
    },
    transaction: t,
  });
  return prev?.remaining_amount || 0;
}

/** 보너스 계산 함수 */
async function calculateTrainerBonus(payments, year, month, t) {
  try {
    // 보너스 규칙 조회
    const bonusRules = await BonusRule.findAll({
      order: [['id', 'ASC']],
      transaction: t,
    });

    let totalBonus = 0;
    const bonusDetails = [];

    // 일별 매출 계산
    const dailyRevenue = {};
    payments.forEach(payment => {
      const date = new Date(payment.payment_date);
      const dateKey = date.toISOString().split('T')[0];
      dailyRevenue[dateKey] = (dailyRevenue[dateKey] || 0) + payment.payment_amount;
    });

    // 주별 매출 계산 (월의 첫 주부터 마지막 주까지)
    const weeklyRevenue = {};
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);

    let currentWeek = 1;
    let weekStart = new Date(firstDay);

    while (weekStart <= lastDay) {
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);

      let weekTotal = 0;
      Object.keys(dailyRevenue).forEach(dateKey => {
        const date = new Date(dateKey);
        if (date >= weekStart && date <= weekEnd) {
          weekTotal += dailyRevenue[dateKey];
        }
      });

      weeklyRevenue[currentWeek] = weekTotal;
      currentWeek++;
      weekStart.setDate(weekStart.getDate() + 7);
    }

    // 보너스 규칙 적용
    bonusRules.forEach(rule => {
      let achieved = false;
      let bonusAmount = 0;

      if (rule.target_type === 'daily') {
        // 일별 보너스 체크
        Object.values(dailyRevenue).forEach(dailyAmount => {
          if (dailyAmount >= rule.threshold_amount) {
            achieved = true;
            bonusAmount = rule.bonus_amount;
          }
        });
      } else if (rule.target_type === 'weekly') {
        // 주별 보너스 체크
        let weeklyAchievementCount = 0;

        Object.values(weeklyRevenue).forEach(weeklyAmount => {
          if (weeklyAmount >= rule.threshold_amount) {
            weeklyAchievementCount++;
          }
        });

        // before_11days 체크
        if (rule.before_11days === 'Y') {
          // 11일 이전까지의 주별 달성 횟수만 계산
          const eleventhDay = new Date(year, month - 1, 11);
          let earlyWeeklyAchievementCount = 0;

          Object.keys(weeklyRevenue).forEach(weekNum => {
            const weekStart = new Date(firstDay);
            weekStart.setDate(weekStart.getDate() + (parseInt(weekNum) - 1) * 7);

            if (weekStart <= eleventhDay && weeklyRevenue[weekNum] >= rule.threshold_amount) {
              earlyWeeklyAchievementCount++;
            }
          });

          if (earlyWeeklyAchievementCount >= rule.achievement_count) {
            achieved = true;
            bonusAmount = rule.bonus_amount;
          }
        } else {
          // 전체 월 기준
          if (weeklyAchievementCount >= rule.achievement_count) {
            achieved = true;
            bonusAmount = rule.bonus_amount;
          }
        }
      }

      if (achieved) {
        totalBonus += bonusAmount;
        bonusDetails.push({
          rule_id: rule.id,
          rule_name: rule.name,
          bonus_amount: bonusAmount,
          target_type: rule.target_type,
          threshold_amount: rule.threshold_amount,
          achievement_count: rule.achievement_count,
          before_11days: rule.before_11days,
        });
      }
    });

    return {
      total_bonus: totalBonus,
      bonus_details: bonusDetails,
      daily_revenue: dailyRevenue,
      weekly_revenue: weeklyRevenue,
    };
  } catch (error) {
    console.error('보너스 계산 오류:', error);
    return {
      total_bonus: 0,
      bonus_details: [],
      daily_revenue: {},
      weekly_revenue: {},
    };
  }
}

/** PT 세션 통계 조회 */
async function getPTSessionStats(userId, year, month, t) {
  try {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const ptSessions = await PTSession.findAll({
      where: {
        trainer_id: userId,
        session_date: {
          [Op.between]: [startDate, endDate],
        },
      },
      attributes: ['id', 'session_date', 'start_time', 'end_time', 'session_type'],
      transaction: t,
    });

    const totalSessions = ptSessions.length;
    const regularSessions = ptSessions.filter(session => session.session_type === 'regular').length;
    const freeSessions = ptSessions.filter(session => session.session_type === 'free').length;

    return {
      total_sessions: totalSessions,
      regular_sessions: regularSessions,
      free_sessions: freeSessions,
    };
  } catch (error) {
    console.error('PT 세션 통계 조회 오류:', error);
    return {
      total_sessions: 0,
      regular_sessions: 0,
      free_sessions: 0,
    };
  }
}

/** 커미션 정책 조회 */
async function getCommissionRate(totalRevenue, positionId, centerId, t) {
  try {
    const whereClause = {
      min_revenue: {
        [Op.lte]: totalRevenue,
      },
      max_revenue: {
        [Op.or]: [{ [Op.gte]: totalRevenue }, { [Op.is]: null }],
      },
      is_active: true,
    };

    if (positionId) {
      whereClause.position_id = {
        [Op.or]: [positionId, null],
      };
    }

    if (centerId) {
      whereClause.center_id = {
        [Op.or]: [centerId, null],
      };
    }

    const commissionRate = await CommissionRate.findOne({
      where: whereClause,
      order: [['min_revenue', 'DESC']],
      transaction: t,
    });

    return commissionRate;
  } catch (error) {
    console.error('커미션 정책 조회 오류:', error);
    return null;
  }
}

/** 팀 PT 인센티브 계산 (팀장인 경우) */
async function calculateTeamPTIncentive(userId, year, month, t) {
  try {
    // 사용자가 팀장인지 확인
    const user = await User.findByPk(userId, {
      include: [
        {
          model: Position,
          as: 'position',
          attributes: ['id', 'name'],
        },
      ],
      transaction: t,
    });

    if (!user || user.position_id !== 7) {
      // 직급 ID 7이 팀장이라고 가정
      return 0;
    }

    // 팀장이 속한 팀 찾기
    const team = await Team.findOne({
      where: { leader_id: userId },
      include: [
        {
          model: User,
          as: 'members',
          attributes: ['id'],
        },
      ],
      transaction: t,
    });

    if (!team) {
      return 0;
    }

    // 팀원들의 ID 수집 (팀장 제외)
    const teamMemberIds = team.members ? team.members.map(member => member.id) : [];

    if (teamMemberIds.length === 0) {
      return 0;
    }

    // 해당 월의 팀원들 매출 계산
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const teamPayments = await Payment.findAll({
      where: {
        trainer_id: {
          [Op.in]: teamMemberIds,
        },
        payment_date: {
          [Op.between]: [startDate, endDate],
        },
      },
      transaction: t,
    });

    const teamTotalRevenue = teamPayments.reduce((sum, payment) => sum + payment.payment_amount, 0);

    // 팀 PT 인센티브는 팀원 매출의 5%
    return Math.round(teamTotalRevenue * 0.05);
  } catch (error) {
    console.error('팀 PT 인센티브 계산 오류:', error);
    return 0;
  }
}

/** 정산 수치 계산 */
async function calcNumbers({
  actual_revenue,
  carryover_from_prev,
  user_id,
  center_id,
  payments,
  year,
  month,
  t,
}) {
  const total_revenue = (actual_revenue || 0) + (carryover_from_prev || 0);
  const settlement_revenue = Math.min(total_revenue, 10_000_000); // 1,000만 한도
  const remaining_amount = total_revenue - settlement_revenue;

  try {
    // 사용자 정보 조회 (기본급, 직급 정보)
    const user = await User.findByPk(user_id, {
      include: [
        {
          model: Position,
          as: 'position',
          attributes: ['id', 'name', 'base_salary'],
        },
      ],
      transaction: t,
    });

    const base_salary = user?.position?.base_salary || 0;

    // PT 세션 통계 조회
    const ptStats = await getPTSessionStats(user_id, year, month, t);
    const regular_pt_count = ptStats.regular_sessions;
    const free_pt_count = ptStats.free_sessions;

    // 커미션 정책 조회
    const commissionRate = await getCommissionRate(total_revenue, user?.position_id, center_id, t);
    const commission_per_session = commissionRate?.commission_per_session || 0;
    const monthly_commission = commissionRate?.monthly_commission || 0;

    // PT 수수료 계산 (정상PT * 시간당수업료 + 이벤트PT * 10,000원)
    const regular_pt_revenue = regular_pt_count * commission_per_session;
    const free_pt_revenue = free_pt_count * 10000;
    const pt_commission_total = regular_pt_revenue + free_pt_revenue;

    // 보너스 계산
    const bonusData = await calculateTrainerBonus(payments, year, month, t);
    const bonus = bonusData.total_bonus;

    // 팀 PT 인센티브 계산 (팀장인 경우만)
    const team_pt_incentive = await calculateTeamPTIncentive(user_id, year, month, t);

    // 총 정산금액 계산
    const total_settlement =
      base_salary + pt_commission_total + monthly_commission + team_pt_incentive + bonus;

    return {
      total_revenue,
      settlement_revenue,
      remaining_amount,
      base_salary,
      regular_pt_count,
      free_pt_count,
      pt_commission_total,
      monthly_commission,
      team_pt_incentive,
      bonus,
      total_settlement,
    };
  } catch (error) {
    console.error('정산 계산 오류:', error);
    // 오류 발생 시 기본값 반환
    return {
      total_revenue,
      settlement_revenue,
      remaining_amount,
      base_salary: 0,
      regular_pt_count: 0,
      free_pt_count: 0,
      pt_commission_total: 0,
      monthly_commission: 0,
      team_pt_incentive: 0,
      bonus: 0,
      total_settlement: 0,
    };
  }
}

/**
 * 지난달(or 지정 월) 직원별 매출을 집계해 monthly_settlements에 업서트
 * @param {string|null} inputYm 'YYYY-MM' 또는 null(지난달)
 * @returns { periodYm, upserted, jobRunId }
 */
async function publishMonthlySettlements(inputYm) {
  const periodYm = resolveTargetPeriodYm(inputYm);
  const year = Number(periodYm.slice(0, 4));
  const month = Number(periodYm.slice(5, 7));
  const prevYm = dayjs(`${periodYm}-01`).subtract(1, 'month').format('YYYY-MM');
  const { start, end } = monthRange(periodYm);

  // 중복 실행 체크 (running 또는 completed 상태)
  const existingJob = await JobRun.findOne({
    where: {
      job_name: 'monthly_settlement_publish',
      target_period: periodYm,
      status: ['running', 'completed'],
    },
  });

  if (existingJob) {
    console.log(`[settlementPublisher] 이미 실행 중인 배치: ${periodYm}`);

    // 기존 running 상태를 skipped로 업데이트
    await existingJob.update({
      status: 'skipped',
      completed_at: new Date(),
      notes: '중복 실행으로 인한 스킵',
    });

    return { periodYm, upserted: 0, jobRunId: existingJob.id, status: 'skipped' };
  }

  // JobRun 레코드 생성
  const jobRun = await JobRun.create({
    job_name: 'monthly_settlement_publish',
    target_period: periodYm,
    status: 'running',
  });

  const startTime = Date.now();

  try {
    const result = await sequelize.transaction(async t => {
      // 1) 지난달 직원별 매출 집계
      const paymentsGrouped = await Payment.findAll({
        attributes: [
          [col(USER_COL), 'user_id'], // 예: trainer_id → user_id 별칭
          [col(CENTER_COL), 'center_id'], // 예: center_id
          [fn('COALESCE', fn('SUM', col(AMOUNT_COL)), 0), 'actual_revenue'], // 금액 컬럼 교체
        ],
        where: {
          [DATE_COL]: { [Op.gte]: start, [Op.lt]: end },
        },
        group: [USER_COL, CENTER_COL],
        transaction: t,
      });

      let upserted = 0;

      // 2) 집계 결과 기반 업서트
      for (const row of paymentsGrouped) {
        const user_id = Number(row.get('user_id'));
        const center_id = Number(row.get('center_id'));
        const actual_revenue = Number(row.get('actual_revenue') || 0);

        // 해당 트레이너의 모든 결제 데이터 조회 (보너스 계산용)
        const trainerPayments = await Payment.findAll({
          where: {
            [USER_COL]: user_id,
            [DATE_COL]: { [Op.gte]: start, [Op.lt]: end },
          },
          attributes: ['payment_amount', 'payment_date'],
          transaction: t,
        });

        const carryover_from_prev = await getPrevCarryover(user_id, prevYm, t);

        // 실제 정산 계산 로직 호출
        const numbers = await calcNumbers({
          actual_revenue,
          carryover_from_prev,
          user_id,
          center_id,
          payments: trainerPayments,
          year,
          month,
          t,
        });

        const payload = {
          user_id,
          center_id,
          settlement_year: year,
          settlement_month: month,
          actual_revenue,
          carryover_from_prev,
          ...numbers,
          status: 'draft',
          notes: null,
        };

        await MonthlySettlement.upsert(payload, { transaction: t });
        upserted++;
      }

      // (옵션) 매출 0인 직원도 draft 생성하려면 Users 기준 0원 레코드 추가 로직을 여기에.

      return { periodYm, upserted };
    });

    // 성공 시 JobRun 업데이트
    const executionTime = Date.now() - startTime;
    await jobRun.update({
      status: 'completed',
      completed_at: new Date(),
      execution_time_ms: executionTime,
      records_processed: result.upserted,
    });

    console.log(
      `[settlementPublisher] 배치 완료: ${periodYm}, 처리: ${result.upserted}건, 소요시간: ${executionTime}ms`
    );
    return { ...result, jobRunId: jobRun.id, status: 'completed' };
  } catch (error) {
    // 실패 시 JobRun 업데이트
    const executionTime = Date.now() - startTime;
    await jobRun.update({
      status: 'failed',
      completed_at: new Date(),
      execution_time_ms: executionTime,
      error_message: error.message,
    });

    console.error(`[settlementPublisher] 배치 실패: ${periodYm}`, error);
    throw error;
  }
}

module.exports = { publishMonthlySettlements };
