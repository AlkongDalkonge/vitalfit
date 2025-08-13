const { Op } = require('sequelize');
const { Payment, Member, User, Position, MonthlySettlement } = require('../models');

/**
 * GET /api/payments?trainer_id=1&year=2024&month=07
 * - trainer_id: 필수
 * - year, month: 필수 (YYYY, MM)
 * 반환: [{ id, member_id, member_name, pt_type, payment_amount, payment_date }]
 */
exports.getPaymentsByTrainerAndMonth = async (req, res) => {
  try {
    const trainerId = parseInt(req.query.trainer_id, 10);
    const year = parseInt(req.query.year, 10);
    const month = parseInt(req.query.month, 10);

    if (!trainerId || !year || !month) {
      return res.status(400).json({
        success: false,
        message: 'trainer_id, year, month 파라미터가 필요합니다.',
      });
    }

    // 해당 월의 시작/종료 날짜 (로컬기준)
    const start = new Date(year, month - 1, 1); // YYYY-MM-01 00:00:00
    const end = new Date(year, month, 0, 23, 59, 59, 999); // YYYY-MM-마지막일 23:59:59

    const rows = await Payment.findAll({
      where: {
        trainer_id: trainerId,
        payment_date: { [Op.between]: [start, end] },
      },
      include: [
        {
          model: Member,
          as: 'member',
          attributes: ['id', 'name'],
        },
      ],
      order: [
        ['payment_date', 'ASC'],
        ['id', 'ASC'],
      ],
    });

    // 표에 필요한 최소 필드로 매핑
    const result = rows.map(r => ({
      id: r.id,
      member_id: r.member_id,
      member_name: r.member?.name ?? '',
      pt_type: r.notes || 'PT 결제',
      payment_amount: r.payment_amount,
      payment_date: r.payment_date,
    }));

    return res.json({ success: true, data: result });
  } catch (err) {
    console.error('결제 조회 실패:', err);
    return res.status(500).json({
      success: false,
      message: '결제 조회 중 오류가 발생했습니다.',
    });
  }
};

/**
 * GET /api/payments/carryover?trainer_id=1&year=2024&month=07
 * - trainer_id: 필수
 * - year, month: 필수 (YYYY, MM)
 * - 이전 달의 이월매출(carryover_from_prev) 조회
 * 반환: { carryover_amount: number }
 */
exports.getCarryoverAmount = async (req, res) => {
  try {
    const trainerId = parseInt(req.query.trainer_id, 10);
    const year = parseInt(req.query.year, 10);
    const month = parseInt(req.query.month, 10);

    if (!trainerId || !year || !month) {
      return res.status(400).json({
        success: false,
        message: 'trainer_id, year, month 파라미터가 필요합니다.',
      });
    }

    // 이전 달 계산
    let prevYear = year;
    let prevMonth = month - 1;

    if (prevMonth === 0) {
      prevMonth = 12;
      prevYear = year - 1;
    }

    // 이전 달의 정산 데이터 조회
    const prevMonthSettlement = await MonthlySettlement.findOne({
      where: {
        user_id: trainerId,
        settlement_year: prevYear,
        settlement_month: prevMonth,
      },
      attributes: ['carryover_from_prev'],
    });

    // 이월매출이 없으면 0원 반환
    const carryoverAmount = prevMonthSettlement?.carryover_from_prev || 0;

    return res.json({
      success: true,
      data: {
        carryover_amount: carryoverAmount,
        prev_year: prevYear,
        prev_month: prevMonth,
      },
    });
  } catch (err) {
    console.error('이월매출 조회 실패:', err);
    return res.status(500).json({
      success: false,
      message: '이월매출 조회 중 오류가 발생했습니다.',
    });
  }
};

/**
 * GET /api/payments/trainer-salary?trainer_id=1
 * - trainer_id: 필수
 * - 트레이너의 기본급 정보 조회
 * 반환: { trainer_id, trainer_name, position_name, base_salary }
 */
exports.getTrainerSalary = async (req, res) => {
  try {
    const trainerId = parseInt(req.query.trainer_id, 10);

    if (!trainerId) {
      return res.status(400).json({
        success: false,
        message: 'trainer_id 파라미터가 필요합니다.',
      });
    }

    // 트레이너 정보와 직급 정보를 함께 조회
    const trainer = await User.findByPk(trainerId, {
      include: [
        {
          model: Position,
          as: 'position',
          attributes: ['id', 'name', 'base_salary'],
        },
      ],
      attributes: ['id', 'name'],
    });

    if (!trainer) {
      return res.status(404).json({
        success: false,
        message: '존재하지 않는 트레이너입니다.',
      });
    }

    const result = {
      trainer_id: trainer.id,
      trainer_name: trainer.name,
      position_name: trainer.position?.name || '',
      base_salary: trainer.position?.base_salary || 0,
    };

    return res.json({ success: true, data: result });
  } catch (err) {
    console.error('트레이너 기본급 조회 실패:', err);
    return res.status(500).json({
      success: false,
      message: '트레이너 기본급 조회 중 오류가 발생했습니다.',
    });
  }
};
