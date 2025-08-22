const { createUpload } = require('../utils/uploadUtils');

// 계좌 이미지 업로드 미들웨어 생성
const accountImageUpload = createUpload(
  'accounts', // 폴더명
  'account_image', // 필드명
  10, // 최대 크기 (MB)
  ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.pdf'] // 허용 확장자
);

module.exports = accountImageUpload;
