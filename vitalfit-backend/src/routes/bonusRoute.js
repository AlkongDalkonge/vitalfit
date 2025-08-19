const express = require('express');
const router = express.Router();
const bonusController = require('../controllers/bonusController');

// 보너스 규칙 목록 조회
router.get('/rules', bonusController.getBonusRules);

// 트레이너의 월별 보너스 계산
router.get('/calculate/:trainerId/:year/:month', bonusController.calculateTrainerBonus);

module.exports = router;
