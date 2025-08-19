const router = require('express').Router();
const controller = require('../controllers/notificationController');

// TODO: requireAuth 미들웨어 추가 (프로젝트에 맞게)
// const { requireAuth } = require('../middlewares/auth');
// router.use(requireAuth);

// 정산 알림 목록 조회
// GET /api/notifications/settlement
router.get('/settlement', controller.getSettlementNotifications);

// 알림 읽음 처리
// PUT /api/notifications/:notificationId/read
router.put('/:notificationId/read', controller.markAsRead);

// 모든 알림 읽음 처리
// PUT /api/notifications/read-all
router.put('/read-all', controller.markAllAsRead);

module.exports = router;
