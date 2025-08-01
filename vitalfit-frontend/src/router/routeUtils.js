// 메뉴명을 경로로 변환하는 함수
export const getPathFromMenu = menuName => {
  switch (menuName) {
    case '지점':
      return '/center';
    case '직원':
      return '/user';
    case '고객':
      return '/member';
    case '정산시스템':
      return '/payment';
    case '알림/공지':
      return '/notice';
    case '분석리포트':
      return '/report';
    case '내계정':
      return '/account';
    default:
      return '/';
  }
};

export const getMenuFromPath = (pathname) => {
  // 대시보드 경로는 null 반환 (메뉴 활성화 없음)
  if (pathname === "/") {
    return null;
  }

  // 경로별 메뉴 매칭 (하위 경로 포함)
  if (pathname.startsWith("/center")) {
    return "지점";
  }
  if (pathname.startsWith("/user")) {
    return "직원";
  }
  if (pathname.startsWith("/member")) {
    return "고객";
  }
  if (pathname.startsWith("/payment")) {
    return "정산시스템";
  }
  if (pathname.startsWith("/notice")) {
    return "알림/공지";
  }
  if (pathname.startsWith("/report")) {
    return "분석리포트";
  }
  if (pathname.startsWith("/account")) {
    return "내계정";
  }

  return null;
};

export const ROUTES = {
  HOME: '/',
  DASHBOARD: '/',
  CENTER: '/center',
  USER: '/user',
  MEMBER: '/member',
  PAYMENT: '/payment',
  NOTICE: '/notice',
  REPORT: '/report',
  ACCOUNT: '/account',
};

export const MENU_CONFIG = [
  { name: '지점', path: ROUTES.CENTER },
  { name: '직원', path: ROUTES.USER },
  { name: '고객', path: ROUTES.MEMBER },
  { name: '정산시스템', path: ROUTES.PAYMENT },
  { name: '알림/공지', path: ROUTES.NOTICE },
  { name: '분석리포트', path: ROUTES.REPORT },
  { name: '내계정', path: ROUTES.ACCOUNT },
];
