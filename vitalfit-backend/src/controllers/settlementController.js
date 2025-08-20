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
          as: 'centerApprovedBy',
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
    const authUser = req.user || null;
    const actingUserId = authUser?.id ?? Number(req.query.user_id);
    if (!actingUserId) {
      return res.status(401).json({ success: false, message: '사용자 정보가 없습니다.' });
    }
    console.log('Draft 정산 확인 - 사용자 ID:', actingUserId);

    // 사용자 정보 조회
    const user = await User.findByPk(actingUserId);
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
        user_id: actingUserId,
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
    // TODO: Auth 구현 후 req.user 사용
    const user = req.user || null;

    console.log('🔍 [정산 목록 조회] 요청 시작');
    console.log('🔍 [정산 목록 조회] 요청 파라미터:', {
      query: req.query,
      user: user,
    });

    const where = {};

    if (req.query.year) where.settlement_year = Number(req.query.year);
    if (req.query.month) where.settlement_month = Number(req.query.month);
    if (req.query.center_id) where.center_id = Number(req.query.center_id);
    if (req.query.status) where.status = req.query.status;
    if (req.query.user_id) where.user_id = Number(req.query.user_id);

    // 로그인 정보가 있을 때만 서버측 강제 필터 적용
    if (user) {
      if (user.position_id === 11) {
        // 센터장: 본인 센터만
        where.center_id = user.center_id;
        console.log('🔍 [정산 목록 조회] 센터장 권한 - 센터 ID 필터 적용:', user.center_id);
      } else if (user.position_id < 11) {
        // 직원: 본인 것만
        where.user_id = user.id;
        console.log('🔍 [정산 목록 조회] 직원 권한 - 본인 ID 필터 적용:', user.id);
      } else {
        console.log('🔍 [정산 목록 조회] 관리자/회계팀 권한 - 필터 없음');
      }
    } else {
      // 미로그인/로컬: 쿼리 파라미터 우선 (프론트에서 보낸 user_id/year/month 존중)
      console.log('🔍 [정산 목록 조회] 미로그인/로컬 - 쿼리 파라미터 우선 사용', where);
    }

    console.log('🔍 [정산 목록 조회] WHERE 조건:', where);
    console.log('🔍 [정산 목록 조회] 데이터베이스 쿼리 실행 시작...');

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

    console.log('🔍 [정산 목록 조회] 쿼리 실행 완료');
    console.log('🔍 [정산 목록 조회] 조회 결과:', {
      count: settlements.length,
      settlements: settlements.map(s => ({
        id: s.id,
        user_id: s.user_id,
        center_id: s.center_id,
        settlement_year: s.settlement_year,
        settlement_month: s.settlement_month,
        status: s.status,
        total_settlement: s.total_settlement,
      })),
    });

    console.log('🔍 [정산 목록 조회] 응답 전송:', {
      success: true,
      dataCount: settlements.length,
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
    const user = req.user || null;
    const actingUserId = user?.id ?? Number(req.query.user_id);
    if (!actingUserId) {
      return res.status(401).json({ success: false, message: '사용자 정보가 없습니다.' });
    }
    console.log('정산 확인 - 사용자 ID:', actingUserId);
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
    settlement.acknowledged_by = actingUserId;
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

// 센터장 승인 → confirmed (트랜잭션 + 행잠금)
exports.approve = async (req, res) => {
  const { sequelize } = require('../models');

  try {
    // TODO: Auth 구현 후 req.user 사용
    const user = req.user || null;
    const actingUserId = user?.id ?? Number(req.query.user_id);
    const actingCenterId = user?.center_id ?? Number(req.query.center_id);
    if (!actingUserId || !actingCenterId) {
      return res.status(401).json({ success: false, message: '사용자 정보가 없습니다.' });
    }

    const result = await sequelize.transaction(async t => {
      // 행잠금으로 정산 데이터 조회 (include 없이)
      const settlement = await MonthlySettlement.findByPk(req.params.id, {
        lock: true,
        transaction: t,
      });

      if (!settlement) {
        throw new Error('정산 데이터를 찾을 수 없습니다.');
      }

      // 트레이너 정보 별도 조회
      const trainer = await User.findByPk(settlement.user_id, {
        attributes: ['id', 'name', 'nickname', 'center_id'],
        transaction: t,
      });

      if (!settlement) {
        throw new Error('정산 데이터를 찾을 수 없습니다.');
      }

      // TODO: Auth 구현 후 권한 체크 추가
      // 권한: 센터장만 (본인 센터의 정산만)
      // if (!isCenterManager(user)) {
      //   throw new Error('승인 권한이 없습니다.');
      // }

      // TODO: Auth 구현 후 센터 체크 추가
      if (trainer.center_id !== actingCenterId) {
        throw new Error('본인 센터의 정산만 승인할 수 있습니다.');
      }

      // 상태 체크
      if (settlement.status === 'paid') {
        throw new Error('이미 지급 완료된 정산입니다.');
      }

      if (settlement.status === 'center_approved') {
        // 멱등: 이미 승인됨
        return {
          success: true,
          data: settlement,
          skipped: true,
          reason: '이미 승인된 정산입니다.',
        };
      }

      // 직원이 먼저 확인했는지 강제 체크
      if (settlement.status !== 'acknowledged') {
        throw new Error('직원이 먼저 확인해야 합니다.');
      }

      // 상태 업데이트
      settlement.status = 'center_approved';
      settlement.center_approved_at = new Date();
      settlement.center_approved_by = actingUserId;
      await settlement.save({ transaction: t });

      return {
        success: true,
        data: settlement,
        message: '정산 승인이 완료되었습니다.',
      };
    });

    res.json(result);
  } catch (error) {
    console.error('정산 승인 오류:', error);

    if (error.message.includes('정산 데이터를 찾을 수 없습니다')) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    if (
      error.message.includes('승인 권한이 없습니다') ||
      error.message.includes('본인 센터의 정산만 승인할 수 있습니다')
    ) {
      return res.status(403).json({
        success: false,
        message: error.message,
      });
    }

    if (
      error.message.includes('직원이 먼저 확인해야 합니다') ||
      error.message.includes('이미 지급 완료된 정산입니다')
    ) {
      return res.status(409).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: '정산 승인 중 오류가 발생했습니다.',
    });
  }
};

// 회계팀 최종 승인 → hq_approved
exports.hqApprove = async (req, res) => {
  const { sequelize } = require('../models');

  try {
    // TODO: Auth 구현 후 req.user 사용
    const user = req.user || null;
    // 필요 시, req.query.user_id를 임시로 허용
    const actingUserId = user?.id ?? Number(req.query.user_id);
    if (!actingUserId) {
      return res.status(401).json({ success: false, message: '사용자 정보가 없습니다.' });
    }

    const result = await sequelize.transaction(async t => {
      // 행잠금으로 정산 데이터 조회
      const settlement = await MonthlySettlement.findByPk(req.params.id, {
        lock: true,
        transaction: t,
      });

      if (!settlement) {
        throw new Error('정산 데이터를 찾을 수 없습니다.');
      }

      // TODO: Auth 구현 후 권한 체크 추가
      // 권한: 회계팀만
      // if (!isFinance(user)) {
      //   throw new Error('승인 권한이 없습니다.');
      // }

      // 상태 체크: 센터장 승인된 정산만
      if (settlement.status !== 'center_approved') {
        throw new Error('센터장 승인이 완료된 정산만 최종 승인할 수 있습니다.');
      }

      if (settlement.status === 'hq_approved') {
        // 멱등: 이미 승인됨
        return {
          success: true,
          data: settlement,
          skipped: true,
          reason: '이미 최종 승인된 정산입니다.',
        };
      }

      // 상태 업데이트
      settlement.status = 'hq_approved';
      settlement.hq_approved_at = new Date();
      settlement.hq_approved_by = actingUserId;
      await settlement.save({ transaction: t });

      return {
        success: true,
        data: settlement,
        message: '최종 승인이 완료되었습니다.',
      };
    });

    res.json(result);
  } catch (error) {
    console.error('최종 승인 오류:', error);

    if (error.message.includes('정산 데이터를 찾을 수 없습니다')) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    if (error.message.includes('승인 권한이 없습니다')) {
      return res.status(403).json({
        success: false,
        message: error.message,
      });
    }

    if (error.message.includes('센터장 승인이 완료된 정산만 최종 승인할 수 있습니다')) {
      return res.status(409).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: '최종 승인 중 오류가 발생했습니다.',
    });
  }
};

