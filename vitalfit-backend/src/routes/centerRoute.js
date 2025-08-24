const express = require('express');
const router = express.Router();
const centerController = require('../controllers/centerController');
const { validateRequest, createCenterSchema } = require('../middlewares/validation');
const { requireCenterManagementPermission } = require('../middlewares/permissionMiddleware');
const auth = require('../middlewares/authMiddleware');

// 디버깅을 위한 미들웨어 추가
router.use((req, res, next) => {
  console.log(`🔍 센터 라우트 요청: ${req.method} ${req.path}`);
  next();
});

// ✅ 모든 센터 목록 조회
// GET /api/centers
router.get('/', centerController.getAllCenters);

// ✅ 센터 등록
// POST /api/centers
router.post(
  '/',
  auth,
  requireCenterManagementPermission,
  validateRequest(createCenterSchema),
  centerController.createCenter
);

// ✅ 센터 검색 (ID 라우트보다 먼저 정의)
// GET /api/centers/search?q=검색어&status=active
router.get('/search', centerController.searchCenters);

// ✅ 센터 이미지 업로드 (ID 라우트보다 먼저 정의)
// POST /api/centers/images
router.post(
  '/images',
  auth,
  requireCenterManagementPermission,
  centerController.upload.single('image'),
  centerController.uploadCenterImage
);

// ✅ 센터 이미지 삭제 (ID 라우트보다 먼저 정의)
// DELETE /api/centers/images/:imageId
router.delete(
  '/images/:imageId',
  auth,
  requireCenterManagementPermission,
  centerController.deleteCenterImage
);

// ✅ 메인 이미지 설정 (ID 라우트보다 먼저 정의)
// PUT /api/centers/images/:imageId/main
router.put('/images/:imageId/main', auth, requireCenterManagementPermission, centerController.setMainImage);

// ✅ 특정 센터 상세 조회
// GET /api/centers/:id
router.get('/:id', centerController.getCenterById);

// ✅ 센터 업데이트
// PUT /api/centers/:id
router.put('/:id', auth, requireCenterManagementPermission, centerController.updateCenter);

// ✅ 센터 삭제
// DELETE /api/centers/:id
router.delete('/:id', auth, requireCenterManagementPermission, centerController.deleteCenter);

module.exports = router;
