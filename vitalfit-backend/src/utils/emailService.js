const nodemailer = require('nodemailer');
const crypto = require('crypto');

// 안전한 임시 비밀번호 생성 함수
const generateSecureTempPassword = (length = 8) => {
  try {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let password = '';

    // 최소 1개의 대문자, 소문자, 숫자 포함
    password += charset.charAt(Math.floor(Math.random() * 26)); // 대문자
    password += charset.charAt(26 + Math.floor(Math.random() * 26)); // 소문자
    password += charset.charAt(52 + Math.floor(Math.random() * 10)); // 숫자

    // 나머지 문자들로 채우기
    for (let i = 3; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }

    // 문자 순서를 섞기
    const shuffledPassword = password
      .split('')
      .sort(() => Math.random() - 0.5)
      .join('');

    console.log('생성된 임시 비밀번호:', shuffledPassword);
    return shuffledPassword;
  } catch (error) {
    console.error('임시 비밀번호 생성 오류:', error);
    // 기본 임시 비밀번호 반환
    return 'Temp1234';
  }
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

// 비밀번호 재설정 이메일 템플릿
const createPasswordResetEmail = (userName, tempPassword) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="margin: 0; font-size: 28px;">VitalFit</h1>
        <p style="margin: 10px 0 0 0; opacity: 0.9;">건강한 라이프스타일을 위한 최고의 선택</p>
      </div>
      
      <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        <h2 style="color: #333; margin-bottom: 20px;">비밀번호 재설정 완료</h2>
        
        <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
          안녕하세요, <strong>${userName}</strong>님!
        </p>
        
        <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
          요청하신 비밀번호 재설정이 완료되었습니다. 아래의 임시 비밀번호로 로그인하신 후, 
          새로운 비밀번호로 변경해주세요.
        </p>
        
        <div style="background: #f8f9fa; border: 2px solid #e9ecef; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center;">
          <p style="margin: 0 0 10px 0; color: #495057; font-weight: bold;">임시 비밀번호</p>
          <p style="margin: 0; font-size: 24px; font-weight: bold; color: #007bff; letter-spacing: 2px;">${tempPassword}</p>
        </div>
        
        <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 15px; margin: 20px 0;">
          <p style="margin: 0; color: #856404; font-size: 14px;">
            <strong>⚠️ 보안 주의사항:</strong><br>
            • 임시 비밀번호는 한 번만 사용 가능합니다<br>
            • 로그인 후 반드시 새로운 비밀번호로 변경해주세요<br>
            • 타인과 비밀번호를 공유하지 마세요
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 30px;">
          <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/login" 
             style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; display: inline-block; font-weight: bold;">
            로그인하기
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

// 이메일 발송 함수
const sendPasswordResetEmail = async (userEmail, userName, tempPassword) => {
  try {
    // 개발 환경에서는 실제 이메일 발송 대신 콘솔에 출력
    if (process.env.NODE_ENV === 'development' && !process.env.EMAIL_PASSWORD) {
      console.log('=== 비밀번호 재설정 이메일 (개발 모드) ===');
      console.log('발송자: vitalfit.dev@gmail.com');
      console.log('수신자:', userEmail);
      console.log('제목: [VitalFit] 비밀번호 재설정 완료');
      console.log('사용자명:', userName);
      console.log('임시 비밀번호:', tempPassword);
      console.log('이메일 내용:');
      console.log(createPasswordResetEmail(userName, tempPassword));
      console.log('📧 === 이메일 내용 끝 ===');

      return { success: true, messageId: 'dev-mode-email' };
    }

    // 실제 Gmail 발송
    const transporter = createTransporter();

    const mailOptions = {
      from: `"VitalFit" <vitalfit.dev@gmail.com>`,
      to: userEmail,
      subject: '[VitalFit] 비밀번호 재설정 완료',
      html: createPasswordResetEmail(userName, tempPassword),
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('📧 이메일 발송 성공:', info.messageId);
    console.log('📧 발송자:', 'vitalfit.dev@gmail.com');
    console.log('📧 수신자:', userEmail);

    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('이메일 발송 실패:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendPasswordResetEmail,
  createPasswordResetEmail,
  generateSecureTempPassword,
};
