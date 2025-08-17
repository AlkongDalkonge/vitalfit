const nodemailer = require('nodemailer');
const crypto = require('crypto');

// 안전한 임시 비밀번호 생성 함수
const generateSecureTempPassword = (length = 12) => {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';

  // 최소 1개의 대문자, 소문자, 숫자, 특수문자 포함
  password += charset.charAt(Math.floor(Math.random() * 26)); // 대문자
  password += charset.charAt(26 + Math.floor(Math.random() * 26)); // 소문자
  password += charset.charAt(52 + Math.floor(Math.random() * 10)); // 숫자
  password += charset.charAt(62 + Math.floor(Math.random() * 8)); // 특수문자

  // 나머지 길이만큼 랜덤하게 선택
  for (let i = 4; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }

  // 문자열을 섞어서 순서를 랜덤하게 만듦
  return password
    .split('')
    .sort(() => Math.random() - 0.5)
    .join('');
};

// 이메일 설정 (개발 환경용)
const createTransporter = () => {
  // 실제 Gmail 사용 (vitalfit.dev@gmail.com으로 발송)
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'vitalfit.dev@gmail.com',
      pass: process.env.EMAIL_PASSWORD || 'your-gmail-app-password', // Gmail 앱 비밀번호 필요
    },
  });
};

