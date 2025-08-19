const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// 디버깅을 위한 미들웨어 추가
router.use((req, res, next) => {
  console.log(`🔍 포지션 라우트 요청: ${req.method} ${req.path}`);
  next();
});

// ✅ 모든 포지션 목록 조회
// GET /api/positions
router.get('/', userController.getPositions);

module.exports = router;
