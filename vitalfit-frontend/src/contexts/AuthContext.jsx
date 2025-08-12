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
        console.log('🔄 AuthContext: 자동 로그인 시도 시작');
        const success = await AuthService.tryAutoLogin();

        if (success) {
          console.log('✅ AuthContext: tryAutoLogin 성공, 사용자 정보 가져오기');
          // 사용자 정보 가져오기
          const userInfo = await getUserInfo();
          if (userInfo && userInfo.status === 'active') {
            console.log('✅ AuthContext: 유효한 사용자 정보 설정');
            setUser(userInfo);
            setIsAuthenticated(true);
          } else {
            // 사용자 정보가 없거나 비활성 상태면 로그아웃
            console.warn(
              '⚠️ AuthContext: 사용자 정보가 없거나 비활성 상태입니다. forceLogout 실행'
            );
            forceLogout();
          }
        } else {
          console.log('❌ AuthContext: tryAutoLogin 실패, 인증 상태 false로 설정');
          setIsAuthenticated(false);
          setUser(null);
        }
      } catch (error) {
        console.error('❌ AuthContext: 자동 로그인 중 오류 발생:', error);
        // 에러 발생 시 토큰 제거
        forceLogout();
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

      // 탈퇴된 계정인 경우 자동 로그아웃
      if (error.response?.status === 403 && error.response?.data?.code === 'ACCOUNT_DEACTIVATED') {
        await logout();
        return null;
      }

      return null;
    }
  };

  // 사용자 정보 새로고침
  const refreshUserInfo = async () => {
    try {
      const userInfo = await getUserInfo();
      if (userInfo) {
        setUser(userInfo);
        return userInfo;
      } else {
        console.warn('⚠️ 사용자 정보를 가져올 수 없음');
        return null;
      }
    } catch (error) {
      console.error('❌ refreshUserInfo 실패:', error);

      // 탈퇴된 계정인 경우 자동 로그아웃
      if (error.response?.status === 403 && error.response?.data?.code === 'ACCOUNT_DEACTIVATED') {
        await logout();
        return null;
      }

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

      // 토큰 저장
      AuthService.setAccessToken(token);

      // 사용자 정보 설정
      setUser(userData);
      setIsAuthenticated(true);

      // 최신 사용자 정보로 갱신
      try {
        const freshUserInfo = await refreshUserInfo();
        if (freshUserInfo) {
          setUser(freshUserInfo);
        }
      } catch (error) {
        console.error('로그인 후 사용자 정보 갱신 실패:', error);
      }

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

  // 강제 로그아웃 (백엔드 API 호출 없이 로컬 상태만 정리)
  const forceLogout = () => {
    AuthService.removeAccessToken();
    setUser(null);
    setIsAuthenticated(false);
  };

  // 인증 상태 검증 (토큰과 상태 일치 여부 확인)
  const validateAuthState = () => {
    const token = AuthService.getAccessToken();
    const hasToken = !!token;
    const isAuthStateTrue = isAuthenticated;

    // 토큰이 없는데 인증 상태가 true인 경우
    if (!hasToken && isAuthStateTrue) {
      console.warn('⚠️ 상태 불일치 감지: 토큰 없음 + 인증 상태 true');
      forceLogout();
      return false;
    }

    // 토큰이 있는데 인증 상태가 false인 경우
    if (hasToken && !isAuthStateTrue) {
      console.warn('⚠️ 상태 불일치 감지: 토큰 있음 + 인증 상태 false');
      return false;
    }

    return true;
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
    forceLogout,
    validateAuthState,
    signup,
    refreshUserInfo,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
