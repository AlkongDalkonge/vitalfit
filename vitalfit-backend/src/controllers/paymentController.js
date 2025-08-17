const Joi = require('joi');
const { Payment, Member, User, Center } = require('../models');

// 결제 생성 스키마
const createPaymentSchema = Joi.object({
  member_id: Joi.number().integer().positive().required(),
  trainer_id: Joi.number().integer().positive().required(),
  center_id: Joi.number().integer().positive().required(),
  payment_amount: Joi.number().integer().positive().required(),
  pt_type: Joi.string().max(50).optional(),
  session_count: Joi.number().integer().positive().required(),
  free_session_count: Joi.number().integer().min(0).default(0),
  payment_date: Joi.date().required(),
  payment_method: Joi.string().max(50).required(),
  notes: Joi.string().optional(),
});

// 결제 생성
const createPayment = async (req, res) => {
  const { error, value } = createPaymentSchema.validate(req.body);

  if (error) {
    return res.status(400).json({
      success: false,
      message: '입력값이 올바르지 않습니다.',
      details: error.details[0].message,
    });
  }

  try {
    const {
      member_id,
      trainer_id,
      center_id,
      payment_amount,
      pt_type,
      session_count,
      free_session_count,
      payment_date,
      payment_method,
      notes,
    } = value;

    // member_id 유효성 검증
    const member = await Member.findByPk(member_id);
    if (!member) {
      return res.status(404).json({
        success: false,
        message: '존재하지 않는 멤버입니다.',
      });
    }

    // trainer_id 유효성 검증
    const trainer = await User.findByPk(trainer_id);
    if (!trainer) {
      return res.status(404).json({
        success: false,
        message: '존재하지 않는 트레이너입니다.',
      });
    }

    // center_id 유효성 검증
    const center = await Center.findByPk(center_id);
    if (!center) {
      return res.status(404).json({
        success: false,
        message: '존재하지 않는 센터입니다.',
      });
    }

    // 결제 생성
    const payment = await Payment.create({
      member_id,
      trainer_id,
      center_id,
      payment_amount,
      pt_type,
      session_count,
      free_session_count,
      payment_date,
      payment_method,
      notes,
    });

    // 멤버의 잔여 세션 수 업데이트
    const totalSessions = session_count + free_session_count;
    await member.update({
      remaining_sessions: (member.remaining_sessions || 0) + totalSessions,
    });

    return res.status(201).json({
      success: true,
      message: '결제가 성공적으로 등록되었습니다.',
      data: payment,
    });
  } catch (error) {
    console.error('결제 생성 오류:', error);
    return res.status(500).json({
      success: false,
      message: '결제 등록 중 오류가 발생했습니다.',
    });
  }
};

// 결제 조회
const getPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const payment = await Payment.findByPk(id, {
      include: [
        { model: Member, as: 'member' },
        { model: User, as: 'trainer' },
        { model: Center, as: 'center' },
      ],
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: '결제 정보를 찾을 수 없습니다.',
      });
    }

    return res.status(200).json({
      success: true,
      message: '결제 정보 조회 성공',
      data: payment,
    });
  } catch (error) {
    console.error('결제 조회 오류:', error);
    return res.status(500).json({
      success: false,
      message: '결제 조회 중 오류가 발생했습니다.',
    });
  }
};

