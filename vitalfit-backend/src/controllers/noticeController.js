const { Notice } = require("../models");
const { Op } = require("sequelize");
const Joi = require("joi");

// Joi 스키마: GET /api/notices 목록조회
const getNoticesSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().allow("").trim().default(""),
});

// Joi 스키마: POST /api/notices 등록
const createNoticeSchema = Joi.object({
  sender_id: Joi.number().required(),
  title: Joi.string().trim().required(),
  content: Joi.string().trim().required(),
  receiver_type: Joi.string().trim().required(),
  receiver_id: Joi.number().optional(),
  receiver_role: Joi.string().optional(),
  is_important: Joi.boolean().optional(),
  pin_until: Joi.date().iso().optional(),
});

// Joi 스키마: GET /api/notices 상세보기
const getNoticeByIdSchema = Joi.object({
  id: Joi.number().integer().min(1).required(),
});

// Joi 스키마 : 수정
const updateNoticeSchema = Joi.object({
  title: Joi.string().trim().optional(),
  content: Joi.string().trim().optional(),
  receiver_type: Joi.string().trim().optional(),
  receiver_id: Joi.number().optional().allow(null),
  receiver_role: Joi.string().optional().allow(null, ""),
  is_important: Joi.boolean().optional(),
  pin_until: Joi.date().iso().optional().allow(null),
}).min(1); // 최소 1개 필드는 있어야 함

// Joi 스키마 : 삭제

const idSchema = Joi.object({
  id: Joi.number().integer().positive().required(),
});

/**
 * 공지사항 목록 간단 조회
 * GET /api/notices?page=1&limit=10&search=키워드
 */
exports.getNotices = async (req, res) => {
  try {
    const { value: query, error } = getNoticesSchema.validate(req.query);
    if (error) {
      return res.status(400).json({
        success: false,
        message: "쿼리 파라미터가 유효하지 않습니다.",
        details: error.details[0].message,
      });
    }

    const { page, limit, search } = query;
    const offset = (page - 1) * limit;

    const where = search
      ? {
          [Op.or]: [
            { title: { [Op.iLike]: `%${search}%` } },
            { content: { [Op.iLike]: `%${search}%` } },
          ],
        }
      : {};

    const { count: totalItems, rows: notices } = await Notice.findAndCountAll({
      where,
      limit,
      offset,
      order: [["createdAt", "DESC"]],
    });

    const pagination = {
      currentPage: page,
      totalPages: Math.ceil(totalItems / limit),
      totalItems,
      itemsPerPage: limit,
    };

    res.json({
      success: true,
      data: {
        notices,
        pagination,
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "공지사항 목록 조회 실패",
      details: err.message,
    });
  }
};

/**
 * 공지사항 작성
 * POST /api/notices
 */
exports.createNotice = async (req, res) => {
  try {
    const { value: body, error } = createNoticeSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: "입력값이 유효하지 않습니다.",
        details: error.details[0].message,
      });
    }

    const notice = await Notice.create(body);

    res.status(201).json({
      success: true,
      message: "공지사항이 등록되었습니다.",
      data: notice,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "공지사항 작성 실패",
      details: err.message,
    });
  }
};

/**
 * 공지사항 상세 조회
 * GET /api/notices/:id
 */
exports.getNoticeById = async (req, res) => {
  try {
    const notice = await Notice.findByPk(req.params.id, {
      attributes: { exclude: ["updatedAt"] }, //해당컬럼은 제외
    });

    if (!notice) {
      return res.status(404).json({
        success: false,
        message: "공지사항을 찾을 수 없습니다.",
      });
    }

    res.json({ success: true, data: notice });
  } catch (err) {
    console.error("공지사항 상세 조회 실패:", err);
    res.status(500).json({
      success: false,
      message: "공지사항 상세 조회 실패",
      details: err.message,
    });
  }
};

/**
 * 공지사항 수정
 * PUT /api/notices/:id
 */
exports.updateNotice = async (req, res) => {
  try {
    //10은 기수, 몇진수로 할지 적는거임.
    // 1) id 유효성 검사 (Joi 또는 숫자 변환)
    // const id = parseInt(req.params.id, 10);
    // if (isNaN(id)) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "유효하지 않은 공지사항 ID입니다.",
    //   });
    // }
    // 2) 입력 데이터 검증
    const { value: validatedBody, error } = updateNoticeSchema.validate(
      req.body
    );
    if (error) {
      return res.status(400).json({
        success: false,
        message: "수정 데이터가 유효하지 않습니다.",
        details: error.details[0].message,
      });
    }

    // 3) 해당 공지사항 조회
    //const notice = await Notice.findByPk(id);
    const notice = await Notice.findByPk(req.params.id);

    if (!notice) {
      return res.status(404).json({
        success: false,
        message: "공지사항을 찾을 수 없습니다.",
      });
    }

    // 4) 업데이트 (검증된 데이터만)
    await notice.update(validatedBody);

    // 5) 수정된 데이터 응답 (updatedAt 제외)
    //const updatedNotice = await Notice.findByPk(id, {
    const updatedNotice = await Notice.findByPk(req.params.id, {
      attributes: { exclude: ["updatedAt"] },
    });

    res.json({
      success: true,
      message: "공지사항이 수정되었습니다.",
      data: updatedNotice,
    });
  } catch (err) {
    console.error("공지사항 수정 실패:", err);
    res.status(500).json({
      success: false,
      message: "공지사항 수정 실패",
      details: err.message,
    });
  }
};

/**
 * 공지사항 삭제
 * DELETE /api/notices/:id
 */
exports.deleteNotice = async (req, res) => {
  try {
    const notice = await Notice.findByPk(req.params.id);
    if (!notice) {
      return res.status(404).json({
        success: false,
        message: "공지사항을 찾을 수 없습니다.",
      });
    }
    await notice.destroy();
    res.json({
      success: true,
      message: "공지사항이 삭제되었습니다.",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "공지사항 삭제 실패",
      details: err.message,
    });
  }
};
