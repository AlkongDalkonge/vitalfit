const express = require('express');
const router = express.Router();

const {
  createPTSession,
  updatePTSession,
  deletePTSession,
  getPTSessionsByMonth,
  getPTSessionsByMember,
  getTrainerPTSessionStats,
} = require('../controllers/ptSessionController');

const {
  getPaymentsByTrainerAndMonth,
  getTrainerSalary,
} = require('../controllers/paymentController');

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

// ✅ 트레이너별 월별 PT 세션 통계 조회 (새로 추가)
// GET /api/pt-sessions/trainer-stats/:trainerId/:year/:month
router.get('/trainer-stats/:trainerId/:year/:month', getTrainerPTSessionStats);

// ✅ 트레이너별 월별 결제 조회 (임시로 pt-sessions 라우터에 추가)
// GET /api/pt-sessions/payments?trainer_id=1&year=2024&month=07
router.get('/payments', getPaymentsByTrainerAndMonth);

// ✅ 트레이너 기본급 조회
// GET /api/pt-sessions/trainer-salary?trainer_id=1
router.get('/trainer-salary', getTrainerSalary);

module.exports = router;
