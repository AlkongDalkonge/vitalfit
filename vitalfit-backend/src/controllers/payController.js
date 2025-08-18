const { Payment, Member, User, Center } = require('../models');
const Joi = require('joi');

// 결제 생성 스키마
const createPaymentSchema = Joi.object({
  member_id: Joi.number().integer().positive().required(),
  trainer_id: Joi.number().integer().positive().required(),
  center_id: Joi.number().integer().positive().required(),
  payment_amount: Joi.number().integer().positive().required(),
  pt_type: Joi.string().max(50).optional(),
  session_count: Joi.number().integer().positive().required(),
  free_session_count: Joi.number().integer().min(0).optional(),
  payment_date: Joi.date().required(),
  payment_method: Joi.string().max(50).required(),
  notes: Joi.string().optional(),
});

// 결제 수정 스키마
const updatePaymentSchema = Joi.object({
  member_id: Joi.number().integer().positive().optional(),
  trainer_id: Joi.number().integer().positive().optional(),
  center_id: Joi.number().integer().positive().optional(),
  payment_amount: Joi.number().integer().positive().optional(),
  pt_type: Joi.string().max(50).optional(),
  session_count: Joi.number().integer().positive().optional(),
  free_session_count: Joi.number().integer().min(0).optional(),
  payment_date: Joi.date().optional(),
  payment_method: Joi.string().max(50).optional(),
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

    // member_id, trainer_id, center_id 유효성 검증
    const member = await Member.findByPk(member_id);
    if (!member) {
      return res.status(400).json({
        success: false,
        message: '존재하지 않는 멤버입니다.',
      });
    }

    const trainer = await User.findByPk(trainer_id);
    if (!trainer) {
      return res.status(400).json({
        success: false,
        message: '존재하지 않는 트레이너입니다.',
      });
    }

    const center = await Center.findByPk(center_id);
    if (!center) {
      return res.status(400).json({
        success: false,
        message: '존재하지 않는 센터입니다.',
      });
    }

    const payment = await Payment.create({
      member_id,
      trainer_id,
      center_id,
      payment_amount,
      pt_type,
      session_count,
      free_session_count: free_session_count || 0,
      payment_date,
      payment_method,
      notes,
    });

    // 생성된 결제를 관계 데이터와 함께 조회
    const createdPayment = await Payment.findByPk(payment.id, {
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
    });

    res.status(201).json({
      success: true,
      message: '결제가 성공적으로 생성되었습니다.',
      data: createdPayment,
    });
  } catch (error) {
    console.error('결제 생성 오류:', error);
    res.status(500).json({
      success: false,
      message: '결제 생성 중 오류가 발생했습니다.',
      error: error.message,
    });
  }
};

// 결제 수정
const updatePayment = async (req, res) => {
  const { error, value } = updatePaymentSchema.validate(req.body);

  if (error) {
    return res.status(400).json({
      success: false,
      message: '입력값이 올바르지 않습니다.',
      details: error.details[0].message,
    });
  }

  try {
    const { id } = req.params;
    const updateData = { ...value };

    const payment = await Payment.findByPk(id);
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: '존재하지 않는 결제입니다.',
      });
    }

    // member_id, trainer_id, center_id가 변경되는 경우 유효성 검증
    if (updateData.member_id) {
      const member = await Member.findByPk(updateData.member_id);
      if (!member) {
        return res.status(400).json({
          success: false,
          message: '존재하지 않는 멤버입니다.',
        });
      }
    }

    if (updateData.trainer_id) {
      const trainer = await User.findByPk(updateData.trainer_id);
      if (!trainer) {
        return res.status(400).json({
          success: false,
          message: '존재하지 않는 트레이너입니다.',
        });
      }
    }

    if (updateData.center_id) {
      const center = await Center.findByPk(updateData.center_id);
      if (!center) {
        return res.status(400).json({
          success: false,
          message: '존재하지 않는 센터입니다.',
        });
      }
    }

    await payment.update(updateData);

    // 수정된 결제를 관계 데이터와 함께 조회
    const updatedPayment = await Payment.findByPk(id, {
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
    });

    res.json({
      success: true,
      message: '결제가 성공적으로 수정되었습니다.',
      data: updatedPayment,
    });
  } catch (error) {
    console.error('결제 수정 오류:', error);
    res.status(500).json({
      success: false,
      message: '결제 수정 중 오류가 발생했습니다.',
      error: error.message,
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
        message: '존재하지 않는 결제입니다.',
      });
    }

    await payment.destroy();

    res.json({
      success: true,
      message: '결제가 성공적으로 삭제되었습니다.',
    });
  } catch (error) {
    console.error('결제 삭제 오류:', error);
    res.status(500).json({
      success: false,
      message: '결제 삭제 중 오류가 발생했습니다.',
      error: error.message,
    });
  }
};

// 결제 목록 조회
const getAllPayments = async (req, res) => {
  try {
    const { member_id, trainer_id, center_id, limit = 100, offset = 0 } = req.query;

    const whereClause = {};

    if (member_id) {
      whereClause.member_id = member_id;
    }

    if (trainer_id) {
      whereClause.trainer_id = trainer_id;
    }

    if (center_id) {
      whereClause.center_id = center_id;
    }

    const payments = await Payment.findAndCountAll({
      where: whereClause,
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
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    res.json({
      success: true,
      message: '결제 목록을 성공적으로 조회했습니다.',
      data: {
        payments: payments.rows,
        total: payments.count,
        limit: parseInt(limit),
        offset: parseInt(offset),
      },
    });
  } catch (error) {
    console.error('결제 목록 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '결제 목록 조회 중 오류가 발생했습니다.',
      error: error.message,
    });
  }
};

module.exports = {
  createPayment,
  updatePayment,
  deletePayment,
  getAllPayments,
};
