const express = require('express');
const router = express.Router();
const centerController = require('../controllers/centerController');

// 디버깅을 위한 미들웨어 추가
router.use((req, res, next) => {
  console.log(`🔍 센터 라우트 요청: ${req.method} ${req.path}`);
  next();
});

// ✅ 모든 센터 목록 조회
// GET /api/centers
router.get('/', centerController.getAllCenters);

// ✅ 특정 센터 상세 조회
// GET /api/centers/:id
router.get('/:id', centerController.getCenterById);

// ✅ 센터 업데이트
// PUT /api/centers/:id
router.put('/:id', centerController.updateCenter);

// ✅ 센터 삭제
// DELETE /api/centers/:id
router.delete('/:id', centerController.deleteCenter);

// ✅ 센터 검색 (ID 라우트보다 나중에 정의)
// GET /api/centers/search?q=검색어&status=active
router.get('/search', centerController.searchCenters);

// ✅ 센터 이미지 업로드 (ID 라우트보다 나중에 정의)
// POST /api/centers/images
router.post('/images', centerController.upload.single('image'), centerController.uploadCenterImage);

// ✅ 센터 이미지 삭제 (ID 라우트보다 나중에 정의)
// DELETE /api/centers/images/:imageId
router.delete('/images/:imageId', centerController.deleteCenterImage);

// ✅ 메인 이미지 설정 (ID 라우트보다 나중에 정의)
// PUT /api/centers/images/:imageId/main
router.put('/images/:imageId/main', centerController.setMainImage);

module.exports = router;
