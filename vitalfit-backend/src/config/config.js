require('dotenv').config();
console.log('Database configuration loaded');

module.exports = {
  development: {
    username: process.env.DB_USERNAME || 'aldalkong',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'vitalfit',
    host: process.env.DB_HOST || 'localhost',
    dialect: process.env.DB_DIALECT || 'postgres',
    logging: true,
    use_env_variable: false,
    dialectOptions: (() => {
      if (process.env.DB_SSL === 'true') {
        return {
          ssl: {
            require: true,
            rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false',
          },
        };
      }
      return {};
    })(),
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
