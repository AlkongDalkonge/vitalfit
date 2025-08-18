// 재인증 관련 유틸리티 함수들

const REAUTH_KEY = 'vitalfit_reauth';
const REAUTH_DURATION = 2 * 60 * 1000; // 2분 (밀리초)
const ACCOUNT_TAB_KEY = 'accountActiveTab'; // 계정 페이지 활성 탭 저장 키

// 민감한 작업이 필요한 페이지들
export const SENSITIVE_PAGES = [
  '/account/personal-info', // 개인정보 수정
  '/account/delete-account', // 계정 삭제
];

/**
 * 재인증 상태를 저장합니다
 * @param {string} userId - 사용자 ID
 * @param {string} reAuthToken - 재인증 JWT 토큰
 * @param {string} pagePath - 재인증이 필요한 페이지 경로
 */
export const setReAuthStatus = (userId, reAuthToken, pagePath = null) => {
  try {
    const reAuthData = {
      userId,
      reAuthToken,
      timestamp: Date.now(),
      isValid: true,
      pagePath, // 페이지별 독립 재인증을 위한 경로 저장
    };
    sessionStorage.setItem(REAUTH_KEY, JSON.stringify(reAuthData));
    console.log('✅ 재인증 상태 저장됨:', { userId, hasToken: !!reAuthToken, pagePath });
  } catch (error) {
    console.error('❌ 재인증 상태 저장 실패:', error);
  }
};

/**
 * 재인증 상태를 확인합니다
 * @param {string} userId - 사용자 ID
 * @param {string} pagePath - 확인할 페이지 경로 (선택사항)
 * @returns {boolean} 재인증이 유효한지 여부
 */
export const isReAuthValid = (userId, pagePath = null) => {
  try {
    const reAuthData = sessionStorage.getItem(REAUTH_KEY);
    if (!reAuthData) {
      console.log('❌ 재인증 데이터 없음');
      return false;
    }

    const data = JSON.parse(reAuthData);
    console.log('🔍 재인증 데이터 확인:', {
      userId: data.userId,
      hasToken: !!data.reAuthToken,
      pagePath: data.pagePath,
      requestedPath: pagePath,
    });

    // 사용자 ID가 다르거나 데이터가 유효하지 않으면 false
    if (data.userId !== userId || !data.isValid || !data.reAuthToken) {
      console.log('❌ 사용자 ID 불일치, 유효하지 않음, 또는 토큰 없음');
      return false;
    }

    // 페이지별 독립 재인증: 특정 페이지 경로가 지정된 경우 해당 경로와 일치해야 함
    if (pagePath && data.pagePath && data.pagePath !== pagePath) {
      console.log('❌ 페이지 경로 불일치:', { stored: data.pagePath, requested: pagePath });
      return false;
    }

    // 2분이 지났는지 확인
    const now = Date.now();
    const timeDiff = now - data.timestamp;
    const remainingTime = Math.max(0, REAUTH_DURATION - timeDiff);

    console.log(`⏰ 재인증 남은 시간: ${Math.ceil(remainingTime / 1000)}초`);

    if (timeDiff > REAUTH_DURATION) {
      // 만료된 경우 상태 제거
      console.log('⏰ 재인증 시간 만료 (2분)');
      clearReAuthStatus();
      return false;
    }

    console.log('✅ 재인증 유효함');
    return true;
  } catch (error) {
    console.error('❌ 재인증 상태 확인 실패:', error);
    return false;
  }
};

/**
 * 재인증 토큰을 가져옵니다
 * @param {string} userId - 사용자 ID
 * @param {string} pagePath - 페이지 경로 (선택사항)
 * @returns {string|null} 재인증 토큰 또는 null
 */
export const getReAuthToken = (userId, pagePath = null) => {
  try {
    const reAuthData = sessionStorage.getItem(REAUTH_KEY);
    if (!reAuthData) return null;

    const data = JSON.parse(reAuthData);

    if (data.userId !== userId || !data.isValid || !data.reAuthToken) {
      return null;
    }

    // 페이지별 독립 재인증 확인 - 경로 매칭 로직 개선
    if (pagePath && data.pagePath) {
      // 1. 정확히 일치하는 경우
      if (data.pagePath === pagePath) {
        console.log('✅ 정확한 페이지 경로 매칭');
      }
      // 2. 계정 페이지에 대한 재인증이 있으면 모든 하위 경로 허용
      else if (data.pagePath === '/account' && pagePath.startsWith('/account/')) {
        console.log('✅ 계정 재인증으로 하위 경로 접근 허용:', {
          parent: data.pagePath,
          child: pagePath,
        });
      }
      // 3. 하위 경로인 경우
      else if (data.pagePath.startsWith(pagePath + '/')) {
        console.log('✅ 하위 경로 매칭:', { parent: data.pagePath, child: pagePath });
      }
      // 4. 상위 경로인 경우
      else if (pagePath.startsWith(data.pagePath + '/')) {
        console.log('✅ 상위 경로 매칭:', { child: data.pagePath, parent: pagePath });
      }
      // 5. 경로가 일치하지 않는 경우
      else {
        console.log('❌ 페이지 경로 매칭 실패:', { stored: data.pagePath, requested: pagePath });
        return null;
      }
    }

    // 2분이 지났는지 확인
    const now = Date.now();
    const timeDiff = now - data.timestamp;

    if (timeDiff > REAUTH_DURATION) {
      clearReAuthStatus();
      return null;
    }

    return data.reAuthToken;
  } catch (error) {
    console.error('❌ 재인증 토큰 가져오기 실패:', error);
    return null;
  }
};

