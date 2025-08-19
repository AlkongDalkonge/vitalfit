const { createUpload } = require('../utils/uploadUtils');

// 프로필 이미지 업로드 미들웨어 생성
const profileUpload = createUpload(
  'profiles', // 폴더명
  'profile_image_url', // 필드명
  5, // 최대 크기 (MB)
  ['.jpg', '.jpeg', '.png'] // 허용 확장자
);

module.exports = profileUpload;
