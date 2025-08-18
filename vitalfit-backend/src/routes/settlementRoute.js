const router = require('express').Router();
const controller = require('../controllers/settlementController');

// TODO: requireAuth 미들웨어 추가 (프로젝트에 맞게)
// const { requireAuth } = require('../middlewares/auth');
// router.use(requireAuth);

// 직원: 본인 정산 확인
// POST /api/settlements/:id/acknowledge
router.post('/:id/acknowledge', controller.acknowledge);

// 지점장: 승인
// POST /api/settlements/:id/approve
router.post('/:id/approve', controller.approve);

// 회계: 지급 처리
// POST /api/settlements/:id/pay
router.post('/:id/pay', controller.pay);

// Draft 정산 확인 (특정 경로를 먼저 정의)
// GET /api/settlements/check-draft
router.get('/check-draft', controller.checkDraftSettlements);

// 상세/목록 조회
// GET /api/settlements/:id
router.get('/:id', controller.getById);
// GET /api/settlements?year=2025&month=7&center_id=...
router.get('/', controller.list);

module.exports = router;
