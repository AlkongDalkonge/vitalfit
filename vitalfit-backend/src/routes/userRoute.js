const express = require('express');
const path = require('path');
const router = express.Router();
const userController = require('../controllers/userController');
const { profileUpload, additionalImageUpload } = require('../middlewares/profileUpload');
const accountImageUpload = require('../middlewares/accountImageUpload');
const auth = require('../middlewares/authMiddleware');
const { requireReAuth } = require('../middlewares/reauthMiddleware');
const {
  checkUserViewPermission,
  checkUserListPermission,
} = require('../middlewares/permissionMiddleware');

// 사용자 목록 조회 (권한 체크 적용)
router.get('/', auth, checkUserListPermission, userController.getAllUsers);

// 회원가입 관련 라우트
router.post(
  '/signup',
  profileUpload.uploadSingle,
  profileUpload.handleError,
  profileUpload.processFile,
  userController.signUp
);

// 이메일 중복확인 라우트
router.post('/check-email', userController.checkEmailDuplicate);

// 이메일 인증 관련 라우트
router.post('/send-verification', userController.sendVerification);
router.post('/verify-email', userController.verifyEmail);

// 로그인 관련 라우트
router.post('/signin', userController.signIn);

// 토큰 갱신 라우트
router.post('/refresh-token', userController.refreshAccessToken);

// 회원가입 시 필요한 데이터 조회 (인증 불필요)
router.get('/positions', userController.getPositions);
router.get('/centers', userController.getCenters);

router.get('/me', auth, userController.getMe);
router.get('/my-account', auth, userController.getMyAccount);
router.put(
  '/me',
  auth,
  profileUpload.uploadSingle,
  profileUpload.handleError,
  profileUpload.processFile,
  userController.updateMyAccount
);

// 계좌 정보 수정
router.put('/account', auth, userController.updateAccountInfo);

// 자격증, 경력, 학력, 인스타그램 정보 수정
router.put('/additional-info', auth, userController.updateAdditionalInfo);

// 개별 정보 수정
router.put('/license', auth, userController.updateLicense);
router.put('/experience', auth, userController.updateExperience);
router.put('/education', auth, userController.updateEducation);
router.put('/instagram', auth, userController.updateInstagram);

// 비밀번호 재설정 토큰 발송
router.post('/reset-password', userController.resetPassword);

// 재인증 관련 라우트
router.post('/verify-password', auth, userController.verifyPassword);

router.put('/change-password', auth, requireReAuth, userController.changePassword);
router.delete('/me', auth, requireReAuth, userController.deactivateAccount);

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
  profileUpload.uploadSingle,
  profileUpload.handleError,
  profileUpload.processFile,
  userController.uploadProfileImage
);

// 계좌 이미지 업로드 라우트
router.post(
  '/upload-account-image',
  auth,
  accountImageUpload.uploadSingle,
  accountImageUpload.handleError,
  accountImageUpload.processFile,
  userController.uploadAccountImage
);

// 추가 이미지 업로드 라우트
router.post(
  '/upload-additional-image',
  (req, res, next) => {
    console.log('🚀 라우트 핸들러 시작: /upload-additional-image');
    console.log('📝 요청 메서드:', req.method);
    console.log('🌐 요청 URL:', req.url);
    console.log('🔑 인증 헤더:', req.headers.authorization ? '있음' : '없음');
    next();
  },
  auth,
  (req, res, next) => {
    console.log('✅ 인증 미들웨어 통과');
    console.log('👤 인증된 사용자:', req.user);
    next();
  },
  additionalImageUpload.uploadSingle,
  (req, res, next) => {
    console.log('📁 파일 업로드 미들웨어 통과');
    console.log('📄 req.file:', req.file);
    next();
  },
  additionalImageUpload.handleError,
  (req, res, next) => {
    console.log('✅ 에러 핸들링 미들웨어 통과');
    next();
  },
  additionalImageUpload.processFile,
  (req, res, next) => {
    console.log('✅ 파일 처리 미들웨어 통과');
    console.log('📝 처리된 req.body:', req.body);
    next();
  },
  userController.uploadAdditionalImage
);

