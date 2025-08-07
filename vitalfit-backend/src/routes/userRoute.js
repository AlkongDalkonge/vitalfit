const express = require('express');
const path = require('path');
const router = express.Router();
const userController = require('../controllers/userController');
const { createUpload } = require('../utils/uploadUtils');
const auth = require('../middlewares/authMiddleware');

// uploadUtils.js를 사용한 프로필 업로드 미들웨어 생성
const { uploadSingle, handleError, processFile } = createUpload('profiles', 'profile_image', 5, [
  '.jpg',
  '.jpeg',
  '.png',
]);

router.post('/signup', uploadSingle, handleError, processFile, userController.signUp);
router.post('/signin', userController.signIn);
router.get('/me', auth, userController.getMe);
router.get('/my-account', auth, userController.getMyAccount);
router.put('/me', auth, uploadSingle, handleError, processFile, userController.updateMyAccount);
router.post('/logout', auth, userController.logout);
router.post('/reset-password', userController.resetPassword);
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

module.exports = router;
