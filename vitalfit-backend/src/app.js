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
const dashboardRouter = require('./routes/dashboardRoute');
const positionRouter = require('./routes/positionRoute');

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
app.use('/api/dashboard', dashboardRouter);
app.use('/api/positions', positionRouter);

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

// 모델 관계 설정: 로컬에서 개발 시에는 동기화 없이도(db생성 없이) 가능하지만,
// Azure DB에서는 동기화가 필요함.
// 즉, 아래내용은 로컬에서 개발 시 연결 확인 용도 디버깅 입니다.(로컬 개발 중에 DB 연결이 잘 되는지 확인하는 용도)
console.log('모델 관계 설정 중...');
try {
  // 모델들이 모두 로드된 후 관계 설정
  const models = require('./models');

  // 모델들이 모두 로드되었는지 확인
  if (!models || Object.keys(models).length === 0) {
    throw new Error('모델이 로드되지 않았습니다.');
  }

  console.log(
    '로드된 모델들:',
    Object.keys(models).filter(key => key !== 'sequelize' && key !== 'Sequelize')
  );

  Object.keys(models).forEach(modelName => {
    if (
      modelName !== 'sequelize' &&
      modelName !== 'Sequelize' &&
      models[modelName] &&
      models[modelName].associate
    ) {
      try {
        models[modelName].associate(models);
        console.log(`✅ ${modelName} 모델 관계 설정 완료`);
      } catch (associateError) {
        console.error(`❌ ${modelName} 모델 관계 설정 실패:`, associateError.message);
      }
    }
  });
  console.log('✅ 모든 모델 관계 설정 완료');
} catch (error) {
  console.error('❌ 모델 관계 설정 실패:', error.message);
  console.error('에러 상세:', error);
}

// Sequelize sync를 통해 서버 실행하므로 여기서는 서버 실행하지 않음
console.log('3️⃣ Sequelize sync를 통해 서버 실행 예정...');

// DB 테이블 생성 및 시드 데이터 실행
sequelize
  .sync({ alter: true }) // alter: true로 설정하여 테이블 구조만 수정
  .then(async () => {
    console.log('1️⃣ DB 테이블 생성 완료!');

    // 시드 데이터 실행 (하드코딩으로 항상 실행)
    try {
      console.log('2️⃣ 시드 데이터를 추가합니다...');
      await seedAllData();
      console.log('3️⃣ 시드 데이터 추가 완료!');
    } catch (error) {
      console.error('시드 데이터 추가 실패:', error);
      // 시드 데이터 실패해도 서버는 계속 실행
    }

    console.log('4️⃣ 서버 실행 준비 완료');
    app.listen(PORT, () => {
      console.log(`5️⃣ 서버가 포트 ${PORT}번에서 실행 중입니다.`);
    });
  })
  .catch(err => {
    console.error('DB 초기화 실패:', err);
  });

module.exports = app;
