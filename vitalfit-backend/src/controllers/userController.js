const { User, Center, Position, Team } = require('../models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const { createHash, validateForeignKey } = require('../utils/userUtils');
const { createUpload, deleteFile, createFilePath } = require('../utils/uploadUtils');
const { sendPasswordResetEmail, generateSecureTempPassword } = require('../utils/emailService');
const secret = process.env.JWT_SECRET || 'vitalfit-secret-key-2025';

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
    .optional()
    .messages({
      'string.pattern.base': '전화번호 형식이 올바르지 않습니다.',
    }),
  position_id: Joi.number().required(),
  center_id: Joi.number().required(),
  team_id: Joi.number().optional(),
  nickname: Joi.string().optional(),
  license: Joi.string().optional(),
  experience: Joi.string().optional(),
  education: Joi.string().optional(),
  instagram: Joi.string().optional(),
  shift: Joi.string().optional(),

  terms_accepted: Joi.boolean().valid(true).required().messages({
    'any.only': '약관 동의는 필수입니다.',
  }),

  privacy_accepted: Joi.boolean().valid(true).required().messages({
    'any.only': '개인정보처리방침 동의는 필수입니다.',
  }),

  join_date: Joi.date().optional(), // 필수 아니면 생략 가능
  profile_image_name: Joi.string().optional(),
  profile_image_url: Joi.string().optional(),
});

// ✅ 회원가입
const signUp = async (req, res, next) => {
  try {
    const { error, value } = signUpSchema.validate(req.body);
    if (error) return res.status(400).json({ success: false, message: error.message });

    const { email, password, center_id, position_id, team_id, terms_accepted } = value;
    const existing = await User.findOne({ where: { email } });
    if (existing)
      return res.status(400).json({ success: false, message: '이미 가입된 이메일입니다.' });

    await validateForeignKey(Center, center_id, '센터');
    await validateForeignKey(Position, position_id, '직책');
    if (team_id) await validateForeignKey(Team, team_id, '팀');

    value.password = await createHash(password);
    if (terms_accepted) value.terms_accepted_at = new Date();
    value.join_date = new Date();

    // 회원가입 시 초기값 설정
    value.status = 'active';
    value.email_verified = false;
    value.login_attempts = 0;
    value.is_locked = false;

    if (req.file) {
      // processFile 미들웨어가 이미 req.body에 설정해줌
      value.profile_image_name = req.body.profile_image_name;
      value.profile_image_url = req.body.profile_image_url;
    }

    const user = await User.create(value);
    const token = jwt.sign({ uid: user.id }, secret, { expiresIn: '1h' });

    // 관리자에게 새 회원가입 알림 (선택사항)
    try {
      await sendNewUserNotification(user);
    } catch (notificationError) {
      console.error('관리자 알림 전송 실패:', notificationError);
      // 알림 실패해도 회원가입은 성공으로 처리
    }

    return res.status(201).json({
      success: true,
      message: '회원가입 완료',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        profile_image_url: user.profile_image_url,
      },
    });
  } catch (err) {
    next(err);
  }
};

// 관리자에게 새 회원가입 알림 전송
const sendNewUserNotification = async user => {
  try {
    // Position과 Center 정보 가져오기
    const position = await Position.findByPk(user.position_id);
    const center = await Center.findByPk(user.center_id);

    const notificationData = {
      type: 'new_user_registration',
      user: {
        name: user.name,
        email: user.email,
        phone: user.phone,
        position: position ? position.name : '알 수 없음',
        center: center ? center.name : '알 수 없음',
        join_date: user.join_date,
      },
      timestamp: new Date(),
    };

    // 여기에 실제 알림 로직 구현 (이메일, 웹훅 등)
    console.log('새 회원가입 알림:', notificationData);

    // TODO: 실제 알림 구현
    // - 관리자 이메일로 알림
    // - 웹 대시보드에 알림 표시
    // - 슬랙/디스코드 웹훅 등
  } catch (error) {
    console.error('알림 전송 중 오류:', error);
    throw error;
  }
};

// ✅ 로그인
const signIn = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({
        success: false,
        message: '이메일과 비밀번호를 모두 입력해주세요.',
      });

    const user = await User.findOne({ where: { email } });
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

    user.login_attempts = 0;
    user.last_login_at = new Date();
    await user.save();

    // Access Token 생성 (24시간)
    const accessToken = jwt.sign({ uid: user.id }, secret, { expiresIn: '24h' });

    return res.status(200).json({
      success: true,
      token: accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        profile_image_url: user.profile_image_url,
      },
      message: '로그인 성공!',
    });
  } catch (err) {
    next(err);
  }
};

// 내 계정 보기
const getMyAccount = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.uid, {
      attributes: { exclude: ['password'] },
      include: [
        { model: Position, as: 'position', attributes: ['name'] },
        { model: Center, as: 'center', attributes: ['name'] },
        { model: Team, as: 'team', attributes: ['name'] },
      ],
    });
    if (!user)
      return res.status(404).json({ success: false, message: '사용자를 찾을 수 없습니다.' });
    return res.status(200).json({ success: true, user });
  } catch (err) {
    next(err);
  }
};

