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

export const getMenuFromPath = pathname => {
  switch (pathname) {
    case '/':
      return null; // 대시보드 경로는 null 반환 (메뉴 활성화 없음)
    case '/center':
      return '지점';
    case '/user':
      return '직원';
    case '/member':
      return '고객';
    case '/payment':
      return '정산시스템';
    case '/notice':
      return '알림/공지';
    case '/report':
      return '분석리포트';
    case '/account':
      return '내계정';
    default:
      return null;
  }
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
