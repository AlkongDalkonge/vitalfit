require('dotenv').config();
const { sequelize } = require('./src/models');
const { seedAllData } = require('./src/utils/seedData');

async function runSeed() {
  try {
    console.log('🌱 시드 데이터 생성을 시작합니다...');

    // 데이터베이스 연결 확인
    await sequelize.authenticate();
    console.log('✅ 데이터베이스 연결 성공');

    // 시드 데이터 실행
    await seedAllData();

    console.log('🎉 시드 데이터 생성 완료!');
    process.exit(0);
  } catch (error) {
    console.error('💥 시드 데이터 생성 실패:', error);
    process.exit(1);
  }
}

runSeed();
