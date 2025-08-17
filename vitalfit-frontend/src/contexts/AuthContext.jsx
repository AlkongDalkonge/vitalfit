import { createContext, useContext, useState, useEffect } from 'react';
import AuthService from '../utils/auth';
import api from '../utils/api';
import {
  setReAuthStatus,
  clearReAuthStatus,
  invalidateReAuthStatus,
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
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // 재인증 관련 상태
  const [showReAuthModal, setShowReAuthModal] = useState(false);
  const [reAuthRequired, setReAuthRequired] = useState(false);

  // 자동 로그인 시도 (한 번만 실행)
  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      try {
        // 저장된 토큰 확인
        const token = AuthService.getAccessToken();

        if (token) {
          try {
            // 서버에서 최신 사용자 정보 가져오기
            const response = await fetch('http://localhost:3001/api/users/me', {
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            });

            if (response.ok) {
              const userData = await response.json();

              if (!isMounted) return;

              // userData.user를 사용 (백엔드 응답 구조에 맞춤)
              const actualUser = userData.user || userData;
              setUser(actualUser);
              setIsAuthenticated(true);

              // localStorage에 최신 정보 저장
              localStorage.setItem('user', JSON.stringify(actualUser));

              // 재인증 필요 여부 확인
              checkReAuthRequired(actualUser.id);
            } else {
              // 서버 연결 실패 시 localStorage 정보 사용
              const storedUser = localStorage.getItem('user');
              if (storedUser) {
                try {
                  const userData = JSON.parse(storedUser);

                  if (!isMounted) return;

                  setUser(userData);
                  setIsAuthenticated(true);

                  // 재인증 필요 여부 확인
                  checkReAuthRequired(userData.id);
                } catch (error) {
                  forceLogout();
                }
              } else {
                forceLogout();
              }
            }
          } catch (error) {
            // 서버 연결 실패 시 localStorage 정보 사용
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
              try {
                const userData = JSON.parse(storedUser);

                if (!isMounted) return;

                setUser(userData);
                setIsAuthenticated(true);

                // 재인증 필요 여부 확인
                checkReAuthRequired(userData.id);
              } catch (error) {
                forceLogout();
              }
            } else {
              forceLogout();
            }
          }
        } else {
          setIsAuthenticated(false);
          setUser(null);
        }
      } catch (error) {
        if (!isMounted) return;

        forceLogout();
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    // 클린업 함수
    return () => {
      isMounted = false;
    };
  }, []); // 빈 의존성 배열 유지 (한 번만 실행)

  // 경로 변경 감지 제거 - AccountPage에서 처리

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
    // setReAuthStatus는 토큰이 필요하므로 여기서는 호출하지 않음
    // 실제 재인증 토큰은 PasswordConfirmModal에서 저장됨
    setReAuthRequired(false);
    setShowReAuthModal(false);
  };

  // 재인증 실패 처리
  const handleReAuthFailure = () => {
    setShowReAuthModal(false);
    // 재인증 실패 시 계정 페이지에서 리다이렉트하거나 처리
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

        // localStorage도 함께 업데이트
        localStorage.setItem('user', JSON.stringify(userInfo));

        // 재인증 필요 여부 확인
        checkReAuthRequired(userInfo.id);

        return userInfo;
      } else {
        return null;
      }
    } catch (error) {
      // 탈퇴된 계정인 경우 자동 로그아웃
      if (error.response?.status === 403 && error.response?.data?.code === 'ACCOUNT_DEACTIVATED') {
        await logout();
        return null;
      }

      return null;
    }
  };

  // 로그인 (Remember Me 지원)
  const login = async (email, password, rememberMe = false) => {
    try {
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

        // 토큰 저장 확인
        const savedToken = AuthService.getAccessToken();
        const savedRefreshToken = AuthService.getRefreshToken();

        // 사용자 정보를 localStorage에 저장 (자동 로그인용)
        localStorage.setItem('user', JSON.stringify(userData));

        // 사용자 정보 설정 - 상태 업데이트를 명시적으로 처리
        setUser(userData);

        setIsAuthenticated(true);

        // 로그인 시 재인증 상태 초기화
        clearReAuthStatus();
        setReAuthRequired(false);
        setShowReAuthModal(false);

        // 상태 업데이트 확인을 위한 지연
        await new Promise(resolve => setTimeout(resolve, 100));

        return { success: true, user: userData };
      } else {
        return { success: false, message: response.data?.message || '응답 데이터 형식 오류' };
      }
    } catch (error) {
      const message = error.response?.data?.message || '로그인에 실패했습니다.';
      return { success: false, message };
    }
  };

  // 로그아웃
  const logout = async () => {
    try {
      await AuthService.logout();
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
    AuthService.removeAccessToken();
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
      forceLogout();
      return false;
    }

    // 토큰이 있는데 인증 상태가 false인 경우
    if (hasToken && !isAuthStateTrue) {
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
