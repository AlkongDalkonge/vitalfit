const multer = require('multer');
const path = require('path');
const fs = require('fs');

/**
 * 파일 업로드 미들웨어 생성
 * @param {string} folder - 업로드 폴더명 (예: 'notices', 'profiles')
 * @param {string} fieldName - 폴더 필드명 (예: 'attachment', 'profile_image_url')
 * @param {number} maxSizeMB - 최대 파일 크기 (MB)
 * @param {string[]} allowedTypes - 허용할 파일 확장자
 */
function createUpload(folder, fieldName, maxSizeMB = 5, allowedTypes = ['.jpg', '.jpeg', '.png']) {
  // 업로드 디렉토리 생성
  const uploadDir = path.join(__dirname, `../../public/uploads/${folder}`);
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  // multer 설정
  const storage = multer.diskStorage({
    destination: uploadDir,
    filename: (req, file, cb) => {
      const originalName = Buffer.from(file.originalname, 'latin1').toString('utf8');
      const ext = path.extname(originalName);
      const name = path.basename(originalName, ext);
      const timestamp = Date.now();
      const filename = `${timestamp}_${name}${ext}`;
      cb(null, filename);
    },
  });

  const fileFilter = (req, file, cb) => {
    const originalName = Buffer.from(file.originalname, 'latin1').toString('utf8');
    const ext = path.extname(originalName).toLowerCase();

    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error(`허용되지 않는 파일 형식입니다. 허용 형식: ${allowedTypes.join(', ')}`), false);
    }
  };

  const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: maxSizeMB * 1024 * 1024 },
  });

  const uploadSingle = upload.single(fieldName);

  // 에러 처리
  const handleError = (err, req, res, next) => {
    console.log('🚨 handleError 미들웨어 호출됨');
    console.log('❌ 에러 타입:', err.constructor.name);
    console.log('❌ 에러 메시지:', err.message);
    console.log('❌ 에러 코드:', err.code);

    if (err instanceof multer.MulterError) {
      console.log('📁 Multer 에러 발생');
      if (err.code === 'LIMIT_FILE_SIZE') {
        console.log('📏 파일 크기 제한 초과');
        return res.status(400).json({
          success: false,
          message: `파일 크기가 너무 큽니다. (최대 ${maxSizeMB}MB)`,
        });
      }
      console.log('📁 기타 Multer 에러');
      return res.status(400).json({
        success: false,
        message: '파일 업로드 중 오류가 발생했습니다.',
        details: err.message,
      });
    }

    if (err) {
      console.log('❌ 일반 에러 발생');
      return res.status(400).json({
        success: false,
        message: err.message,
      });
    }

    console.log('✅ 에러 없음, 다음으로 진행');
    next();
  };

  // 파일 정보 처리
  const processFile = (req, res, next) => {
    console.log('🔧 processFile 미들웨어 호출됨');
    console.log('📁 폴더명:', folder);
    console.log('📄 req.file:', req.file);
    console.log('📝 req.body (처리 전):', req.body);

    if (req.file) {
      console.log('✅ 파일 발견, 처리 시작');
      const originalName = Buffer.from(req.file.originalname, 'latin1').toString('utf8');
      const fileUrl = `/uploads/${folder}/${req.file.filename}`;

      console.log('📝 원본 파일명:', originalName);
      console.log('🔗 파일 URL:', fileUrl);

      // 폴더별로 다른 필드명 사용
      if (folder === 'notices') {
        req.body.attachment_name = originalName;
        req.body.attachment_url = fileUrl;
        console.log('📋 공지사항 필드 설정');
      } else if (folder === 'profiles') {
        req.body.profile_image_name = originalName;
        req.body.profile_image_url = fileUrl;
        console.log('📋 프로필 이미지 필드 설정');
      } else if (folder === 'accounts') {
        req.body.account_image_name = originalName;
        req.body.account_image_url = fileUrl;
        console.log('📋 계좌 이미지 필드 설정');
      } else {
        req.body.file_url = fileUrl;
        console.log('📋 일반 파일 필드 설정');
      }

      console.log('📝 req.body (처리 후):', req.body);
    } else {
      console.log('⚠️ 파일이 없음');
    }

    console.log('✅ processFile 완료, 다음으로 진행');
    next();
  };

  return {
    uploadSingle,
    handleError,
    processFile,
  };
}

// 파일 삭제 함수
function deleteFile(filePath) {
  try {
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`파일 삭제 완료: ${filePath}`);
      return true;
    }
    return false;
  } catch (err) {
    console.error(`파일 삭제 실패: ${filePath}`, err);
    return false;
  }
}

// 파일 경로 생성 함수
function createFilePath(folder, fileName) {
  return path.join(__dirname, `../../public/uploads/${folder}`, fileName);
}

module.exports = {
  createUpload,
  deleteFile,
  createFilePath,
};
