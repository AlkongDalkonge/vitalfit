require('dotenv').config();

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const fs = require('fs');
fs.mkdirSync('public/uploads', { recursive: true });

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
app.use('/uploads', express.static('public/uploads'));
// origin: "*" + credentials: true 는 사실 브라우저에서 보안 정책 때문에 같이 쓰면 안 되는 조합임.
// 만약 인증 쿠키(credential)를 쓸 거면, origin을 특정 도메인으로 제한하는 게 좋아.
// 당장은 문제 없지만 배포할 땐 이 점 고려해줘!
app.use(cors({ origin: '*', credentials: false }));
app.use(morgan('dev'));

// 위쪽 어딘가 공용 함수 추가
function formatSequelizeError(err) {
  if (err && err.name && err.errors) {
    return {
      name: err.name,
      items: err.errors.map(e => ({
        message: e.message,
        path: e.path, // 어느 필드인지
        value: e.value, // 어떤 값이 문제였는지
        type: e.type, // uniqueViolation, notNull Violation 등
      })),
    };
  }
  return { name: err?.name || 'Error', message: err?.message || String(err) };
}

const seedStatus = {
  started: false,
  done: false,
  error: null,
  ranAt: null,
  step: null,
  counts: {},
};

const SEED_TOKEN = process.env.SEED_TOKEN;
app.post('/admin/run-seed', async (req, res) => {
  if (!SEED_TOKEN || req.query.token !== SEED_TOKEN) {
    return res.status(401).json({ ok: false, error: 'unauthorized' });
  }
  if (seedStatus.started && !seedStatus.done) {
    return res.status(409).json({ ok: false, error: 'already running' });
  }

  seedStatus.started = true;
  seedStatus.done = false;
  seedStatus.error = null;
  seedStatus.step = 'init';
  seedStatus.ranAt = null;
  seedStatus.counts = {};

  try {
    await sequelize.authenticate();
    seedStatus.step = 'sync';
    await sequelize.sync({ force: false });

    seedStatus.step = 'seeding';
    await seedAllData(info => {
      if (info?.step) seedStatus.step = info.step;
      if (info?.counts) seedStatus.counts = { ...seedStatus.counts, ...info.counts };
    });

    seedStatus.done = true;
    seedStatus.ranAt = new Date().toISOString();
    return res.json({ ok: true, status: seedStatus });
  } catch (e) {
    const details = formatSequelizeError(e);
    seedStatus.error = details; // 상태에도 저장
    seedStatus.done = false;
    return res
      .status(500)
      .json({ ok: false, error: 'Validation error', details, status: seedStatus });
  }
});

// Azure 백엔드 상태 확인용
app.get('/health', (_, res) => res.status(200).json({ ok: true, time: new Date() }));
app.get('/', (_req, res) => res.status(200).send('Backend OK')); // 루트 응답 추가

app.get('/api/ping-db', async (_req, res) => {
  try {
    const [rows] = await sequelize.query('SELECT NOW() AS now');
    return res.status(200).json({ db: true, now: rows[0].now });
  } catch (e) {
    return res.status(500).json({ db: false, error: e.message });
  }
});

app.get('/seed-status', (_req, res) => {
  res.status(200).json(seedStatus);
});

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

const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';

// 1️⃣ 서버 먼저 실행
app.listen(PORT, HOST, () => {
  console.log(`✅ 서버가 포트 ${HOST}:${PORT}에서 실행 중입니다.`);
});

// 2️⃣ DB 작업은 백그라운드에서 실행
(async () => {
  try {
    await sequelize.authenticate();
    console.log('1️⃣ DB 연결 성공!');

    await sequelize.sync({ force: false });
    console.log('2️⃣ DB 테이블 생성 완료!');

    if (process.env.SEED_DATA === 'true') {
      try {
        seedStatus.started = true;
        console.log('3️⃣ 시드 데이터 추가 시작...');
        await seedAllData();
        seedStatus.done = true;
        seedStatus.ranAt = new Date().toISOString();
        console.log('4️⃣ 시드 데이터 추가 완료!');
      } catch (error) {
        console.error('시드 데이터 추가 실패:', error);
      }
    } else {
      console.log('시드 데이터 건너뜀 (SEED_DATA=false 또는 production)');
    }
  } catch (e) {
    seedStatus.error = e?.message || String(e);
    console.error('❌ DB 초기화 실패:', e);
    // 주의: 여기서 process.exit() 하지 말 것 (Azure Health Check 실패 방지)
  }
})();

// 에러 핸들링 미들웨어
app.use(errorHandler);

module.exports = app;