// 내 정보 수정
const updateMyAccount = async (req, res, next) => {
  try {
    const updates = req.body;

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

    if (updates.center_id) await validateForeignKey(Center, updates.center_id, '센터');
    if (updates.position_id) await validateForeignKey(Position, updates.position_id, '직책');
    if (updates.team_id) await validateForeignKey(Team, updates.team_id, '팀');

    const user = await User.findByPk(req.user.uid);
    if (!user)
      return res.status(404).json({ success: false, message: '사용자를 찾을 수 없습니다.' });

    // 새 파일이 업로드된 경우 기존 파일 삭제
    if (req.file && user.profile_image_url) {
      const oldFilePath = createFilePath('profiles', user.profile_image_url.split('/').pop());
      deleteFile(oldFilePath);
    }

    if (req.file) {
      // processFile 미들웨어가 이미 req.body에 설정해줌
      updates.profile_image_name = req.body.profile_image_name;
      updates.profile_image_url = req.body.profile_image_url;
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

// 로그아웃 (프론트에서 토큰 삭제로 처리)
const logout = async (req, res) => {
  res.status(200).json({ success: true, message: '로그아웃되었습니다.' });
};

// 비밀번호 초기화
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

    // 안전한 임시 비밀번호 생성 (8자리 영숫자)
    const tempPassword = generateSecureTempPassword(8);
    user.password = await createHash(tempPassword);
    await user.save();

    // 이메일 발송
    const emailResult = await sendPasswordResetEmail(email, user.name, tempPassword);

    if (emailResult.success) {
      return res.status(200).json({
        success: true,
        message: '임시 비밀번호가 이메일로 발송되었습니다. 이메일을 확인해주세요.',
      });
    } else {
      // 이메일 발송 실패 시 비밀번호를 원래대로 되돌림
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

// 비밀번호 변경
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.uid;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: '현재 비밀번호와 새 비밀번호를 모두 입력해주세요.',
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: '새 비밀번호는 최소 8자 이상이어야 합니다.',
      });
    }

    // 사용자 조회
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '사용자를 찾을 수 없습니다.',
      });
    }

    // 현재 비밀번호 확인
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: '현재 비밀번호가 올바르지 않습니다.',
      });
    }

    // 새 비밀번호가 현재 비밀번호와 같은지 확인
    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      return res.status(400).json({
        success: false,
        message: '새 비밀번호는 현재 비밀번호와 달라야 합니다.',
      });
    }

    // 새 비밀번호 해시화 및 저장
    const hashedNewPassword = await createHash(newPassword);
    await user.update({ password: hashedNewPassword });

    return res.status(200).json({
      success: true,
      message: '비밀번호가 성공적으로 변경되었습니다.',
    });
  } catch (err) {
    console.error('비밀번호 변경 오류:', err);
    next(err);
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

// 회원 탈퇴
const deactivateAccount = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.uid);
    if (!user)
      return res.status(404).json({ success: false, message: '사용자를 찾을 수 없습니다.' });

    // 프로필 이미지가 있으면 파일도 함께 삭제
    if (user.profile_image_url) {
      const filePath = createFilePath('profiles', user.profile_image_url.split('/').pop());
      deleteFile(filePath);
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

    // 역할별 필터링 (position 기반)
    if (role) {
      // role을 position으로 매핑
      let positionIds = [];
      if (role === 'admin') {
        positionIds = [12]; // 관리자 position_id
      } else if (role === 'trainer') {
        positionIds = [3, 4, 5]; // 트레이너 관련 position_id들
      } else if (role === 'staff') {
        positionIds = [1, 2, 6, 7, 8, 9, 10, 11]; // 기타 직원 position_id들
      }
      if (positionIds.length > 0) {
        whereClause.position_id = { [require('sequelize').Op.in]: positionIds };
      }
    }

    // 센터별 필터링
    if (centerId) {
      whereClause.center_id = parseInt(centerId);
    }

    // 팀별 필터링
    if (teamId) {
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
    const trainerUsers = users.filter(user => [3, 4, 5].includes(user.position_id)).length;
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
      if ([3, 4, 5].includes(user.position_id)) centerStats[centerName].trainers++;
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
      if ([3, 4, 5].includes(user.position_id)) teamStats[teamName].trainers++;
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

module.exports = {
  signUp,
  signIn,
  getMe: getMyAccount, // getMe를 getMyAccount로 별칭
  getMyAccount,
  updateMyAccount,
  logout,
  resetPassword,
  changePassword,
  deleteProfileImage,
  uploadProfileImage, // 새로 추가된 함수
  deactivateAccount,
  getAllUsers,
  getUserById,
  getPositions,
  getCenters,
};
