const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

// ✅ 트레이너별 월별 결제 조회
// GET /api/payments?trainer_id=1&year=2024&month=07
router.get('/', paymentController.getPaymentsByTrainerAndMonth);

// ✅ 이월매출 조회
// GET /api/payments/carryover?trainer_id=1&year=2024&month=07
router.get('/carryover', paymentController.getCarryoverAmount);

module.exports = router;
