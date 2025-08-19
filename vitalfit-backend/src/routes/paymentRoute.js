const express = require('express');
const router = express.Router();
const auth = require('../middlewares/authMiddleware');

const {
  createPayment,
  getPayment,
  getAllPayments,
  updatePayment,
  deletePayment,
  getCarryover,
} = require('../controllers/paymentController');

// 결제 생성
router.post('/', auth, createPayment);

// 이월 매출 조회 (구체적인 라우트를 먼저 정의)
router.get('/carryover', auth, getCarryover);

// 결제 목록 조회
router.get('/', auth, getAllPayments);

// 결제 조회
router.get('/:id', auth, getPayment);

// 결제 수정
router.put('/:id', auth, updatePayment);

// 결제 삭제
router.delete('/:id', auth, deletePayment);

module.exports = router;
