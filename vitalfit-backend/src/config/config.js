require('dotenv').config();

// 디버깅: 환경 변수 확인
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('TEST_DB_USERNAME:', process.env.TEST_DB_USERNAME);
console.log('TEST_DB_HOST:', process.env.TEST_DB_HOST);
console.log('TEST_DB_NAME:', process.env.TEST_DB_NAME);

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
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'vitalfit',
    host: process.env.DB_HOST || 'localhost',
    dialect: process.env.DB_DIALECT || 'postgres',
    // dialect: process.env.DB_DIALECT || 'sqlite',
    // storage: process.env.DB_STORAGE || './database.sqlite',
    logging: false,
    use_env_variable: false,
    // PostgreSQL SSL 설정
    dialectOptions: {
      ssl: false, // 개발 환경에서는 SSL 비활성화
    },
  },
  test: {
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'vitalfit_test',
    host: process.env.DB_HOST || 'localhost',
    dialect: 'postgres',
    logging: false,
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
