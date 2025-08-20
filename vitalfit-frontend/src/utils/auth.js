import api from './api';
import axios from 'axios';

class AuthService {
  // Access Token 관리 (Remember Me에 따라 다른 저장소 사용)
  static setAccessToken(token, rememberMe = false) {
    console.log('🔐 setAccessToken 호출:', {
      token: token ? token.substring(0, 20) + '...' : null,
      rememberMe: rememberMe,
    });

    // rememberMe가 명시적으로 false인 경우에만 sessionStorage 사용
    if (rememberMe === false) {
      sessionStorage.setItem('accessToken', token);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('rememberMe');
      console.log('📱 토큰을 sessionStorage에 저장 (rememberMe: false)');
    } else {
      // rememberMe가 true이거나 undefined인 경우 localStorage 사용
      localStorage.setItem('accessToken', token);
      localStorage.setItem('rememberMe', 'true');
      sessionStorage.removeItem('accessToken');
      console.log('💾 토큰을 localStorage에 저장 (rememberMe: true)');
    }

    // 메모리에 토큰 저장
    window.__accessToken = token;

    // 토큰 만료 시간 설정
    const expiryTime = rememberMe ? 7 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
    const expiryDate = new Date(Date.now() + expiryTime);
    localStorage.setItem('tokenExpiry', expiryDate.toISOString());

    this.setupAutoRefresh(token, rememberMe);
    this.debugTokenStorage();
  }

  static getAccessToken() {
    console.log('🔍 getAccessToken 호출');

    // 메모리에서 먼저 확인
    if (window.__accessToken) {
      console.log('✅ 메모리에서 토큰 발견');
      return window.__accessToken;
    }

    // Remember Me 설정 확인
    const rememberMe = localStorage.getItem('rememberMe');
    console.log('🔍 rememberMe 설정:', rememberMe);

    if (rememberMe === 'true') {
      // localStorage에서 토큰 가져오기
      const token = localStorage.getItem('accessToken');
      console.log('🔍 localStorage에서 토큰 확인:', token ? '토큰 있음' : '토큰 없음');
      if (token) {
        window.__accessToken = token;
        console.log('✅ localStorage에서 토큰 가져옴');
        return token;
      }
    } else {
      // sessionStorage에서 토큰 가져오기
      const token = sessionStorage.getItem('accessToken');
      console.log('🔍 sessionStorage에서 토큰 확인:', token ? '토큰 있음' : '토큰 없음');
      if (token) {
        window.__accessToken = token;
        console.log('✅ sessionStorage에서 토큰 가져옴');
        return token;
      }
    }

    console.log('❌ 토큰을 찾을 수 없음');
    return null;
  }

  static removeAccessToken() {
    // 모든 저장소에서 토큰 제거
    localStorage.removeItem('accessToken');
    sessionStorage.removeItem('accessToken');
    localStorage.removeItem('rememberMe');
    localStorage.removeItem('tokenExpiry');
    delete window.__accessToken;

    // 자동 갱신 타이머 정리
    this.clearAutoRefreshTimer();
  }

  // Remember Me 설정 가져오기
  static getRememberMe() {
    return localStorage.getItem('rememberMe') === 'true';
  }

  // Refresh Token 관리
  static setRefreshToken(token) {
    console.log('🔐 setRefreshToken 호출:', {
      token: token ? token.substring(0, 20) + '...' : null,
    });
    localStorage.setItem('refreshToken', token);
    console.log('💾 Refresh Token localStorage 저장 완료');
    this.debugTokenStorage(); // 저장 후 상태 확인
  }

  static getRefreshToken() {
    return localStorage.getItem('refreshToken');
  }

  static removeRefreshToken() {
    localStorage.removeItem('refreshToken');
  }

  // 토큰 만료 시간 확인
  static isTokenExpired() {
    const expiry = localStorage.getItem('tokenExpiry');
    if (!expiry) return true;

    const expiryDate = new Date(expiry);
    const now = new Date();

    // 5분 전에 만료되는 것으로 간주
    const bufferTime = 5 * 60 * 1000; // 5분
    return now.getTime() > expiryDate.getTime() - bufferTime;
  }