/**
 * 재인증 상태를 제거합니다
 */
export const clearReAuthStatus = () => {
  try {
    sessionStorage.removeItem(REAUTH_KEY);
    console.log('🗑️ 재인증 상태 제거됨');
  } catch (error) {
    console.error('❌ 재인증 상태 제거 실패:', error);
  }
};

/**
 * 재인증 상태를 무효화합니다 (로그아웃 시 사용)
 */
export const invalidateReAuthStatus = () => {
  try {
    const reAuthData = sessionStorage.getItem(REAUTH_KEY);
    if (reAuthData) {
      const data = JSON.parse(reAuthData);
      data.isValid = false;
      sessionStorage.setItem(REAUTH_KEY, JSON.stringify(data));
      console.log('❌ 재인증 상태 무효화됨');
    }
  } catch (error) {
    console.error('❌ 재인증 상태 무효화 실패:', error);
  }
};

/**
 * 재인증 만료 시간까지 남은 시간을 계산합니다 (초 단위)
 * @param {string} userId - 사용자 ID
 * @param {string} pagePath - 페이지 경로 (선택사항)
 * @returns {number} 남은 시간 (초), 만료되었으면 0
 */
export const getReAuthTimeRemaining = (userId, pagePath = null) => {
  try {
    const reAuthData = sessionStorage.getItem(REAUTH_KEY);
    if (!reAuthData) return 0;

    const data = JSON.parse(reAuthData);

    if (data.userId !== userId || !data.isValid) {
      return 0;
    }

    // 페이지별 독립 재인증 확인
    if (pagePath && data.pagePath && data.pagePath !== pagePath) {
      return 0;
    }

    const now = Date.now();
    const timeDiff = now - data.timestamp;
    const remaining = Math.max(0, REAUTH_DURATION - timeDiff);

    return Math.ceil(remaining / 1000); // 초 단위로 반환
  } catch (error) {
    console.error('재인증 남은 시간 계산 실패:', error);
    return 0;
  }
};

/**
 * 재인증 상태를 새로고침합니다 (시간 연장)
 * @param {string} userId - 사용자 ID
 * @param {string} reAuthToken - 새로운 재인증 토큰
 * @param {string} pagePath - 페이지 경로 (선택사항)
 */
export const refreshReAuthStatus = (userId, reAuthToken, pagePath = null) => {
  if (reAuthToken) {
    setReAuthStatus(userId, reAuthToken, pagePath);
  }
};

/**
 * 계정 페이지 활성 탭을 저장합니다
 * @param {string} tabId - 활성 탭 ID
 */
export const saveAccountTab = tabId => {
  try {
    localStorage.setItem(ACCOUNT_TAB_KEY, tabId);
    console.log('💾 계정 페이지 활성 탭 저장:', tabId);
  } catch (error) {
    console.error('❌ 계정 페이지 탭 저장 실패:', error);
  }
};

/**
 * 계정 페이지 활성 탭을 가져옵니다
 * @returns {string} 저장된 활성 탭 ID 또는 기본값
 */
export const getAccountTab = () => {
  try {
    const savedTab = localStorage.getItem(ACCOUNT_TAB_KEY);
    return savedTab || 'personal';
  } catch (error) {
    console.error('❌ 계정 페이지 탭 가져오기 실패:', error);
    return 'personal';
  }
};

/**
 * 페이지 이동 시 재인증 상태를 유지합니다
 * @param {string} userId - 사용자 ID
 */
export const handlePageNavigation = userId => {
  // AccountPage에서만 호출되므로 로그 제거
  // console.log('🔄 페이지 이동 - 재인증 상태 유지 (userId:', userId, ')');
  // clearReAuthStatus() 제거 - 재인증 상태 유지
  // 추가적인 처리가 필요하지 않음
};

/**
 * 재인증이 필요한지 확인합니다
 * @param {string} userId - 사용자 ID
 * @param {string} pagePath - 페이지 경로 (선택사항)
 * @returns {boolean} 재인증이 필요한지 여부
 */
export const needsReAuth = (userId, pagePath = null) => {
  const needs = !isReAuthValid(userId, pagePath);
  console.log(`🔐 사용자 ${userId} 재인증 필요: ${needs}`, pagePath ? `(경로: ${pagePath})` : '');
  return needs;
};

