// 권한 체크 유틸리티 함수들

// 센터장 레벨 (level 11)
const CENTER_MANAGER_LEVEL = 11;

// 사용자가 센터장 이상 권한을 가지고 있는지 확인
export const hasCenterManagerPermission = user => {
  if (!user || !user.position) {
    return false;
  }

  return user.position.level >= CENTER_MANAGER_LEVEL;
};

// 사용자가 특정 레벨 이상의 권한을 가지고 있는지 확인
export const hasPermissionLevel = (user, requiredLevel) => {
  if (!user || !user.position) {
    return false;
  }

  return user.position.level >= requiredLevel;
};

// 사용자가 모든 권한을 가지고 있는지 확인 (포지션 12, 99)
export const hasFullPermission = user => {
  if (!user || !user.position) {
    return false;
  }

  return user.position.level === 12 || user.position.level === 99;
};

// 사용자가 팀 관리 권한을 가지고 있는지 확인 (포지션 8~10)
export const hasTeamManagementPermission = user => {
  if (!user || !user.position) {
    return false;
  }

  return user.position.level >= 8 && user.position.level <= 10;
};

// 사용자가 센터 관리 권한을 가지고 있는지 확인 (포지션 11)
export const hasCenterManagementPermission = user => {
  if (!user || !user.position) {
    return false;
  }

  return user.position.level === 11;
};

// 사용자가 기본 권한만 가지고 있는지 확인 (포지션 1~7)
export const hasBasicPermission = user => {
  if (!user || !user.position) {
    return false;
  }

  return user.position.level >= 1 && user.position.level <= 7;
};

// 특정 유저를 조회할 수 있는 권한이 있는지 확인
export const canViewUser = (currentUser, targetUser) => {
  if (!currentUser || !currentUser.position) {
    return false;
  }

  const currentUserLevel = currentUser.position.level;

  // 포지션 12, 99는 모든 권한
  if (currentUserLevel === 12 || currentUserLevel === 99) {
    return true;
  }

  // 본인 조회는 항상 가능
  if (currentUser.id === targetUser.id) {
    return true;
  }

  // 포지션 1~7은 본인만 조회 가능
  if (currentUserLevel >= 1 && currentUserLevel <= 7) {
    return false;
  }

  // 포지션 8~10은 소속 팀 유저 조회 가능
  if (currentUserLevel >= 8 && currentUserLevel <= 10) {
    return currentUser.team_id === targetUser.team_id;
  }

  // 포지션 11은 소속 센터 유저 조회 가능
  if (currentUserLevel === 11) {
    return currentUser.center_id === targetUser.center_id;
  }

  return false;
};

// 사용자 목록을 조회할 수 있는 권한이 있는지 확인
export const canViewUserList = user => {
  if (!user || !user.position) {
    return false;
  }

  const userLevel = user.position.level;

  // 모든 포지션에서 목록 조회 가능 (필터링은 백엔드에서 처리)
  return true;
};

// 권한에 따른 버튼 렌더링 여부 확인
export const canPerformAction = (user, requiredLevel = CENTER_MANAGER_LEVEL) => {
  return hasPermissionLevel(user, requiredLevel);
};

// 권한이 없을 때 표시할 메시지
export const getPermissionMessage = () => {
  return '센터장 이상 권한이 필요합니다.';
};

// 권한이 없을 때 표시할 상세 메시지
export const getDetailedPermissionMessage = () => {
  return '센터 등록, 수정, 삭제 및 이미지 관리는 센터장 이상 권한이 필요합니다. 현재는 보기 권한만 있습니다.';
};

// 사용자 조회 권한이 없을 때 표시할 메시지
export const getUserViewPermissionMessage = userLevel => {
  if (userLevel >= 1 && userLevel <= 7) {
    return '본인 정보만 조회할 수 있습니다.';
  } else if (userLevel >= 8 && userLevel <= 10) {
    return '소속 팀 유저만 조회할 수 있습니다.';
  } else if (userLevel === 11) {
    return '소속 센터 유저만 조회할 수 있습니다.';
  } else {
    return '해당 정보를 조회할 권한이 없습니다.';
  }
};

// 사용자 목록 조회 권한이 없을 때 표시할 메시지
export const getUserListPermissionMessage = () => {
  return '사용자 목록을 조회할 권한이 없습니다.';
};

// 멤버 목록을 조회할 수 있는 권한이 있는지 확인
export const canViewMemberList = user => {
  if (!user || !user.position) {
    return false;
  }

  const userLevel = user.position.level;

  // 모든 포지션에서 멤버 목록 조회 가능 (필터링은 백엔드에서 처리)
  return true;
};

// 멤버 목록 조회 권한이 없을 때 표시할 메시지
export const getMemberListPermissionMessage = () => {
  return '멤버 목록을 조회할 권한이 없습니다.';
};
