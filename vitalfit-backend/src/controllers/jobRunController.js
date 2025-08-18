const { JobRun } = require('../models');
const { Op, fn, col } = require('sequelize');
const { publishMonthlySettlements } = require('../services/settlementPublisher');

/**
 * POST /api/job-runs/execute
 * 배치 프로그램 수동 실행
 */
exports.executeBatchJob = async (req, res) => {
  try {
    const { target_period } = req.body;

    console.log(`[API] 수동 배치 실행 요청: ${target_period || '자동(지난달)'}`);

    const result = await publishMonthlySettlements(target_period);

    res.json({
      success: true,
      message: '배치 프로그램이 실행되었습니다.',
      data: {
        period_ym: result.periodYm,
        status: result.status,
        records_processed: result.upserted,
        job_run_id: result.jobRunId,
        execution_time_ms: result.executionTime,
      },
    });
  } catch (error) {
    console.error('배치 실행 오류:', error);
    res.status(500).json({
      success: false,
      message: '배치 프로그램 실행 중 오류가 발생했습니다.',
      error: error.message,
    });
  }
};

/**
 * GET /api/job-runs
 * 배치 작업 실행 이력 조회
 */
exports.getJobRuns = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      job_name,
      status,
      target_period,
      start_date,
      end_date,
    } = req.query;

    const offset = (page - 1) * limit;
    const whereClause = {};

    // 필터링 조건
    if (job_name) whereClause.job_name = job_name;
    if (status) whereClause.status = status;
    if (target_period) whereClause.target_period = target_period;

    if (start_date || end_date) {
      whereClause.started_at = {};
      if (start_date) whereClause.started_at[Op.gte] = new Date(start_date);
      if (end_date) whereClause.started_at[Op.lte] = new Date(end_date);
    }

    const { count, rows: jobRuns } = await JobRun.findAndCountAll({
      where: whereClause,
      order: [['started_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    res.json({
      success: true,
      data: {
        job_runs: jobRuns,
        pagination: {
          current_page: parseInt(page),
          total_pages: Math.ceil(count / limit),
          total_count: count,
          limit: parseInt(limit),
        },
      },
    });
  } catch (error) {
    console.error('JobRun 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: 'JobRun 조회 중 오류가 발생했습니다.',
    });
  }
};

/**
 * GET /api/job-runs/:id
 * 특정 배치 작업 실행 상세 조회
 */
exports.getJobRunById = async (req, res) => {
  try {
    const { id } = req.params;

    const jobRun = await JobRun.findByPk(id);

    if (!jobRun) {
      return res.status(404).json({
        success: false,
        message: '존재하지 않는 JobRun입니다.',
      });
    }

    res.json({
      success: true,
      data: jobRun,
    });
  } catch (error) {
    console.error('JobRun 상세 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: 'JobRun 상세 조회 중 오류가 발생했습니다.',
    });
  }
};

/**
 * GET /api/job-runs/status/current
 * 현재 실행 중인 배치 작업 상태 조회
 */
exports.getCurrentJobStatus = async (req, res) => {
  try {
    const { job_name } = req.query;

    const whereClause = { status: ['running', 'skipped'] };
    if (job_name) whereClause.job_name = job_name;

    const runningJobs = await JobRun.findAll({
      where: whereClause,
      order: [['started_at', 'DESC']],
    });

    res.json({
      success: true,
      data: {
        running_jobs: runningJobs,
        count: runningJobs.length,
        running_count: runningJobs.filter(job => job.status === 'running').length,
        skipped_count: runningJobs.filter(job => job.status === 'skipped').length,
      },
    });
  } catch (error) {
    console.error('현재 Job 상태 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '현재 Job 상태 조회 중 오류가 발생했습니다.',
    });
  }
};

/**
 * GET /api/job-runs/stats/summary
 * 배치 작업 통계 요약
 */
exports.getJobRunStats = async (req, res) => {
  try {
    const { days = 30 } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    // 최근 N일간 통계
    const recentStats = await JobRun.findAll({
      where: {
        started_at: {
          [Op.gte]: startDate,
        },
      },
      attributes: [
        'status',
        [fn('COUNT', col('id')), 'count'],
        [fn('AVG', col('execution_time_ms')), 'avg_execution_time'],
      ],
      group: ['status'],
    });

    // 전체 통계
    const totalStats = await JobRun.findAll({
      attributes: ['status', [fn('COUNT', col('id')), 'count']],
      group: ['status'],
    });

    // 최근 실행된 작업들
    const recentJobs = await JobRun.findAll({
      where: {
        started_at: {
          [Op.gte]: startDate,
        },
      },
      order: [['started_at', 'DESC']],
      limit: 10,
    });

    res.json({
      success: true,
      data: {
        recent_stats: recentStats,
        total_stats: totalStats,
        recent_jobs: recentJobs,
        period_days: parseInt(days),
      },
    });
  } catch (error) {
    console.error('JobRun 통계 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: 'JobRun 통계 조회 중 오류가 발생했습니다.',
    });
  }
};

/**
 * POST /api/job-runs/:id/cancel
 * 실행 중인 배치 작업 취소
 */
exports.cancelJobRun = async (req, res) => {
  try {
    const { id } = req.params;

    const jobRun = await JobRun.findByPk(id);

    if (!jobRun) {
      return res.status(404).json({
        success: false,
        message: '존재하지 않는 JobRun입니다.',
      });
    }

    if (jobRun.status !== 'running') {
      return res.status(400).json({
        success: false,
        message: '실행 중인 작업만 취소할 수 있습니다.',
      });
    }

    await jobRun.update({
      status: 'cancelled',
      completed_at: new Date(),
      notes: '사용자에 의해 취소됨',
    });

    res.json({
      success: true,
      message: '배치 작업이 취소되었습니다.',
      data: jobRun,
    });
  } catch (error) {
    console.error('JobRun 취소 오류:', error);
    res.status(500).json({
      success: false,
      message: 'JobRun 취소 중 오류가 발생했습니다.',
    });
  }
};
