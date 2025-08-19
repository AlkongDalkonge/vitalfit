require('dotenv').config();
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize({
  host: process.env.AZURE_DB_HOST,
  port: Number(process.env.AZURE_DB_PORT) || 5432,
  username: process.env.AZURE_DB_USERNAME,
  password: process.env.AZURE_DB_PASSWORD,
  database: process.env.AZURE_DB_NAME,
  dialect: 'postgres',
  ssl: {
    require: true,
    rejectUnauthorized: false,
  },
  logging: console.log,
});

async function testConnection() {
  try {
    console.log('Azure DB 연결 테스트 시작...');
    console.log('Host:', process.env.AZURE_DB_HOST);
    console.log('Port:', process.env.AZURE_DB_PORT);
    console.log('Username:', process.env.AZURE_DB_USERNAME);
    console.log('Database:', process.env.AZURE_DB_NAME);

    await sequelize.authenticate();
    console.log('✅ Azure DB 연결 성공!');

    // 데이터베이스 정보 조회
    const [results] = await sequelize.query('SELECT version()');
    console.log('DB Version:', results[0].version);
  } catch (error) {
    console.error('❌ Azure DB 연결 실패:', error.message);
    console.error('Error details:', error);
  } finally {
    await sequelize.close();
  }
}

testConnection();