/**
 * 민감 작업에 대한 재인증이 필요한지 확인합니다
 * @param {string} userId - 사용자 ID
 * @param {string} pagePath - 페이지 경로 (선택사항)
 * @returns {boolean} 민감 작업 재인증이 필요한지 여부
 */
export const needsSensitiveActionReAuth = (userId, pagePath = null) => {
  // 사용자 ID가 없으면 재인증 필요
  if (!userId) {
    console.log(`🔐 사용자 ID 없음 - 재인증 필요: true`);
    return true;
  }

  // 민감한 작업 페이지들은 항상 재인증 필요
  if (pagePath && SENSITIVE_PAGES.includes(pagePath)) {
    console.log(`🔐 민감한 작업 페이지: ${pagePath} - 재인증 필요: true`);
    return true;
  }

  // 현재 페이지에 대한 재인증 상태 확인
  const isCurrentPageReAuthValid = isPageReAuthValid(userId, pagePath);
  const needs = !isCurrentPageReAuthValid;

  console.log(
    `🔐 사용자 ${userId} 민감 작업 재인증 필요: ${needs}`,
    pagePath ? `(경로: ${pagePath}, 현재 상태: ${isCurrentPageReAuthValid})` : ''
  );
  return needs;
};

/**
 * 특정 페이지에 대한 재인증 상태를 확인합니다
 * @param {string} userId - 사용자 ID
 * @param {string} pagePath - 페이지 경로
 * @returns {boolean} 해당 페이지에 대한 재인증이 유효한지 여부
 */
export const isPageReAuthValid = (userId, pagePath) => {
  try {
    // pagePath 유효성 검사 추가
    if (!pagePath || typeof pagePath !== 'string') {
      console.log('❌ 유효하지 않은 pagePath:', pagePath);
      return false;
    }

    const reAuthData = sessionStorage.getItem(REAUTH_KEY);
    if (!reAuthData) {
      console.log('❌ 재인증 데이터 없음');
      return false;
    }

    const data = JSON.parse(reAuthData);
    console.log('🔍 페이지별 재인증 확인:', {
      userId: data.userId,
      hasToken: !!data.reAuthToken,
      storedPagePath: data.pagePath,
      requestedPagePath: pagePath,
    });

    // 사용자 ID가 다르거나 데이터가 유효하지 않으면 false
    if (data.userId !== userId || !data.isValid || !data.reAuthToken) {
      console.log('❌ 사용자 ID 불일치, 유효하지 않음, 또는 토큰 없음');
      return false;
    }

    // 2분이 지났는지 확인
    const now = Date.now();
    const timeDiff = now - data.timestamp;

    if (timeDiff > REAUTH_DURATION) {
      console.log('⏰ 재인증 시간 만료 (2분)');
      clearReAuthStatus();
      return false;
    }

    // 페이지 경로 매칭 로직 개선 - 계정 재인증 후 하위 파일들 자유 이용
    // 1. 정확히 일치하는 경우
    if (data.pagePath === pagePath) {
      console.log('✅ 정확한 페이지 경로 매칭');
      return true;
    }

    // 2. 계정 페이지에 대한 재인증이 있으면 모든 하위 경로 허용
    if (
      data.pagePath === '/account' &&
      pagePath &&
      typeof pagePath === 'string' &&
      pagePath.startsWith('/account/')
    ) {
      console.log('✅ 계정 재인증으로 하위 경로 접근 허용:', {
        parent: data.pagePath,
        child: pagePath,
      });
      return true;
    }

    // 3. 하위 경로인 경우 (예: /account에 대한 재인증이 있으면 /account/password-change도 허용)
    if (
      data.pagePath &&
      pagePath &&
      typeof pagePath === 'string' &&
      pagePath.startsWith(data.pagePath + '/')
    ) {
      console.log('✅ 하위 경로 매칭:', { parent: data.pagePath, child: pagePath });
      return true;
    }

    // 4. 상위 경로인 경우 (예: /account/password-change에 대한 재인증이 있으면 /account도 허용)
    if (
      pagePath &&
      data.pagePath &&
      typeof pagePath === 'string' &&
      data.pagePath.startsWith(pagePath + '/')
    ) {
      console.log('✅ 상위 경로 매칭:', { child: data.pagePath, parent: pagePath });
      return true;
    }

    console.log('❌ 페이지 경로 매칭 실패');
    return false;
  } catch (error) {
    console.error('❌ 페이지별 재인증 상태 확인 실패:', error);
    return false;
  }
};

/**
 * 페이지별 재인증 상태를 설정합니다
 * @param {string} userId - 사용자 ID
 * @param {string} reAuthToken - 재인증 토큰
 * @param {string} pagePath - 페이지 경로
 */
export const setPageReAuthStatus = (userId, reAuthToken, pagePath) => {
  setReAuthStatus(userId, reAuthToken, pagePath);
};
