require('dotenv').config();
console.log(process.env.DB_USERNAME);
module.exports = {
  // 환경변수 사용 (보안상 권장)
  development: {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    host: process.env.DB_HOST,
    dialect: 'postgres',
    port: process.env.DB_PORT,
  },
  // development: {
  //   username: "aldalkong",
  //   password: "postgres",
  //   database: "vitalfit",
  //   host: "localhost",
  //   dialect: "postgres",
  //   port: 5432,
  // },
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
