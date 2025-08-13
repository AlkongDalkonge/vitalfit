const express = require('express');
const router = express.Router();

const {
  createMember,
  updateMember,
  getAllMembers,
} = require('../controllers/memberController');

// ✅ 멤버 생성
// POST /api/members
router.post('/', createMember);

// ✅ 멤버 수정
// PUT /api/members/:id
router.put('/:id', updateMember);

// ✅ 멤버 목록 조회 (필터링 기능 포함)
// GET /api/members?centerId=1&trainerId=2&status=active&search=김철수&page=1&limit=1000
router.get('/', getAllMembers);

module.exports = router;
