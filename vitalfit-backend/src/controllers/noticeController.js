const { Notice, NoticeComment, User } = require("../models");
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

// ========== 댓글 관련 API ==========

// Joi 스키마: 댓글 조회
const getCommentsSchema = Joi.object({
  id: Joi.number().integer().min(1).required(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(50).default(20),
});

// Joi 스키마: 댓글 생성
const createCommentSchema = Joi.object({
  id: Joi.number().integer().min(1).required(), // notice_id
  user_id: Joi.number().integer().min(1).required(),
  content: Joi.string().trim().min(1).max(1000).required(),
  parent_id: Joi.number().integer().min(1).optional(), // 대댓글인 경우
});

// Joi 스키마: 댓글 수정
const updateCommentSchema = Joi.object({
  id: Joi.number().integer().min(1).required(), // notice_id
  commentId: Joi.number().integer().min(1).required(),
  content: Joi.string().trim().min(1).max(1000).required(),
});

// Joi 스키마: 댓글 삭제
const deleteCommentSchema = Joi.object({
  id: Joi.number().integer().min(1).required(), // notice_id
  commentId: Joi.number().integer().min(1).required(),
});

/**
 * 특정 공지사항의 댓글 목록 조회
 * GET /api/notices/:id/comments?page=1&limit=20
 */
exports.getComments = async (req, res) => {
  try {
    // 유효성 검사
    const { error, value } = getCommentsSchema.validate({
      ...req.params,
      ...req.query,
    });

    if (error) {
      return res.status(400).json({
        success: false,
        message: "입력값 오류",
        details: error.details.map((detail) => detail.message),
      });
    }

    const { id: notice_id, page, limit } = value;
    const offset = (page - 1) * limit;

    // 공지사항 존재 여부 확인
    const notice = await Notice.findByPk(notice_id);
    if (!notice) {
      return res.status(404).json({
        success: false,
        message: "해당 공지사항을 찾을 수 없습니다.",
      });
    }

    // 최상위 댓글만 조회 (parent_id가 null인 댓글들)
    const { count, rows: topLevelComments } =
      await NoticeComment.findAndCountAll({
        where: {
          notice_id,
          parent_id: null, // 최상위 댓글만
        },
        include: [
          {
            model: User,
            as: "author",
            attributes: ["id", "name", "role"],
          },
          {
            model: NoticeComment,
            as: "replies",
            include: [
              {
                model: User,
                as: "author",
                attributes: ["id", "name", "role"],
              },
              {
                model: NoticeComment,
                as: "replies",
                include: [
                  {
                    model: User,
                    as: "author",
                    attributes: ["id", "name", "role"],
                  },
                  {
                    model: NoticeComment,
                    as: "replies",
                    include: [
                      {
                        model: User,
                        as: "author",
                        attributes: ["id", "name", "role"],
                      },
                    ],
                    order: [["created_at", "ASC"]],
                  },
                ],
                order: [["created_at", "ASC"]],
              },
            ],
            order: [["created_at", "ASC"]],
          },
        ],
        order: [["created_at", "ASC"]],
        limit,
        offset,
      });

    // 전체 댓글 수 계산 (모든 depth 포함)
    const totalCommentsCount = await NoticeComment.count({
      where: { notice_id },
    });

    const totalPages = Math.ceil(count / limit);

    res.status(200).json({
      success: true,
      data: {
        comments: topLevelComments,
        pagination: {
          currentPage: page,
          totalPages,
          totalComments: totalCommentsCount,
          topLevelComments: count,
          limit,
        },
      },
    });
  } catch (err) {
    console.error("댓글 조회 실패:", err);
    res.status(500).json({
      success: false,
      message: "댓글 조회 실패",
      details: err.message,
    });
  }
};

/**
 * 댓글 생성
 * POST /api/notices/:id/comments
 */
exports.createComment = async (req, res) => {
  try {
    // 유효성 검사
    const { error, value } = createCommentSchema.validate({
      ...req.params,
      ...req.body,
    });

    if (error) {
      return res.status(400).json({
        success: false,
        message: "입력값 오류",
        details: error.details.map((detail) => detail.message),
      });
    }

    const { id: notice_id, user_id, content, parent_id } = value;

    // 공지사항 존재 여부 확인
    const notice = await Notice.findByPk(notice_id);
    if (!notice) {
      return res.status(404).json({
        success: false,
        message: "해당 공지사항을 찾을 수 없습니다.",
      });
    }

    let depth = 0;
    let parentComment = null;

    // 대댓글인 경우 부모 댓글 확인 및 깊이 계산
    if (parent_id) {
      parentComment = await NoticeComment.findOne({
        where: {
          id: parent_id,
          notice_id, // 같은 공지사항의 댓글이어야 함
        },
      });

      if (!parentComment) {
        return res.status(404).json({
          success: false,
          message: "부모 댓글을 찾을 수 없습니다.",
        });
      }

      depth = parentComment.depth + 1;

      // 최대 깊이 제한 확인 (3단계까지)
      if (depth > 3) {
        return res.status(400).json({
          success: false,
          message: "댓글 깊이는 최대 3단계까지만 허용됩니다.",
        });
      }
    }

    // 댓글 생성
    const comment = await NoticeComment.create({
      notice_id,
      user_id,
      content,
      parent_id: parent_id || null,
      depth,
    });

    // 생성된 댓글 정보 조회 (작성자 정보 포함)
    const createdComment = await NoticeComment.findByPk(comment.id, {
      include: [
        {
          model: User,
          as: "author",
          attributes: ["id", "name", "role"],
        },
      ],
    });

    res.status(201).json({
      success: true,
      message: "댓글이 성공적으로 생성되었습니다.",
      data: createdComment,
    });
  } catch (err) {
    console.error("댓글 생성 실패:", err);
    res.status(500).json({
      success: false,
      message: "댓글 생성 실패",
      details: err.message,
    });
  }
};

/**
 * 댓글 수정
 * PUT /api/notices/:id/comments/:commentId
 */
exports.updateComment = async (req, res) => {
  try {
    // 유효성 검사
    const { error, value } = updateCommentSchema.validate({
      ...req.params,
      ...req.body,
    });

    if (error) {
      return res.status(400).json({
        success: false,
        message: "입력값 오류",
        details: error.details.map((detail) => detail.message),
      });
    }

    const { id: notice_id, commentId, content } = value;

    // 댓글 존재 여부 확인
    const comment = await NoticeComment.findOne({
      where: {
        id: commentId,
        notice_id,
      },
    });

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "해당 댓글을 찾을 수 없습니다.",
      });
    }

    // 댓글 수정
    await comment.update({ content });

    // 수정된 댓글 정보 조회 (작성자 정보 포함)
    const updatedComment = await NoticeComment.findByPk(commentId, {
      include: [
        {
          model: User,
          as: "author",
          attributes: ["id", "name", "role"],
        },
      ],
    });

    res.status(200).json({
      success: true,
      message: "댓글이 성공적으로 수정되었습니다.",
      data: updatedComment,
    });
  } catch (err) {
    console.error("댓글 수정 실패:", err);
    res.status(500).json({
      success: false,
      message: "댓글 수정 실패",
      details: err.message,
    });
  }
};

/**
 * 댓글 삭제
 * DELETE /api/notices/:id/comments/:commentId
 */
exports.deleteComment = async (req, res) => {
  try {
    // 유효성 검사
    const { error, value } = deleteCommentSchema.validate(req.params);

    if (error) {
      return res.status(400).json({
        success: false,
        message: "입력값 오류",
        details: error.details.map((detail) => detail.message),
      });
    }

    const { id: notice_id, commentId } = value;

    // 댓글 존재 여부 확인
    const comment = await NoticeComment.findOne({
      where: {
        id: commentId,
        notice_id,
      },
    });

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "해당 댓글을 찾을 수 없습니다.",
      });
    }

    // 댓글 삭제
    await comment.destroy();

    res.status(200).json({
      success: true,
      message: "댓글이 성공적으로 삭제되었습니다.",
    });
  } catch (err) {
    console.error("댓글 삭제 실패:", err);
    res.status(500).json({
      success: false,
      message: "댓글 삭제 실패",
      details: err.message,
    });
  }
};
