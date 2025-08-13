const { BonusRule } = require('../models');

// 보너스 규칙 목록 조회
exports.getBonusRules = async (req, res) => {
  try {
    const bonusRules = await BonusRule.findAll({
      order: [['id', 'ASC']],
    });

    res.json(bonusRules);
  } catch (error) {
    console.error('보너스 규칙 조회 오류:', error);
    res.status(500).json({ error: '보너스 규칙 조회 중 오류가 발생했습니다.' });
  }
};

// 트레이너의 월별 보너스 계산
exports.calculateTrainerBonus = async (req, res) => {
  try {
    const { trainerId, year, month } = req.params;

    if (!trainerId || !year || !month) {
      return res.status(400).json({ error: '트레이너 ID, 년도, 월이 필요합니다.' });
    }

    // 해당 월의 결제 데이터 조회 (Payment 모델 필요)
    const { Payment } = require('../models');
    const { Op } = require('sequelize');

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const payments = await Payment.findAll({
      where: {
        trainer_id: trainerId,
        payment_date: {
          [Op.between]: [startDate, endDate],
        },
      },
      include: [
        {
          model: require('../models').Member,
          as: 'member',
          attributes: ['name'],
        },
      ],
      order: [['payment_date', 'ASC']],
    });

    // 보너스 규칙 조회
    const bonusRules = await BonusRule.findAll({
      order: [['id', 'ASC']],
    });

    // 보너스 계산 로직
    const bonusCalculation = calculateBonus(payments, bonusRules, year, month);

    res.json(bonusCalculation);
  } catch (error) {
    console.error('보너스 계산 오류:', error);
    res.status(500).json({ error: '보너스 계산 중 오류가 발생했습니다.' });
  }
};

// 보너스 계산 함수
function calculateBonus(payments, bonusRules, year, month) {
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
}