// User 모델 import
const { User } = require('../models');

// 휴가 신청 목록 조회
router.get('/leave/list', async (req, res) => {
  try {
    const { userId } = req.query;

    let users;
    if (userId) {
      // 특정 사용자의 휴가 신청만 조회
      users = await User.findAll({
        where: { id: userId },
        attributes: ['id', 'name', 'email', 'shift'],
      });
    } else {
      // 모든 사용자의 휴가 신청 조회 (관리자용)
      users = await User.findAll({
        attributes: ['id', 'name', 'email', 'shift'],
      });
    }

    // shift 필드에서 휴가 신청 정보 추출
    const requests = [];
    users.forEach(user => {
      if (user.shift) {
        try {
          const shiftData = JSON.parse(user.shift);
          if (shiftData.leaveRequests && Array.isArray(shiftData.leaveRequests)) {
            shiftData.leaveRequests.forEach(request => {
              requests.push({
                ...request,
                userId: user.id,
                userName: user.name,
                userEmail: user.email,
              });
            });
          }
        } catch (error) {
          console.error(`사용자 ${user.id}의 shift 데이터 파싱 오류:`, error);
        }
      }
    });

    res.json({
      success: true,
      data: requests,
    });
  } catch (error) {
    console.error('휴가 신청 목록 조회 실패:', error);
    res.status(500).json({
      success: false,
      message: '휴가 신청 목록 조회에 실패했습니다.',
    });
  }
});

// 휴가 신청 제출
router.post('/leave/submit', async (req, res) => {
  try {
    const {
      leaveType,
      startDate,
      endDate,
      startTime,
      endTime,
      reason,
      userId,
      userName,
      userEmail,
    } = req.body;

    // 사용자 정보 조회
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '사용자를 찾을 수 없습니다.',
      });
    }

    const requestId = Date.now().toString();
    const leaveRequest = {
      id: requestId,
      leaveType,
      startDate,
      endDate,
      startTime,
      endTime,
      reason,
      status: 'pending',
      submittedAt: new Date().toISOString(),
    };

    // 기존 shift 데이터 가져오기
    let shiftData = {};
    if (user.shift) {
      try {
        shiftData = JSON.parse(user.shift);
      } catch (error) {
        console.error('기존 shift 데이터 파싱 오류:', error);
        shiftData = { schedules: [] };
      }
    } else {
      shiftData = { schedules: [] };
    }

    // leaveRequests 배열이 없으면 생성
    if (!shiftData.leaveRequests) {
      shiftData.leaveRequests = [];
    }

    // 새로운 휴가 신청 추가
    shiftData.leaveRequests.push(leaveRequest);

    // User 모델의 shift 필드 업데이트
    await user.update({ shift: JSON.stringify(shiftData) });

    console.log('📋 생성된 휴가 신청:', leaveRequest);
    console.log('💾 User 모델의 shift 필드에 휴가 신청 저장 완료');

    console.log('📧 이메일 발송 시작...');
    console.log('📝 휴가 신청 데이터:', leaveRequest);
    console.log('🔧 환경 변수 확인:');
    console.log('  - NODE_ENV:', process.env.NODE_ENV);
    console.log('  - EMAIL_PASSWORD 존재:', !!process.env.EMAIL_PASSWORD);

    // 관리자에게 이메일 발송
    const { sendLeaveRequestEmail } = require('../utils/emailService');
    console.log('📧 sendLeaveRequestEmail 함수 로드됨');

    try {
      await sendLeaveRequestEmail(leaveRequest, 'vitalfit.dev@gmail.com');
      console.log('✅ 이메일 발송 성공!');
    } catch (emailError) {
      console.error('❌ 이메일 발송 실패:', emailError);
      // 이메일 실패해도 휴가 신청은 성공으로 처리
    }

    res.json({
      success: true,
      message: '휴가 신청이 완료되었습니다.',
      requestId: leaveRequest.id,
    });
  } catch (error) {
    console.error('휴가 신청 실패:', error);
    res.status(500).json({
      success: false,
      message: '휴가 신청에 실패했습니다.',
    });
  }
});

