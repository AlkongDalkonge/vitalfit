const { PTSession, Member, User, Center } = require("../models");
const Joi = require("joi");

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
  session_type: Joi.string().valid("regular", "free").default("regular"),
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
  session_type: Joi.string().valid("regular", "free").optional(),
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
      message: "입력값이 올바르지 않습니다.",
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
          message: "이미 등록된 PT 세션입니다.",
          data: existingSession,
        });
      }
    }

    // member_id 유효성 검증
    const member = await Member.findByPk(member_id);
    if (!member) {
      return res.status(404).json({
        success: false,
        message: "존재하지 않는 멤버입니다.",
      });
    }

    // trainer_id 유효성 검증
    const trainer = await User.findByPk(trainer_id);
    if (!trainer) {
      return res.status(404).json({
        success: false,
        message: "존재하지 않는 트레이너입니다.",
      });
    }

    // center_id 유효성 검증
    const center = await Center.findByPk(center_id);
    if (!center) {
      return res.status(404).json({
        success: false,
        message: "존재하지 않는 센터입니다.",
      });
    }

    // 같은 날짜, 같은 시간대에 중복 등록 체크
    const existingSession = await PTSession.findOne({
      where: {
        member_id,
        session_date,
        start_time,
      },
    });

    if (existingSession) {
      return res.status(409).json({
        success: false,
        message: "해당 날짜와 시간에 이미 등록된 PT 세션이 있습니다.",
      });
    }

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

    res.status(201).json({
      success: true,
      message: "PT 세션이 성공적으로 등록되었습니다.",
      data: ptSession,
    });
  } catch (error) {
    console.error("PT 세션 등록 오류:", error);
    res.status(500).json({
      success: false,
      message: "PT 세션 등록 중 오류가 발생했습니다.",
      error: error.message,
    });
  }
};

// PT 세션 수정
const updatePTSession = async (req, res) => {
  const { error, value } = updatePTSessionSchema.validate(req.body);

  if (error) {
    return res.status(400).json({
      success: false,
      message: "입력값이 올바르지 않습니다.",
      details: error.details[0].message,
    });
  }

  try {
    const { id } = req.params;
    const updateData = value;

    const ptSession = await PTSession.findByPk(id);
    if (!ptSession) {
      return res.status(404).json({
        success: false,
        message: "존재하지 않는 PT 세션입니다.",
      });
    }

    // 권한 체크 (트레이너가 자신의 세션만 수정 가능)
    // TODO: 실제 인증 시스템 구현 시 JWT 토큰에서 사용자 정보 추출
    // if (req.user.id !== ptSession.trainer_id && req.user.role !== 'admin') {
    //   return res.status(403).json({
    //     success: false,
    //     message: "해당 PT 세션을 수정할 권한이 없습니다.",
    //   });
    // }

    await ptSession.update(updateData);

    res.json({
      success: true,
      message: "PT 세션이 성공적으로 수정되었습니다.",
      data: ptSession,
    });
  } catch (error) {
    console.error("PT 세션 수정 오류:", error);
    res.status(500).json({
      success: false,
      message: "PT 세션 수정 중 오류가 발생했습니다.",
      error: error.message,
    });
  }
};

// 멤버별 PT 세션 조회
const getPTSessionsByMember = async (req, res) => {
  try {
    const { memberId } = req.params;
    const { page = 1, limit = 10, status, start_date, end_date } = req.query;
    const offset = (page - 1) * limit;

    // memberId를 정수로 변환
    const memberIdInt = parseInt(memberId);
    if (isNaN(memberIdInt)) {
      return res.status(400).json({
        success: false,
        message: "유효하지 않은 멤버 ID입니다.",
      });
    }

    // member_id 유효성 검증
    const member = await Member.findByPk(memberIdInt);
    if (!member) {
      return res.status(404).json({
        success: false,
        message: "존재하지 않는 멤버입니다.",
      });
    }

    const whereClause = { member_id: memberIdInt };

    // 날짜 범위 필터
    if (start_date && end_date) {
      whereClause.session_date = {
        [require("sequelize").Op.between]: [start_date, end_date],
      };
    } else if (start_date) {
      whereClause.session_date = {
        [require("sequelize").Op.gte]: start_date,
      };
    } else if (end_date) {
      whereClause.session_date = {
        [require("sequelize").Op.lte]: end_date,
      };
    }

    const { count, rows: ptSessions } = await PTSession.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Member,
          as: "member",
          attributes: ["id", "name", "phone"],
        },
        {
          model: User,
          as: "trainer",
          attributes: ["id", "name", "email"],
        },
        {
          model: Center,
          as: "center",
          attributes: ["id", "name", "address"],
        },
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [
        ["session_date", "DESC"],
        ["start_time", "ASC"],
      ],
    });

    if (count === 0) {
      return res.status(404).json({
        success: false,
        message: "해당 멤버의 PT 세션이 없습니다.",
      });
    }

    res.json({
      success: true,
      message: "멤버별 PT 세션 목록을 성공적으로 조회했습니다.",
      data: {
        member: {
          id: member.id,
          name: member.name,
          phone: member.phone,
        },
        pt_sessions: ptSessions,
        pagination: {
          current_page: parseInt(page),
          total_pages: Math.ceil(count / limit),
          total_items: count,
          items_per_page: parseInt(limit),
        },
      },
    });
  } catch (error) {
    console.error("멤버별 PT 세션 조회 오류:", error);
    res.status(500).json({
      success: false,
      message: "멤버별 PT 세션 조회 중 오류가 발생했습니다.",
      error: error.message,
    });
  }
};

