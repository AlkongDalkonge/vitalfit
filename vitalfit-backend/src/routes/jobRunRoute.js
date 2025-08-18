const express = require('express');
const router = express.Router();
const jobRunController = require('../controllers/jobRunController');

// 현재 실행 중인 배치 작업 상태 조회
router.get('/status/current', jobRunController.getCurrentJobStatus);

// 배치 작업 통계 요약
router.get('/stats/summary', jobRunController.getJobRunStats);

// 배치 프로그램 수동 실행
router.post('/execute', jobRunController.executeBatchJob);

// 특정 배치 작업 실행 상세 조회
router.get('/:id', jobRunController.getJobRunById);

// 배치 작업 실행 이력 조회
router.get('/', jobRunController.getJobRuns);

// 실행 중인 배치 작업 취소
router.post('/:id/cancel', jobRunController.cancelJobRun);

module.exports = router;
