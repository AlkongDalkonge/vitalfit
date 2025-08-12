const express = require('express');
const router = express.Router();
const teamController = require('../controllers/teamController');

// ✅ 모든 팀 조회
// GET /api/teams
router.get('/', teamController.getAllTeams);

// ✅ 특정 팀 조회
// GET /api/teams/:id
router.get('/:id', teamController.getTeamById);

module.exports = router;
