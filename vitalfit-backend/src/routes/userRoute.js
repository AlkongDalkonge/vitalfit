const express = require('express');
const path = require('path');
const router = express.Router();
const userController = require('../controllers/userController');
const { uploadSingle } = require('../middlewares/profileUpload');
const auth = require('../middlewares/authMiddleware');

// ✅ 인증 관련 라우트
router.post('/signup', uploadSingle, userController.signUp);
router.post('/signin', userController.signIn);
router.get('/me', auth, userController.getMyAccount);
router.put('/me', auth, uploadSingle, userController.updateMyAccount);
router.post('/logout', auth, userController.logout);
router.post('/reset-password', userController.resetPassword);
router.delete('/me', auth, userController.deactivateAccount);

// ✅ 사용자 관리 라우트 (새로 추가)
// GET /api/users - 모든 사용자 조회 (필터링 지원)
router.get('/', userController.getAllUsers);

// GET /api/users/:id - 특정 사용자 조회
router.get('/:id', userController.getUserById);

// 약관 관련 라우트
router.get('/terms', (req, res) => {
  res.sendFile(path.join(__dirname, '../../public/terms.html'));
});

router.get('/privacy', (req, res) => {
  res.sendFile(path.join(__dirname, '../../public/privacy.html'));
});

module.exports = router;
