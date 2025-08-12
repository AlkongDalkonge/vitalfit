const express = require('express');
const path = require('path');
const router = express.Router();
const userController = require('../controllers/userController');
const { uploadSingle, handleError, processFile } = require('../middlewares/profileUpload');
const auth = require('../middlewares/authMiddleware');

// 사용자 목록 조회 (관리자용)
router.get('/', auth, userController.getAllUsers);

// 회원가입 관련 라우트
router.post('/signup', uploadSingle, handleError, processFile, userController.signUp);

// 회원가입 시 필요한 데이터 조회 (인증 불필요)
router.get('/positions', userController.getPositions);
router.get('/centers', userController.getCenters);

router.post('/signin', userController.signIn);
router.get('/me', auth, userController.getMe);
router.get('/my-account', auth, userController.getMyAccount);
router.put('/me', auth, uploadSingle, handleError, processFile, userController.updateMyAccount);
router.post('/logout', auth, userController.logout);
router.post('/reset-password', userController.resetPassword);
router.put('/change-password', auth, userController.changePassword);
router.delete('/me', auth, userController.deactivateAccount);

// 약관 관련 라우트 (구체적인 라우트를 먼저 정의)
router.get('/terms', (req, res) => {
  res.sendFile(path.join(__dirname, '../../public/terms.html'));
});

router.get('/privacy', (req, res) => {
  res.sendFile(path.join(__dirname, '../../public/privacy.html'));
});

// 프로필 사진 관련 라우트 (파라미터가 있는 라우트를 나중에 정의)
router.delete('/profile-image', auth, userController.deleteProfileImage);
router.post(
  '/profile-image',
  auth,
  uploadSingle,
  handleError,
  processFile,
  userController.uploadProfileImage
);

// 특정 사용자 조회 (관리자용) - 파라미터가 있는 라우트를 마지막에 정의
router.get('/:id', auth, userController.getUserById);

module.exports = router;
