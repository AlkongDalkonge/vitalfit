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
        { model: Center, as: 'center', attributes: ['id'] }
      ]
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

    // 포지션 1~7은 본인만 조회 가능
    if (currentUserLevel >= 1 && currentUserLevel <= 7) {
      return res.status(403).json({
        success: false,
        message: '본인 정보만 조회할 수 있습니다.',
      });
    }

    // 포지션 8~10은 소속 팀 유저 조회 가능
    if (currentUserLevel >= 8 && currentUserLevel <= 10) {
      if (!currentUser.team_id) {
        return res.status(403).json({
          success: false,
          message: '팀 정보가 없어 권한을 확인할 수 없습니다.',
        });
      }

      // 대상 유저가 같은 팀에 속하는지 확인
      const targetUser = await User.findByPk(targetUserId, {
        attributes: ['team_id']
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
        attributes: ['center_id']
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
        { model: Center, as: 'center', attributes: ['id'] }
      ]
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
        { model: Center, as: 'center', attributes: ['id'] }
      ]
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

// 센터장 이상 권한 체크 미들웨어
const requireCenterManagerPermission = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.uid, {
      include: [
        { model: Position, as: 'position', attributes: ['level'] }
      ]
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
const requirePermissionLevel = (requiredLevel) => {
  return async (req, res, next) => {
    try {
      const user = await User.findByPk(req.user.uid, {
        include: [
          { model: Position, as: 'position', attributes: ['level'] }
        ]
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

module.exports = {
  checkUserViewPermission,
  checkUserListPermission,
  checkMemberListPermission,
  requireCenterManagerPermission,
  requirePermissionLevel,
  CENTER_MANAGER_LEVEL
}; 