// 특정 멤버의 월별 PT 세션 조회
const getPTSessionsByMemberMonth = async (req, res) => {
  try {
    const { memberId, year, month } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    // memberId를 정수로 변환
    const memberIdInt = parseInt(memberId);
    if (isNaN(memberIdInt)) {
      return res.status(400).json({
        success: false,
        message: "유효하지 않은 멤버 ID입니다.",
      });
    }

    // 년월 형식 검증
    const yearInt = parseInt(year);
    const monthInt = parseInt(month);

    if (isNaN(yearInt) || isNaN(monthInt) || monthInt < 1 || monthInt > 12) {
      return res.status(400).json({
        success: false,
        message: "유효하지 않은 년월 형식입니다. (YYYY/MM)",
      });
    }

    // member_id 유효성 검증
    const member = await Member.findByPk(memberIdInt);
    if (!member) {
      return res.status(404).json({
        success: false,
        message: "존재하지 않는 멤버입니다.",
      });
    }

    // 해당 월의 시작일과 종료일 계산 (타임존 문제 해결)
    const startDate = new Date(yearInt, monthInt - 1, 1);
    const endDate = new Date(yearInt, monthInt, 0); // 해당 월의 마지막 날

    // YYYY-MM-DD 형식으로 직접 변환 (타임존 문제 방지)
    const startDateStr = `${yearInt}-${String(monthInt).padStart(2, "0")}-01`;
    const endDateStr = `${yearInt}-${String(monthInt).padStart(
      2,
      "0"
    )}-${String(endDate.getDate()).padStart(2, "0")}`;

    const whereClause = {
      member_id: memberIdInt,
      session_date: {
        [require("sequelize").Op.between]: [startDateStr, endDateStr],
      },
    };

    const { count, rows: ptSessions } = await PTSession.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Member,
          as: "member",
          attributes: [
            "id",
            "name",
            "phone",
            "join_date",
            "expire_date",
            "total_sessions",
            "used_sessions",
            "free_sessions",
          ],
        },
        {
          model: User,
          as: "trainer",
          attributes: ["id", "name", "email"],
        },
        {
          model: Center,
          as: "center",
          attributes: ["id", "name", "address"],
        },
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [
        ["session_date", "ASC"],
        ["start_time", "ASC"],
      ],
    });

    if (count === 0) {
      return res.status(404).json({
        success: false,
        message: "해당 멤버의 해당 월 PT 세션이 없습니다.",
      });
    }

    // 통계 정보 계산
    const stats = {
      total_sessions: count,
      regular_sessions: ptSessions.filter(
        (session) => session.session_type === "regular"
      ).length,
      free_sessions: ptSessions.filter(
        (session) => session.session_type === "free"
      ).length,
    };

    res.json({
      success: true,
      message: "특정 멤버의 월별 PT 세션 목록을 성공적으로 조회했습니다.",
      data: {
        member: {
          id: member.id,
          name: member.name,
          phone: member.phone,
        },
        year: yearInt,
        month: monthInt,
        period: {
          start_date: startDate.toISOString().split("T")[0],
          end_date: endDate.toISOString().split("T")[0],
        },
        stats,
        pt_sessions: ptSessions,
        pagination: {
          current_page: parseInt(page),
          total_pages: Math.ceil(count / limit),
          total_items: count,
          items_per_page: parseInt(limit),
        },
      },
    });
  } catch (error) {
    console.error("특정 멤버의 월별 PT 세션 조회 오류:", error);
    res.status(500).json({
      success: false,
      message: "특정 멤버의 월별 PT 세션 조회 중 오류가 발생했습니다.",
      error: error.message,
    });
  }
};

