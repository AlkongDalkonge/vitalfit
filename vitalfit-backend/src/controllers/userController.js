const { User, Center, Position, Team } = require('../models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const { createHash, validateForeignKey } = require('../utils/userUtils');
const { createUpload, deleteFile, createFilePath } = require('../utils/uploadUtils');
const {
  sendPasswordResetEmail,
  generateSecureTempPassword,
  sendVerificationEmail,
} = require('../utils/emailService');
const config = require('../config/config');
const { generateReAuthToken } = require('../middlewares/reauthMiddleware');
const secret = config.jwt.secret;
const { Op } = require('sequelize'); // Op 추가
const crypto = require('crypto'); // crypto 추가

// 이메일 인증 토큰 스키마
const emailVerificationSchema = Joi.object({
  token: Joi.string().required(),
});

const signUpSchema = Joi.object({
  name: Joi.string().min(2).max(20).required().messages({
    'any.required': '이름은 필수입니다.',
  }),

  email: Joi.string().email().required().messages({
    'string.email': '올바른 이메일 형식이 아닙니다.',
    'any.required': '이메일은 필수입니다.',
  }),

  password: Joi.string().min(8).required().messages({
    'string.min': '비밀번호는 최소 8자 이상이어야 합니다.',
    'any.required': '비밀번호는 필수입니다.',
  }),

  confirmPassword: Joi.string().valid(Joi.ref('password')).required().messages({
    'any.only': '비밀번호가 일치하지 않습니다.',
    'any.required': '비밀번호 확인은 필수입니다.',
  }),
  phone: Joi.string()
    .pattern(/^01[0-9]-\d{3,4}-\d{4}$/)
    .required()
    .messages({
      'string.pattern.base': '전화번호 형식이 올바르지 않습니다. (예: 010-1234-5678)',
      'any.required': '전화번호는 필수입니다.',
    }),
  position_id: Joi.number().required().messages({
    'any.required': '직책은 필수입니다.',
  }),
  center_id: Joi.number().required().messages({
    'any.required': '센터는 필수입니다.',
  }),
  team_id: Joi.number().optional().allow(null, ''),
  nickname: Joi.string().optional().allow(''),
  license: Joi.string().optional().allow(''),
  experience: Joi.string().optional().allow(''),
  education: Joi.string().optional().allow(''),
  instagram: Joi.string().optional().allow(''),
  shift: Joi.string().optional().allow(''),

  terms_accepted: Joi.boolean().valid(true).required().messages({
    'any.only': '약관 동의는 필수입니다.',
    'any.required': '약관 동의는 필수입니다.',
  }),

  privacy_accepted: Joi.boolean().valid(true).required().messages({
    'any.only': '개인정보처리방침 동의는 필수입니다.',
    'any.required': '개인정보처리방침 동의는 필수입니다.',
  }),

  // 웹캠 관련 필드는 선택사항으로 유지
  profile_image_name: Joi.string().optional().allow('', null),
  profile_image_url: Joi.string().optional().allow('', null),
});

// ✅ 회원가입 (이메일 인증 필요, JWT 발급 안함)
const signUp = async (req, res, next) => {
  try {
    console.log('회원가입 요청 데이터:', req.body);
    const { error, value } = signUpSchema.validate(req.body);
    if (error) {
      console.log('회원가입 검증 오류:', error.details);
      return res.status(400).json({
        success: false,
        message: '입력 정보를 확인해주세요.',
        details: error.details.map(detail => detail.message),
      });
    }
    console.log('검증된 데이터:', value);

    const { email, password, center_id, position_id, team_id, terms_accepted } = value;

    // 탈퇴한 사용자의 이메일인지 확인
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser && existingUser.status === 'active') {
      return res.status(400).json({ success: false, message: '이미 가입된 이메일입니다.' });
    }

    // 탈퇴한 사용자라면 기존 계정을 재활성화
    if (existingUser && existingUser.status === 'inactive') {
      // 기존 계정 정보 업데이트
      existingUser.name = value.name;
      existingUser.password = await createHash(password);
      existingUser.phone = value.phone;
      existingUser.position_id = value.position_id;
      existingUser.center_id = value.center_id;
      existingUser.team_id = value.team_id || null;
      existingUser.nickname = value.nickname || null;
      existingUser.license = value.license || null;
      existingUser.experience = value.experience || null;
      existingUser.education = value.education || null;
      existingUser.instagram = value.instagram || null;
      existingUser.shift = value.shift || null;
      existingUser.terms_accepted = value.terms_accepted;
      existingUser.terms_accepted_at = new Date();
      existingUser.status = 'pending_verification'; // 이메일 인증 대기 상태
      existingUser.join_date = new Date(); // 자동으로 현재 날짜 설정
      existingUser.leave_date = null; // 탈퇴일 초기화

      if (req.file) {
        existingUser.profile_image_name = req.body.profile_image_name;
        existingUser.profile_image_url = req.body.profile_image_url;
      }

      await existingUser.save();

      // 6자리 인증 코드 생성 (새 사용자와 동일하게)
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

      // 인증 코드를 사용자 정보에 저장
      existingUser.verification_code = verificationCode;
      existingUser.verification_code_expires_at = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24시간 유효
      await existingUser.save();

      // 이메일 인증 메일 발송
      await sendVerificationEmail(existingUser.email, existingUser.name, verificationCode);

      return res.status(200).json({
        success: true,
        message: '기존 계정이 재활성화되었습니다. 이메일 인증을 완료해주세요.',
        requiresEmailVerification: true,
      });
    }

    // 새 사용자 생성
    const hashedPassword = await createHash(password);
    const userData = {
      ...value,
      password: hashedPassword,
      status: 'pending_verification', // 이메일 인증 대기 상태
      join_date: new Date(), // 자동으로 현재 날짜 설정
      // 선택사항 필드들의 빈 문자열을 null로 변환
      team_id: value.team_id || null,
      nickname: value.nickname || null,
      license: value.license || null,
      experience: value.experience || null,
      education: value.education || null,
      instagram: value.instagram || null,
      shift: value.shift || null,
    };

    if (req.file) {
      userData.profile_image_name = req.body.profile_image_name;
      userData.profile_image_url = req.body.profile_image_url;
    }

    const newUser = await User.create(userData);

    // 6자리 인증 코드 생성
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    // 인증 코드를 사용자 정보에 저장
    newUser.verification_code = verificationCode;
    newUser.verification_code_expires_at = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24시간 유효
    await newUser.save();

    // 이메일 인증 메일 발송
    await sendVerificationEmail(newUser.email, newUser.name, verificationCode);

    return res.status(201).json({
      success: true,
      message: '회원가입이 완료되었습니다. 이메일 인증을 완료해주세요.',
      requiresEmailVerification: true,
    });
  } catch (err) {
    console.error('회원가입 처리 중 오류 발생:', err);
    console.error('오류 스택:', err.stack);

    // 데이터베이스 관련 오류인지 확인
    if (err.name === 'SequelizeValidationError') {
      return res.status(400).json({
        success: false,
        message: '입력 데이터가 올바르지 않습니다.',
        details: err.errors.map(e => e.message),
      });
    }

    if (err.name === 'SequelizeForeignKeyConstraintError') {
      return res.status(400).json({
        success: false,
        message: '존재하지 않는 직책 또는 센터입니다.',
        details: err.message,
      });
    }

    // 기타 오류
    return res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.',
      details: err.message,
    });
  }
};

