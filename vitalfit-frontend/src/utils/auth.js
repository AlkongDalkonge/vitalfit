import api from './api';

class AuthService {
  // Access Token 관리 (localStorage)
  static setAccessToken(token) {
    localStorage.setItem('accessToken', token);
    window.__accessToken = token; // 메모리에도 저장 (성능 향상)
  }

  static getAccessToken() {
    // 메모리에서 먼저 확인, 없으면 localStorage에서 가져오기
    if (window.__accessToken) {
      return window.__accessToken;
    }
    const token = localStorage.getItem('accessToken');
    if (token) {
      window.__accessToken = token; // 메모리에 캐시
    }
    return token;
  }

  static removeAccessToken() {
    localStorage.removeItem('accessToken');
    delete window.__accessToken;
  }

  // 로그아웃
  static async logout() {
    try {
      await api.post('/users/logout');
    } catch (error) {
      console.error('로그아웃 중 오류:', error);
    } finally {
      this.removeAccessToken();
    }
  }

  // 인증 상태 확인
  static isAuthenticated() {
    return !!this.getAccessToken();
  }

  // 자동 로그인 시도 (페이지 로드 시)
  static async tryAutoLogin() {
    const accessToken = this.getAccessToken();

    if (!accessToken) {
      console.log('🔍 tryAutoLogin: 토큰이 없습니다.');
      return false;
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
}

export default AuthService;
