const express = require('express');
const router = express.Router();
const auth = require('../middlewares/authMiddleware');
const { checkMemberListPermission } = require('../middlewares/permissionMiddleware');

const {
  createMember,
  updateMember,
  getAllMembers,
  getMember,
} = require('../controllers/memberController');

const { getMemberPayments } = require('../controllers/paymentController');

// ✅ 멤버 생성
// POST /api/members
router.post('/', createMember);

// ✅ 멤버 수정
// PUT /api/members/:id
router.put('/:id', updateMember);

// ✅ 멤버 목록 조회 (필터링 기능 포함)
// GET /api/members?centerId=1&trainerId=2&status=active&search=김철수&page=1&limit=1000
router.get('/', auth, checkMemberListPermission, getAllMembers);

// ✅ 멤버 개별 조회
// GET /api/members/:id
router.get('/:id', getMember);

// ✅ 멤버별 결제 내역 조회
// GET /api/members/:id/payments
router.get('/:id/payments', getMemberPayments);

module.exports = router;
