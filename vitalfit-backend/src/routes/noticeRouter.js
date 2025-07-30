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

module.exports = router;
