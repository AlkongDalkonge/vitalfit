const { seedAllData } = require('./src/utils/seedData.js');

async function runSeed() {
  try {
    console.log('🌱 시드데이터 실행을 시작합니다...');
    await seedAllData();
    console.log('✅ 시드데이터 실행이 완료되었습니다!');
    process.exit(0);
  } catch (error) {
    console.error('❌ 시드데이터 실행 중 오류 발생:', error);
    process.exit(1);
  }
}

runSeed(); 