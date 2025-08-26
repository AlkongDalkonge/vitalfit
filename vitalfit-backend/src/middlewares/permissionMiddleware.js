const { User, Position, Team, Center } = require('../models');

// 센터장 레벨 (level 11)
const CENTER_MANAGER_LEVEL = 11;

// 유저 조회 권한 체크 미들웨어
const checkUserViewPermission = async (req, res, next) => {
  try {
    const targetUserId = parseInt(req.params.id);
    const currentUserId = req.user.uid;

    // 현재 로그인한 사용자 정보 조회
    const currentUser = await User.findByPk(currentUserId, {
      include: [
        { model: Position, as: 'position', attributes: ['id', 'level'] },
        { model: Team, as: 'team', attributes: ['id'] },
        { model: Center, as: 'center', attributes: ['id'] },
      ],
    });

    if (!currentUser || !currentUser.position) {
      return res.status(403).json({
        success: false,
        message: '권한 정보를 찾을 수 없습니다.',
      });
    }

    const currentUserLevel = currentUser.position.level;

    // 포지션 12, 99는 모든 권한
    if (currentUserLevel === 12 || currentUserLevel === 99) {
      return next();
    }

    // 본인 조회는 항상 가능
    if (targetUserId === currentUserId) {
      return next();
    }

    // 포지션 1~6은 본인만 조회 가능
    if (currentUserLevel >= 1 && currentUserLevel <= 6) {
      return res.status(403).json({
        success: false,
        message: '본인 정보만 조회할 수 있습니다.',
      });
    }

    // 포지션 7~10은 소속 팀 유저 조회 가능 (팀장 포함)
    if (currentUserLevel >= 7 && currentUserLevel <= 10) {
      if (!currentUser.team_id) {
        return res.status(403).json({
          success: false,
          message: '팀 정보가 없어 권한을 확인할 수 없습니다.',
        });
      }

      // 대상 유저가 같은 팀에 속하는지 확인
      const targetUser = await User.findByPk(targetUserId, {
        attributes: ['team_id'],
      });

      if (!targetUser || targetUser.team_id !== currentUser.team_id) {
        return res.status(403).json({
          success: false,
          message: '소속 팀 유저만 조회할 수 있습니다.',
        });
      }

      return next();
    }

    // 포지션 11은 소속 센터 유저 조회 가능
    if (currentUserLevel === 11) {
      if (!currentUser.center_id) {
        return res.status(403).json({
          success: false,
          message: '센터 정보가 없어 권한을 확인할 수 없습니다.',
        });
      }

      // 대상 유저가 같은 센터에 속하는지 확인
      const targetUser = await User.findByPk(targetUserId, {
        attributes: ['center_id'],
      });

      if (!targetUser || targetUser.center_id !== currentUser.center_id) {
        return res.status(403).json({
          success: false,
          message: '소속 센터 유저만 조회할 수 있습니다.',
        });
      }

      return next();
    }

    // 기타 경우는 권한 없음
    return res.status(403).json({
      success: false,
      message: '해당 정보를 조회할 권한이 없습니다.',
    });
  } catch (error) {
    console.error('권한 체크 오류:', error);
    return res.status(500).json({
      success: false,
      message: '권한 확인 중 오류가 발생했습니다.',
    });
  }
};

// 유저 목록 조회 권한 체크 미들웨어
const checkUserListPermission = async (req, res, next) => {
  try {
    const currentUserId = req.user.uid;

    // 현재 로그인한 사용자 정보 조회
    const currentUser = await User.findByPk(currentUserId, {
      include: [
        { model: Position, as: 'position', attributes: ['id', 'level'] },
        { model: Team, as: 'team', attributes: ['id'] },
        { model: Center, as: 'center', attributes: ['id'] },
      ],
    });

    if (!currentUser || !currentUser.position) {
      return res.status(403).json({
        success: false,
        message: '권한 정보를 찾을 수 없습니다.',
      });
    }

    const currentUserLevel = currentUser.position.level;

    // 포지션 12, 99는 모든 권한
    if (currentUserLevel === 12 || currentUserLevel === 99) {
      return next();
    }

    // 포지션 1~7도 목록 조회는 가능하지만 필터링은 컨트롤러에서 처리
    // (본인만 보이도록 필터링)
    return next();
  } catch (error) {
    console.error('권한 체크 오류:', error);
    return res.status(500).json({
      success: false,
      message: '권한 확인 중 오류가 발생했습니다.',
    });
  }
};

