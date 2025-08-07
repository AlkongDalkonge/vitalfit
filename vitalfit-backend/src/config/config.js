require('dotenv').config();
console.log(process.env.DB_USERNAME);
module.exports = {
  // 환경변수 사용 (보안상 권장)

  // development: {
  //   dialect: 'sqlite',
  //   storage: './database.sqlite',
  //   logging: false,
  // },
  //   development: {
  //     username: 'aldalkong',
  //     password: 'postgres',
  //     database: 'vitalfit',
  //     host: 'localhost',
  //     dialect: 'postgres',
  //     port: 5432,
  // =======
  development: {
    username: process.env.DB_USERNAME || 'aldalkong',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'vitalfit',
    host: process.env.DB_HOST || 'localhost',
    dialect: process.env.DB_DIALECT || 'sqlite',
    storage: process.env.DB_STORAGE || './database.sqlite',
    logging: false,
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
