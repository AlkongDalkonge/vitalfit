const { CommissionRate, Position, Center } = require('../models');
const { Op } = require('sequelize');

// 총매출에 따른 커미션과 수업료 조회
exports.getCommissionRateByRevenue = async (req, res) => {
  try {
    const { totalRevenue, positionId, centerId } = req.query;

    if (!totalRevenue || !positionId) {
      return res.status(400).json({
        success: false,
        message: '총매출액과 직급 ID는 필수입니다.',
      });
    }

    const revenue = parseInt(totalRevenue);
    const position = parseInt(positionId);
    const center = centerId ? parseInt(centerId) : null;

    console.log('커미션 정책 조회 파라미터:', { revenue, position, center });

    // 쿼리 조건 구성
    const whereClause = {
      min_revenue: {
        [Op.lte]: revenue,
      },
      max_revenue: {
        [Op.or]: [{ [Op.gte]: revenue }, { [Op.is]: null }],
      },
      is_active: true,
    };

    // position_id 조건 추가
    if (position) {
      whereClause.position_id = {
        [Op.or]: [position, null], // 특정 직급 또는 기본 정책
      };
    }

    // center_id 조건 추가
    if (center) {
      whereClause.center_id = {
        [Op.or]: [center, null], // 특정 센터 또는 전체 센터 적용
      };
    }

    console.log('쿼리 조건:', JSON.stringify(whereClause, null, 2));

    // 조건에 맞는 commission_rate 조회
    const commissionRate = await CommissionRate.findOne({
      where: whereClause,
      include: [
        {
          model: Position,
          as: 'position',
          attributes: ['id', 'name'],
        },
        {
          model: Center,
          as: 'center',
          attributes: ['id', 'name'],
        },
      ],
      order: [['min_revenue', 'DESC']], // 가장 높은 min_revenue 우선
    });

    console.log(
      '조회된 커미션 정책:',
      commissionRate
        ? {
            id: commissionRate.id,
            min_revenue: commissionRate.min_revenue,
            max_revenue: commissionRate.max_revenue,
            position_id: commissionRate.position_id,
            center_id: commissionRate.center_id,
            commission_per_session: commissionRate.commission_per_session,
            monthly_commission: commissionRate.monthly_commission,
          }
        : null
    );

    if (!commissionRate) {
      return res.status(404).json({
        success: false,
        message: '해당 매출액에 맞는 커미션 정책을 찾을 수 없습니다.',
      });
    }

    res.json({
      success: true,
      data: {
        id: commissionRate.id,
        min_revenue: commissionRate.min_revenue,
        max_revenue: commissionRate.max_revenue,
        commission_per_session: commissionRate.commission_per_session,
        monthly_commission: commissionRate.monthly_commission,
        position: commissionRate.position,
        center: commissionRate.center,
        description: commissionRate.description,
      },
    });
  } catch (error) {
    console.error('커미션 정책 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.',
    });
  }
};

// 모든 커미션 정책 조회 (관리용)
exports.getAllCommissionRates = async (req, res) => {
  try {
    const { positionId, centerId, isActive } = req.query;

    const whereClause = {};

    if (positionId) whereClause.position_id = positionId;
    if (centerId) whereClause.center_id = centerId;
    if (isActive !== undefined) whereClause.is_active = isActive === 'true';

    const commissionRates = await CommissionRate.findAll({
      where: whereClause,
      include: [
        {
          model: Position,
          as: 'position',
          attributes: ['id', 'name'],
        },
        {
          model: Center,
          as: 'center',
          attributes: ['id', 'name'],
        },
      ],
      order: [['min_revenue', 'ASC']],
    });

    res.json({
      success: true,
      data: commissionRates,
    });
  } catch (error) {
    console.error('커미션 정책 목록 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.',
    });
  }
};
