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

    // 디버깅 로그 추가
    console.log('🔍 Auth Middleware Debug:');
    console.log('  - Token decoded:', decoded);
    console.log('  - User ID from token:', decoded.uid);

    const user = await User.findByPk(decoded.uid);

    // 디버깅 로그 추가
    console.log('  - User found in DB:', user ? 'Yes' : 'No');
    if (user) {
      console.log('  - User details:', {
        id: user.id,
        name: user.name,
        email: user.email,
        status: user.status,
      });
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: '유효하지 않은 토큰입니다.',
      });
    }

    if (user.status !== 'active') {
      console.log('  - ❌ User status check failed:', user.status);
      return res.status(403).json({
        success: false,
        message: '비활성화된 계정입니다.',
      });
    }

    console.log('  - ✅ User status check passed:', user.status);
    req.user = {
      ...decoded,
      id: decoded.uid, // 권한 미들웨어에서 사용하는 id 필드 추가
    };
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