// 멤버 목록 조회 권한 체크 미들웨어
const checkMemberListPermission = async (req, res, next) => {
  try {
    const currentUserId = req.user.uid;

    // 현재 로그인한 사용자 정보 조회
    const currentUser = await User.findByPk(currentUserId, {
      include: [
        { model: Position, as: 'position', attributes: ['id', 'level'] },
        { model: Team, as: 'team', attributes: ['id'] },
        { model: Center, as: 'center', attributes: ['id'] },
      ],
    });

    if (!currentUser || !currentUser.position) {
      return res.status(403).json({
        success: false,
        message: '권한 정보를 찾을 수 없습니다.',
      });
    }

    const currentUserLevel = currentUser.position.level;

    // 모든 포지션에서 멤버 목록 조회 가능 (필터링은 컨트롤러에서 처리)
    return next();
  } catch (error) {
    console.error('권한 체크 오류:', error);
    return res.status(500).json({
      success: false,
      message: '권한 확인 중 오류가 발생했습니다.',
    });
  }
};

// 멤버 관리 권한 체크 미들웨어 (생성, 수정, 삭제)
const checkMemberManagementPermission = async (req, res, next) => {
  try {
    const currentUserId = req.user.uid;

    // 현재 로그인한 사용자 정보 조회
    const currentUser = await User.findByPk(currentUserId, {
      include: [
        { model: Position, as: 'position', attributes: ['id', 'level'] },
        { model: Team, as: 'team', attributes: ['id'] },
        { model: Center, as: 'center', attributes: ['id'] },
      ],
    });

    if (!currentUser || !currentUser.position) {
      return res.status(403).json({
        success: false,
        message: '권한 정보를 찾을 수 없습니다.',
      });
    }

    const currentUserLevel = currentUser.position.level;

    // 포지션 12, 99는 모든 권한
    if (currentUserLevel === 12 || currentUserLevel === 99) {
      return next();
    }

    // 포지션 1~6: 본인 담당 멤버만 관리 가능
    if (currentUserLevel >= 1 && currentUserLevel <= 6) {
      // 멤버 수정의 경우 본인이 담당하는 멤버인지 확인
      if (req.params.id) {
        const member = await require('../models').Member.findByPk(req.params.id);
        if (!member || member.trainer_id !== currentUserId) {
          return res.status(403).json({
            success: false,
            message: '본인이 담당하는 멤버만 관리할 수 있습니다.',
          });
        }
      }
      return next();
    }

    // 포지션 7~10: 소속 팀 멤버 관리 가능
    if (currentUserLevel >= 7 && currentUserLevel <= 10) {
      if (!currentUser.team_id) {
        return res.status(403).json({
          success: false,
          message: '팀 정보가 없어 권한을 확인할 수 없습니다.',
        });
      }

      // 멤버 수정의 경우 소속 팀 멤버인지 확인
      if (req.params.id) {
        const member = await require('../models').Member.findByPk(req.params.id, {
          include: [{ model: User, as: 'trainer', attributes: ['team_id'] }],
        });
        if (!member || !member.trainer || member.trainer.team_id !== currentUser.team_id) {
          return res.status(403).json({
            success: false,
            message: '소속 팀 멤버만 관리할 수 있습니다.',
          });
        }
      }
      return next();
    }

    // 포지션 11: 소속 센터 멤버 관리 가능
    if (currentUserLevel === 11) {
      if (!currentUser.center_id) {
        return res.status(403).json({
          success: false,
          message: '센터 정보가 없어 권한을 확인할 수 없습니다.',
        });
      }

      // 멤버 수정의 경우 소속 센터 멤버인지 확인
      if (req.params.id) {
        const member = await require('../models').Member.findByPk(req.params.id);
        if (!member || member.center_id !== currentUser.center_id) {
          return res.status(403).json({
            success: false,
            message: '소속 센터 멤버만 관리할 수 있습니다.',
          });
        }
      }
      return next();
    }

    // 기타 경우는 권한 없음
    return res.status(403).json({
      success: false,
      message: '멤버 관리 권한이 없습니다.',
    });
  } catch (error) {
    console.error('권한 체크 오류:', error);
    return res.status(500).json({
      success: false,
      message: '권한 확인 중 오류가 발생했습니다.',
    });
  }
};

