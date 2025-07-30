require("dotenv").config();

const express = require("express");
const cors = require("cors"); //다른 도메인에서 서버에 안전하게 요청할 수 있도록 허용
const morgan = require("morgan");

const noticeRouter = require("./routes/noticeRouter"); // 경로 확인 필요
const { sequelize } = require("./models"); // DB 연결 확인용
const errorHandler = require("./middlewares/errorHandler"); // 에러 처리 미들웨어
const models = require("./models"); //Sequelize 모델 및 DB연결
const app = express();

// 미들웨어 등록
app.use(express.json()); //라우터전에 있어야합니다.
app.use(cors({ origin: "*", credentials: true }));
app.use(cors());
app.use(morgan("dev"));
app.use(express.urlencoded({ extended: true })); // 폼 데이터(HTML form 등)나 x-www-form-urlencoded 형식의 요청 바디를 파싱해주는 Express 미들웨어

// 라우터 등록
app.use("/api/notices", noticeRouter);
app.use("/api/members", require("./routes/memberRoute"));
app.use("/api/pt-sessions", require("./routes/ptSessionRoute"));

// 404 처리 - 미들웨어 마지막에 위치
app.use((req, res) => {
  res.status(404).json({
    success: false,
    status: 404,
    message: "요청한 리소스를 찾을 수 없습니다.",
  });
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
