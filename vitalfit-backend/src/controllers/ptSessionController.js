const { PTSession, Member, User, Center } = require('../models');
const { Op } = require('sequelize');
const Joi = require('joi');

// PT 세션 생성 스키마
const createPTSessionSchema = Joi.object({
  member_id: Joi.number().integer().positive().required(),
  trainer_id: Joi.number().integer().positive().required(),
  center_id: Joi.number().integer().positive().required(),
  session_date: Joi.date().required(),
  start_time: Joi.string()
    .pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .required(),
  end_time: Joi.string()
    .pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .optional(),
  session_type: Joi.string().valid('regular', 'free').default('regular'),
  signature_data: Joi.string().required(),
  signature_time: Joi.date().default(() => new Date()),
  notes: Joi.string().optional(),
  idempotency_key: Joi.string().optional(), // 멱등성 키
});

// PT 세션 수정 스키마
const updatePTSessionSchema = Joi.object({
  session_date: Joi.date().optional(),
  start_time: Joi.string()
    .pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .optional(),
  end_time: Joi.string()
    .pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .optional(),
  session_type: Joi.string().valid('regular', 'free').optional(),
  signature_data: Joi.string().optional(),
  signature_time: Joi.date().optional(),
  notes: Joi.string().optional(),
});

// PT 세션 생성
const createPTSession = async (req, res) => {
  const { error, value } = createPTSessionSchema.validate(req.body);

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
      session_date,
      start_time,
      end_time,
      session_type,
      signature_data,
      signature_time,
      notes,
      idempotency_key,
    } = value;

    // 멱등성 키가 있는 경우 중복 체크
    if (idempotency_key) {
      const existingSession = await PTSession.findOne({
        where: { idempotency_key },
      });
      if (existingSession) {
        return res.status(409).json({
          success: false,
          message: '이미 등록된 PT 세션입니다.',
          data: existingSession,
        });
      }
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

    // PT 세션 생성
    const ptSession = await PTSession.create({
      member_id,
      trainer_id,
      center_id,
      session_date,
      start_time,
      end_time,
      session_type,
      signature_data,
      signature_time,
      notes,
      idempotency_key,
    });

    return res.status(201).json({
      success: true,
      message: 'PT 세션이 성공적으로 생성되었습니다.',
      data: {
        pt_session: ptSession,
      },
    });
  } catch (error) {
    console.error('PT 세션 생성 오류:', error);
    return res.status(500).json({
      success: false,
      message: 'PT 세션 생성 중 오류가 발생했습니다.',
    });
  }
};

// PT 세션 수정
const updatePTSession = async (req, res) => {
  const { id } = req.params;
  const { error, value } = updatePTSessionSchema.validate(req.body);

  if (error) {
    return res.status(400).json({
      success: false,
      message: '입력값이 올바르지 않습니다.',
      details: error.details[0].message,
    });
  }

  try {
    const ptSession = await PTSession.findByPk(id);
    if (!ptSession) {
      return res.status(404).json({
        success: false,
        message: '존재하지 않는 PT 세션입니다.',
      });
    }

    await ptSession.update(value);

    return res.status(200).json({
      success: true,
      message: 'PT 세션이 성공적으로 수정되었습니다.',
      data: {
        pt_session: ptSession,
      },
    });
  } catch (error) {
    console.error('PT 세션 수정 오류:', error);
    return res.status(500).json({
      success: false,
      message: 'PT 세션 수정 중 오류가 발생했습니다.',
    });
  }
};

// PT 세션 삭제
const deletePTSession = async (req, res) => {
  const { id } = req.params;

  try {
    const ptSession = await PTSession.findByPk(id);
    if (!ptSession) {
      return res.status(404).json({
        success: false,
        message: '존재하지 않는 PT 세션입니다.',
      });
    }

    await ptSession.destroy();

    return res.status(200).json({
      success: true,
      message: 'PT 세션이 성공적으로 삭제되었습니다.',
    });
  } catch (error) {
    console.error('PT 세션 삭제 오류:', error);
    return res.status(500).json({
      success: false,
      message: 'PT 세션 삭제 중 오류가 발생했습니다.',
    });
  }
};