// 멤버 생성 권한 체크 미들웨어
const checkMemberCreatePermission = async (req, res, next) => {
  try {
    const currentUserId = req.user.uid;
    const { center_id, trainer_id } = req.body;

    // 현재 로그인한 사용자 정보 조회
    const currentUser = await User.findByPk(currentUserId, {
      include: [
        { model: Position, as: 'position', attributes: ['id', 'level'] },
        { model: Team, as: 'team', attributes: ['id'] },
        { model: Center, as: 'center', attributes: ['id'] },
      ],
    });

    if (!currentUser || !currentUser.position) {
      return res.status(403).json({
        success: false,
        message: '권한 정보를 찾을 수 없습니다.',
      });
    }

    const currentUserLevel = currentUser.position.level;

    // 포지션 12, 99는 모든 권한
    if (currentUserLevel === 12 || currentUserLevel === 99) {
      return next();
    }

    // 포지션 1~6: 본인을 담당 트레이너로 하는 멤버만 생성 가능
    if (currentUserLevel >= 1 && currentUserLevel <= 6) {
      if (trainer_id && parseInt(trainer_id) !== currentUserId) {
        return res.status(403).json({
          success: false,
          message: '본인을 담당 트레이너로 하는 멤버만 생성할 수 있습니다.',
        });
      }
      return next();
    }

    // 포지션 7~10: 소속 팀 유저를 담당 트레이너로 하는 멤버만 생성 가능
    if (currentUserLevel >= 7 && currentUserLevel <= 10) {
      if (!currentUser.team_id) {
        return res.status(403).json({
          success: false,
          message: '팀 정보가 없어 권한을 확인할 수 없습니다.',
        });
      }

      if (trainer_id) {
        const trainer = await User.findByPk(trainer_id, {
          attributes: ['id', 'team_id'],
        });
        if (!trainer || trainer.team_id !== currentUser.team_id) {
          return res.status(403).json({
            success: false,
            message: '소속 팀 유저를 담당 트레이너로 하는 멤버만 생성할 수 있습니다.',
          });
        }
      }
      return next();
    }

    // 포지션 11: 소속 센터에 멤버만 생성 가능
    if (currentUserLevel === 11) {
      if (!currentUser.center_id) {
        return res.status(403).json({
          success: false,
          message: '센터 정보가 없어 권한을 확인할 수 없습니다.',
        });
      }

      if (center_id && parseInt(center_id) !== currentUser.center_id) {
        return res.status(403).json({
          success: false,
          message: '소속 센터에만 멤버를 생성할 수 있습니다.',
        });
      }
      return next();
    }

    // 기타 경우는 권한 없음
    return res.status(403).json({
      success: false,
      message: '멤버 생성 권한이 없습니다.',
    });
  } catch (error) {
    console.error('멤버 생성 권한 체크 오류:', error);
    return res.status(500).json({
      success: false,
      message: '권한 확인 중 오류가 발생했습니다.',
    });
  }
};

// 센터 관리 권한 체크 미들웨어 (관리자만 모든 센터 관리 가능)
const requireCenterManagementPermission = async (req, res, next) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: '인증이 필요합니다.',
      });
    }

    const user = await User.findByPk(req.user.id, {
      include: [
        { model: Position, as: 'position', attributes: ['id', 'level'] },
        { model: Center, as: 'center', attributes: ['id'] },
      ],
    });

    if (!user || !user.position) {
      return res.status(403).json({
        success: false,
        message: '권한 정보를 찾을 수 없습니다.',
      });
    }

    // 관리자 (position_id: 13)는 모든 센터 관리 가능
    if (user.position_id === 13) {
      return next();
    }

    // 센터장 (position_id: 11)은 소속 센터만 관리 가능
    if (user.position_id === 11) {
      const centerId = req.params.id || req.body.center_id;
      if (centerId && user.center_id && parseInt(centerId) !== user.center_id) {
        return res.status(403).json({
          success: false,
          message: '소속 센터만 관리할 수 있습니다.',
        });
      }
      return next();
    }

    return res.status(403).json({
      success: false,
      message: '센터 관리 권한이 없습니다.',
    });
  } catch (error) {
    console.error('권한 체크 오류:', error);
    return res.status(500).json({
      success: false,
      message: '권한 확인 중 오류가 발생했습니다.',
    });
  }
};