// ✅ 이메일 인증 완료
const verifyEmail = async (req, res, next) => {
  try {
    const { email, verificationCode } = req.body;

    if (!email || !verificationCode) {
      return res.status(400).json({
        success: false,
        message: '이메일과 인증 코드를 모두 입력해주세요.',
      });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ success: false, message: '사용자를 찾을 수 없습니다.' });
    }

    // 인증 코드 확인
    if (user.verification_code !== verificationCode) {
      return res.status(400).json({ success: false, message: '인증 코드가 올바르지 않습니다.' });
    }

    // 인증 코드 만료 확인
    if (user.verification_code_expires_at < new Date()) {
      return res.status(400).json({
        success: false,
        message: '인증 코드가 만료되었습니다. 다시 인증 코드를 발송해주세요.',
      });
    }

    // 이메일 인증 완료
    user.status = 'active';
    user.email_verified_at = new Date();
    user.verification_code = null;
    user.verification_code_expires_at = null;
    await user.save();

    return res.status(200).json({
      success: true,
      message: '이메일 인증이 완료되었습니다. 로그인 페이지로 이동합니다.',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        status: user.status,
        email_verified_at: user.email_verified_at,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ✅ 로그인 (바로 JWT 토큰 발급)
const signIn = async (req, res, next) => {
  try {
    const { email, password, rememberMe = false } = req.body;
    if (!email || !password)
      return res.status(400).json({
        success: false,
        message: '이메일과 비밀번호를 모두 입력해주세요.',
      });

    const user = await User.findOne({
      where: { email },
    });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      if (user) {
        user.login_attempts += 1;
        if (user.login_attempts >= 100) {
          user.is_locked = true;
        }
        await user.save();
      }
      return res.status(401).json({ success: false, message: '로그인 정보가 올바르지 않습니다.' });
    }

    if (user.is_locked)
      return res.status(403).json({
        success: false,
        message: '계정이 잠겼습니다. 관리자에게 문의해주세요.',
      });

    // 이메일 인증이 완료되지 않은 사용자는 로그인 차단
    if (user.status === 'pending_verification') {
      return res.status(403).json({
        success: false,
        message: '이메일 인증을 완료해주세요.',
        code: 'EMAIL_NOT_VERIFIED',
      });
    }

    // 탈퇴된 사용자는 로그인 차단
    if (user.status === 'retired') {
      return res.status(403).json({
        success: false,
        message: '탈퇴된 계정입니다. 회원가입을 다시 진행해주세요.',
        code: 'ACCOUNT_DEACTIVATED',
      });
    }

    user.login_attempts = 0;
    user.last_login_at = new Date();
    await user.save();

    // Access Token 생성 (Remember Me에 따라 다른 만료 시간)
    const accessTokenExpiry = rememberMe ? '7d' : '24h';
    const accessToken = jwt.sign(
      {
        uid: user.id,
        type: 'access',
        rememberMe,
      },
      secret,
      { expiresIn: accessTokenExpiry }
    );

    // Refresh Token 생성 (30일)
    const refreshToken = jwt.sign(
      {
        uid: user.id,
        type: 'refresh',
        rememberMe,
      },
      secret,
      { expiresIn: '30d' }
    );

    // Refresh Token을 사용자 테이블에 저장
    user.refresh_token = refreshToken;
    await user.save();

    return res.status(200).json({
      success: true,
      message: '로그인 성공!',
      token: accessToken,
      refreshToken: refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        profile_image_url: user.profile_image_url,
        nickname: user.nickname,
        position_id: user.position_id,
        center_id: user.center_id,
        team_id: user.team_id,
        status: user.status,
      },
    });
  } catch (err) {
    next(err);
  }
};

