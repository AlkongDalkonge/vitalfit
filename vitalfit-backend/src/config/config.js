require('dotenv').config();
console.log('Database configuration loaded');

module.exports = {
  development: {
    username: process.env.DB_USERNAME || 'vitalfit_admin',
    password: process.env.DB_PASSWORD || 'your_password_here',
    database: process.env.DB_NAME || 'vitalfit',
    host: process.env.DB_HOST || 'vitalfit.postgres.database.azure.com',
    port: process.env.DB_PORT || 5432,
    dialect: process.env.DB_DIALECT || 'postgres',
    logging: false,
    use_env_variable: false,
    dialectOptions: {
      ssl: {
        require: true, // Azure PostgreSQL은 SSL 필수
        rejectUnauthorized: false, // 인증서 검증 비활성화
      },
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  },
  test: {
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'vitalfit',
    host: process.env.DB_HOST || 'localhost',
    dialect: 'postgres',
    logging: false,
  },
  production: {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: false,
    dialectOptions: {
      ssl: {
        require: true, // Azure PostgreSQL는 무조건 true
        rejectUnauthorized: false, // 인증서 검증 비활성화
      },
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  },
};
