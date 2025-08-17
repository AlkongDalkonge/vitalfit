require('dotenv').config();

const common = {
  dialect: 'postgres',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  timezone: '+09:00', // 한국 시간
};

module.exports = {
  // JWT 설정
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    reAuthExpiresIn: process.env.JWT_REAUTH_EXPIRES_IN || '2m',
  },

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
