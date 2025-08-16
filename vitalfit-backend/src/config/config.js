require('dotenv').config();

const common = {
  dialect: 'postgres',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  timezone: '+09:00', // 한국 시간
};

module.exports = {
  // 로컬 테스트 DB
  development: {
    ...common,
    host: process.env.TEST_DB_HOST || 'localhost',
    port: Number(process.env.TEST_DB_PORT) || 5432,
    username: process.env.TEST_DB_USERNAME || 'aldalkong',
    password: process.env.TEST_DB_PASSWORD || 'postgres',
    database: process.env.TEST_DB_NAME || 'vitalfit_test',
  },

  // Azure 운영 DB
  production: {
    ...common,
    host: process.env.AZURE_DB_HOST,
    port: Number(process.env.AZURE_DB_PORT) || 5432,
    username: process.env.AZURE_DB_USERNAME,
    password: process.env.AZURE_DB_PASSWORD,
    database: process.env.AZURE_DB_NAME,
    ssl: {
      require: true,
      rejectUnauthorized: false, // Azure PostgreSQL 연결을 위해 필요
    },
  },
};
