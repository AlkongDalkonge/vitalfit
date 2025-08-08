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

  // Refresh Token 관리 (localStorage)
  static setRefreshToken(token) {
    localStorage.setItem('refreshToken', token);
  }

  static getRefreshToken() {
    return localStorage.getItem('refreshToken');
  }

  static removeRefreshToken() {
    localStorage.removeItem('refreshToken');
  }

  // 토큰 갱신
  static async refreshAccessToken() {
    try {
      const refreshToken = this.getRefreshToken();
      if (!refreshToken) {
        throw new Error('Refresh token이 없습니다.');
      }

      const response = await api.post('/users/refresh', {
        refreshToken,
      });

      const { accessToken } = response.data;
      this.setAccessToken(accessToken);
      return accessToken;
    } catch (error) {
      this.removeAccessToken();
      this.removeRefreshToken();
      localStorage.removeItem('rememberMe');
      throw error;
    }
  }

  // 로그아웃
  static async logout() {
    try {
      const refreshToken = this.getRefreshToken();
      if (refreshToken) {
        await api.post('/users/logout', {
          refreshToken,
        });
      }
    } catch (error) {
      console.error('로그아웃 중 오류:', error);
    } finally {
      this.removeAccessToken();
      this.removeRefreshToken();
      localStorage.removeItem('rememberMe');
    }
  }

  // 인증 상태 확인
  static isAuthenticated() {
    return !!this.getAccessToken();
  }

  // 자동 로그인 시도 (페이지 로드 시)
  static async tryAutoLogin() {
    const accessToken = this.getAccessToken();
    const refreshToken = this.getRefreshToken();
    const rememberMe = localStorage.getItem('rememberMe');

    // Access Token이 있으면 먼저 시도
    if (accessToken && rememberMe === 'true') {
      try {
        // 토큰 유효성 검증
        const response = await api.get('/users/me');
        return true;
      } catch (error) {
        // Access Token이 만료되었으면 Refresh Token으로 갱신 시도
        if (refreshToken) {
          try {
            await this.refreshAccessToken();
            return true;
          } catch (refreshError) {
            console.error('토큰 갱신 실패:', refreshError);
            return false;
          }
        }
        // Refresh Token도 없으면 로그인 실패
        this.removeAccessToken();
        return false;
      }
    }

    // Access Token이 없지만 Refresh Token이 있으면 갱신 시도
    if (refreshToken && rememberMe === 'true') {
      try {
        await this.refreshAccessToken();
        return true;
      } catch (error) {
        console.error('Refresh Token으로 자동 로그인 실패:', error);
        return false;
      }
    }

    return false;
  }
}

export default AuthService;