// 월별 PT 세션 조회 (새로 추가)
const getPTSessionsByMonth = async (req, res) => {
  const { year, month } = req.params;

  try {
    // 년월 유효성 검증
    const yearNum = parseInt(year);
    const monthNum = parseInt(month);
    
    if (isNaN(yearNum) || yearNum < 1900 || yearNum > 2100) {
      return res.status(400).json({
        success: false,
        message: '유효하지 않은 년도입니다.',
      });
    }
    
    if (isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
      return res.status(400).json({
        success: false,
        message: '유효하지 않은 월입니다.',
      });
    }

    // 해당 월의 시작일과 종료일 계산
    const startDate = new Date(yearNum, monthNum - 1, 1);
    const endDate = new Date(yearNum, monthNum, 0, 23, 59, 59);

    // PT 세션 조회
    const ptSessions = await PTSession.findAll({
      where: {
        session_date: {
          [Op.between]: [startDate, endDate],
        },
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
          attributes: ['id', 'name'],
        },
      ],
      order: [['session_date', 'ASC'], ['start_time', 'ASC']],
    });

    // 통계 정보 계산
    const totalSessions = ptSessions.length;
    const completedSessions = ptSessions.filter(session => session.end_time).length;
    const completionRate = totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0;

    // 센터별 통계
    const centerStats = {};
    ptSessions.forEach(session => {
      const centerName = session.center?.name || 'Unknown';
      if (!centerStats[centerName]) {
        centerStats[centerName] = { total: 0, completed: 0 };
      }
      centerStats[centerName].total++;
      if (session.end_time) {
        centerStats[centerName].completed++;
      }
    });

    // 트레이너별 통계
    const trainerStats = {};
    ptSessions.forEach(session => {
      const trainerName = session.trainer?.name || 'Unknown';
      if (!trainerStats[trainerName]) {
        trainerStats[trainerName] = { total: 0, completed: 0 };
      }
      trainerStats[trainerName].total++;
      if (session.end_time) {
        trainerStats[trainerName].completed++;
      }
    });

    return res.status(200).json({
      success: true,
      message: '월별 PT 세션 조회 성공',
      data: {
        year: yearNum,
        month: monthNum,
        pt_sessions: ptSessions,
        statistics: {
          total_sessions: totalSessions,
          completed_sessions: completedSessions,
          completion_rate: completionRate,
          center_stats: centerStats,
          trainer_stats: trainerStats,
        },
      },
    });
  } catch (error) {
    console.error('월별 PT 세션 조회 오류:', error);
    return res.status(500).json({
      success: false,
      message: '월별 PT 세션 조회 중 오류가 발생했습니다.',
    });
  }
};

// 멤버별 PT 세션 조회 (기존 함수 개선)
const getPTSessionsByMember = async (req, res) => {
  const { memberId } = req.params;
  const { page = 1, limit = 10, year, month } = req.query;

  try {
    const offset = (page - 1) * limit;
    const whereClause = { member_id: memberId };

    // 월별 필터링 추가
    if (year && month) {
      const yearNum = parseInt(year);
      const monthNum = parseInt(month);
      
      if (!isNaN(yearNum) && !isNaN(monthNum) && monthNum >= 1 && monthNum <= 12) {
        const startDate = new Date(yearNum, monthNum - 1, 1);
        const endDate = new Date(yearNum, monthNum, 0, 23, 59, 59);
        
        whereClause.session_date = {
          [Op.between]: [startDate, endDate],
        };
      }
    }

    // 멤버 정보 조회
    const member = await Member.findByPk(memberId, {
      attributes: ['id', 'name', 'phone', 'join_date', 'expire_date'],
    });

    if (!member) {
      return res.status(404).json({
        success: false,
        message: '존재하지 않는 멤버입니다.',
      });
    }

    const { count, rows: ptSessions } = await PTSession.findAndCountAll({
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
          attributes: ['id', 'name'],
        },
      ],
      order: [['session_date', 'DESC'], ['start_time', 'ASC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    // 통계 정보 계산
    const totalSessions = count;
    const completedSessions = ptSessions.filter(session => session.end_time).length;
    const completionRate = totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0;

    return res.status(200).json({
      success: true,
      message: '멤버별 PT 세션 조회 성공',
      data: {
        member: member,
        pt_sessions: ptSessions,
        pagination: {
          current_page: parseInt(page),
          total_pages: Math.ceil(count / limit),
          total_count: count,
          limit: parseInt(limit),
        },
        statistics: {
          total_sessions: totalSessions,
          completed_sessions: completedSessions,
          completion_rate: completionRate,
        },
        filters: {
          year: year || null,
          month: month || null,
        },
      },
    });
  } catch (error) {
    console.error('멤버별 PT 세션 조회 오류:', error);
    return res.status(500).json({
      success: false,
      message: '멤버별 PT 세션 조회 중 오류가 발생했습니다.',
    });
  }
};

module.exports = {
  createPTSession,
  updatePTSession,
  deletePTSession,
  getPTSessionsByMonth,
  getPTSessionsByMember,
};
