const path = require("path");
const express = require("express");
const models = require("./models"); //Sequelize 모델 및 DB연결
//const cors = require("cors");   //다른 도메인에서 서버에 안전하게 요청할 수 있도록 허용

const app = express();
app.use(express.json()); //라우터전에 있어야합니다.
// app.use(cors({ origin: "http://localhost:3001", credentials: true }));
//app.use(cors());
app.use(express.urlencoded({ extended: true })); // 폼 데이터(HTML form 등)나 x-www-form-urlencoded 형식의 요청 바디를 파싱해주는 Express 미들웨어

//파일다운로드
// const uploadDir = `public/uploads`;
// app.use(`/downloads`, express.static(path.join(__dirname, uploadDir)));

//라우터 등록
//app.use("/api/notice", require("./routes/noticeRoute"));
app.use("/api/members", require("./routes/memberRoute"));

// 404 처리 용도
app.use((req, res) => {
  res.status(404).json({
    status: "Fail",
    message: "요청한 리소스는 찾을 수 없어요 ",
  });
});

// 500 의 경우에도 에러 처리
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    status: "Error",
    message: `server error : ${err.stack}`,
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`서버가 http://localhost:${PORT} 에서 실행 중 입니다. `);
  models.sequelize
    .sync({ force: false }) // true -> false
    .then(() => {
      console.log("DB connected");
    })
    .catch(() => {
      console.error("DB error");
      process.exit();
    });
});