// 🔄 Access Token 갱신 (Refresh Token 사용)
const refreshAccessToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token이 필요합니다.',
      });
    }

    // Refresh Token 검증
    const decoded = jwt.verify(refreshToken, secret);

    if (decoded.type !== 'refresh') {
      return res.status(401).json({
        success: false,
        message: '유효하지 않은 refresh token입니다.',
      });
    }

    // 사용자 확인
    const user = await User.findOne({
      where: {
        id: decoded.uid,
        refresh_token: refreshToken,
      },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: '유효하지 않은 refresh token입니다.',
      });
    }

    // 사용자 상태 확인
    if (user.status === 'inactive') {
      return res.status(403).json({
        success: false,
        message: '탈퇴된 계정입니다.',
        code: 'ACCOUNT_DEACTIVATED',
      });
    }

    // 새로운 Access Token 생성
    const accessTokenExpiry = decoded.rememberMe ? '7d' : '24h';
    const newAccessToken = jwt.sign(
      {
        uid: user.id,
        type: 'access',
        rememberMe: decoded.rememberMe,
      },
      secret,
      { expiresIn: accessTokenExpiry }
    );

    return res.status(200).json({
      success: true,
      message: '토큰이 갱신되었습니다.',
      accessToken: newAccessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        profile_image_url: user.profile_image_url,
        nickname: user.nickname,
        position_id: user.position_id,
        center_id: user.center_id,
        team_id: user.team_id,
        status: user.status,
      },
    });
  } catch (err) {
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: '유효하지 않은 refresh token입니다.',
      });
    }
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Refresh token이 만료되었습니다. 다시 로그인해주세요.',
      });
    }
    next(err);
  }
};

// 내 계정 보기
const getMyAccount = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.uid, {
      attributes: [
        'id',
        'name',
        'email',
        'phone',
        'gender',
        'profile_image_url',
        'nickname',
        'position_id',
        'center_id',
        'team_id',
        'status',
        'account_number',
        'account_bank',
        'account_image_url',
        'account_image_name',
        'license',
        'experience',
        'education',
        'instagram',
        // refresh_token은 보안상 별도로 관리
      ],
    });
    if (!user)
      return res.status(404).json({ success: false, message: '사용자를 찾을 수 없습니다.' });

    // 탈퇴된 사용자는 접근 차단
    if (user.status === 'inactive') {
      return res.status(403).json({
        success: false,
        message: '탈퇴된 계정입니다. 다시 로그인해주세요.',
        code: 'ACCOUNT_DEACTIVATED',
      });
    }

    return res.status(200).json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        gender: user.gender,
        profile_image_url: user.profile_image_url,
        nickname: user.nickname,
        position_id: user.position_id,
        center_id: user.center_id,
        team_id: user.team_id,
        status: user.status,
        account_number: user.account_number,
        account_bank: user.account_bank,
        account_image_url: user.account_image_url,
        account_image_name: user.account_image_name,
        license: user.license,
        experience: user.experience,
        education: user.education,
        instagram: user.instagram,
        // refresh_token은 보안상 별도로 관리
      },
    });
  } catch (err) {
    next(err);
  }
};

