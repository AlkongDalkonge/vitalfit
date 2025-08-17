const fs = require('fs');
const path = require('path');

// 업로드 디렉토리 생성 함수
const createUploadDirectories = () => {
  const baseDir = path.join(__dirname, 'public', 'uploads');

  // 기본 업로드 디렉토리
  if (!fs.existsSync(baseDir)) {
    fs.mkdirSync(baseDir, { recursive: true });
    console.log('✅ 기본 업로드 디렉토리 생성:', baseDir);
  }

  // 프로필 이미지 디렉토리
  const profilesDir = path.join(baseDir, 'profiles');
  if (!fs.existsSync(profilesDir)) {
    fs.mkdirSync(profilesDir, { recursive: true });
    console.log('✅ 프로필 이미지 디렉토리 생성:', profilesDir);
  }

  // 추가 이미지 디렉토리
  const additionalImagesDir = path.join(baseDir, 'additional_images');
  if (!fs.existsSync(additionalImagesDir)) {
    fs.mkdirSync(additionalImagesDir, { recursive: true });
    console.log('✅ 추가 이미지 디렉토리 생성:', additionalImagesDir);
  }

  // 센터 이미지 디렉토리
  const centersDir = path.join(baseDir, 'centers');
  if (!fs.existsSync(centersDir)) {
    fs.mkdirSync(centersDir, { recursive: true });
    console.log('✅ 센터 이미지 디렉토리 생성:', centersDir);
  }

  console.log('🎉 모든 업로드 디렉토리 생성 완료!');
};

// 스크립트 실행
createUploadDirectories();
