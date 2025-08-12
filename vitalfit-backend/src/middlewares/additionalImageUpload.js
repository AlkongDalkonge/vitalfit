const { createUpload } = require('../utils/uploadUtils');

// 자격증, 경력, 학력, 인스타그램 이미지 업로드 미들웨어 생성
const additionalImageUpload = createUpload(
  'additional-images', // 폴더명
  'image', // 필드명
  10, // 최대 크기 (MB)
  ['.jpg', '.jpeg', '.png'] // 허용 확장자
);

module.exports = additionalImageUpload;
