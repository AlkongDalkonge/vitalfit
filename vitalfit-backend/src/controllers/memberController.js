const { Member, Center, User } = require("../models");
const Joi = require("joi");

// 멤버 생성 스키마
const createMemberSchema = Joi.object({
  name: Joi.string().trim().max(100).required(),
  phone: Joi.string().trim().max(20).required(),
  center_id: Joi.number().integer().positive().required(),
  trainer_id: Joi.number().integer().positive().required(),
  join_date: Joi.date().required(),
  expire_date: Joi.date().optional(),
  total_sessions: Joi.number().integer().min(0).optional(),
  used_sessions: Joi.number().integer().min(0).optional(),
  free_sessions: Joi.number().integer().min(0).optional(),
  memo: Joi.string().trim().optional(),
  status: Joi.string()
    .valid("active", "inactive", "expired", "withdrawn")
    .optional(),
});

// 멤버 수정 스키마
const updateMemberSchema = Joi.object({
  name: Joi.string().trim().max(100).optional(),
  phone: Joi.string().trim().max(20).optional(),
  center_id: Joi.number().integer().positive().optional(),
  trainer_id: Joi.number().integer().positive().optional(),
  join_date: Joi.date().optional(),
  expire_date: Joi.date().optional(),
  total_sessions: Joi.number().integer().min(0).optional(),
  used_sessions: Joi.number().integer().min(0).optional(),
  free_sessions: Joi.number().integer().min(0).optional(),
  memo: Joi.string().trim().optional(),
  status: Joi.string()
    .valid("active", "inactive", "expired", "withdrawn")
    .optional(),
});

// 멤버 생성
const createMember = async (req, res) => {
  const { error, value } = createMemberSchema.validate(req.body);

  if (error) {
    return res.status(400).json({
      success: false,
      message: "입력값이 올바르지 않습니다.",
      details: error.details[0].message,
    });
  }

  try {
    const {
      name,
      phone,
      center_id,
      trainer_id,
      join_date,
      expire_date,
      total_sessions,
      used_sessions,
      free_sessions,
      memo,
      status,
    } = value;

    // center_id와 trainer_id 유효성 검증
    const center = await Center.findByPk(center_id);
    if (!center) {
      return res.status(400).json({
        success: false,
        message: "존재하지 않는 센터입니다.",
      });
    }

    const trainer = await User.findByPk(trainer_id);
    if (!trainer) {
      return res.status(400).json({
        success: false,
        message: "존재하지 않는 트레이너입니다.",
      });
    }

    const member = await Member.create({
      name,
      phone,
      center_id,
      trainer_id,
      join_date,
      expire_date,
      total_sessions: total_sessions || 0,
      used_sessions: used_sessions || 0,
      free_sessions: free_sessions || 0,
      memo,
      status: status || "active",
    });

    res.status(201).json({
      success: true,
      message: "멤버가 성공적으로 생성되었습니다.",
      data: member,
    });
  } catch (error) {
    console.error("멤버 생성 오류:", error);
    res.status(500).json({
      success: false,
      message: "멤버 생성 중 오류가 발생했습니다.",
      error: error.message,
    });
  }
};

// 멤버 수정
const updateMember = async (req, res) => {
  const { error, value } = updateMemberSchema.validate(req.body);

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

    const member = await Member.findByPk(id);
    if (!member) {
      return res.status(404).json({
        success: false,
        message: "존재하지 않는 멤버입니다.",
      });
    }

    // center_id나 trainer_id가 변경되는 경우 유효성 검증
    if (updateData.center_id) {
      const center = await Center.findByPk(updateData.center_id);
      if (!center) {
        return res.status(400).json({
          success: false,
          message: "존재하지 않는 센터입니다.",
        });
      }
    }

    if (updateData.trainer_id) {
      const trainer = await User.findByPk(updateData.trainer_id);
      if (!trainer) {
        return res.status(400).json({
          success: false,
          message: "존재하지 않는 트레이너입니다.",
        });
      }
    }

    await member.update(updateData);

    res.json({
      success: true,
      message: "멤버가 성공적으로 수정되었습니다.",
      data: member,
    });
  } catch (error) {
    console.error("멤버 수정 오류:", error);
    res.status(500).json({
      success: false,
      message: "멤버 수정 중 오류가 발생했습니다.",
      error: error.message,
    });
  }
};

// 전체 멤버 조회
const getAllMembers = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};
    if (status) {
      whereClause.status = status;
    }

    const { count, rows: members } = await Member.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Center,
          as: "center",
          attributes: ["id", "name", "address"],
        },
        {
          model: User,
          as: "trainer",
          attributes: ["id", "name", "email"],
        },
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["createdAt", "DESC"]],
    });

    res.json({
      success: true,
      message: "멤버 목록을 성공적으로 조회했습니다.",
      data: {
        members,
        pagination: {
          current_page: parseInt(page),
          total_pages: Math.ceil(count / limit),
          total_items: count,
          items_per_page: parseInt(limit),
        },
      },
    });
  } catch (error) {
    console.error("멤버 조회 오류:", error);
    res.status(500).json({
      success: false,
      message: "멤버 조회 중 오류가 발생했습니다.",
      error: error.message,
    });
  }
};

