const express = require('express');
const router = express.Router();
const auth = require('../middlewares/authMiddleware');
const {
  requirePaymentPermission,
  requirePaymentManagementPermission,
} = require('../middlewares/permissionMiddleware');

const {
  createPayment,
  getPayment,
  getAllPayments,
  updatePayment,
  deletePayment,
  getCarryover,
} = require('../controllers/paymentController');

// 결제 생성
router.post('/', auth, requirePaymentManagementPermission, createPayment);

// 이월 매출 조회 (구체적인 라우트를 먼저 정의)
router.get('/carryover', auth, requirePaymentPermission, getCarryover);

// 결제 목록 조회
router.get('/', auth, requirePaymentPermission, getAllPayments);

// 결제 조회
router.get('/:id', auth, requirePaymentPermission, getPayment);

// 결제 수정
router.put('/:id', auth, requirePaymentManagementPermission, updatePayment);

// 결제 삭제
router.delete('/:id', auth, requirePaymentManagementPermission, deletePayment);

module.exports = router;
