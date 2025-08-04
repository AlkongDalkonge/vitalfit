const multer = require('multer');
const path = require('path');

const uploadDir = 'public/uploads';

// 업로드 디렉토리 설정
const fs = require('fs');
const storage = multer.diskStorage({
  destination: `./${uploadDir}`,
  filename: function (req, file, cb) {
    const fname =
      'vitalfitprofile_' +
      path.parse(file.originalname).name.replace(/\s+/g, '_') +
      '-' +
      Date.now() +
      path.extname(file.originalname);
    cb(null, fname);
  },
});

// 파일 필터링: 이미지 파일만 사용
const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/jpg'];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error('이미지 파일(jpeg, jpg, png)만 업로드 가능합니다.'), false);
};

// 업로드 미들웨어 설정, 파일 크게 제한
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

const uploadSingle = upload.single('profile_image_url');

module.exports = {
  uploadSingle,
};