// center_id로 멤버 조회
const getMembersByCenter = async (req, res) => {
  try {
    const { center_id } = req.params;
    const { page = 1, limit = 10, status } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = { center_id };
    if (status) {
      whereClause.status = status;
    }

    // center_id 유효성 검증
    const center = await Center.findByPk(center_id);
    if (!center) {
      return res.status(404).json({
        success: false,
        message: "존재하지 않는 센터입니다.",
      });
    }

    const { count, rows: members } = await Member.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Center,
          as: "center",
          attributes: ["id", "name", "address"],
        },
        {
          model: User,
          as: "trainer",
          attributes: ["id", "name", "email"],
        },
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["createdAt", "DESC"]],
    });

    res.json({
      success: true,
      message: "센터별 멤버 목록을 성공적으로 조회했습니다.",
      data: {
        center: {
          id: center.id,
          name: center.name,
          address: center.address,
        },
        members,
        pagination: {
          current_page: parseInt(page),
          total_pages: Math.ceil(count / limit),
          total_items: count,
          items_per_page: parseInt(limit),
        },
      },
    });
  } catch (error) {
    console.error("센터별 멤버 조회 오류:", error);
    res.status(500).json({
      success: false,
      message: "센터별 멤버 조회 중 오류가 발생했습니다.",
      error: error.message,
    });
  }
};

// trainer_id로 멤버 조회
const getMembersByTrainer = async (req, res) => {
  try {
    const { trainer_id } = req.params;
    const { page = 1, limit = 10, status } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = { trainer_id };
    if (status) {
      whereClause.status = status;
    }

    // trainer_id 유효성 검증
    const trainer = await User.findByPk(trainer_id);
    if (!trainer) {
      return res.status(404).json({
        success: false,
        message: "존재하지 않는 트레이너입니다.",
      });
    }

    const { count, rows: members } = await Member.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Center,
          as: "center",
          attributes: ["id", "name", "address"],
        },
        {
          model: User,
          as: "trainer",
          attributes: ["id", "name", "email"],
        },
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["createdAt", "DESC"]],
    });

    res.json({
      success: true,
      message: "트레이너별 멤버 목록을 성공적으로 조회했습니다.",
      data: {
        trainer: {
          id: trainer.id,
          name: trainer.name,
          email: trainer.email,
        },
        members,
        pagination: {
          current_page: parseInt(page),
          total_pages: Math.ceil(count / limit),
          total_items: count,
          items_per_page: parseInt(limit),
        },
      },
    });
  } catch (error) {
    console.error("트레이너별 멤버 조회 오류:", error);
    res.status(500).json({
      success: false,
      message: "트레이너별 멤버 조회 중 오류가 발생했습니다.",
      error: error.message,
    });
  }
};

// 이름으로 멤버 조회
const getMembersByName = async (req, res) => {
  try {
    const { name } = req.params;
    const { page = 1, limit = 10, status } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {
      name: {
        [require("sequelize").Op.iLike]: `%${name}%`, // 대소문자 구분 없이 부분 검색
      },
    };

    if (status) {
      whereClause.status = status;
    }

    const { count, rows: members } = await Member.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Center,
          as: "center",
          attributes: ["id", "name", "address"],
        },
        {
          model: User,
          as: "trainer",
          attributes: ["id", "name", "email"],
        },
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["createdAt", "DESC"]],
    });

    res.json({
      success: true,
      message: "이름으로 멤버 목록을 성공적으로 조회했습니다.",
      data: {
        search_name: name,
        members,
        pagination: {
          current_page: parseInt(page),
          total_pages: Math.ceil(count / limit),
          total_items: count,
          items_per_page: parseInt(limit),
        },
      },
    });
  } catch (error) {
    console.error("이름별 멤버 조회 오류:", error);
    res.status(500).json({
      success: false,
      message: "이름별 멤버 조회 중 오류가 발생했습니다.",
      error: error.message,
    });
  }
};

// 센터와 유저 더미데이터 생성 (테스트용)
const createDummyCenterAndUser = async (req, res) => {
  try {
    // 센터 더미데이터 생성 또는 조회
    const [center] = await Center.findOrCreate({
      where: { id: 1 },
      defaults: {
        name: "테스트센터",
        location: "강남",
        address: "서울시 강남구",
        phone: "02-1234-5678",
      },
    });

    // 유저(트레이너) 더미데이터 생성 또는 조회
    const [user] = await User.findOrCreate({
      where: { id: 1 },
      defaults: {
        name: "테스트트레이너",
        email: "trainer1@test.com",
        password: "123456", // 실제 운영에서는 암호화 필요
        role: "trainer",
        phone: "010-1234-5678",
        center_id: center.id, // 생성된 센터와 연결
        join_date: new Date(),
      },
    });

    res.json({
      success: true,
      message: "센터와 유저 더미데이터가 생성되었습니다.",
      data: {
        center,
        user,
      },
    });
  } catch (error) {
    console.error("더미데이터 생성 오류:", error);
    res.status(500).json({
      success: false,
      message: "더미데이터 생성 중 오류가 발생했습니다.",
      error: error.message,
    });
  }
};

module.exports = {
  createMember,
  updateMember,
  getAllMembers,
  getMembersByCenter,
  getMembersByTrainer,
  getMembersByName,
  createDummyCenterAndUser,
};