// 내 정보 수정
const updateMyAccount = async (req, res, next) => {
  try {
    const updates = req.body;

    // 디버깅을 위한 로깅 추가
    console.log('🔍 updateMyAccount 호출됨');
    console.log('📥 받은 데이터:', updates);
    console.log('📋 position_id:', updates.position_id, 'type:', typeof updates.position_id);
    console.log('📋 center_id:', updates.center_id, 'type:', typeof updates.center_id);
    console.log('📋 license:', updates.license ? '있음' : '없음');
    console.log('📋 experience:', updates.experience ? '있음' : '없음');
    console.log('📋 education:', updates.education ? '있음' : '없음');
    console.log('📋 instagram:', updates.instagram ? '있음' : '없음');

    // shift 데이터 검증
    if (updates.shift) {
      try {
        const parsedShift = JSON.parse(updates.shift);
        if (!parsedShift || typeof parsedShift !== 'object') {
          return res.status(400).json({
            success: false,
            message: '근무 일정 데이터 형식이 올바르지 않습니다.',
          });
        }

        // 압축된 형식 (s, d, t) 또는 일반 형식 (schedules) 모두 지원
        let schedules;
        if (parsedShift.schedules && Array.isArray(parsedShift.schedules)) {
          // 일반 형식
          schedules = parsedShift.schedules;
        } else if (parsedShift.s && Array.isArray(parsedShift.s)) {
          // 압축된 형식
          schedules = parsedShift.s;
        } else {
          return res.status(400).json({
            success: false,
            message: '근무 일정 스케줄 데이터가 올바르지 않습니다.',
          });
        }

        // 각 스케줄 검증
        for (let i = 0; i < schedules.length; i++) {
          const schedule = schedules[i];
          // 압축된 형식 (d, t.s, t.e) 또는 일반 형식 (days, time.start, time.end) 모두 지원
          const days = schedule.days || schedule.d;
          const time = schedule.time || schedule.t;

          if (!days || !Array.isArray(days) || !time) {
            return res.status(400).json({
              success: false,
              message: `스케줄 ${i + 1}의 데이터 형식이 올바르지 않습니다.`,
            });
          }

          // 시간 검증
          const startTime = time.start || time.s;
          const endTime = time.end || time.e;
          if (!startTime || !endTime) {
            return res.status(400).json({
              success: false,
              message: `스케줄 ${i + 1}의 시간 데이터가 올바르지 않습니다.`,
            });
          }
        }

        console.log('✅ shift 데이터 검증 통과:', parsedShift);
      } catch (parseError) {
        console.error('shift 데이터 파싱 실패:', parseError);
        return res.status(400).json({
          success: false,
          message: '근무 일정 데이터를 파싱할 수 없습니다.',
        });
      }
    }

    // 필수 필드 검증 및 전처리
    // 자격증, 경력, 학력, 인스타그램만 업데이트하는 경우에는 필수 필드 검증 건너뛰기
    const isOnlyAdditionalInfoUpdate =
      updates.license !== undefined ||
      updates.experience !== undefined ||
      updates.education !== undefined ||
      updates.instagram !== undefined;

    // position_id나 center_id가 실제로 업데이트되는 경우에만 해당 필드 검증
    console.log('🔍 position_id 검증 시작:', updates.position_id !== undefined);
    if (updates.position_id !== undefined) {
      console.log('⚠️ position_id 검증 실행:', updates.position_id);
      if (!updates.position_id || updates.position_id === '') {
        console.log('❌ position_id 검증 실패');
        return res.status(400).json({
          success: false,
          message: '직책은 필수 선택 항목입니다.',
        });
      }
      console.log('✅ position_id 검증 통과');
    }

    console.log('🔍 center_id 검증 시작:', updates.center_id !== undefined);
    if (updates.center_id !== undefined) {
      console.log('⚠️ center_id 검증 실행:', updates.center_id);
      if (!updates.center_id || updates.center_id === '') {
        console.log('❌ center_id 검증 실패');
        return res.status(400).json({
          success: false,
          message: '센터는 필수 선택 항목입니다.',
        });
      }
      console.log('✅ center_id 검증 통과');
    }

    // 빈 문자열을 null로 변환 (선택적 필드만)
    if (updates.team_id === '') {
      updates.team_id = null;
    }

    // 외래키 검증 - 각 필드가 실제로 업데이트되는 경우에만 수행
    if (updates.center_id !== undefined) {
      await validateForeignKey(Center, updates.center_id, '센터');
    }
    if (updates.position_id !== undefined) {
      await validateForeignKey(Position, updates.position_id, '직책');
    }
    if (updates.team_id !== undefined) {
      await validateForeignKey(Team, updates.team_id, '팀');
    }

    const user = await User.findByPk(req.user.uid);
    if (!user)
      return res.status(404).json({ success: false, message: '사용자를 찾을 수 없습니다.' });

    if (req.file) {
      // processFile 미들웨어가 이미 req.body에 설정해줌
      updates.profile_image_name = req.body.profile_image_name;
      updates.profile_image_url = req.body.profile_image_url;
    }

    // enum 필드들이 빈 문자열이면 null로 변환
    if (updates.gender === '') {
      updates.gender = null;
    }

    // gender 필드 값 검증
    if (updates.gender && !['male', 'female'].includes(updates.gender)) {
      return res.status(400).json({
        success: false,
        message: '성별은 male, female 중 하나여야 합니다.',
      });
    }

    // ❌ 보안: status 필드는 사용자가 직접 변경할 수 없음
    if (updates.status !== undefined) {
      delete updates.status;
      console.warn(`[SECURITY] User ${req.user.uid} attempted to change status field`);
    }

    // 날짜 필드 처리: 빈 문자열이거나 "Invalid date"면 null로 변환
    if (updates.join_date === '' || updates.join_date === 'Invalid date') {
      updates.join_date = null;
    }
    if (updates.leave_date === '' || updates.leave_date === 'Invalid date') {
      updates.leave_date = null;
    }

    console.log('업데이트할 데이터:', updates);

    await user.update(updates);

    // 업데이트된 사용자 정보 조회
    const updatedUser = await User.findByPk(req.user.uid, {
      include: [
        { model: Position, as: 'position' },
        { model: Center, as: 'center' },
        { model: Team, as: 'team' },
      ],
    });

    return res.status(200).json({
      success: true,
      message: '내 정보가 수정되었습니다.',
      user: updatedUser,
    });
  } catch (err) {
    console.error('updateMyAccount 에러:', err);
    next(err);
  }
};

// 계좌 정보 업데이트
const updateAccountInfo = async (req, res, next) => {
  try {
    const { account_number, account_bank, account_image_name, account_image_url } = req.body;

    // 계좌번호가 없어도 저장 가능 (기존 정보 초기화 목적)
    // if (!account_number) {
    //   return res.status(400).json({
    //     success: false,
    //     message: '계좌번호를 입력해주세요.',
    //   });
    // }

    const user = await User.findByPk(req.user.uid);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '사용자를 찾을 수 없습니다.',
      });
    }

    // 계좌 정보 업데이트
    const updateData = { account_number };
    if (account_bank) updateData.account_bank = account_bank;
    if (account_image_name) updateData.account_image_name = account_image_name;
    if (account_image_url) updateData.account_image_url = account_image_url;

    await user.update(updateData);

    return res.status(200).json({
      success: true,
      message: '계좌 정보가 업데이트되었습니다.',
      account_number: account_number,
      account_image_name: account_image_name,
      account_image_url: account_image_url,
    });
  } catch (err) {
    console.error('updateAccountInfo 에러:', err);
    next(err);
  }
};

// 자격증, 경력, 학력, 인스타그램 정보 업데이트
const updateAdditionalInfo = async (req, res, next) => {
  try {
    const { license, experience, education, instagram } = req.body;

    const user = await User.findByPk(req.user.uid);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '사용자를 찾을 수 없습니다.',
      });
    }

    // 추가 정보 업데이트
    const updateData = {};
    if (license !== undefined) updateData.license = license;
    if (experience !== undefined) updateData.experience = experience;
    if (education !== undefined) updateData.education = education;
    if (instagram !== undefined) updateData.instagram = instagram;

    await user.update(updateData);

    return res.status(200).json({
      success: true,
      message: '추가 정보가 업데이트되었습니다.',
      license: updateData.license,
      experience: updateData.experience,
      education: updateData.education,
      instagram: updateData.instagram,
    });
  } catch (err) {
    console.error('updateAdditionalInfo 에러:', err);
    next(err);
  }
};

// 자격증 정보만 업데이트
const updateLicense = async (req, res, next) => {
  try {
    const { license } = req.body;

    const user = await User.findByPk(req.user.uid);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '사용자를 찾을 수 없습니다.',
      });
    }

    await user.update({ license });

    return res.status(200).json({
      success: true,
      message: '자격증 정보가 업데이트되었습니다.',
      license: license,
    });
  } catch (err) {
    console.error('updateLicense 에러:', err);
    next(err);
  }
};

