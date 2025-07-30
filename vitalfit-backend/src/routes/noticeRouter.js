const express = require("express");
const router = express.Router();
const noticeController = require("../controllers/noticeController");
const { validateIdParam } = require("../middlewares/validateIdParam");

// 공지사항 목록 조회
router.get("/", noticeController.getNotices);

// 공지사항 작성
router.post("/", noticeController.createNotice);

// 공지사항 상세 조회
router.get("/:id", validateIdParam, noticeController.getNoticeById);

// 공지사항 수정
router.put("/:id", validateIdParam, noticeController.updateNotice);

// 공지사항 삭제
router.delete("/:id", validateIdParam, noticeController.deleteNotice);

// ========== 댓글 관련 라우트 ==========

// 댓글 목록 조회
router.get("/:id/comments", validateIdParam, noticeController.getComments);

// 댓글 생성
router.post("/:id/comments", validateIdParam, noticeController.createComment);

// 댓글 수정
router.put(
  "/:id/comments/:commentId",
  validateIdParam,
  noticeController.updateComment
);

// 댓글 삭제
router.delete(
  "/:id/comments/:commentId",
  validateIdParam,
  noticeController.deleteComment
);

module.exports = router;
