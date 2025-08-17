const express = require('express');
const router = express.Router();
const auth = require('../middlewares/authMiddleware');

const {
  createPayment,
  getPayment,
  getAllPayments,
  updatePayment,
  deletePayment,
} = require('../controllers/paymentController');

// 결제 생성
router.post('/', auth, createPayment);

// 결제 조회
router.get('/:id', auth, getPayment);

// 결제 목록 조회
router.get('/', auth, getAllPayments);

// 결제 수정
router.put('/:id', auth, updatePayment);

// 결제 삭제
router.delete('/:id', auth, deletePayment);

module.exports = router;