// 월별 PT 세션 조회
const getPTSessionsByMonth = async (req, res) => {
  try {
    const { year, month } = req.params;
    const { page = 1, limit = 10, center_id, trainer_id } = req.query;
    const offset = (page - 1) * limit;

    // 년월 형식 검증
    const yearInt = parseInt(year);
    const monthInt = parseInt(month);

    if (isNaN(yearInt) || isNaN(monthInt) || monthInt < 1 || monthInt > 12) {
      return res.status(400).json({
        success: false,
        message: "유효하지 않은 년월 형식입니다. (YYYY/MM)",
      });
    }

    // 해당 월의 시작일과 종료일 계산
    const startDate = new Date(yearInt, monthInt - 1, 1);
    const endDate = new Date(yearInt, monthInt, 0); // 해당 월의 마지막 날

    const whereClause = {
      session_date: {
        [require("sequelize").Op.between]: [
          startDate.toISOString().split("T")[0],
          endDate.toISOString().split("T")[0],
        ],
      },
    };

    // 센터별 필터
    if (center_id) {
      const centerIdInt = parseInt(center_id);
      if (!isNaN(centerIdInt)) {
        whereClause.center_id = centerIdInt;
      }
    }

    // 트레이너별 필터
    if (trainer_id) {
      const trainerIdInt = parseInt(trainer_id);
      if (!isNaN(trainerIdInt)) {
        whereClause.trainer_id = trainerIdInt;
      }
    }

    const { count, rows: ptSessions } = await PTSession.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Member,
          as: "member",
          attributes: ["id", "name", "phone"],
        },
        {
          model: User,
          as: "trainer",
          attributes: ["id", "name", "email"],
        },
        {
          model: Center,
          as: "center",
          attributes: ["id", "name", "address"],
        },
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [
        ["session_date", "ASC"],
        ["start_time", "ASC"],
      ],
    });

    if (count === 0) {
      return res.status(404).json({
        success: false,
        message: "해당 월의 PT 세션이 없습니다.",
      });
    }

    // 통계 정보 계산
    const stats = {
      total_sessions: count,
      regular_sessions: ptSessions.filter(
        (session) => session.session_type === "regular"
      ).length,
      free_sessions: ptSessions.filter(
        (session) => session.session_type === "free"
      ).length,
      unique_members: new Set(ptSessions.map((session) => session.member_id))
        .size,
      unique_trainers: new Set(ptSessions.map((session) => session.trainer_id))
        .size,
    };

    res.json({
      success: true,
      message: "월별 PT 세션 목록을 성공적으로 조회했습니다.",
      data: {
        year: yearInt,
        month: monthInt,
        period: {
          start_date: startDate.toISOString().split("T")[0],
          end_date: endDate.toISOString().split("T")[0],
        },
        stats,
        pt_sessions: ptSessions,
        pagination: {
          current_page: parseInt(page),
          total_pages: Math.ceil(count / limit),
          total_items: count,
          items_per_page: parseInt(limit),
        },
      },
    });
  } catch (error) {
    console.error("월별 PT 세션 조회 오류:", error);
    res.status(500).json({
      success: false,
      message: "월별 PT 세션 조회 중 오류가 발생했습니다.",
      error: error.message,
    });
  }
};

// PT 세션 삭제
const deletePTSession = async (req, res) => {
  try {
    const { id } = req.params;

    // id를 정수로 변환
    const idInt = parseInt(id);
    if (isNaN(idInt)) {
      return res.status(400).json({
        success: false,
        message: "유효하지 않은 PT 세션 ID입니다.",
      });
    }

    const ptSession = await PTSession.findByPk(idInt);
    if (!ptSession) {
      return res.status(404).json({
        success: false,
        message: "존재하지 않는 PT 세션입니다.",
      });
    }

    // 권한 체크 (트레이너가 자신의 세션만 삭제 가능)
    // TODO: 실제 인증 시스템 구현 시 JWT 토큰에서 사용자 정보 추출
    // if (req.user.id !== ptSession.trainer_id && req.user.role !== 'admin') {
    //   return res.status(403).json({
    //     success: false,
    //     message: "해당 PT 세션을 삭제할 권한이 없습니다.",
    //   });
    // }

    await ptSession.destroy();

    res.json({
      success: true,
      message: "PT 세션이 성공적으로 삭제되었습니다.",
    });
  } catch (error) {
    console.error("PT 세션 삭제 오류:", error);
    res.status(500).json({
      success: false,
      message: "PT 세션 삭제 중 오류가 발생했습니다.",
      error: error.message,
    });
  }
};

module.exports = {
  createPTSession,
  updatePTSession,
  getPTSessionsByMember,
  getPTSessionsByMemberMonth,
  getPTSessionsByMonth,
  deletePTSession,
};
