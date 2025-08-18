const { MonthlySettlement, User, Center } = require('../models');

// 권한 헬퍼
function isTeamLeader(user) {
  return user?.position_id === 7; // 팀장
}
function isCenterManager(user) {
  return user?.position_id === 11; // 센터장
}

// 정산 상세 조회
exports.getById = async (req, res) => {
  try {
    const settlement = await MonthlySettlement.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'trainer',
          attributes: ['id', 'name', 'nickname'],
        },
        {
          model: User,
          as: 'acknowledgedBy',
          attributes: ['id', 'name'],
        },
        {
          model: User,
          as: 'managerApprovedBy',
          attributes: ['id', 'name'],
        },
        {
          model: User,
          as: 'paidBy',
          attributes: ['id', 'name'],
        },
      ],
    });

    if (!settlement) {
      return res.status(404).json({
        success: false,
        message: '정산 데이터를 찾을 수 없습니다.',
      });
    }

    // TODO: Auth 구현 후 가시성 필터 추가
    res.json({
      success: true,
      data: settlement,
    });
  } catch (error) {
    console.error('정산 상세 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '정산 데이터 조회 중 오류가 발생했습니다.',
    });
  }
};

// 사용자의 draft 정산 확인
exports.checkDraftSettlements = async (req, res) => {
  try {
    // TODO: Auth 구현 후 req.user 사용
    // 임시로 쿼리 파라미터에서 user_id를 받음
    const userId = req.query.user_id || req.user?.id || 1;
    console.log('Draft 정산 확인 - 사용자 ID:', userId);

    // 사용자 정보 조회
    const user = await User.findByPk(userId);
    if (!user) {
      return res.json({
        success: true,
        data: {
          hasDraftSettlements: false,
          draftSettlements: [],
          count: 0,
        },
      });
    }

    // position_id가 11 이상인 사용자(admin, 회계팀, 센터장)는 draft 정산 확인하지 않음
    if (user.position_id >= 11) {
      console.log('승인자 권한이므로 draft 정산 확인하지 않음:', { position_id: user.position_id });
      return res.json({
        success: true,
        data: {
          hasDraftSettlements: false,
          draftSettlements: [],
          count: 0,
        },
      });
    }

    const draftSettlements = await MonthlySettlement.findAll({
      where: {
        user_id: userId,
        status: 'draft',
      },
      include: [
        {
          model: User,
          as: 'trainer',
          attributes: ['id', 'name', 'nickname', 'position_id', 'team_id'],
        },
        {
          model: Center,
          as: 'center',
          attributes: ['id', 'name'],
        },
      ],
      attributes: [
        'id',
        'user_id',
        'center_id',
        'settlement_year',
        'settlement_month',
        'total_settlement',
        'status',
        'created_at',
      ],
      order: [
        ['settlement_year', 'DESC'],
        ['settlement_month', 'DESC'],
      ],
      limit: 5, // 최근 5개만
    });

    res.json({
      success: true,
      data: {
        hasDraftSettlements: draftSettlements.length > 0,
        draftSettlements: draftSettlements,
        count: draftSettlements.length,
      },
    });
  } catch (error) {
    console.error('Draft 정산 확인 오류:', error);
    res.status(500).json({
      success: false,
      message: 'Draft 정산 확인 중 오류가 발생했습니다.',
    });
  }
};

// 정산 목록 조회
exports.list = async (req, res) => {
  try {
    const where = {};

    if (req.query.year) where.settlement_year = Number(req.query.year);
    if (req.query.month) where.settlement_month = Number(req.query.month);
    if (req.query.center_id) where.center_id = Number(req.query.center_id);
    if (req.query.status) where.status = req.query.status;
    if (req.query.user_id) where.user_id = Number(req.query.user_id);

    // TODO: Auth 구현 후 역할별 가시성 필터 추가
    const settlements = await MonthlySettlement.findAll({
      where,
      include: [
        {
          model: User,
          as: 'trainer',
          attributes: ['id', 'name', 'nickname', 'position_id'],
        },
        {
          model: User,
          as: 'acknowledgedBy',
          attributes: ['id', 'name'],
        },
        {
          model: User,
          as: 'centerApprovedBy',
          attributes: ['id', 'name'],
        },
        {
          model: Center,
          as: 'center',
          attributes: ['id', 'name'],
        },
      ],
      order: [
        ['settlement_year', 'DESC'],
        ['settlement_month', 'DESC'],
        ['user_id', 'ASC'],
      ],
    });

    res.json({
      success: true,
      data: settlements,
    });
  } catch (error) {
    console.error('정산 목록 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '정산 목록 조회 중 오류가 발생했습니다.',
    });
  }
};

