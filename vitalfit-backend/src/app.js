require("dotenv").config();

const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const noticeRouter = require("./routes/noticeRouter"); // 경로 확인 필요
const { sequelize } = require("./models"); // DB 연결 확인용
const errorHandler = require("./middlewares/errorHandler"); // 에러 처리 미들웨어

const app = express();

// 미들웨어 등록
app.use(cors());
app.use(morgan("dev"));
app.use(express.json()); // JSON 요청 파싱

// 라우터 등록
app.use("/api/notices", noticeRouter);

// 404 처리
app.use((req, res, next) => {
  res.status(404).json({ message: "요청하신 경로를 찾을 수 없습니다." });
});

// 에러 핸들링 미들웨어
app.use(errorHandler);

// DB 연결 확인 후 서버 실행
const PORT = process.env.SERVER_PORT || 3000;

sequelize
  .sync({ force: false }) //DB 생성
  .then(() => {
    console.log("DB 테이블 생성 완료!");
    app.listen(PORT, () => {
      console.log(`서버가 포트 ${PORT}번에서 실행 중입니다.`);
    });
  })
  .catch((err) => {
    console.error("테이블 생성 실패:", err);
  });

module.exports = app;
