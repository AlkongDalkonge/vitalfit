import { createContext, useContext, useState, useEffect } from 'react';
import AuthService from '../utils/auth';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // 자동 로그인 시도
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const success = await AuthService.tryAutoLogin();
        if (success) {
          // 사용자 정보 가져오기
          const userInfo = await getUserInfo();
          setUser(userInfo);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('자동 로그인 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // 사용자 정보 가져오기
  const getUserInfo = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/users/me`, {
        headers: {
          Authorization: `Bearer ${AuthService.getAccessToken()}`,
        },
      });
      return response.data.user;
    } catch (error) {
      console.error('사용자 정보 가져오기 실패:', error);
      return null;
    }
  };

  // 로그인
  const login = async (email, password, rememberMe = false) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/users/signin`, {
        email,
        password,
        rememberMe,
      });

      const { token, user: userData } = response.data;

      // 토큰 저장
      AuthService.setAccessToken(token);
      if (rememberMe) {
        localStorage.setItem('rememberMe', 'true');
      }

      // 사용자 정보 설정
      setUser(userData);
      setIsAuthenticated(true);

      return { success: true, user: userData };
    } catch (error) {
      const message = error.response?.data?.message || '로그인에 실패했습니다.';
      return { success: false, message };
    }
  };

  // 로그아웃
  const logout = async () => {
    try {
      await AuthService.logout();
    } catch (error) {
      console.error('로그아웃 중 오류:', error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  // 회원가입
  const signup = async userData => {
    try {
      const response = await axios.post(`${API_BASE_URL}/users/signup`, userData);
      const { token, user: newUser } = response.data;

      // 토큰 저장
      AuthService.setAccessToken(token);

      // 사용자 정보 설정
      setUser(newUser);
      setIsAuthenticated(true);

      return { success: true, user: newUser };
    } catch (error) {
      const message = error.response?.data?.message || '회원가입에 실패했습니다.';
      return { success: false, message };
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    logout,
    signup,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