  // 자동 갱신 타이머 설정
  static setupAutoRefresh(token, rememberMe) {
    // 기존 타이머 정리
    this.clearAutoRefreshTimer();

    if (!token) return;

    // 토큰 만료 5분 전에 자동 갱신
    const expiryTime = rememberMe ? 7 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000; // 7일 또는 24시간
    const refreshTime = expiryTime - 5 * 60 * 1000; // 5분 전

    this.autoRefreshTimer = setTimeout(async () => {
      console.log('🔄 토큰 자동 갱신 시작');
      try {
        await this.silentRefresh();
      } catch (error) {
        console.error('자동 토큰 갱신 실패:', error);
        // 자동 갱신 실패 시 사용자에게 알림
        this.handleRefreshFailure();
      }
    }, refreshTime);

    console.log(`🔄 자동 갱신 타이머 설정 완료 (${Math.floor(refreshTime / 1000 / 60)}분 후)`);
  }

  // 자동 갱신 타이머 정리
  static clearAutoRefreshTimer() {
    if (this.autoRefreshTimer) {
      clearTimeout(this.autoRefreshTimer);
      this.autoRefreshTimer = null;
    }
  }

  // 무음 갱신 (사용자가 모르게 토큰 갱신)
  static async silentRefresh() {
    try {
      const refreshToken = this.getRefreshToken();
      if (!refreshToken) {
        throw new Error('Refresh token이 없습니다.');
      }

      console.log('🔄 무음 갱신 시작');

      const response = await fetch(
        `${process.env.REACT_APP_API_URL || 'http://localhost:3001/api'}/users/refresh-token`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ refreshToken }),
        }
      );

      if (!response.ok) {
        throw new Error('토큰 갱신 실패');
      }

      const data = await response.json();

      if (data.success && data.accessToken) {
        // 새로운 토큰 저장
        const rememberMe = this.getRememberMe();
        this.setAccessToken(data.accessToken, rememberMe);

        console.log('✅ 무음 갱신 성공');
        return data.accessToken;
      } else {
        throw new Error('토큰 갱신 응답 형식 오류');
      }
    } catch (error) {
      console.error('❌ 무음 갱신 실패:', error);
      throw error;
    }
  }

  // 갱신 실패 처리
  static handleRefreshFailure() {
    console.warn('⚠️ 토큰 갱신 실패 - 사용자에게 알림');

    // 사용자에게 토큰 갱신 실패 알림 (주석처리됨)
    // if (window.showRefreshFailureNotification) {
    //   window.showRefreshFailureNotification();
    // } else {
    //   // 기본 알림 (Toast 또는 모달)
    //   alert('세션이 만료되었습니다. 다시 로그인해주세요.');
    // }
  }

  // Access Token 갱신
  static async refreshAccessToken() {
    try {
      const refreshToken = this.getRefreshToken();
      if (!refreshToken) {
        console.log('Refresh token이 없어 토큰 갱신을 건너뜁니다.');
        return null;
      }

      const response = await api.post('/users/refresh-token', {
        refreshToken,
      });

      const { accessToken } = response.data;
      this.setAccessToken(accessToken, this.getRememberMe());

      return accessToken;
    } catch (error) {
      console.error('토큰 갱신 실패:', error);
      this.removeAccessToken();
      this.removeRefreshToken();
      throw error;
    }
  }

  // 로그아웃
  static async logout() {
    try {
      await api.post('/users/logout');
    } catch (error) {
      console.error('로그아웃 중 오류:', error);
    } finally {
      this.removeAccessToken();
      this.removeRefreshToken();
      this.clearAutoRefreshTimer();
    }
  }

  // 인증 상태 확인
  static isAuthenticated() {
    const token = this.getAccessToken();
    if (!token) return false;

    // 토큰 만료 확인
    if (this.isTokenExpired()) {
      console.log('⚠️ 토큰이 만료되었습니다.');
      return false;
    }

    return true;
  }

  // 자동 로그인 시도 (페이지 로드 시)
  static async tryAutoLogin() {
    const accessToken = this.getAccessToken();

    if (!accessToken) {
      console.log('🔍 tryAutoLogin: 토큰이 없습니다.');
      return false;
    }

    // 토큰 만료 확인
    if (this.isTokenExpired()) {
      console.log('🔍 tryAutoLogin: 토큰이 만료되었습니다.');

      // 무음 갱신 시도
      try {
        await this.silentRefresh();
        console.log('✅ 토큰 자동 갱신 성공');
      } catch (error) {
        console.log('❌ 토큰 자동 갱신 실패:', error);
        this.removeAccessToken();
        this.removeRefreshToken();
        return false;
      }
    }

    try {
      console.log('🔍 tryAutoLogin: 토큰 유효성 검증 시작');
      // 토큰 유효성 검증
      const response = await api.get('/users/me');

      // 응답이 성공적이고 사용자 데이터가 있는 경우에만 true 반환
      if (response.data && response.data.user) {
        const user = response.data.user;
        console.log('🔍 tryAutoLogin: 사용자 상태 확인:', user.status);

        if (user.status === 'active') {
          console.log('✅ tryAutoLogin: 유효한 활성 사용자입니다.');
          return true;
        } else {
          // 사용자 데이터가 있지만 비활성 상태면 토큰 제거
          console.warn('⚠️ tryAutoLogin: 비활성 사용자입니다. 상태:', user.status);
          this.removeAccessToken();
          return false;
        }
      } else {
        // 사용자 데이터가 없으면 토큰 제거
        console.warn('⚠️ tryAutoLogin: 사용자 데이터가 없습니다.');
        this.removeAccessToken();
        return false;
      }
    } catch (error) {
      console.error('❌ tryAutoLogin: 토큰 유효성 검증 실패:', error);

      // 403 에러 (탈퇴된 계정) 또는 401 에러 (토큰 만료)인 경우
      if (error.response?.status === 403 || error.response?.status === 401) {
        console.warn('⚠️ tryAutoLogin: 인증 실패로 토큰 제거. 상태:', error.response?.status);
        this.removeAccessToken();
      }
      return false;
    }
  }

  // 세션 기반 로그인을 위한 자동 로그아웃 설정 (30초 타이머 제거)
  static setupSessionLogout() {
    const rememberMe = this.getRememberMe();

    if (rememberMe) {
      console.log('🔒 Remember Me가 활성화되어 있어 세션 로그아웃을 설정하지 않습니다.');
      return;
    }

    console.log('🔒 세션 기반 로그인: 자동 로그아웃 비활성화 (새로고침 시 로그인 유지)');

    // 30초 타이머 제거하고 새로고침 시에도 로그인 유지
    // 빈 정리 함수 반환
    return () => {
      // 정리할 것이 없음
    };
  }

  // 디버깅용: 현재 토큰 저장 상태 출력
  static debugTokenStorage() {
    console.log('🔍 === 토큰 저장 상태 디버깅 ===');
    console.log('localStorage.accessToken:', localStorage.getItem('accessToken') ? '있음' : '없음');
    console.log(
      'sessionStorage.accessToken:',
      sessionStorage.getItem('accessToken') ? '있음' : '없음'
    );
    console.log('localStorage.rememberMe:', localStorage.getItem('rememberMe'));
    console.log(
      'localStorage.refreshToken:',
      localStorage.getItem('refreshToken') ? '있음' : '없음'
    );
    console.log('localStorage.tokenExpiry:', localStorage.getItem('tokenExpiry'));
    console.log('window.__accessToken:', window.__accessToken ? '있음' : '없음');
    console.log('================================');
  }
}

