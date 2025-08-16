const express = require('express');
const router = express.Router();
const teamController = require('../controllers/teamController');

// ✅ 모든 팀 조회
// GET /api/teams
router.get('/', teamController.getAllTeams);

// ✅ 특정 팀 조회
// GET /api/teams/:id
router.get('/:id', teamController.getTeamById);

// ✅ 팀별 매출 통계 조회 (새로 추가)
// GET /api/teams/:teamId/revenue-stats/:year/:month
router.get('/:teamId/revenue-stats/:year/:month', teamController.getTeamRevenueStats);

module.exports = router;
