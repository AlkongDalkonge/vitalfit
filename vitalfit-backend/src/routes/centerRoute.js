const express = require('express');
const router = express.Router();
const centerController = require('../controllers/centerController');

// ✅ 모든 센터 목록 조회
// GET /api/centers
router.get('/', centerController.getAllCenters);

// ✅ 센터 검색
// GET /api/centers/search?q=검색어&status=active
router.get('/search', centerController.searchCenters);

// ✅ 특정 센터 상세 조회
// GET /api/centers/:id
router.get('/:id', centerController.getCenterById);

module.exports = router; 