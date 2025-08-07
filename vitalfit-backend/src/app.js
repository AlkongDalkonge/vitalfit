require('dotenv').config();

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const noticeRouter = require('./routes/noticeRouter');
const memberRouter = require('./routes/memberRoute');
const ptSessionRouter = require('./routes/ptSessionRoute');
const centerRouter = require('./routes/centerRoute');
const userRouter = require('./routes/userRoute');
const teamRouter = require('./routes/teamRoute');

const { sequelize } = require('./models');
const errorHandler = require('./middlewares/errorHandler');
const { seedAllData } = require('./utils/seedData');

const app = express();

// 미들웨어 등록
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 정적 파일 서빙 (파일 다운로드용)
app.use('/uploads', express.static('public/uploads'));
// origin: "*" + credentials: true 는 사실 브라우저에서 보안 정책 때문에 같이 쓰면 안 되는 조합임.
// 만약 인증 쿠키(credential)를 쓸 거면, origin을 특정 도메인으로 제한하는 게 좋아.
// 당장은 문제 없지만 배포할 땐 이 점 고려해줘!
app.use(cors({ origin: '*', credentials: true }));
app.use(morgan('dev'));

// 라우터 등록
app.use('/api/notices', noticeRouter);
app.use('/api/members', memberRouter);
app.use('/api/pt-sessions', ptSessionRouter);
app.use('/api/centers', centerRouter);
app.use('/api/users', userRouter);
app.use('/api/teams', teamRouter);

// 404 처리
app.use((req, res) => {
  res.status(404).json({
    success: false,
    status: 404,
    message: '요청한 리소스를 찾을 수 없습니다.',
  });
});

// 에러 핸들링 미들웨어
app.use(errorHandler);

// DB 연결 및 서버 실행
const PORT = process.env.SERVER_PORT || 3001;

sequelize
  // .sync({ force: false })
  .sync({ force: true })
  .then(async () => {
    console.log('DB 테이블 생성 완료!');

    // 시드 데이터 실행 조건 확인
    const shouldSeedData = process.env.SEED_DATA === 'true';

    if (shouldSeedData) {
      try {
        console.log('시드 데이터를 추가합니다...');
        await seedAllData();
      } catch (error) {
        console.error('시드 데이터 추가 실패:', error);
        // 시드 데이터 실패해도 서버는 계속 실행
      }
    } else {
      console.log('시드 데이터를 건너뜁니다. (SEED_DATA=false 또는 production 환경)');
    }

    app.listen(PORT, () => {
      console.log(`서버가 포트 ${PORT}번에서 실행 중입니다.`);
    });
  })
  .catch(err => {
    console.error('DB 초기화 실패:', err);
  });

module.exports = app;
