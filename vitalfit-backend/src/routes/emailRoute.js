const express = require('express');
const router = express.Router();
const { sendLeaveRequestEmail, sendLeaveResponseEmail } = require('../utils/emailService');

// 휴가 신청 이메일 발송 (관리자에게)
router.post('/leave-request', async (req, res) => {
  try {
    const { request, adminEmail } = req.body;

    if (!request || !adminEmail) {
      return res.status(400).json({
        success: false,
        message: '필수 정보가 누락되었습니다.',
      });
    }

    await sendLeaveRequestEmail(request, adminEmail);

    res.json({
      success: true,
      message: '휴가 신청 이메일이 관리자에게 전송되었습니다.',
    });
  } catch (error) {
    console.error('휴가 신청 이메일 발송 실패:', error);
    res.status(500).json({
      success: false,
      message: '이메일 발송에 실패했습니다.',
    });
  }
});

// 휴가 응답 이메일 발송 (사용자에게)
router.post('/leave-response', async (req, res) => {
  try {
    const { request, action, userEmail } = req.body;

    if (!request || !action || !userEmail) {
      return res.status(400).json({
        success: false,
        message: '필수 정보가 누락되었습니다.',
      });
    }

    await sendLeaveResponseEmail(request, action, userEmail);

    res.json({
      success: true,
      message: `${action === 'approved' ? '승인' : '거절'} 결과 이메일이 사용자에게 전송되었습니다.`,
    });
  } catch (error) {
    console.error('휴가 응답 이메일 발송 실패:', error);
    res.status(500).json({
      success: false,
      message: '이메일 발송에 실패했습니다.',
    });
  }
});

module.exports = router;