// 회계팀 반려 → rejected
exports.hqReject = async (req, res) => {
  const { sequelize } = require('../models');

  try {
    // TODO: Auth 구현 후 req.user 사용
    const user = req.user || null;
    // 필요 시, req.query.user_id를 임시로 허용
    const actingUserId = user?.id ?? Number(req.query.user_id);
    if (!actingUserId) {
      return res.status(401).json({ success: false, message: '사용자 정보가 없습니다.' });
    }
    const { reject_reason } = req.body || {};

    if (!reject_reason || reject_reason.trim() === '') {
      return res.status(400).json({
        success: false,
        message: '반려 사유를 입력해주세요.',
      });
    }

    const result = await sequelize.transaction(async t => {
      // 행잠금으로 정산 데이터 조회
      const settlement = await MonthlySettlement.findByPk(req.params.id, {
        lock: true,
        transaction: t,
      });

      if (!settlement) {
        throw new Error('정산 데이터를 찾을 수 없습니다.');
      }

      // TODO: Auth 구현 후 권한 체크 추가
      // 권한: 회계팀만
      // if (!isFinance(user)) {
      //   throw new Error('반려 권한이 없습니다.');
      // }

      // 상태 체크: 센터장 승인된 정산만
      if (settlement.status !== 'center_approved') {
        throw new Error('센터장 승인이 완료된 정산만 반려할 수 있습니다.');
      }

      if (settlement.status === 'rejected') {
        // 멱등: 이미 반려됨
        return {
          success: true,
          data: settlement,
          skipped: true,
          reason: '이미 반려된 정산입니다.',
        };
      }

      // 상태 업데이트
      settlement.status = 'rejected';
      settlement.rejected_at = new Date();
      settlement.rejected_by = actingUserId;
      settlement.reject_reason = reject_reason.trim();
      settlement.rejected_role = 'hq';
      await settlement.save({ transaction: t });

      // 알림 생성: 직원과 센터장에게
      const { SettlementNotification } = require('../models');

      // 직원에게 알림
      await SettlementNotification.create(
        {
          settlement_id: settlement.id,
          user_id: settlement.user_id,
          notification_type: 'rejected',
          message: `정산이 반려되었습니다. 사유: ${reject_reason.trim()}`,
        },
        { transaction: t }
      );

      // 센터장에게 알림 (트레이너 정보 조회)
      const trainer = await require('../models').User.findByPk(settlement.user_id, {
        attributes: ['center_id'],
        transaction: t,
      });

      if (trainer && trainer.center_id) {
        // 해당 센터의 센터장 찾기
        const centerManager = await require('../models').User.findOne({
          where: {
            center_id: trainer.center_id,
            position_id: 11, // 센터장
          },
          transaction: t,
        });

        if (centerManager) {
          await SettlementNotification.create(
            {
              settlement_id: settlement.id,
              user_id: centerManager.id,
              notification_type: 'rejected',
              message: `센터 직원의 정산이 반려되었습니다. 사유: ${reject_reason.trim()}`,
            },
            { transaction: t }
          );
        }
      }

      return {
        success: true,
        data: settlement,
        message: '정산이 반려되었습니다.',
      };
    });

    res.json(result);
  } catch (error) {
    console.error('정산 반려 오류:', error);

    if (error.message.includes('정산 데이터를 찾을 수 없습니다')) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    if (error.message.includes('반려 권한이 없습니다')) {
      return res.status(403).json({
        success: false,
        message: error.message,
      });
    }

    if (error.message.includes('센터장 승인이 완료된 정산만 반려할 수 있습니다')) {
      return res.status(409).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: '정산 반려 중 오류가 발생했습니다.',
    });
  }
};

// 회계 지급 → paid
exports.pay = async (req, res) => {
  try {
    // TODO: Auth 구현 후 req.user 사용
    const user = req.user || null;
    // 필요 시, req.query.user_id를 임시로 허용
    const actingUserId = user?.id ?? Number(req.query.user_id);
    if (!actingUserId) {
      return res.status(401).json({ success: false, message: '사용자 정보가 없습니다.' });
    }
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

    if (settlement.status !== 'hq_approved') {
      return res.status(409).json({
        success: false,
        message: '최종 승인된 정산만 지급 처리할 수 있습니다.',
      });
    }

    settlement.status = 'paid';
    settlement.paid_at = new Date();
    settlement.paid_by = actingUserId;
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
