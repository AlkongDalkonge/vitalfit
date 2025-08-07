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

// ✅ 센터 이미지 업로드
// POST /api/centers/images
router.post('/images', centerController.upload.single('image'), centerController.uploadCenterImage);

// ✅ 센터 이미지 삭제
// DELETE /api/centers/images/:imageId
router.delete('/images/:imageId', centerController.deleteCenterImage);

// ✅ 메인 이미지 설정
// PUT /api/centers/images/:imageId/main
router.put('/images/:imageId/main', centerController.setMainImage);

module.exports = router;
