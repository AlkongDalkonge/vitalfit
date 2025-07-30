"use strict";

// Node.js 기본 모듈 불러오기
const fs = require("fs"); // 파일 시스템 접근
const path = require("path"); // 경로 관련 유틸
const Sequelize = require("sequelize"); // Sequelize ORM
const env = process.env.NODE_ENV || "development";
const config = require(__dirname + "/../config/config.js")[env];
const db = {};

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(
    config.database,
    config.username,
    config.password,
    config
  );
}

fs.readdirSync(__dirname)
  .filter((file) => {
    return (
      file.indexOf(".") !== 0 &&
      file !== basename &&
      file.slice(-3) === ".js" &&
      file.indexOf(".test.js") === -1
    );
  })
  .forEach((file) => {
    // 각 모델 파일 불러오기
    const modelDefiner = require(path.join(__dirname, file));

    // 불러온 것이 함수(모델 정의 함수)일 경우만 실행
    if (typeof modelDefiner === "function") {
      const model = modelDefiner(sequelize, Sequelize.DataTypes); // 모델 정의 실행
      db[model.name] = model; // db 객체에 등록
    } else {
      // 함수가 아니면 경고 로그 출력 (모델 등록 안 됨)
      console.warn(
        `❗️ ${file}은 함수가 아닙니다. 모델로 등록되지 않았습니다.`
      );
    }
  });

// 모델 간의 관계 설정 (associate 메서드가 있다면 실행)
Object.keys(db).forEach((modelName) => {
  if (typeof db[modelName].associate === "function") {
    db[modelName].associate(db); // 관계 정의
  }
});

// Sequelize 인스턴스와 Sequelize 라이브러리 자체도 함께 export
db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db; // db 객체 전체를 외부로 내보냄
