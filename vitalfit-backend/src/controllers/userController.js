const { User, Center, Position, Team } = require('../models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const { createHash, validateForeignKey } = require('../utils/userUtils');
const secret = process.env.JWT_SECRET;

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

  join_date: Joi.date().optional(), // 필수 아니면 생략 가능
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

    if (req.file) {
      value.profile_image_name = req.file.filename;
      value.profile_image_url = `/uploads/${req.file.filename}`;
    }

    const user = await User.create(value);
    const token = jwt.sign({ uid: user.id }, secret, { expiresIn: '1h' });

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
        if (user.login_attempts >= 5) {
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

    const token = jwt.sign({ uid: user.id }, secret, { expiresIn: '1h' });
    return res.status(200).json({
      success: true,
      token,
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

// ✅ 내 계정 보기
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

// ✅ 내 정보 수정
const updateMyAccount = async (req, res, next) => {
  try {
    const updates = req.body;
    if (updates.center_id) await validateForeignKey(Center, updates.center_id, '센터');
    if (updates.position_id) await validateForeignKey(Position, updates.position_id, '직책');
    if (updates.team_id) await validateForeignKey(Team, updates.team_id, '팀');

    if (req.file) {
      updates.profile_image_name = req.file.filename;
      updates.profile_image_url = `/uploads/${req.file.filename}`;
    }

    const user = await User.findByPk(req.user.uid);
    if (!user)
      return res.status(404).json({ success: false, message: '사용자를 찾을 수 없습니다.' });

    await user.update(updates);
    return res.status(200).json({ success: true, message: '내 정보가 수정되었습니다.', user });
  } catch (err) {
    next(err);
  }
};

// ✅ 로그아웃 (프론트에서 토큰 삭제로 처리)
const logout = async (req, res) => {
  return res.status(200).json({ success: true, message: '로그아웃 되었습니다.' });
};

// ✅ 비밀번호 초기화
const resetPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user)
      return res.status(404).json({
        success: false,
        message: '해당 이메일 사용자를 찾을 수 없습니다.',
      });

    const tempPassword = Math.random().toString(36).slice(-8);
    user.password = await createHash(tempPassword);
    await user.save();

    // 실제 운영에선 이메일 발송 처리 필요
    return res.status(200).json({
      success: true,
      message: '임시 비밀번호가 발급되었습니다.',
      tempPassword,
    });
  } catch (err) {
    next(err);
  }
};

// ✅ 소프트 삭제 (회원 탈퇴)
const deactivateAccount = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.uid);
    if (!user)
      return res.status(404).json({ success: false, message: '사용자를 찾을 수 없습니다.' });

    user.status = 'inactive';
    user.leave_date = new Date();
    await user.save();

    return res.status(200).json({ success: true, message: '회원 탈퇴가 처리되었습니다.' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  signUp,
  signIn,
  getMyAccount,
  updateMyAccount,
  logout,
  resetPassword,
  deactivateAccount,
};