// 권한 체크 유틸리티 함수들
export const hasRole = (user, requiredRole) => {
  if (!user || !user.position_id) return false;
  return user.position_id >= requiredRole;
};

export const isAdmin = user => hasRole(user, 99); // 관리자 (level 99)
export const isCenterManager = user => hasRole(user, 11); // 센터장 (level 11)
export const isManager = user => hasRole(user, 9); // 매니저 (level 9)
export const isTeamLeader = user => hasRole(user, 7); // 팀장 (level 7)
export const isTrainer = user => hasRole(user, 3); // 트레이너 (level 3)
export const isStudent = user => hasRole(user, 2); // 교육생 (level 2)
export const isTrainee = user => hasRole(user, 1); // 연습생 (level 1)

// PT 스케줄 관련 권한 체크
export const canViewAllPTSchedules = user => {
  return isAdmin(user) || isCenterManager(user) || isManager(user);
};

export const canEditPTSessions = user => {
  return (
    isTrainer(user) ||
    isTeamLeader(user) ||
    isManager(user) ||
    isCenterManager(user) ||
    isAdmin(user)
  );
};

export const canViewAdminPTSchedule = user => {
  return isAdmin(user); // 관리자만 접근 가능
};

export const canViewTrainerPTSchedule = user => {
  return (
    isTrainer(user) ||
    isTeamLeader(user) ||
    isManager(user) ||
    isCenterManager(user) ||
    isAdmin(user)
  );
};

export default AuthService;