// 휴가 승인/반려 처리 (이메일에서 직접 처리)
router.get('/leave/approve/:requestId', async (req, res) => {
  try {
    const { requestId } = req.params;

    // 모든 사용자에서 해당 휴가 신청 찾기
    const users = await User.findAll({
      attributes: ['id', 'name', 'email', 'shift'],
    });

    let foundUser = null;
    let foundRequest = null;

    for (const user of users) {
      if (user.shift) {
        try {
          const shiftData = JSON.parse(user.shift);
          if (shiftData.leaveRequests && Array.isArray(shiftData.leaveRequests)) {
            const request = shiftData.leaveRequests.find(req => req.id === requestId);
            if (request) {
              foundUser = user;
              foundRequest = request;
              break;
            }
          }
        } catch (error) {
          console.error(`사용자 ${user.id}의 shift 데이터 파싱 오류:`, error);
        }
      }
    }

    if (!foundRequest || !foundUser) {
      return res.status(404).send('휴가 신청을 찾을 수 없습니다.');
    }

    // shiftData에서 해당 휴가 신청을 찾아서 상태 변경
    const shiftData = JSON.parse(foundUser.shift);
    const requestIndex = shiftData.leaveRequests.findIndex(req => req.id === requestId);

    if (requestIndex !== -1) {
      // 상태를 승인으로 변경
      shiftData.leaveRequests[requestIndex].status = 'approved';
      shiftData.leaveRequests[requestIndex].processedAt = new Date().toISOString();
      shiftData.leaveRequests[requestIndex].processedBy = '관리자';

      // 데이터베이스에 승인 상태 업데이트
      await foundUser.update({ shift: JSON.stringify(shiftData) });
      console.log('✅ 휴가 신청 승인 상태 업데이트 완료');
    } else {
      console.error('❌ 휴가 신청을 찾을 수 없음');
      return res.status(404).send('휴가 신청을 찾을 수 없습니다.');
    }

    // 신청자에게 결과 이메일 발송
    const { sendLeaveResponseEmail } = require('../utils/emailService');
    await sendLeaveResponseEmail(foundRequest, 'approved', foundUser.email);

    // 승인 완료 페이지로 리다이렉트
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>휴가 신청 승인 완료</title>
        <style>
          body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
          .success { color: #28a745; font-size: 24px; margin: 20px 0; }
          .info { color: #666; margin: 20px 0; }
        </style>
      </head>
      <body>
        <h1>✅ 휴가 신청이 승인되었습니다</h1>
        <p class="success">신청 ID: ${requestId}</p>
        <p class="success">신청자: ${foundUser.name}</p>
        <p class="info">신청자에게 승인 결과가 자동으로 통보되었습니다.</p>
        <p class="info">이 창을 닫으셔도 됩니다.</p>
      </body>
      </html>
    `);
  } catch (error) {
    console.error('휴가 승인 처리 실패:', error);
    res.status(500).send('처리에 실패했습니다.');
  }
});

router.get('/leave/reject/:requestId', async (req, res) => {
  try {
    const { requestId } = req.params;

    // 모든 사용자에서 해당 휴가 신청 찾기
    const users = await User.findAll({
      attributes: ['id', 'name', 'email', 'shift'],
    });

    let foundUser = null;
    let foundRequest = null;

    for (const user of users) {
      if (user.shift) {
        try {
          const shiftData = JSON.parse(user.shift);
          if (shiftData.leaveRequests && Array.isArray(shiftData.leaveRequests)) {
            const request = shiftData.leaveRequests.find(req => req.id === requestId);
            if (request) {
              foundUser = user;
              foundRequest = request;
              break;
            }
          }
        } catch (error) {
          console.error(`사용자 ${user.id}의 shift 데이터 파싱 오류:`, error);
        }
      }
    }

    if (!foundRequest || !foundUser) {
      return res.status(404).send('휴가 신청을 찾을 수 없습니다.');
    }

    // shiftData에서 해당 휴가 신청을 찾아서 상태 변경
    const shiftData = JSON.parse(foundUser.shift);
    const requestIndex = shiftData.leaveRequests.findIndex(req => req.id === requestId);

    if (requestIndex !== -1) {
      // 상태를 반려로 변경
      shiftData.leaveRequests[requestIndex].status = 'rejected';
      shiftData.leaveRequests[requestIndex].processedAt = new Date().toISOString();
      shiftData.leaveRequests[requestIndex].processedBy = '관리자';

      // 데이터베이스에 반려 상태 업데이트
      await foundUser.update({ shift: JSON.stringify(shiftData) });
      console.log('✅ 휴가 신청 반려 상태 업데이트 완료');
    } else {
      console.error('❌ 휴가 신청을 찾을 수 없음');
      return res.status(404).send('휴가 신청을 찾을 수 없습니다.');
    }

    // 신청자에게 결과 이메일 발송
    const { sendLeaveResponseEmail } = require('../utils/emailService');
    await sendLeaveResponseEmail(foundRequest, 'rejected', foundUser.email);

    // 반려 완료 페이지로 리다이렉트
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>휴가 신청 반려 완료</title>
        <style>
          body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
          .reject { color: #dc3545; font-size: 24px; margin: 20px 0; }
          .info { color: #666; margin: 20px 0; }
        </style>
      </head>
      <body>
        <h1>❌ 휴가 신청이 반려되었습니다</h1>
        <p class="reject">신청 ID: ${requestId}</p>
        <p class="reject">신청자: ${foundUser.name}</p>
        <p class="info">신청자에게 반려 결과가 자동으로 통보되었습니다.</p>
        <p class="info">이 창을 닫으셔도 됩니다.</p>
      </body>
      </html>
    `);
  } catch (error) {
    console.error('휴가 반려 처리 실패:', error);
    res.status(500).send('처리에 실패했습니다.');
  }
});

// 휴가 신청 삭제
router.delete('/leave/delete/:requestId', async (req, res) => {
  try {
    const { requestId } = req.params;
    console.log('🗑️ 휴가 신청 삭제 시작:', requestId);

    // 모든 사용자에서 해당 휴가 신청 찾기
    const users = await User.findAll({
      attributes: ['id', 'name', 'email', 'shift'],
    });

    let foundUser = null;
    let foundRequestIndex = -1;

    for (const user of users) {
      if (user.shift) {
        try {
          const shiftData = JSON.parse(user.shift);
          if (shiftData.leaveRequests && Array.isArray(shiftData.leaveRequests)) {
            const requestIndex = shiftData.leaveRequests.findIndex(req => req.id === requestId);
            if (requestIndex !== -1) {
              foundUser = user;
              foundRequestIndex = requestIndex;
              break;
            }
          }
        } catch (error) {
          console.error(`사용자 ${user.id}의 shift 데이터 파싱 오류:`, error);
        }
      }
    }

    if (!foundUser || foundRequestIndex === -1) {
      return res.status(404).json({
        success: false,
        message: '휴가 신청을 찾을 수 없습니다.',
      });
    }

    // shiftData에서 해당 휴가 신청 제거
    const shiftData = JSON.parse(foundUser.shift);
    shiftData.leaveRequests.splice(foundRequestIndex, 1);

    // 데이터베이스에 업데이트된 shift 데이터 저장
    await foundUser.update({ shift: JSON.stringify(shiftData) });
    console.log('✅ 휴가 신청 삭제 완료');

    res.json({
      success: true,
      message: '휴가 신청이 삭제되었습니다.',
    });
  } catch (error) {
    console.error('휴가 신청 삭제 실패:', error);
    res.status(500).json({
      success: false,
      message: '삭제 처리에 실패했습니다.',
    });
  }
});

// 특정 사용자 조회 (권한 체크 적용)
router.get('/:id', auth, checkUserViewPermission, userController.getUserById);

module.exports = router;
