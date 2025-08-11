require('dotenv').config();
console.log('Database configuration loaded');

module.exports = {
  development: {
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'vitalfit',
    host: process.env.DB_HOST || 'localhost',
    dialect: process.env.DB_DIALECT || 'postgres',
    port: process.env.DB_PORT || 5432,
    logging: console.log, // 개발 환경에서 SQL 로그 확인
    use_env_variable: false,
    dialectOptions: 
      // 로컬에서 개발 시에는 ssl을 false로 설정하거나 없애는 경우에
      // postgres, sequelize 데이터베이스 연결 가능 {
      // ssl:
      //   process.env.DB_SSL === 'true'
      //     ? {
      //         require: true,
      //         rejectUnauthorized: false,
      //       }
      //     : false,
      // // Azure DB 연결 최적화 (SSL이 true일 때만)
      // ...(process.env.DB_SSL === 'true' && {
      //   connectTimeout: 60000, // 60초
      //   acquireTimeout: 60000,
      //   timeout: 60000,
      // }),
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  },
  test: {
    username: 'root',
    password: null,
    database: 'database_test',
    host: '127.0.0.1',
    dialect: 'mysql',
  },
  production: {
    username: 'root',
    password: null,
    database: 'database_production',
    host: '127.0.0.1',
    dialect: 'mysql',
  },
};