// 결제 목록 조회
const getAllPayments = async (req, res) => {
  try {
    const { page = 1, limit = 10, member_id, trainer_id, center_id } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (member_id) where.member_id = member_id;
    if (trainer_id) where.trainer_id = trainer_id;
    if (center_id) where.center_id = center_id;

    const { count, rows: payments } = await Payment.findAndCountAll({
      where,
      include: [
        { model: Member, as: 'member' },
        { model: User, as: 'trainer' },
        { model: Center, as: 'center' },
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    return res.status(200).json({
      success: true,
      message: '결제 목록 조회 성공',
      data: {
        payments,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit),
        },
      },
    });
  } catch (error) {
    console.error('결제 목록 조회 오류:', error);
    return res.status(500).json({
      success: false,
      message: '결제 목록 조회 중 오류가 발생했습니다.',
    });
  }
};

// 결제 수정
const updatePayment = async (req, res) => {
  const { error, value } = createPaymentSchema.validate(req.body);

  if (error) {
    return res.status(400).json({
      success: false,
      message: '입력값이 올바르지 않습니다.',
      details: error.details[0].message,
    });
  }

  try {
    const { id } = req.params;
    const {
      member_id,
      trainer_id,
      center_id,
      payment_amount,
      pt_type,
      session_count,
      free_session_count,
      payment_date,
      payment_method,
      notes,
    } = value;

    const payment = await Payment.findByPk(id);
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: '결제 정보를 찾을 수 없습니다.',
      });
    }

    // member_id 유효성 검증
    const member = await Member.findByPk(member_id);
    if (!member) {
      return res.status(404).json({
        success: false,
        message: '존재하지 않는 멤버입니다.',
      });
    }

    // trainer_id 유효성 검증
    const trainer = await User.findByPk(trainer_id);
    if (!trainer) {
      return res.status(404).json({
        success: false,
        message: '존재하지 않는 트레이너입니다.',
      });
    }

    // center_id 유효성 검증
    const center = await Center.findByPk(center_id);
    if (!center) {
      return res.status(404).json({
        success: false,
        message: '존재하지 않는 센터입니다.',
      });
    }

    // 기존 세션 수와 새로운 세션 수의 차이를 계산
    const oldTotalSessions = payment.session_count + payment.free_session_count;
    const newTotalSessions = session_count + free_session_count;
    const sessionDifference = newTotalSessions - oldTotalSessions;

    // 결제 정보 업데이트
    await payment.update({
      member_id,
      trainer_id,
      center_id,
      payment_amount,
      pt_type,
      session_count,
      free_session_count,
      payment_date,
      payment_method,
      notes,
    });

    // 멤버의 잔여 세션 수 업데이트
    if (sessionDifference !== 0) {
      await member.update({
        remaining_sessions: (member.remaining_sessions || 0) + sessionDifference,
      });
    }

    return res.status(200).json({
      success: true,
      message: '결제 정보가 성공적으로 수정되었습니다.',
      data: payment,
    });
  } catch (error) {
    console.error('결제 수정 오류:', error);
    return res.status(500).json({
      success: false,
      message: '결제 수정 중 오류가 발생했습니다.',
    });
  }
};

// 결제 삭제
const deletePayment = async (req, res) => {
  try {
    const { id } = req.params;
    const payment = await Payment.findByPk(id);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: '결제 정보를 찾을 수 없습니다.',
      });
    }

    // 멤버의 잔여 세션 수 차감
    const member = await Member.findByPk(payment.member_id);
    if (member) {
      const totalSessions = payment.session_count + payment.free_session_count;
      await member.update({
        remaining_sessions: Math.max(0, (member.remaining_sessions || 0) - totalSessions),
      });
    }

    await payment.destroy();

    return res.status(200).json({
      success: true,
      message: '결제가 성공적으로 삭제되었습니다.',
    });
  } catch (error) {
    console.error('결제 삭제 오류:', error);
    return res.status(500).json({
      success: false,
      message: '결제 삭제 중 오류가 발생했습니다.',
    });
  }
};

// 멤버별 결제 내역 조회
const getMemberPayments = async (req, res) => {
  try {
    const memberId = parseInt(req.params.id, 10);

    if (!memberId) {
      return res.status(400).json({
        success: false,
        message: 'member_id 파라미터가 필요합니다.',
      });
    }

    const payments = await Payment.findAll({
      where: {
        member_id: memberId,
      },
      include: [
        {
          model: Member,
          as: 'member',
          attributes: ['id', 'name', 'phone'],
        },
        {
          model: User,
          as: 'trainer',
          attributes: ['id', 'name', 'nickname'],
        },
        {
          model: Center,
          as: 'center',
          attributes: ['id', 'name', 'address'],
        },
      ],
      order: [['payment_date', 'DESC']],
    });

    return res.json({
      success: true,
      message: '멤버별 결제 내역을 성공적으로 조회했습니다.',
      data: {
        payments,
        total: payments.length,
      },
    });
  } catch (err) {
    console.error('멤버별 결제 조회 실패:', err);
    return res.status(500).json({
      success: false,
      message: '멤버별 결제 조회 중 오류가 발생했습니다.',
    });
  }
};

// 트레이너별 월별 결제 조회
const getPaymentsByTrainerAndMonth = async (req, res) => {
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

    // 해당 월의 시작/종료 날짜
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59, 999);

    const { Op } = require('sequelize');
    const payments = await Payment.findAll({
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

    const result = payments.map(payment => ({
      id: payment.id,
      member_id: payment.member_id,
      member_name: payment.member?.name ?? '',
      pt_type: payment.notes || 'PT 결제',
      payment_amount: payment.payment_amount,
      payment_date: payment.payment_date,
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

// 트레이너 기본급 조회
const getTrainerSalary = async (req, res) => {
  try {
    const trainerId = parseInt(req.query.trainer_id, 10);

    if (!trainerId) {
      return res.status(400).json({
        success: false,
        message: 'trainer_id 파라미터가 필요합니다.',
      });
    }

    const { Position } = require('../models');
    
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

module.exports = {
  createPayment,
  getPayment,
  getAllPayments,
  updatePayment,
  deletePayment,
  getMemberPayments,
  getPaymentsByTrainerAndMonth,
  getTrainerSalary,
};
