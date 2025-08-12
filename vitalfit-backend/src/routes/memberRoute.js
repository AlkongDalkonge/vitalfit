const express = require('express');
const router = express.Router();
const {
  createMember,
  updateMember,
  getAllMembers,
  createDummyCenterAndUser,
} = require('../controllers/memberController');

// 멤버 생성
router.post('/', createMember);

// 멤버 수정
router.put('/:id', updateMember);

// 멤버 전체 조회 (센터별, 트레이너별 필터링 포함)
// GET /api/member - 전체 조회
// GET /api/member?centerId={centerId} - 센터별 조회
// GET /api/member?trainerId={trainerId} - 트레이너별 조회
router.get('/', getAllMembers);

// 더미 데이터 생성 (테스트용)
router.post('/dummy', createDummyCenterAndUser);

module.exports = router;
