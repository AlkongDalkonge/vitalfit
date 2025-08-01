const express = require('express');
const router = express.Router();

// Dummy 데이터 생성 라우트
const { createDummyCenterAndUser } = require('../controllers/memberController');
router.post('/dummy-center-user', createDummyCenterAndUser);

const {
  createMember,
  updateMember,
  getAllMembers,
  getMembersByCenter,
  getMembersByTrainer,
  getMembersByName,
} = require('../controllers/memberController');

// 멤버 생성
router.post('/', createMember);

// 멤버 수정
router.put('/:id', updateMember);

// 전체 멤버 조회
router.get('/', getAllMembers);

// 센터별 멤버 조회
router.get("/center/:center_id", getMembersByCenter);

// 트레이너별 멤버 조회
router.get("/trainer/:trainer_id", getMembersByTrainer);

// 이름으로 멤버 조회
router.get("/name/:name", getMembersByName);

module.exports = router;
