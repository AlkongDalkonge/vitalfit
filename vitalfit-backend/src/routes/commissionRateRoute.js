const express = require('express');
const router = express.Router();
const commissionRateController = require('../controllers/commissionRateController');

// 총매출에 따른 커미션과 수업료 조회
router.get('/by-revenue', commissionRateController.getCommissionRateByRevenue);

// 모든 커미션 정책 조회 (관리용)
router.get('/', commissionRateController.getAllCommissionRates);

module.exports = router;
