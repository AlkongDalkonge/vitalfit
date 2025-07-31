const multer = require('multer');
const path = require('path');
const fs = require('fs');

// 업로드 디렉토리 확인 및 생성
const uploadDir = path.join(__dirname, '../../public/uploads/notices');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// multer 스토리지 설정
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // 파일명: 현재시간_원본파일명
    const timestamp = Date.now();
    const originalName = Buffer.from(file.originalname, 'latin1').toString('utf8');
    const ext = path.extname(originalName);
    const name = path.basename(originalName, ext);
    const filename = `${timestamp}_${name}${ext}`;
    cb(null, filename);
  },
});

// 파일 필터 설정 (허용할 파일 형식)
const fileFilter = (req, file, cb) => {
  // 허용할 파일 확장자
  const allowedTypes = [
    '.jpg',
    '.jpeg',
    '.png',
    '.gif',
    '.bmp', // 이미지
    '.pdf',
    '.doc',
    '.docx',
    '.txt',
    '.rtf', // 문서
    '.xls',
    '.xlsx',
    '.csv', // 스프레드시트
    '.ppt',
    '.pptx', // 프레젠테이션
    '.zip',
    '.rar',
    '.7z', // 압축파일
  ];

  const originalName = Buffer.from(file.originalname, 'latin1').toString('utf8');
  const ext = path.extname(originalName).toLowerCase();

  if (allowedTypes.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error(`허용되지 않는 파일 형식입니다. 허용 형식: ${allowedTypes.join(', ')}`), false);
  }
};

// multer 설정
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB 제한
  },
});

// 단일 파일 업로드 미들웨어
const uploadSingle = upload.single('attachment');

// 에러 처리 미들웨어
const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: '파일 크기가 너무 큽니다. (최대 10MB)',
      });
    }
    return res.status(400).json({
      success: false,
      message: '파일 업로드 중 오류가 발생했습니다.',
      details: err.message,
    });
  }

  if (err) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }

  next();
};

// 업로드된 파일 정보를 req.body에 추가하는 미들웨어
const processUploadedFile = (req, res, next) => {
  if (req.file) {
    req.body.attachment_name = Buffer.from(req.file.originalname, 'latin1').toString('utf8');
    req.body.attachment_url = `/uploads/notices/${req.file.filename}`;
  }
  next();
};

module.exports = {
  uploadSingle,
  handleUploadError,
  processUploadedFile,
};