// 경력 정보만 업데이트
const updateExperience = async (req, res, next) => {
  try {
    const { experience } = req.body;
    console.log('🔄 경력 업데이트 요청:', { experience, userId: req.user.uid });

    const user = await User.findByPk(req.user.uid);
    if (!user) {
      console.log('❌ 사용자를 찾을 수 없음:', req.user.uid);
      return res.status(404).json({
        success: false,
        message: '사용자를 찾을 수 없습니다.',
      });
    }

    console.log('✅ 사용자 찾음:', user.id);
    await user.update({ experience });
    console.log('💾 경력 정보 업데이트 완료');

    return res.status(200).json({
      success: true,
      message: '경력 정보가 업데이트되었습니다.',
      experience: experience,
    });
  } catch (err) {
    console.error('❌ updateExperience 에러:', err);
    next(err);
  }
};

// 학력 정보만 업데이트
const updateEducation = async (req, res, next) => {
  try {
    const { education } = req.body;
    console.log('🔄 학력 업데이트 요청:', { education, userId: req.user.uid });

    const user = await User.findByPk(req.user.uid);
    if (!user) {
      console.log('❌ 사용자를 찾을 수 없음:', req.user.uid);
      return res.status(404).json({
        success: false,
        message: '사용자를 찾을 수 없습니다.',
      });
    }

    console.log('✅ 사용자 찾음:', user.id);
    await user.update({ education });
    console.log('💾 학력 정보 업데이트 완료');

    return res.status(200).json({
      success: true,
      message: '학력 정보가 업데이트되었습니다.',
      education: education,
    });
  } catch (err) {
    console.error('❌ updateEducation 에러:', err);
    next(err);
  }
};

// 인스타그램 정보만 업데이트
const updateInstagram = async (req, res, next) => {
  try {
    const { instagram } = req.body;

    const user = await User.findByPk(req.user.uid);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '사용자를 찾을 수 없습니다.',
      });
    }

    await user.update({ instagram });

    return res.status(200).json({
      success: true,
      message: '인스타그램 정보가 업데이트되었습니다.',
      instagram: instagram,
    });
  } catch (err) {
    console.error('updateInstagram 에러:', err);
    next(err);
  }
};

// 로그아웃 (프론트에서 토큰 삭제로 처리)
const logout = async (req, res) => {
  res.status(200).json({ success: true, message: '로그아웃되었습니다.' });
};

// 비밀번호 재설정 (8자리 임시 비밀번호 생성 및 이메일 발송)
const resetPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: '이메일 주소를 입력해주세요.',
      });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '해당 이메일 사용자를 찾을 수 없습니다.',
      });
    }

    // 탈퇴한 계정인지 확인
    if (user.status === 'inactive') {
      return res.status(403).json({
        success: false,
        message: '탈퇴된 계정입니다. 회원가입을 다시 진행해주세요.',
        code: 'ACCOUNT_DEACTIVATED',
      });
    }

    // 8자리 안전한 임시 비밀번호 생성
    const tempPassword = generateSecureTempPassword(8);

    // 개발 환경에서 임시 비밀번호를 콘솔에 출력 (테스트용)
    if (process.env.NODE_ENV === 'development') {
      console.log('🔐 === 비밀번호 재설정 ===');
      console.log('📧 사용자 이메일:', email);
      console.log('👤 사용자 이름:', user.name);
      console.log('🔑 생성된 임시 비밀번호:', tempPassword);
      console.log('🔐 === 비밀번호 재설정 끝 ===');
    }

    // 임시 비밀번호 해시화
    const bcrypt = require('bcrypt');
    const hashedTempPassword = await bcrypt.hash(tempPassword, 10);

    // 사용자 비밀번호를 임시 비밀번호로 업데이트
    user.password = hashedTempPassword;
    await user.save();

    // 이메일로 임시 비밀번호 발송
    const emailResult = await sendPasswordResetEmail(email, user.name, tempPassword);

    if (emailResult.success) {
      return res.status(200).json({
        success: true,
        message: '임시 비밀번호가 이메일로 발송되었습니다. 이메일을 확인해주세요.',
      });
    } else {
      // 이메일 발송 실패 시 원래 비밀번호로 복원 (보안상 필요)
      console.error('이메일 발송 실패:', emailResult.error);
      return res.status(500).json({
        success: false,
        message: '이메일 발송에 실패했습니다. 잠시 후 다시 시도해주세요.',
      });
    }
  } catch (err) {
    console.error('비밀번호 재설정 오류:', err);
    next(err);
  }
};

// ✅ 비밀번호 변경
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.uid;

    // 현재 사용자 정보 조회
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: '사용자를 찾을 수 없습니다.' });
    }

    // 현재 비밀번호 확인
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return res
        .status(400)
        .json({ success: false, message: '현재 비밀번호가 일치하지 않습니다.' });
    }

    // 새 비밀번호가 현재 비밀번호와 같은지 확인
    if (currentPassword === newPassword) {
      return res
        .status(400)
        .json({ success: false, message: '새 비밀번호는 현재 비밀번호와 달라야 합니다.' });
    }

    // 새 비밀번호 해시화
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // 비밀번호 업데이트
    await user.update({ password: hashedNewPassword });

    res.json({ success: true, message: '비밀번호가 성공적으로 변경되었습니다.' });
  } catch (error) {
    next(error);
  }
};

// ✅ 비밀번호 확인 (재인증용) - 재인증 토큰 발급
const verifyPassword = async (req, res, next) => {
  try {
    const { password } = req.body;
    const userId = req.user.uid;

    // 현재 사용자 정보 조회
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: '사용자를 찾을 수 없습니다.' });
    }

    // 비밀번호 확인
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ success: false, message: '비밀번호가 일치하지 않습니다.' });
    }

    // 재인증 성공 시 재인증 토큰 발급 (2분 유효)
    const reAuthToken = generateReAuthToken(userId);

    res.json({
      success: true,
      message: '비밀번호 확인이 완료되었습니다.',
      reAuthToken,
      expiresIn: '2m',
    });
  } catch (error) {
    next(error);
  }
};