// 이메일 인증 이메일 템플릿
const createVerificationEmail = (userName, verificationCode) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="margin: 0; font-size: 28px;">VitalFit</h1>
        <p style="margin: 10px 0 0 0; opacity: 0.9;">건강한 라이프스타일을 위한 최고의 선택</p>
      </div>
      
      <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        <h2 style="color: #333; margin-bottom: 20px;">이메일 인증</h2>
        
        <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
          안녕하세요, <strong>${userName}</strong>님!
        </p>
        
        <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
          VitalFit 회원가입을 완료하기 위해 이메일 인증을 진행해주세요.
          아래의 인증 코드를 사용하여 계정을 활성화할 수 있습니다.
        </p>
        
        <div style="background: #f8f9fa; border: 2px solid #e9ecef; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center;">
          <p style="margin: 0 0 10px 0; color: #495057; font-weight: bold;">인증 코드</p>
          <p style="margin: 0; font-size: 24px; font-weight: bold; color: #007bff; letter-spacing: 2px;">${verificationCode}</p>
        </div>
        
        <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 15px; margin: 20px 0;">
          <p style="margin: 0; color: #856404; font-size: 14px;">
            <strong>⚠️ 인증 코드 사용법:</strong><br>
            • 이 코드는 24시간 동안 유효합니다<br>
            • VitalFit 앱에서 이 6자리 코드를 입력하여 인증을 완료하세요<br>
            • 인증이 완료되면 로그인이 가능합니다
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 30px;">
          <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email" 
             style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; display: inline-block; font-weight: bold;">
            이메일 인증하기
          </a>
        </div>
        
        <hr style="border: none; border-top: 1px solid #e9ecef; margin: 30px 0;">
        
        <p style="color: #999; font-size: 12px; text-align: center; margin: 0;">
          이 이메일은 VitalFit 시스템에서 자동으로 발송되었습니다.<br>
          문의사항이 있으시면 관리자에게 연락해주세요.
        </p>
      </div>
    </div>
  `;
};

// 비밀번호 재설정 이메일 템플릿
const createPasswordResetEmail = (userName, resetToken) => {
  const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password/confirm?token=${resetToken}`;

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="margin: 0; font-size: 28px;">VitalFit</h1>
        <p style="margin: 10px 0 0 0; opacity: 0.9;">건강한 라이프스타일을 위한 최고의 선택</p>
      </div>
      
      <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        <h2 style="color: #333; margin-bottom: 20px;">비밀번호 재설정 요청</h2>
        
        <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
          안녕하세요, <strong>${userName}</strong>님!
        </p>
        
        <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
          비밀번호 재설정을 요청하셨습니다. 아래의 링크를 클릭하여 새로운 비밀번호를 설정해주세요.
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetLink}" 
             style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 40px; text-decoration: none; border-radius: 25px; display: inline-block; font-weight: bold; font-size: 16px;">
            비밀번호 재설정하기
          </a>
        </div>
        
        <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 15px; margin: 20px 0;">
          <p style="margin: 0; color: #856404; font-size: 14px;">
            <strong>⚠️ 보안 주의사항:</strong><br>
            • 이 링크는 30분 동안만 유효합니다<br>
            • 본인이 요청하지 않은 경우 이 이메일을 무시하세요<br>
            • 타인과 이 링크를 공유하지 마세요
          </p>
        </div>
        
        <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
          링크가 작동하지 않는 경우, 아래 주소를 브라우저에 복사하여 붙여넣기 해주세요:
        </p>
        
        <div style="background: #f8f9fa; border: 1px solid #e9ecef; border-radius: 8px; padding: 15px; margin: 20px 0; word-break: break-all;">
          <p style="margin: 0; color: #495057; font-size: 12px; font-family: monospace;">
            ${resetLink}
          </p>
        </div>
        
        <hr style="border: none; border-top: 1px solid #e9ecef; margin: 30px 0;">
        
        <p style="color: #999; font-size: 12px; text-align: center; margin: 0;">
          이 이메일은 VitalFit 시스템에서 자동으로 발송되었습니다.<br>
          문의사항이 있으시면 관리자에게 연락해주세요.
        </p>
      </div>
    </div>
  `;
};

// 로그인 인증 코드 이메일 템플릿
const createLoginVerificationEmail = (userName, verificationCode) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="margin: 0; font-size: 28px;">VitalFit</h1>
        <p style="margin: 10px 0 0 0; opacity: 0.9;">건강한 라이프스타일을 위한 최고의 선택</p>
      </div>
      
      <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        <h2 style="color: #333; margin-bottom: 20px;">로그인 인증 코드</h2>
        
        <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
          안녕하세요, <strong>${userName}</strong>님!
        </p>
        
        <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
          VitalFit 로그인을 완료하기 위해 인증 코드를 입력해주세요.
          아래의 6자리 코드를 사용하여 로그인을 완료할 수 있습니다.
        </p>
        
        <div style="background: #f8f9fa; border: 2px solid #e9ecef; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center;">
          <p style="margin: 0 0 10px 0; color: #495057; font-weight: bold;">로그인 인증 코드</p>
          <p style="margin: 0; font-size: 24px; font-weight: bold; color: #007bff; letter-spacing: 2px;">${verificationCode}</p>
        </div>
        
        <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 15px; margin: 20px 0;">
          <p style="margin: 0; color: #856404; font-size: 14px;">
            <strong>⚠️ 인증 코드 사용법:</strong><br>
            • 이 코드는 10분 동안 유효합니다<br>
            • VitalFit 앱에서 이 6자리 코드를 입력하여 로그인을 완료하세요<br>
            • 인증이 완료되면 자동으로 로그인됩니다
          </p>
        </div>
        
        <hr style="border: none; border-top: 1px solid #e9ecef; margin: 30px 0;">
        
        <p style="color: #999; font-size: 12px; text-align: center; margin: 0;">
          이 이메일은 VitalFit 시스템에서 자동으로 발송되었습니다.<br>
          문의사항이 있으시면 관리자에게 연락해주세요.
        </p>
      </div>
    </div>
  `;
};

