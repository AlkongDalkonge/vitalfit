import { createContext, useContext, useState, useEffect } from 'react';
import AuthService from '../utils/auth';
import api from '../utils/api';

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
          if (userInfo) {
            setUser(userInfo);
            setIsAuthenticated(true);
          }
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
      const response = await api.get('/users/me');
      return response.data.user;
    } catch (error) {
      console.error('사용자 정보 가져오기 실패:', error);
      return null;
    }
  };

  // 로그인
  const login = async (email, password) => {
    try {
      const response = await api.post('/users/signin', {
        email,
        password,
      });

      const { token, user: userData } = response.data;

      console.log('로그인 응답:', response.data);

      // 토큰 저장
      AuthService.setAccessToken(token);

      // 사용자 정보 설정
      setUser(userData);
      setIsAuthenticated(true);

      console.log('AuthContext - 로그인 성공, 사용자 정보:', userData);
      console.log('AuthContext - profile_image_url:', userData?.profile_image_url);

      return { success: true, user: userData };
    } catch (error) {
      console.error('로그인 오류:', error);
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
      const response = await api.post('/users/signup', userData);
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