// 프로필 이미지 삭제
const deleteProfileImage = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.uid);
    if (!user)
      return res.status(404).json({ success: false, message: '사용자를 찾을 수 없습니다.' });

    if (user.profile_image_url) {
      const filePath = createFilePath('profiles', user.profile_image_url.split('/').pop());
      deleteFile(filePath);
    }

    await user.update({
      profile_image_name: null,
      profile_image_url: null,
    });

    return res.status(200).json({ success: true, message: '프로필 이미지가 삭제되었습니다.' });
  } catch (err) {
    next(err);
  }
};

// 프로필 이미지만 업로드
const uploadProfileImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: '프로필 이미지 파일이 필요합니다.',
      });
    }

    const user = await User.findByPk(req.user.uid);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '사용자를 찾을 수 없습니다.',
      });
    }

    // 기존 프로필 이미지가 있으면 파일 삭제
    if (user.profile_image_url) {
      const oldFilePath = createFilePath('profiles', user.profile_image_url.split('/').pop());
      deleteFile(oldFilePath);
    }

    // 새 프로필 이미지 정보 업데이트
    await user.update({
      profile_image_name: req.body.profile_image_name,
      profile_image_url: req.body.profile_image_url,
    });

    return res.status(200).json({
      success: true,
      message: '프로필 이미지가 업로드되었습니다.',
      data: {
        profile_image_name: user.profile_image_name,
        profile_image_url: user.profile_image_url,
      },
    });
  } catch (err) {
    next(err);
  }
};

// 추가 이미지 업로드 (자격증, 경력, 학력, 인스타그램)
const uploadAdditionalImage = async (req, res, next) => {
  try {
    console.log('🔍 uploadAdditionalImage 시작');
    console.log('📝 req.body:', req.body);
    console.log('📁 req.file:', req.file);
    console.log('👤 req.user:', req.user);

    const { field } = req.body; // 'license', 'experience', 'education', 'instagram', 'account'

    if (!field) {
      console.log('❌ field가 없음');
      return res.status(400).json({
        success: false,
        message: '이미지 타입을 지정해주세요.',
      });
    }

    // account 필드는 별도 처리
    if (field === 'account') {
      return res.status(200).json({
        success: true,
        message: '계좌 이미지가 업로드되었습니다.',
        data: {
          image_name: req.file.filename,
          image_url: `/uploads/additional_images/${req.file.filename}`,
          uploaded_at: new Date().toISOString(),
        },
      });
    }

    if (!req.file) {
      console.log('❌ req.file이 없음');
      return res.status(400).json({
        success: false,
        message: '업로드할 이미지가 없습니다.',
      });
    }

    // 현재 사용자 정보 가져오기
    console.log('🔍 사용자 정보 조회 시작, uid:', req.user.uid);
    const user = await User.findByPk(req.user.uid);
    console.log('👤 사용자 정보 조회 결과:', user ? '사용자 발견' : '사용자 없음');

    if (!user) {
      console.log('❌ 사용자를 찾을 수 없음');
      return res.status(404).json({
        success: false,
        message: '사용자를 찾을 수 없습니다.',
      });
    }

    // 이미지 정보 (센터 이미지와 동일한 방식)
    const imageName = req.file.filename;
    const imageUrl = `/uploads/additional_images/${imageName}`;

    // 기존 이미지가 있으면 파일 삭제 (센터 이미지와 동일한 방식)
    if (user[field]) {
      try {
        const existingData = JSON.parse(user[field]);
        if (existingData.image_url) {
          const oldFilePath = createFilePath(
            'additional_images',
            existingData.image_url.split('/').pop()
          );
          deleteFile(oldFilePath);
        }
      } catch (error) {
        console.log(`${field} 필드 파싱 실패, 기존 파일 삭제 건너뜀:`, error.message);
      }
    }

    // 새 이미지 정보를 간단한 구조로 저장 (센터 이미지와 유사)
    const newImageData = {
      image_name: imageName,
      image_url: imageUrl,
      uploaded_at: new Date().toISOString(),
    };

    // 데이터베이스에 저장
    await user.update({
      [field]: JSON.stringify(newImageData),
    });

    return res.status(200).json({
      success: true,
      message: '이미지가 업로드되었습니다.',
      data: {
        image_name: imageName,
        image_url: imageUrl,
        uploaded_at: newImageData.uploaded_at,
      },
    });
  } catch (err) {
    console.error('❌ 추가 이미지 업로드 오류:', err);
    console.error('❌ 에러 스택:', err.stack);
    console.error('❌ 에러 메시지:', err.message);
    next(err);
  }
};

// 회원 탈퇴
const deactivateAccount = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.uid);
    if (!user)
      return res.status(404).json({ success: false, message: '사용자를 찾을 수 없습니다.' });

    // 프로필 이미지가 있으면 파일도 함께 삭제
    if (user.profile_image_url) {
      try {
        const filePath = createFilePath('profiles', user.profile_image_url.split('/').pop());
        deleteFile(filePath);
      } catch (fileError) {
        console.error('프로필 이미지 파일 삭제 실패:', fileError);
        // 파일 삭제 실패해도 계정 탈퇴는 계속 진행
      }
    }

    user.status = 'inactive';
    user.leave_date = new Date();
    await user.save();

    return res.status(200).json({ success: true, message: '회원 탈퇴가 처리되었습니다.' });
  } catch (err) {
    next(err);
  }
};

