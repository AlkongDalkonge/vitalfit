const db = require("../src/models/Index"); // db 객체 import
const sequelize = db.sequelize; // sequelize 인스턴스 추출

async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log("PostgreSQL 연결 성공!");
  } catch (error) {
    console.error("연결 실패:", error);
  } finally {
    await sequelize.close();
  }
}

testConnection();
