const express = require('express');
const router = express.Router();

const {
  createPTSession,
  updatePTSession,
  deletePTSession,
  getPTSessionsByMonth,
  getPTSessionsByMember,
} = require('../controllers/ptSessionController');

// ✅ PT 세션 생성
// POST /api/pt-sessions
router.post('/', createPTSession);

// ✅ PT 세션 수정
// PUT /api/pt-sessions/:id
router.put('/:id', updatePTSession);

// ✅ PT 세션 삭제
// DELETE /api/pt-sessions/:id
router.delete('/:id', deletePTSession);

// ✅ 월별 PT 세션 조회 (새로 추가)
// GET /api/pt-sessions/month/:year/:month
router.get('/month/:year/:month', getPTSessionsByMonth);

// ✅ 멤버별 PT 세션 조회
// GET /api/pt-sessions/member/:memberId
router.get('/member/:memberId', getPTSessionsByMember);

module.exports = router;