// 모든 사용자 조회
const getAllUsers = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 1000,
      role,
      centerId,
      teamId,
      positionId,
      status,
      search,
    } = req.query;

    const offset = (page - 1) * limit;
    const whereClause = {};

    // 현재 로그인한 사용자 정보 조회 (권한 필터링용)
    const currentUser = await User.findByPk(req.user.uid, {
      include: [
        { model: Position, as: 'position', attributes: ['id', 'level'] },
        { model: Team, as: 'team', attributes: ['id'] },
        { model: Center, as: 'center', attributes: ['id'] },
      ],
    });

    if (!currentUser || !currentUser.position) {
      return res.status(403).json({
        success: false,
        message: '권한 정보를 찾을 수 없습니다.',
      });
    }

    const currentUserLevel = currentUser.position.level;

    // 권한에 따른 필터링 적용
    // 포지션 1~7: 본인만 조회
    if (currentUserLevel >= 1 && currentUserLevel <= 7) {
      whereClause.id = req.user.uid;
    }
    // 포지션 8~10: 소속 팀 유저만 조회
    else if (currentUserLevel >= 8 && currentUserLevel <= 10) {
      if (!currentUser.team_id) {
        return res.status(403).json({
          success: false,
          message: '팀 정보가 없어 권한을 확인할 수 없습니다.',
        });
      }
      whereClause.team_id = currentUser.team_id;
    }
    // 포지션 11: 소속 센터 유저만 조회
    else if (currentUserLevel === 11) {
      if (!currentUser.center_id) {
        return res.status(403).json({
          success: false,
          message: '센터 정보가 없어 권한을 확인할 수 없습니다.',
        });
      }
      whereClause.center_id = currentUser.center_id;
    }
    // 포지션 12, 99: 모든 유저 조회 가능 (필터링 없음)

    // 역할별 필터링 (position 기반)
    if (role) {
      // role을 position으로 매핑
      let positionIds = [];
      if (role === 'admin') {
        positionIds = [12]; // 관리자 position_id
      } else if (role === 'trainer') {
        positionIds = [3, 4, 5, 7]; // 트레이너 관련 position_id들 (팀장 포함)
      } else if (role === 'staff') {
        positionIds = [1, 2, 6, 8, 9, 10, 11]; // 기타 직원 position_id들 (팀장 제외)
      }
      if (positionIds.length > 0) {
        whereClause.position_id = { [require('sequelize').Op.in]: positionIds };
      }
    }

    // 센터별 필터링 (권한이 있는 경우에만)
    if (centerId && (currentUserLevel === 12 || currentUserLevel === 99)) {
      whereClause.center_id = parseInt(centerId);
    }

    // 팀별 필터링 (권한이 있는 경우에만)
    if (teamId && (currentUserLevel === 12 || currentUserLevel === 99)) {
      whereClause.team_id = parseInt(teamId);
    }

    // 직급별 필터링
    if (positionId) {
      whereClause.position_id = parseInt(positionId);
    }

    // 상태별 필터링
    if (status) {
      whereClause.status = status;
    }

    // 검색 필터링 (이름, 이메일, 닉네임)
    if (search) {
      whereClause[require('sequelize').Op.or] = [
        { name: { [require('sequelize').Op.iLike]: `%${search}%` } },
        { email: { [require('sequelize').Op.iLike]: `%${search}%` } },
        { nickname: { [require('sequelize').Op.iLike]: `%${search}%` } },
      ];
    }

    const { count, rows: users } = await User.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Center,
          as: 'center',
          attributes: ['id', 'name'],
        },
        {
          model: Position,
          as: 'position',
          attributes: ['id', 'name'],
        },
        {
          model: Team,
          as: 'team',
          attributes: ['id', 'name'],
        },
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    // 통계 정보 계산
    const activeUsers = users.filter(user => user.status === 'active').length;
    const inactiveUsers = users.filter(user => user.status === 'inactive').length;
    const trainerUsers = users.filter(user => [3, 4, 5, 7].includes(user.position_id)).length;
    const adminUsers = users.filter(user => user.position_id === 12).length;

    // 센터별 통계
    const centerStats = {};
    users.forEach(user => {
      const centerName = user.center?.name || 'Unknown';
      if (!centerStats[centerName]) {
        centerStats[centerName] = { total: 0, active: 0, inactive: 0, trainers: 0, admins: 0 };
      }
      centerStats[centerName].total++;
      centerStats[centerName][user.status]++;
      if ([3, 4, 5, 7].includes(user.position_id)) centerStats[centerName].trainers++;
      if (user.position_id === 12) centerStats[centerName].admins++;
    });

    // 팀별 통계
    const teamStats = {};
    users.forEach(user => {
      const teamName = user.team?.name || 'Unknown';
      if (!teamStats[teamName]) {
        teamStats[teamName] = { total: 0, active: 0, inactive: 0, trainers: 0, admins: 0 };
      }
      teamStats[teamName].total++;
      teamStats[teamName][user.status]++;
      if ([3, 4, 5, 7].includes(user.position_id)) teamStats[teamName].trainers++;
      if (user.position_id === 12) teamStats[teamName].admins++;
    });

    return res.status(200).json({
      success: true,
      message: '사용자 목록 조회 성공',
      data: {
        users: users,
        pagination: {
          current_page: parseInt(page),
          total_pages: Math.ceil(count / limit),
          total_count: count,
          limit: parseInt(limit),
        },
        statistics: {
          total_users: count,
          active_users: activeUsers,
          inactive_users: inactiveUsers,
          trainer_users: trainerUsers,
          admin_users: adminUsers,
          center_stats: centerStats,
          team_stats: teamStats,
        },
        filters: {
          role: role || null,
          center_id: centerId || null,
          team_id: teamId || null,
          position_id: positionId || null,
          status: status || null,
          search: search || null,
        },
      },
    });
  } catch (error) {
    console.error('사용자 목록 조회 오류:', error);
    return res.status(500).json({
      success: false,
      message: '사용자 목록 조회 중 오류가 발생했습니다.',
    });
  }
};

