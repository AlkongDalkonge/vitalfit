const { SettlementRejectLog } = require('../models');

/**
 * 정산 거절 로그 생성
 * @param {Object} params - 거절 정보
 * @param {number} params.settlementId - 정산 ID
 * @param {number} params.rejectedBy - 거절한 사용자 ID
 * @param {string} params.rejectedRole - 거절자 역할 ('center_manager' | 'hq')
 * @param {string} params.rejectReason - 거절 사유 (선택사항)
 * @param {Object} params.transaction - 트랜잭션 객체 (선택사항)
 * @returns {Promise<Object>} 생성된 로그 객체
 */
const createSettlementRejectLog = async ({
  settlementId,
  rejectedBy,
  rejectedRole,
  rejectReason = null,
  transaction = null,
}) => {
  try {
    const log = await SettlementRejectLog.create(
      {
        settlement_id: settlementId,
        rejected_at: new Date(),
        rejected_by: rejectedBy,
        rejected_role: rejectedRole,
        reject_reason: rejectReason,
      },
      { transaction }
    );

    

    return log;
  } catch (error) {
    console.error('[SettlementRejectLog] 거절 로그 생성 실패:', error);
    throw error;
  }
};

/**
 * 정산의 거절 이력 조회
 * @param {number} settlementId - 정산 ID
 * @param {Object} options - 조회 옵션
 * @param {number} options.limit - 조회 개수 제한 (기본값: 10)
 * @param {Object} options.transaction - 트랜잭션 객체 (선택사항)
 * @returns {Promise<Array>} 거절 로그 배열
 */
const getSettlementRejectHistory = async (settlementId, options = {}) => {
  try {
    const { limit = 10, transaction = null } = options;

    const logs = await SettlementRejectLog.findAll({
      where: { settlement_id: settlementId },
      include: [
        {
          model: require('../models').User,
          as: 'rejectedBy',
          attributes: ['id', 'name', 'nickname'],
        },
      ],
      order: [['rejected_at', 'DESC']],
      limit,
      transaction,
    });

    return logs;
  } catch (error) {
    console.error('[SettlementRejectLog] 거절 이력 조회 실패:', error);
    throw error;
  }
};

/**
 * 사용자가 거절한 정산 목록 조회
 * @param {number} userId - 사용자 ID
 * @param {Object} options - 조회 옵션
 * @param {number} options.limit - 조회 개수 제한 (기본값: 20)
 * @param {number} options.offset - 오프셋 (기본값: 0)
 * @param {Object} options.transaction - 트랜잭션 객체 (선택사항)
 * @returns {Promise<Object>} 거절 로그 목록과 총 개수
 */
const getUserRejectHistory = async (userId, options = {}) => {
  try {
    const { limit = 20, offset = 0, transaction = null } = options;

    const { count, rows } = await SettlementRejectLog.findAndCountAll({
      where: { rejected_by: userId },
      include: [
        {
          model: require('../models').MonthlySettlement,
          as: 'settlement',
          attributes: ['id', 'settlement_year', 'settlement_month', 'total_settlement'],
          include: [
            {
              model: require('../models').User,
              as: 'trainer',
              attributes: ['id', 'name', 'nickname'],
            },
          ],
        },
      ],
      order: [['rejected_at', 'DESC']],
      limit,
      offset,
      transaction,
    });

    return {
      total: count,
      logs: rows,
    };
  } catch (error) {
    console.error('[SettlementRejectLog] 사용자 거절 이력 조회 실패:', error);
    throw error;
  }
};

module.exports = {
  createSettlementRejectLog,
  getSettlementRejectHistory,
  getUserRejectHistory,
}; 