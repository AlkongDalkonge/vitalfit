require('dotenv').config();

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const noticeRouter = require('./src/routes/noticeRouter');
const memberRouter = require('./src/routes/memberRoute');
const ptSessionRouter = require('./src/routes/ptSessionRoute');
const centerRouter = require('./src/routes/centerRoute');
const userRouter = require('./src/routes/userRoute');
const teamRouter = require('./src/routes/teamRoute');
const dashboardRouter = require('./src/routes/dashboardRoute');
const positionRouter = require('./src/routes/positionRoute');
const paymentRouter = require('./src/routes/paymentRoute');
const bonusRouter = require('./src/routes/bonusRoute');
const commissionRateRouter = require('./src/routes/commissionRateRoute');
const jobRunRouter = require('./src/routes/jobRunRoute');
const settlementRouter = require('./src/routes/settlementRoute');
const emailRouter = require('./src/routes/emailRoute');
const notificationRouter = require('./src/routes/notificationRoute');
//라우터 등록
const { sequelize } = require('./src/models');
const errorHandler = require('./src/middlewares/errorHandler');
const { seedAllData } = require('./src/utils/seedData');

const app = express();

// 미들웨어 등록
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 정적 파일 서빙 (파일 다운로드용)
app.use('/uploads', express.static('public/uploads'));
// origin: "*" + credentials: true 는 사실 브라우저에서 보안 정책 때문에 같이 쓰면 안 되는 조합임.
// 만약 인증 쿠키(credential)를 쓸 거면, origin을 특정 도메인으로 제한하는 게 좋아.
// 당장은 문제 없지만 배포할 땐 이 점 고려해줘!
app.use(
  cors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true,
  })
);
app.use(morgan('dev'));

// 라우터 등록
app.use('/api/notices', noticeRouter);
app.use('/api/members', memberRouter);
app.use('/api/pt-sessions', ptSessionRouter);
app.use('/api/centers', centerRouter);
app.use('/api/users', userRouter);
app.use('/api/teams', teamRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/positions', positionRouter);
app.use('/api/payments', paymentRouter);
app.use('/api/bonus', bonusRouter);
app.use('/api/commission-rates', commissionRateRouter);
app.use('/api/job-runs', jobRunRouter);
app.use('/api/settlements', settlementRouter);
app.use('/api/email', emailRouter);
app.use('/api/notifications', notificationRouter);

// 404 처리
app.use((req, res) => {
  res.status(200).json({
    status: 200,
    message: '요청한 리소스를 찾을 수 없습니다.',
  });
});

// 에러 핸들링 미들웨어
app.use(errorHandler);

// DB 연결 및 서버 실행
const PORT = process.env.PORT || 3001;

sequelize
  // .sync({ force: false, alter: true })
  .sync({ force: true })
  .then(async () => {
    console.log('1️⃣ DB 테이블 생성 완료!');

    // 시드 데이터 실행 조건 확인
    const shouldSeedData = process.env.SEED_DATA === 'false';

    if (shouldSeedData) {
      try {
        console.log('2️⃣ 시드 데이터를 추가합니다...');
        console.log('SEED_DATA 환경변수:', process.env.SEED_DATA);
        await seedAllData();
        console.log('3️⃣ 시드 데이터 추가 완료!');
      } catch (error) {
        console.error('❌ 시드 데이터 추가 실패:', error);
        console.error('❌ 오류 스택:', error.stack);
        // 시드 데이터 실패해도 서버는 계속 실행
      }
    } else {
      console.log('시드 데이터를 건너뜁니다. (SEED_DATA=false 또는 production 환경)');
    }

    // ✅ 크론 로드 (모든 환경에서 실행)
    require('./src/cron/publish.cron');
    console.log('[cron] 배치 스케줄러 로드 완료');

    console.log('4️⃣ 서버 실행 준비 완료');
    app.listen(PORT, () => {
      console.log(`5️⃣ 서버가 포트 ${PORT}번에서 실행 중입니다.`);
    });
  })
  .catch(err => {
    console.error('DB 초기화 실패:', err);
  });

module.exports = app;