// 특정 사용자 조회
const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id, {
      include: [
        {
          model: Center,
          as: 'center',
          attributes: ['id', 'name', 'address'],
        },
        {
          model: Position,
          as: 'position',
          attributes: ['id', 'name'],
        },
        {
          model: Team,
          as: 'team',
          attributes: ['id', 'name'],
        },
      ],
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: '존재하지 않는 사용자입니다.',
      });
    }

    return res.status(200).json({
      success: true,
      message: '사용자 조회 성공',
      data: {
        user: user,
      },
    });
  } catch (error) {
    console.error('사용자 조회 오류:', error);
    return res.status(500).json({
      success: false,
      message: '사용자 조회 중 오류가 발생했습니다.',
    });
  }
};

// ✅ 포지션 목록 조회 (회원가입용)
const getPositions = async (req, res, next) => {
  try {
    const positions = await Position.findAll({
      where: { is_active: true },
      attributes: ['id', 'name', 'code', 'level', 'description'],
      order: [['level', 'ASC']],
    });

    res.json({
      success: true,
      data: positions,
    });
  } catch (error) {
    console.error('포지션 목록 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '포지션 목록을 가져오는 중 오류가 발생했습니다.',
    });
  }
};

// ✅ 센터 목록 조회 (회원가입용)
const getCenters = async (req, res, next) => {
  try {
    const centers = await Center.findAll({
      where: { status: 'active' },
      attributes: ['id', 'name', 'address', 'phone', 'description'],
      order: [['name', 'ASC']],
    });

    res.json({
      success: true,
      data: centers,
    });
  } catch (error) {
    console.error('센터 목록 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '센터 목록을 가져오는 중 오류가 발생했습니다.',
    });
  }
};

// ✅ 이메일 중복확인
const checkEmailDuplicate = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: '이메일 주소를 입력해주세요.',
      });
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: '올바른 이메일 형식을 입력해주세요.',
      });
    }

    // 기존 사용자 확인
    const existingUser = await User.findOne({ where: { email } });

    if (existingUser && existingUser.status === 'active') {
      // 활성 상태의 사용자가 있으면 사용 불가
      return res.status(200).json({
        success: true,
        available: false,
        message: '이미 사용 중인 이메일입니다.',
      });
    } else if (existingUser && existingUser.status === 'inactive') {
      // 탈퇴한 사용자의 이메일이면 재사용 가능
      return res.status(200).json({
        success: true,
        available: true,
        message: '사용 가능한 이메일입니다. (기존 계정 재활성화)',
      });
    } else {
      // 새로운 이메일이면 사용 가능
      return res.status(200).json({
        success: true,
        available: true,
        message: '사용 가능한 이메일입니다.',
      });
    }
  } catch (err) {
    console.error('이메일 중복확인 오류:', err);
    next(err);
  }
};

// ✅ 이메일 인증 코드 발송
const sendVerification = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: '이메일 주소를 입력해주세요.',
      });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '해당 이메일 사용자를 찾을 수 없습니다.',
      });
    }

    // 이미 이메일 인증이 완료된 사용자인지 확인
    if (user.status === 'active' && user.email_verified_at) {
      return res.status(400).json({
        success: false,
        message: '이미 이메일 인증이 완료된 계정입니다.',
      });
    }

    // 6자리 인증 코드 생성
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    // 인증 코드를 사용자 정보에 저장
    user.verification_code = verificationCode;
    user.verification_code_expires_at = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24시간 유효
    await user.save();

    // 이메일 인증 코드 메일 발송
    await sendVerificationEmail(user.email, user.name, verificationCode);

    return res.status(200).json({
      success: true,
      message: '인증 코드가 이메일로 발송되었습니다.',
      requiresEmailVerification: true,
    });
  } catch (err) {
    console.error('인증 코드 발송 오류:', err);
    next(err);
  }
};

// ✅ 계좌 이미지 업로드
const uploadAccountImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: '업로드할 파일이 없습니다.',
      });
    }

    console.log('=== 계좌 이미지 업로드 시작 ===');
    console.log('📁 업로드된 파일:', req.file);
    console.log('📝 req.body:', req.body);

    // 파일 정보 추출
    const originalName = req.body.account_image_name || req.file.originalname;
    const fileUrl = req.body.account_image_url || `/uploads/accounts/${req.file.filename}`;

    console.log('✅ 계좌 이미지 업로드 성공:', {
      originalName,
      fileUrl,
      filename: req.file.filename,
    });

    return res.status(200).json({
      success: true,
      message: '계좌 이미지가 업로드되었습니다.',
      data: {
        image_name: originalName,
        image_url: fileUrl,
        filename: req.file.filename,
      },
    });
  } catch (err) {
    console.error('계좌 이미지 업로드 오류:', err);
    next(err);
  }
};

module.exports = {
  signUp,
  verifyEmail,
  signIn,
  getMe: getMyAccount, // getMe를 getMyAccount로 별칭
  getMyAccount,
  updateMyAccount,
  updateAccountInfo,
  updateAdditionalInfo, // 새로 추가된 함수
  updateLicense, // 새로 추가된 함수
  updateExperience, // 새로 추가된 함수
  updateEducation, // 새로 추가된 함수
  updateInstagram, // 새로 추가된 함수
  logout,
  resetPassword,
  changePassword,
  deleteProfileImage,
  uploadProfileImage, // 새로 추가된 함수
  uploadAdditionalImage, // 새로 추가된 함수
  uploadAccountImage, // 계좌 이미지 업로드 함수
  deactivateAccount,
  getAllUsers,
  getUserById,
  getPositions,
  getCenters,
  sendVerification, // 새로 추가된 함수
  checkEmailDuplicate, // 새로 추가된 함수
  verifyPassword, // 새로 추가된 함수
  refreshAccessToken, // 새로 추가된 함수
};
