const jwt = require('jsonwebtoken');
const config = require('../config/config');

/**
 * 재인증 토큰 검증 미들웨어
 * 민감 작업 수행 시 재인증 상태를 확인합니다.
 */
const requireReAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: '인증 토큰이 필요합니다.',
      });
    }

    const token = authHeader.substring(7);
    const secret = config.jwt.secret;

    // 메인 토큰 검증
    const decoded = jwt.verify(token, secret);

    // 재인증 토큰 확인
    const reAuthToken = req.headers['x-reauth-token'];

    if (!reAuthToken) {
      return res.status(403).json({
        success: false,
        message: '재인증이 필요합니다.',
        code: 'REAUTH_REQUIRED',
      });
    }

    try {
      // 재인증 토큰 검증 (2분 만료)
      const reAuthDecoded = jwt.verify(reAuthToken, secret);

      // 재인증 토큰의 사용자 ID가 메인 토큰과 일치하는지 확인
      if (reAuthDecoded.uid !== decoded.uid) {
        return res.status(403).json({
          success: false,
          message: '재인증 토큰이 유효하지 않습니다.',
          code: 'INVALID_REAUTH_TOKEN',
        });
      }

      // 재인증 토큰의 만료 시간 확인
      const now = Math.floor(Date.now() / 1000);
      if (reAuthDecoded.exp < now) {
        return res.status(403).json({
          success: false,
          message: '재인증이 만료되었습니다. 다시 인증해주세요.',
          code: 'REAUTH_EXPIRED',
        });
      }

      // 재인증 성공
      req.user = decoded;
      req.reAuthUser = reAuthDecoded;
      next();
    } catch (reAuthError) {
      if (reAuthError.name === 'TokenExpiredError') {
        return res.status(403).json({
          success: false,
          message: '재인증이 만료되었습니다. 다시 인증해주세요.',
          code: 'REAUTH_EXPIRED',
        });
      }

      return res.status(403).json({
        success: false,
        message: '재인증 토큰이 유효하지 않습니다.',
        code: 'INVALID_REAUTH_TOKEN',
      });
    }
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

/**
 * 재인증 토큰 발급 함수
 * @param {string} userId - 사용자 ID
 * @returns {string} 재인증 토큰
 */
const generateReAuthToken = userId => {
  const secret = config.jwt.secret;
  const payload = {
    uid: userId,
    type: 'reauth',
    iat: Math.floor(Date.now() / 1000),
  };

  return jwt.sign(payload, secret, {
    expiresIn: config.jwt.reAuthTokenExpiry,
  });
};

/**
 * 재인증 토큰 검증 함수 (선택적)
 * @param {string} token - 재인증 토큰
 * @returns {object|null} 검증된 토큰 정보 또는 null
 */
const verifyReAuthToken = token => {
  try {
    const secret = config.jwt.secret;
    const decoded = jwt.verify(token, secret);

    if (decoded.type !== 'reauth') {
      return null;
    }

    return decoded;
  } catch (error) {
    return null;
  }
};

module.exports = {
  requireReAuth,
  generateReAuthToken,
  verifyReAuthToken,
};