// 직원 확인
exports.acknowledge = async (req, res) => {
  try {
    // TODO: Auth 구현 후 req.user 사용
    // 임시로 쿼리 파라미터에서 user_id를 받음
    const userId = req.query.user_id || req.user?.id || 1;
    console.log('정산 확인 - 사용자 ID:', userId);
    const user = { id: userId, position_id: 1 }; // 임시 사용자 정보
    const settlement = await MonthlySettlement.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'trainer',
          attributes: ['id', 'name', 'nickname', 'position_id'],
        },
        {
          model: User,
          as: 'acknowledgedBy',
          attributes: ['id', 'name'],
        },
        {
          model: User,
          as: 'centerApprovedBy',
          attributes: ['id', 'name'],
        },
        {
          model: Center,
          as: 'center',
          attributes: ['id', 'name'],
        },
      ],
    });

    if (!settlement) {
      return res.status(404).json({
        success: false,
        message: '정산 데이터를 찾을 수 없습니다.',
      });
    }

    // TODO: Auth 구현 후 권한 체크 추가
    // 권한: 본인만 가능 (관리자 예외)
    // if (!isAdmin(user) && settlement.user_id !== user.id) {
    //   return res.status(403).json({
    //     success: false,
    //     message: '본인의 정산만 확인할 수 있습니다.',
    //   });
    // }

    // 상태 체크: paid는 수정 금지
    if (settlement.status === 'paid') {
      return res.status(409).json({
        success: false,
        message: '이미 지급 완료된 정산입니다.',
      });
    }

    // 멱등: 이미 확인했다면 no-op
    if (settlement.acknowledged_at) {
      return res.json({
        success: true,
        data: settlement,
        skipped: true,
        reason: '이미 확인된 정산입니다.',
      });
    }

    settlement.status = 'acknowledged';
    settlement.acknowledged_at = new Date();
    settlement.acknowledged_by = user.id;
    await settlement.save();

    res.json({
      success: true,
      data: settlement,
      message: '정산 확인이 완료되었습니다.',
    });
  } catch (error) {
    console.error('정산 확인 오류:', error);
    res.status(500).json({
      success: false,
      message: '정산 확인 중 오류가 발생했습니다.',
    });
  }
};

// 지점장 승인 → confirmed
exports.approve = async (req, res) => {
  try {
    // TODO: Auth 구현 후 req.user 사용
    const user = req.user || { id: 1, position_id: 11 }; // 임시 센터장 정보
    const settlement = await MonthlySettlement.findByPk(req.params.id);

    if (!settlement) {
      return res.status(404).json({
        success: false,
        message: '정산 데이터를 찾을 수 없습니다.',
      });
    }

    // TODO: Auth 구현 후 권한 체크 추가
    // 권한: 지점장/관리자만
    // if (!(isManager(user) || isAdmin(user))) {
    //   return res.status(403).json({
    //     success: false,
    //     message: '승인 권한이 없습니다.',
    //   });
    // }

    // TODO: Auth 구현 후 센터 일치 검사 추가
    // if (isCenterManager(user) && settlement.center_id !== user.center_id) {
    //   return res.status(403).json({ success: false, message: '다른 센터의 정산은 승인할 수 없습니다.' });
    // }

    // 상태 체크
    if (settlement.status === 'paid') {
      return res.status(409).json({
        success: false,
        message: '이미 지급 완료된 정산입니다.',
      });
    }

    if (settlement.status === 'confirmed') {
      // 멱등: 이미 승인됨
      return res.json({
        success: true,
        data: settlement,
        skipped: true,
        reason: '이미 승인된 정산입니다.',
      });
    }

    // 직원이 먼저 확인했는지 강제 체크
    if (settlement.status !== 'acknowledged') {
      return res.status(409).json({
        success: false,
        message: '직원이 먼저 확인해야 합니다.',
      });
    }

    settlement.status = 'confirmed';
    settlement.manager_approved_at = new Date();
    settlement.manager_approved_by = user.id;
    await settlement.save();

    res.json({
      success: true,
      data: settlement,
      message: '정산 승인이 완료되었습니다.',
    });
  } catch (error) {
    console.error('정산 승인 오류:', error);
    res.status(500).json({
      success: false,
      message: '정산 승인 중 오류가 발생했습니다.',
    });
  }
};

// 회계 지급 → paid
exports.pay = async (req, res) => {
  try {
    // TODO: Auth 구현 후 req.user 사용
    const user = req.user || { id: 1, position_id: 12 }; // 임시 회계팀 정보
    const { payment_ref } = req.body || {};

    const settlement = await MonthlySettlement.findByPk(req.params.id);

    if (!settlement) {
      return res.status(404).json({
        success: false,
        message: '정산 데이터를 찾을 수 없습니다.',
      });
    }

    // TODO: Auth 구현 후 권한 체크 추가
    // 권한: 회계팀/관리자만
    // if (!(isFinance(user) || isAdmin(user))) {
    //   return res.status(403).json({
    //     success: false,
    //     message: '지급 처리 권한이 없습니다.',
    //   });
    // }

    if (settlement.status === 'paid') {
      return res.json({
        success: true,
        data: settlement,
        skipped: true,
        reason: '이미 지급 완료된 정산입니다.',
      });
    }

    if (settlement.status !== 'confirmed') {
      return res.status(409).json({
        success: false,
        message: '승인된 정산만 지급 처리할 수 있습니다.',
      });
    }

    settlement.status = 'paid';
    settlement.paid_at = new Date();
    settlement.paid_by = user.id;
    if (payment_ref) settlement.payment_ref = String(payment_ref);
    await settlement.save();

    res.json({
      success: true,
      data: settlement,
      message: '지급 처리가 완료되었습니다.',
    });
  } catch (error) {
    console.error('지급 처리 오류:', error);
    res.status(500).json({
      success: false,
      message: '지급 처리 중 오류가 발생했습니다.',
    });
  }
};
