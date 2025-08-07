import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

class AuthService {
  // Access Token 관리 (메모리)
  static setAccessToken(token) {
    window.__accessToken = token;
  }

  static getAccessToken() {
    return window.__accessToken;
  }

  static removeAccessToken() {
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

      const response = await axios.post(`${API_BASE_URL}/users/refresh`, {
        refreshToken,
      });

      const { accessToken } = response.data;
      this.setAccessToken(accessToken);
      return accessToken;
    } catch (error) {
      this.removeAccessToken();
      this.removeRefreshToken();
      window.location.href = '/login';
      throw error;
    }
  }

  // 로그아웃
  static async logout() {
    try {
      const refreshToken = this.getRefreshToken();
      if (refreshToken) {
        await axios.post(`${API_BASE_URL}/users/logout`, {
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
    const refreshToken = this.getRefreshToken();
    const rememberMe = localStorage.getItem('rememberMe');

    if (refreshToken && rememberMe === 'true') {
      try {
        await this.refreshAccessToken();
        return true;
      } catch (error) {
        console.error('자동 로그인 실패:', error);
        return false;
      }
    }
    return false;
  }
}

export default AuthService;