// 센터장 이상 권한 체크 미들웨어 (기존 호환성 유지)
const requireCenterManagerPermission = async (req, res, next) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: '인증이 필요합니다.',
      });
    }

    const user = await User.findByPk(req.user.id, {
      include: [{ model: Position, as: 'position', attributes: ['level'] }],
    });

    if (!user || !user.position) {
      return res.status(403).json({
        success: false,
        message: '권한 정보를 찾을 수 없습니다.',
      });
    }

    if (user.position.level < CENTER_MANAGER_LEVEL) {
      return res.status(403).json({
        success: false,
        message: '센터장 이상 권한이 필요합니다.',
      });
    }

    next();
  } catch (error) {
    console.error('권한 체크 오류:', error);
    return res.status(500).json({
      success: false,
      message: '권한 확인 중 오류가 발생했습니다.',
    });
  }
};

// 특정 레벨 이상 권한 체크 미들웨어
const requirePermissionLevel = requiredLevel => {
  return async (req, res, next) => {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({
          success: false,
          message: '인증이 필요합니다.',
        });
      }

      const user = await User.findByPk(req.user.id, {
        include: [{ model: Position, as: 'position', attributes: ['level'] }],
      });

      if (!user || !user.position) {
        return res.status(403).json({
          success: false,
          message: '권한 정보를 찾을 수 없습니다.',
        });
      }

      if (user.position.level < requiredLevel) {
        return res.status(403).json({
          success: false,
          message: `레벨 ${requiredLevel} 이상 권한이 필요합니다.`,
        });
      }

      next();
    } catch (error) {
      console.error('권한 체크 오류:', error);
      return res.status(500).json({
        success: false,
        message: '권한 확인 중 오류가 발생했습니다.',
      });
    }
  };
};

// PT 결제 조회 권한 체크 미들웨어 (포지션별 권한 범위 적용)
const requirePaymentPermission = async (req, res, next) => {
  try {
    if (!req.user || !req.user.uid) {
      return res.status(401).json({
        success: false,
        message: '인증이 필요합니다.',
      });
    }

    const currentUser = await User.findByPk(req.user.uid || req.user.id, {
      include: [
        { model: Position, as: 'position', attributes: ['id', 'level'] },
        { model: Team, as: 'team', attributes: ['id'] },
        { model: Center, as: 'center', attributes: ['id'] },
      ],
    });

    if (!currentUser || !currentUser.position) {
      return res.status(403).json({
        success: false,
        message: '권한 정보를 찾을 수 없습니다.',
      });
    }

    const currentUserLevel = currentUser.position.level;

    // 포지션 12, 13, 99는 모든 권한 (관리자 포함)
    if (currentUserLevel === 12 || currentUserLevel === 13 || currentUserLevel === 99) {
      return next();
    }

    // 포지션 1~6: 본인 담당 멤버의 PT 결제만 조회 가능
    if (currentUserLevel >= 1 && currentUserLevel <= 6) {
      return next();
    }

    // 포지션 7~10: 소속 팀 멤버의 PT 결제 조회 가능
    if (currentUserLevel >= 7 && currentUserLevel <= 10) {
      if (!currentUser.team_id) {
        return res.status(403).json({
          success: false,
          message: '팀 정보가 없어 권한을 확인할 수 없습니다.',
        });
      }
      return next();
    }

    // 포지션 11: 소속 센터 멤버의 PT 결제 조회 가능
    if (currentUserLevel === 11) {
      if (!currentUser.center_id) {
        return res.status(403).json({
          success: false,
          message: '센터 정보가 없어 권한을 확인할 수 없습니다.',
        });
      }
      return next();
    }

    return res.status(403).json({
      success: false,
      message: 'PT 결제 조회 권한이 없습니다.',
    });
  } catch (error) {
    console.error('PT 결제 조회 권한 체크 오류:', error);
    return res.status(500).json({
      success: false,
      message: '권한 확인 중 오류가 발생했습니다.',
    });
  }
};

