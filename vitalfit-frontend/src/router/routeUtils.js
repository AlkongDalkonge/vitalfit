// 메뉴명을 경로로 변환하는 함수
export const getPathFromMenu = menuName => {
  switch (menuName) {
    case '지점':
      return '/centers';
    case '직원':
      return '/users';
    case '고객':
      return '/members';
    case 'PT 결제':
      return '/pay';
    case '정산시스템':
      return '/settlement';
    case '알림/공지':
      return '/notices';
    case '분석리포트':
      return '/analytics';
    case '내계정':
      return '/account';
    default:
      return '/';
  }
};

export const getMenuFromPath = pathname => {
  // 대시보드 경로는 null 반환 (메뉴 활성화 없음)
  if (pathname === '/' || pathname === '/dashboard' || pathname === '/dashboard/') {
    return null;
  }

  // 경로별 메뉴 매칭 (하위 경로 포함)
  if (pathname.startsWith('/centers') || pathname.startsWith('/dashboard/centers')) {
    return '지점';
  }
  if (pathname.startsWith('/users') || pathname.startsWith('/dashboard/users')) {
    return '직원';
  }
  if (pathname.startsWith('/members') || pathname.startsWith('/dashboard/members')) {
    return '고객';
  }
  if (pathname.startsWith('/pay') || pathname.startsWith('/dashboard/pay')) {
    return 'PT 결제';
  }
  if (pathname.startsWith('/settlement') || pathname.startsWith('/dashboard/settlement')) {
    return '정산시스템';
  }
  if (pathname.startsWith('/notices') || pathname.startsWith('/dashboard/notices')) {
    return '알림/공지';
  }
  if (pathname.startsWith('/analytics') || pathname.startsWith('/dashboard/analytics')) {
    return '분석리포트';
  }
  if (pathname.startsWith('/account') || pathname.startsWith('/dashboard/account')) {
    return '내계정';
  }

  return null;
};

export const ROUTES = {
  HOME: '/',
  DASHBOARD: '/dashboard',
  CENTER: '/centers',
  USER: '/users',
  MEMBER: '/members',
  PAY: '/pay',
  PAYMENT: '/settlement',
  PAYMENT_HISTORY: '/payment-history',
  PT_SESSIONS: '/members/:id/pt-sessions',
  NOTICE: '/notices',
  ANALYTICS: '/analytics',
  ACCOUNT: '/account',
  PERSONAL_INFO: '/account/personal-info',
  DELETE_ACCOUNT: '/account/delete-account',
};

export const MENU_CONFIG = [
  { name: '지점', path: ROUTES.CENTER },
  { name: '직원', path: ROUTES.USER },
  { name: '고객', path: ROUTES.MEMBER },
  { name: 'PT 결제', path: ROUTES.PAY },
  { name: '정산시스템', path: ROUTES.PAYMENT },
  { name: '알림/공지', path: ROUTES.NOTICE },
  { name: '분석리포트', path: ROUTES.ANALYTICS },
  { name: '내계정', path: ROUTES.ACCOUNT },
];

// 민감한 작업이 필요한 페이지들
export const SENSITIVE_ROUTES = [ROUTES.PERSONAL_INFO, ROUTES.DELETE_ACCOUNT];

// 특정 경로가 민감한 작업인지 확인하는 함수
export const isSensitiveRoute = pathname => {
  return SENSITIVE_ROUTES.includes(pathname);
};
