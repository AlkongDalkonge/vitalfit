const multer = require('multer');
const path = require('path');
const fs = require('fs');

function createUploader({
  folder = 'uploads',
  fileField = 'file',
  allowedExtensions = ['.jpg', '.jpeg', '.png'],
  maxSizeMB = 5,
  filenamePrefix = '',
}) {
  const uploadDir = path.join(__dirname, `../../public/${folder}`);
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

  const storage = multer.diskStorage({
    destination: uploadDir,
    filename: (req, file, cb) => {
      const originalName = Buffer.from(file.originalname, 'latin1').toString('utf8');
      const ext = path.extname(originalName).toLowerCase();
      const name = path.basename(originalName, ext).replace(/\s+/g, '_');
      const timestamp = Date.now();
      const filename = `${filenamePrefix}${timestamp}_${name}${ext}`;
      cb(null, filename);
    },
  });

  const fileFilter = (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedExtensions.includes(ext)) cb(null, true);
    else cb(new Error(`허용되지 않는 파일 형식입니다. (${allowedExtensions.join(', ')})`), false);
  };

  const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: maxSizeMB * 1024 * 1024 },
  });

  return upload.single(fileField);
}

module.exports = createUploader;
