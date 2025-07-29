// 메뉴명을 경로로 변환하는 함수
export const getPathFromMenu = (menuName) => {
  switch (menuName) {
    case '지점':
      return '/branch';
    case '직원':
      return '/staff';
    case '고객':
      return '/customer';
    case '정산시스템':
      return '/settlement';
    case '알림/공지':
      return '/notification';
    case '분석리포트':
      return '/report';
    case '내계정':
      return '/account';
    default:
      return '/staff';
  }
};

// 경로를 메뉴명으로 변환하는 함수
export const getMenuFromPath = (pathname) => {
  switch (pathname) {
    case '/':
      return '직원'; // 대시보드 경로지만 직원으로 표시
    case '/branch':
      return '지점';
    case '/staff':
      return '직원';
    case '/customer':
      return '고객';
    case '/settlement':
      return '정산시스템';
    case '/notification':
      return '알림/공지';
    case '/report':
      return '분석리포트';
    case '/account':
      return '내계정';
    default:
      return '직원';
  }
};

// 모든 라우트 경로 정의
export const ROUTES = {
  HOME: '/',
  DASHBOARD: '/',
  BRANCH: '/branch',
  STAFF: '/staff',
  CUSTOMER: '/customer',
  SETTLEMENT: '/settlement',
  NOTIFICATION: '/notification',
  REPORT: '/report',
  ACCOUNT: '/account',
};

// 메뉴 설정 (대시보드 제거)
export const MENU_CONFIG = [
  { name: '지점', path: ROUTES.BRANCH },
  { name: '직원', path: ROUTES.STAFF },
  { name: '고객', path: ROUTES.CUSTOMER },
  { name: '정산시스템', path: ROUTES.SETTLEMENT },
  { name: '알림/공지', path: ROUTES.NOTIFICATION },
  { name: '분석리포트', path: ROUTES.REPORT },
  { name: '내계정', path: ROUTES.ACCOUNT },
]; 