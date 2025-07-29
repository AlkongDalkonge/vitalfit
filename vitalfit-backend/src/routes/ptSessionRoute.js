const express = require("express");
const router = express.Router();

const {
  createPTSession,
  updatePTSession,
  getPTSessionsByMember,
  getPTSessionsByMonth,
  deletePTSession,
} = require("../controllers/ptSessionController");

// PT 세션 등록
router.post("/", createPTSession);

// PT 세션 수정
router.put("/:id", updatePTSession);

// PT 세션 삭제
router.delete("/:id", deletePTSession);

// 멤버별 PT 세션 조회
router.get("/member/:memberId", getPTSessionsByMember);

// 월별 PT 세션 조회
router.get("/month/:year/:month", getPTSessionsByMonth);

module.exports = router; 