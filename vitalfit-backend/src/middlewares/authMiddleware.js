const jwt = require('jsonwebtoken');
const { User } = require('../models');

const auth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: '인증 토큰이 필요합니다.',
      });
    }

    const token = authHeader.substring(7); // "Bearer " 제거
    const secret = process.env.JWT_SECRET || 'default-secret-key-for-development';
    const decoded = jwt.verify(token, secret);

    const user = await User.findByPk(decoded.uid);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: '유효하지 않은 토큰입니다.',
      });
    }

    if (user.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: '비활성화된 계정입니다.',
      });
    }

    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: '유효하지 않은 토큰입니다.',
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: '토큰이 만료되었습니다.',
      });
    }
    next(error);
  }
};

module.exports = auth;
