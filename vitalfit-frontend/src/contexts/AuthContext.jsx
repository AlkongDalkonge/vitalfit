import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import AuthService from '../utils/auth';
import api from '../utils/api';
import {
  clearReAuthStatus,
  needsReAuth,
  handlePageNavigation,
} from '../utils/reAuthUtils';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const initRef = useRef(false); //개발모드에서 useEffect가 두번 돌때 재실행 방지용
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // 재인증 관련 상태
  const [showReAuthModal, setShowReAuthModal] = useState(false);
  const [reAuthRequired, setReAuthRequired] = useState(false);

  // 자동 로그인 시도 (한 번만 실행) - 임시 비활성화
  useEffect(() => {
    if (initRef.current) {
      return;
    }

    initRef.current = true;
    console.log('🔄 AuthContext: 자동 로그인 비활성화됨');
    
    // 로딩 상태만 false로 설정하고 자동 로그인 시도하지 않음
    setLoading(false);
    setIsAuthenticated(false);
    setUser(null);
  }, []); // 빈 의존성 배열 유지 (한 번만 실행)

  // 재인증 필요 여부 확인
  const checkReAuthRequired = userId => {
    if (userId && needsReAuth(userId)) {
      setReAuthRequired(true);
      setShowReAuthModal(true);
    } else {
      setReAuthRequired(false);
      setShowReAuthModal(false);
    }
  };

  // 재인증 성공 처리
  const handleReAuthSuccess = (userId, pagePath = null) => {
    setReAuthRequired(false);
    setShowReAuthModal(false);
    console.log('✅ 재인증 성공 - 4분간 유효', pagePath ? `(경로: ${pagePath})` : '');
  };

  // 재인증 실패 처리
  const handleReAuthFailure = () => {
    setShowReAuthModal(false);
  };

  // 재인증 모달 닫기
  const closeReAuthModal = () => {
    setShowReAuthModal(false);
  };

  // 페이지 이동 시 재인증 상태 처리
  const handleNavigation = userId => {
    if (userId) {
      handlePageNavigation(userId);
      setReAuthRequired(false);
      setShowReAuthModal(false);
    }
  };

  // 사용자 정보 가져오기
  const getUserInfo = async () => {
    try {
      const response = await api.get('/users/me');
      return response.data.user;
    } catch (error) {
      console.error('사용자 정보 가져오기 실패:', error);

      // 탈퇴된 계정인 경우 자동 로그아웃
      if (error.response?.status === 403 && error.response?.data?.code === 'ACCOUNT_DEACTIVATED') {
        console.log('🚫 탈퇴된 계정 감지, 자동 로그아웃 실행');
        await logout();
        return null;
      }

      return null;
    }
  };

  // 사용자 정보 새로고침
  const refreshUserInfo = useCallback(async () => {
    try {
      const userInfo = await getUserInfo();
      if (userInfo) {
        setUser(userInfo);

        // 재인증 필요 여부 확인
        checkReAuthRequired(userInfo.id);

        return userInfo;
      } else {
        console.warn('⚠️ 사용자 정보를 가져올 수 없음');
        return null;
      }
    } catch (error) {
      console.error('❌ refreshUserInfo 실패:', error);

      // 탈퇴된 계정인 경우 자동 로그아웃
      if (error.response?.status === 403 && error.response?.data?.code === 'ACCOUNT_DEACTIVATED') {
        console.log('🚫 탈퇴된 계정 감지, 자동 로그아웃 실행');
        await logout();
        return null;
      }

      return null;
    }
  }, []);

  // 로그인 (Remember Me 지원)
  const login = async (email, password, rememberMe = false) => {
    try {
      console.log('🔐 로그인 시도:', email);

      const requestData = {
        email,
        password,
        rememberMe,
      };

      const response = await api.post('/users/signin', requestData);

      // Axios 응답에서 실제 데이터는 response.data에 있음
      if (response.data && response.data.token && response.data.user) {
        const { token, refreshToken, user: userData } = response.data;

        // Refresh Token을 먼저 저장
        if (refreshToken) {
          AuthService.setRefreshToken(refreshToken);
        }

        // Remember Me에 따라 Access Token 저장
        AuthService.setAccessToken(token, rememberMe);

        // 사용자 정보를 localStorage에 저장 (자동 로그인용)
        localStorage.setItem('user', JSON.stringify(userData));

        // 사용자 정보 설정
        setUser(userData);
        setIsAuthenticated(true);

        // 로그인 시 재인증 상태 초기화
        clearReAuthStatus();
        setReAuthRequired(false);
        setShowReAuthModal(false);

        console.log('✅ 로그인 성공:', userData.name);

        return { success: true, user: userData };
      } else {
        console.log('❌ 로그인 실패:', response.data?.message || '응답 데이터 형식 오류');
        return { success: false, message: response.data?.message || '응답 데이터 형식 오류' };
      }
    } catch (error) {
      console.error('❌ AuthContext login 오류:', error);
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
      // 재인증 상태 정리
      clearReAuthStatus();
      setReAuthRequired(false);
      setShowReAuthModal(false);
    }
  };

  // 강제 로그아웃 (백엔드 API 호출 없이 로컬 상태만 정리)
  const forceLogout = () => {
    console.log('🔒 강제 로그아웃 실행');
    AuthService.removeAccessToken();
    AuthService.removeRefreshToken();
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
    // 재인증 상태 정리
    clearReAuthStatus();
    setReAuthRequired(false);
    setShowReAuthModal(false);
  };

  // 인증 상태 검증 (토큰과 상태 일치 여부 확인)
  const validateAuthState = () => {
    const token = AuthService.getAccessToken();
    const hasToken = !!token;
    const isAuthStateTrue = isAuthenticated;

    // 토큰이 없는데 인증 상태가 true인 경우
    if (!hasToken && isAuthStateTrue) {
      console.warn('⚠️ 인증 상태 불일치: 토큰 없음 + 인증 상태 true');
      forceLogout();
      return false;
    }

    // 토큰이 있는데 인증 상태가 false인 경우
    if (hasToken && !isAuthStateTrue) {
      console.warn('⚠️ 인증 상태 불일치: 토큰 있음 + 인증 상태 false');
      return false;
    }

    return true;
  };

  // 회원가입
  const signup = async userData => {
    try {
      const response = await api.post('/users/signup', userData);
      const { token, user: newUser } = response.data;

      // 회원가입 시에는 기본적으로 Remember Me 활성화 (사용자 편의성)
      AuthService.setAccessToken(token, true);

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
    setUser,
    setIsAuthenticated,
    login,
    logout,
    forceLogout,
    validateAuthState,
    signup,
    refreshUserInfo,
    // 재인증 관련
    showReAuthModal,
    reAuthRequired,
    handleReAuthSuccess,
    handleReAuthFailure,
    closeReAuthModal,
    handleNavigation,
    checkReAuthRequired,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