// 이메일 인증 이메일 발송 함수
const sendVerificationEmail = async (userEmail, userName, verificationCode) => {
  try {
    // 개발 환경에서는 실제 이메일 발송 대신 콘솔에 출력
    if (process.env.NODE_ENV === 'development' && !process.env.EMAIL_PASSWORD) {
      console.log('📧 === 이메일 인증 이메일 (개발 모드) ===');
      console.log('📧 발송자: vitalfit.dev@gmail.com');
      console.log('📧 수신자:', userEmail);
      console.log('📧 제목: [VitalFit] 이메일 인증');
      console.log('📧 사용자명:', userName);
      console.log('📧 인증 코드:', verificationCode);
      console.log('📧 이메일 내용:');
      console.log(createVerificationEmail(userName, verificationCode));
      console.log('📧 === 이메일 내용 끝 ===');

      return { success: true, messageId: 'dev-mode-verification-email' };
    }

    // 실제 Gmail 발송
    const transporter = createTransporter();

    const mailOptions = {
      from: `"VitalFit" <vitalfit.dev@gmail.com>`,
      to: userEmail,
      subject: '[VitalFit] 이메일 인증',
      html: createVerificationEmail(userName, verificationCode),
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('📧 이메일 인증 이메일 발송 성공:', info.messageId);
    console.log('📧 발송자:', 'vitalfit.dev@gmail.com');
    console.log('📧 수신자:', userEmail);

    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('이메일 인증 이메일 발송 실패:', error);
    return { success: false, error: error.message };
  }
};

// 비밀번호 재설정 이메일 발송 함수
const sendPasswordResetEmail = async (userEmail, userName, resetToken) => {
  try {
    // 개발 환경에서는 실제 이메일 발송 대신 콘솔에 출력
    if (process.env.NODE_ENV === 'development' && !process.env.EMAIL_PASSWORD) {
      console.log('📧 === 비밀번호 재설정 이메일 (개발 모드) ===');
      console.log('📧 발송자: vitalfit.dev@gmail.com');
      console.log('📧 수신자:', userEmail);
      console.log('📧 제목: [VitalFit] 비밀번호 재설정 요청');
      console.log('📧 사용자명:', userName);
      console.log('📧 재설정 토큰:', resetToken);
      console.log('📧 이메일 내용:');
      console.log(createPasswordResetEmail(userName, resetToken));
      console.log('📧 === 이메일 내용 끝 ===');

      return { success: true, messageId: 'dev-mode-email' };
    }

    // 실제 Gmail 발송
    const transporter = createTransporter();

    const mailOptions = {
      from: `"VitalFit" <vitalfit.dev@gmail.com>`,
      to: userEmail,
      subject: '[VitalFit] 비밀번호 재설정 요청',
      html: createPasswordResetEmail(userName, resetToken),
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('📧 이메일 발송 성공:', info.messageId);
    console.log('📧 발송자:', 'vitalfit.dev@gmail.com');
    console.log('�� 수신자:', userEmail);

    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('이메일 발송 실패:', error);
    return { success: false, error: error.message };
  }
};

// 로그인 인증 코드 이메일 발송 함수
const sendLoginVerificationCode = async (userEmail, userName, verificationCode) => {
  try {
    // 개발 환경에서는 실제 이메일 발송 대신 콘솔에 출력
    if (process.env.NODE_ENV === 'development' && !process.env.EMAIL_PASSWORD) {
      console.log('📧 === 로그인 인증 코드 이메일 (개발 모드) ===');
      console.log('📧 발송자: vitalfit.dev@gmail.com');
      console.log('📧 수신자:', userEmail);
      console.log('📧 제목: [VitalFit] 로그인 인증 코드');
      console.log('📧 사용자명:', userName);
      console.log('📧 인증 코드:', verificationCode);
      console.log('📧 이메일 내용:');
      console.log(createLoginVerificationEmail(userName, verificationCode));
      console.log('📧 === 이메일 내용 끝 ===');

      return { success: true, messageId: 'dev-mode-login-verification-email' };
    }

    // 실제 Gmail 발송
    const transporter = createTransporter();

    const mailOptions = {
      from: `"VitalFit" <vitalfit.dev@gmail.com>`,
      to: userEmail,
      subject: '[VitalFit] 로그인 인증 코드',
      html: createLoginVerificationEmail(userName, verificationCode),
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('📧 로그인 인증 코드 이메일 발송 성공:', info.messageId);
    console.log('📧 발송자:', 'vitalfit.dev@gmail.com');
    console.log('📧 수신자:', userEmail);

    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('로그인 인증 코드 이메일 발송 실패:', error);
    return { success: false, error: error.message };
  }
};

// 휴가 신청 이메일 템플릿
const createLeaveRequestEmail = request => {
  const leaveTypeLabels = {
    vacation: '연차',
    halfday: '반차',
    sick: '병가',
    personal: '휴가',
    other: '근무신청',
  };

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="margin: 0; font-size: 28px;">VitalFit</h1>
        <p style="margin: 10px 0 0 0; opacity: 0.9;">휴가 신청 알림</p>
      </div>
      
      <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        <h2 style="color: #333; margin-bottom: 20px;">새로운 휴가 신청이 접수되었습니다</h2>
        
        <div style="background: #f8f9fa; border: 2px solid #e9ecef; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <h3 style="color: #495057; margin-top: 0;">신청 정보</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #495057;">신청자:</td>
              <td style="padding: 8px 0; color: #666;">${request.user.name} (${request.user.position})</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #495057;">휴가 유형:</td>
              <td style="padding: 8px 0; color: #666;">${leaveTypeLabels[request.leaveType] || '기타'}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #495057;">기간:</td>
              <td style="padding: 8px 0; color: #666;">${request.startDate}${request.endDate ? ` ~ ${request.endDate}` : ''}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #495057;">시간:</td>
              <td style="padding: 8px 0; color: #666;">${request.startTime} ~ ${request.endTime}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #495057;">사유:</td>
              <td style="padding: 8px 0; color: #666;">${request.reason}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #495057;">신청일:</td>
              <td style="padding: 8px 0; color: #666;">${new Date(request.submittedAt).toLocaleDateString('ko-KR')}</td>
            </tr>
          </table>
        </div>
        
        <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 15px; margin: 20px 0;">
          <p style="margin: 0; color: #856404; font-size: 14px;">
            <strong>📋 승인/반려 처리:</strong><br>
            • 아래 버튼을 클릭하여 이 신청을 승인 또는 반려할 수 있습니다<br>
            • 처리 결과는 자동으로 신청자에게 통보됩니다
          </p>
        </div>
        
        <div style="text-align: center; margin: 20px 0;">
          <a href="${process.env.BACKEND_URL || 'http://localhost:3001'}/api/users/leave/approve/${request.id}" 
             style="background: #28a745; color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; display: inline-block; font-weight: bold; margin-right: 15px;">
            ✅ 승인
          </a>
          <a href="${process.env.BACKEND_URL || 'http://localhost:3001'}/api/users/leave/reject/${request.id}" 
             style="background: #dc3545; color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; display: inline-block; font-weight: bold;">
            ❌ 반려
          </a>
        </div>
        
        <hr style="border: none; border-top: 1px solid #e9ecef; margin: 30px 0;">
        
        <p style="color: #999; font-size: 12px; text-align: center; margin: 0;">
          이 이메일은 VitalFit 시스템에서 자동으로 발송되었습니다.<br>
          문의사항이 있으시면 관리자에게 연락해주세요.
        </p>
      </div>
    </div>
  `;
};

// 휴가 응답 이메일 템플릿
const createLeaveResponseEmail = (request, action) => {
  const leaveTypeLabels = {
    vacation: '연차',
    halfday: '반차',
    sick: '병가',
    personal: '휴가',
    other: '근무신청',
  };

  const actionText = action === 'approved' ? '승인' : '반려';
  const actionColor = action === 'approved' ? '#28a745' : '#dc3545';
  const actionBgColor = action === 'approved' ? '#d4edda' : '#f8d7da';
  const actionBorderColor = action === 'approved' ? '#c3e6cb' : '#f5c6cb';

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="margin: 0; font-size: 28px;">VitalFit</h1>
        <p style="margin: 10px 0 0 0; opacity: 0.9;">휴가 신청 결과</p>
      </div>
      
      <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        <div style="background: ${actionBgColor}; border: 2px solid ${actionBorderColor}; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center;">
          <h2 style="color: ${actionColor}; margin: 0; font-size: 24px;">휴가 신청이 ${actionText}되었습니다</h2>
        </div>
        
        <div style="background: #f8f9fa; border: 2px solid #e9ecef; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <h3 style="color: #495057; margin-top: 0;">신청 정보</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #495057;">휴가 유형:</td>
              <td style="padding: 8px 0; color: #666;">${leaveTypeLabels[request.leaveType] || '기타'}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #495057;">기간:</td>
              <td style="padding: 8px 0; color: #666;">${request.startDate}${request.endDate ? ` ~ ${request.endDate}` : ''}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #495057;">시간:</td>
              <td style="padding: 8px 0; color: #666;">${request.startTime} ~ ${request.endTime}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #495057;">사유:</td>
              <td style="padding: 8px 0; color: #666;">${request.reason}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #495057;">처리일:</td>
              <td style="padding: 8px 0; color: #666;">${new Date().toLocaleDateString('ko-KR')}</td>
            </tr>
          </table>
        </div>
        
        <div style="background: #d1ecf1; border: 1px solid #bee5eb; border-radius: 8px; padding: 15px; margin: 20px 0;">
          <p style="margin: 0; color: #0c5460; font-size: 14px;">
            <strong>ℹ️ 안내사항:</strong><br>
            • ${action === 'approved' ? '승인된 휴가는 지정된 기간에 사용할 수 있습니다' : '거절된 휴가는 사용할 수 없습니다'}<br>
            • 추가 문의사항이 있으시면 관리자에게 연락해주세요
          </p>
        </div>
        
        <hr style="border: none; border-top: 1px solid #e9ecef; margin: 30px 0;">
        
        <p style="color: #999; font-size: 12px; text-align: center; margin: 0;">
          이 이메일은 VitalFit 시스템에서 자동으로 발송되었습니다.<br>
          문의사항이 있으시면 관리자에게 연락해주세요.
        </p>
      </div>
    </div>
  `;
};

// 휴가 신청 이메일 발송 함수
const sendLeaveRequestEmail = async (request, adminEmail) => {
  try {
    // 환경 변수 디버깅
    console.log('🔧 이메일 발송 환경 변수 확인:');
    console.log('  - NODE_ENV:', process.env.NODE_ENV);
    console.log('  - EMAIL_PASSWORD 존재:', !!process.env.EMAIL_PASSWORD);
    console.log(
      '  - EMAIL_PASSWORD 길이:',
      process.env.EMAIL_PASSWORD ? process.env.EMAIL_PASSWORD.length : 0
    );

    // 개발 환경에서도 실제 이메일 발송 (EMAIL_PASSWORD가 있으면)
    if (process.env.NODE_ENV === 'development' && !process.env.EMAIL_PASSWORD) {
      console.log('📧 === 휴가 신청 이메일 (개발 모드 - 콘솔 출력) ===');
      console.log('📧 발송자: vitalfit.dev@gmail.com');
      console.log('📧 수신자:', adminEmail);
      console.log('📧 제목: [VitalFit] 새로운 휴가 신청 알림');
      console.log('📧 이메일 내용:');
      console.log(createLeaveRequestEmail(request));
      console.log('📧 === 이메일 내용 끝 ===');

      return { success: true, messageId: 'dev-mode-leave-request-email' };
    }

    // 실제 Gmail 발송
    const transporter = createTransporter();

    const mailOptions = {
      from: `"VitalFit" <vitalfit.dev@gmail.com>`,
      to: adminEmail,
      subject: '[VitalFit] 새로운 휴가 신청 알림',
      html: createLeaveRequestEmail(request),
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('📧 휴가 신청 이메일 발송 성공:', info.messageId);
    console.log('📧 발송자:', 'vitalfit.dev@gmail.com');
    console.log('📧 수신자:', adminEmail);

    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('휴가 신청 이메일 발송 실패:', error);
    return { success: false, error: error.message };
  }
};

// 휴가 응답 이메일 발송 함수
const sendLeaveResponseEmail = async (request, action, userEmail) => {
  try {
    // 개발 환경에서는 실제 이메일 발송 대신 콘솔에 출력
    if (process.env.NODE_ENV === 'development' && !process.env.EMAIL_PASSWORD) {
      console.log('📧 === 휴가 응답 이메일 (개발 모드) ===');
      console.log('📧 발송자: vitalfit.dev@gmail.com');
      console.log('📧 수신자:', userEmail);
      console.log('📧 제목: [VitalFit] 휴가 신청 결과');
      console.log('📧 액션:', action);
      console.log('📧 이메일 내용:');
      console.log(createLeaveResponseEmail(request, action));
      console.log('📧 === 이메일 내용 끝 ===');

      return { success: true, messageId: 'dev-mode-leave-response-email' };
    }

    // 실제 Gmail 발송
    const transporter = createTransporter();

    const mailOptions = {
      from: `"VitalFit" <vitalfit.dev@gmail.com>`,
      to: userEmail,
      subject: '[VitalFit] 휴가 신청 결과',
      html: createLeaveResponseEmail(request, action),
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('📧 휴가 응답 이메일 발송 성공:', info.messageId);
    console.log('📧 발송자:', 'vitalfit.dev@gmail.com');
    console.log('📧 수신자:', userEmail);

    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('휴가 응답 이메일 발송 실패:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendLoginVerificationCode,
  createVerificationEmail,
  createPasswordResetEmail,
  createLoginVerificationEmail,
  generateSecureTempPassword,
  sendLeaveRequestEmail,
  sendLeaveResponseEmail,
};
