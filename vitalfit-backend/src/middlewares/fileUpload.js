const { createUpload } = require('../utils/uploadUtils');

// 공지사항 파일 업로드 미들웨어 생성
const noticeUpload = createUpload(
  'notices', // 폴더명
  'attachment', // 필드명
  10, // 최대 크기 (MB)
  [
    '.jpg',
    '.jpeg',
    '.png',
    '.gif',
    '.bmp',
    '.pdf',
    '.doc',
    '.docx',
    '.txt',
    '.rtf',
    '.xls',
    '.xlsx',
    '.csv',
    '.ppt',
    '.pptx',
    '.zip',
    '.rar',
    '.7z',
  ] // 허용 확장자
);

module.exports = noticeUpload;