// PT 결제 관리 권한 체크 미들웨어 (담당 트레이너만 관리 가능)
const requirePaymentManagementPermission = async (req, res, next) => {
  try {
    if (!req.user || !req.user.uid) {
      return res.status(401).json({
        success: false,
        message: '인증이 필요합니다.',
      });
    }

    const currentUser = await User.findByPk(req.user.uid || req.user.id, {
      include: [{ model: Position, as: 'position', attributes: ['id', 'level'] }],
    });

    if (!currentUser || !currentUser.position) {
      return res.status(403).json({
        success: false,
        message: '권한 정보를 찾을 수 없습니다.',
      });
    }

    const currentUserLevel = currentUser.position.level;

    // 포지션 12, 13, 99는 모든 권한 (관리자 포함)
    if (currentUserLevel === 12 || currentUserLevel === 13 || currentUserLevel === 99) {
      return next();
    }

    // PT 결제 생성의 경우: 담당 멤버인지 확인
    if (req.method === 'POST' && req.body.member_id) {
      console.log('🔍 PT 결제 생성 권한 체크:', {
        currentUser: {
          uid: currentUser.uid,
          id: currentUser.id,
          name: currentUser.name,
          position_level: currentUserLevel,
        },
        requestBody: {
          member_id: req.body.member_id,
        },
      });

      const member = await require('../models').Member.findByPk(req.body.member_id);

      console.log('🔍 멤버 정보:', {
        member: member
          ? {
              id: member.id,
              name: member.name,
              trainer_id: member.trainer_id,
            }
          : null,
        isTrainer: member ? member.trainer_id === currentUser.id : false,
      });

      if (!member || member.trainer_id !== currentUser.id) {
        console.log('❌ PT 결제 생성 권한 거부:', {
          reason: !member ? '멤버를 찾을 수 없음' : '담당 트레이너가 아님',
          member_trainer_id: member?.trainer_id,
          current_user_id: currentUser.id,
        });
        return res.status(403).json({
          success: false,
          message: '본인이 담당하는 멤버의 PT 결제만 생성할 수 있습니다.',
        });
      }

      console.log('✅ PT 결제 생성 권한 승인');
      return next();
    }

    // PT 결제 수정/삭제의 경우: 담당 트레이너인지 확인
    if (req.params.id) {
      const payment = await require('../models').Payment.findByPk(req.params.id);
      if (!payment || payment.trainer_id !== currentUser.id) {
        return res.status(403).json({
          success: false,
          message: '본인이 담당하는 멤버의 PT 결제만 관리할 수 있습니다.',
        });
      }
      return next();
    }

    // 기타 경우는 권한 없음
    return res.status(403).json({
      success: false,
      message: 'PT 결제 관리 권한이 없습니다.',
    });
  } catch (error) {
    console.error('PT 결제 관리 권한 체크 오류:', error);
    return res.status(500).json({
      success: false,
      message: '권한 확인 중 오류가 발생했습니다.',
    });
  }
};

// PT 세션 조회 권한 체크 미들웨어 (포지션별 권한 범위 적용)
const requirePTSessionPermission = async (req, res, next) => {
  try {
    if (!req.user || !req.user.uid) {
      return res.status(401).json({
        success: false,
        message: '인증이 필요합니다.',
      });
    }

    const currentUser = await User.findByPk(req.user.uid, {
      include: [
        { model: Position, as: 'position', attributes: ['id', 'level'] },
        { model: Team, as: 'team', attributes: ['id'] },
        { model: Center, as: 'center', attributes: ['id'] },
      ],
    });

    if (!currentUser || !currentUser.position) {
      return res.status(403).json({
        success: false,
        message: '권한 정보를 찾을 수 없습니다.',
      });
    }

    const currentUserLevel = currentUser.position.level;

    // 포지션 12, 13, 99는 모든 권한 (관리자 포함)
    if (currentUserLevel === 12 || currentUserLevel === 13 || currentUserLevel === 99) {
      return next();
    }

    // 포지션 1~6: 본인 담당 멤버의 PT 세션만 조회 가능
    if (currentUserLevel >= 1 && currentUserLevel <= 6) {
      return next();
    }

    // 포지션 7~10: 소속 팀 멤버의 PT 세션 조회 가능
    if (currentUserLevel >= 7 && currentUserLevel <= 10) {
      if (!currentUser.team_id) {
        return res.status(403).json({
          success: false,
          message: '팀 정보가 없어 권한을 확인할 수 없습니다.',
        });
      }
      return next();
    }

    // 포지션 11: 소속 센터 멤버의 PT 세션 조회 가능
    if (currentUserLevel === 11) {
      if (!currentUser.center_id) {
        return res.status(403).json({
          success: false,
          message: '센터 정보가 없어 권한을 확인할 수 없습니다.',
        });
      }
      return next();
    }

    // 기타 경우는 권한 없음
    return res.status(403).json({
      success: false,
      message: 'PT 세션 조회 권한이 없습니다.',
    });
  } catch (error) {
    console.error('PT 세션 권한 체크 오류:', error);
    return res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.',
    });
  }
};

