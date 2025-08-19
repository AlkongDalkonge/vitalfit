const express = require('express');
const { getDashboardStats } = require('../controllers/dashboardController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

// 대시보드 통계 조회
router.get('/stats', authMiddleware, getDashboardStats);

module.exports = router;