// PT 세션 관리 권한 체크 미들웨어 (담당 트레이너만 관리 가능)
const requirePTSessionManagementPermission = async (req, res, next) => {
  try {
    if (!req.user || !req.user.uid) {
      return res.status(401).json({
        success: false,
        message: '인증이 필요합니다.',
      });
    }

    const currentUser = await User.findByPk(req.user.uid || req.user.id, {
      include: [{ model: Position, as: 'position', attributes: ['id', 'level'] }],
    });

    if (!currentUser || !currentUser.position) {
      return res.status(403).json({
        success: false,
        message: '권한 정보를 찾을 수 없습니다.',
      });
    }

    const currentUserLevel = currentUser.position.level;

    // 포지션 12, 13, 99는 모든 권한 (관리자 포함)
    if (currentUserLevel === 12 || currentUserLevel === 13 || currentUserLevel === 99) {
      return next();
    }

    // PT 세션 생성의 경우: 담당 멤버인지 확인
    if (req.method === 'POST' && req.body.member_id) {
      console.log('🔍 PT 세션 생성 권한 체크:', {
        currentUser: {
          uid: currentUser.uid,
          id: currentUser.id,
          name: currentUser.name,
          position_level: currentUserLevel,
        },
        requestBody: {
          member_id: req.body.member_id,
        },
      });

      const member = await require('../models').Member.findByPk(req.body.member_id);

      console.log('🔍 멤버 정보:', {
        member: member
          ? {
              id: member.id,
              name: member.name,
              trainer_id: member.trainer_id,
            }
          : null,
        isTrainer: member ? member.trainer_id === currentUser.id : false,
      });

      if (!member || member.trainer_id !== currentUser.id) {
        console.log('❌ PT 세션 생성 권한 거부:', {
          reason: !member ? '멤버를 찾을 수 없음' : '담당 트레이너가 아님',
          member_trainer_id: member?.trainer_id,
          current_user_id: currentUser.id,
        });
        return res.status(403).json({
          success: false,
          message: '본인이 담당하는 멤버의 PT 세션만 생성할 수 있습니다.',
        });
      }

      console.log('✅ PT 세션 생성 권한 승인');
      return next();
    }

    // PT 세션 수정/삭제의 경우: 담당 트레이너인지 확인
    if (req.params.id) {
      const ptSession = await require('../models').PTSession.findByPk(req.params.id);
      if (!ptSession || ptSession.trainer_id !== currentUser.id) {
        return res.status(403).json({
          success: false,
          message: '본인이 담당하는 멤버의 PT 세션만 관리할 수 있습니다.',
        });
      }
      return next();
    }

    // 기타 경우는 권한 없음
    return res.status(403).json({
      success: false,
      message: 'PT 세션 관리 권한이 없습니다.',
    });
  } catch (error) {
    console.error('PT 세션 관리 권한 체크 오류:', error);
    return res.status(500).json({
      success: false,
      message: '권한 확인 중 오류가 발생했습니다.',
    });
  }
};

module.exports = {
  checkUserViewPermission,
  checkUserListPermission,
  checkMemberListPermission,
  checkMemberManagementPermission,
  checkMemberCreatePermission,
  requireCenterManagerPermission,
  requireCenterManagementPermission,
  requirePaymentPermission,
  requirePaymentManagementPermission,
  requirePTSessionPermission,
  requirePTSessionManagementPermission,
  requirePermissionLevel,
  CENTER_MANAGER_LEVEL,
};
