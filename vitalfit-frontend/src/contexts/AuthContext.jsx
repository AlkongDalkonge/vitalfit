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
        console.log('🔄 AuthContext: 자동 로그인 시도 시작');

        // 저장된 토큰 확인
        const token = AuthService.getAccessToken();
        console.log('🔍 저장된 토큰 확인:', token ? '토큰 있음' : '토큰 없음');

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
              console.log('✅ 서버에서 최신 사용자 정보 가져옴:', userData);

              if (!isMounted) return;

              // userData.user를 사용 (백엔드 응답 구조에 맞춤)
              const actualUser = userData.user || userData;
              setUser(actualUser);
              setIsAuthenticated(true);

              // localStorage에 최신 정보 저장
              localStorage.setItem('user', JSON.stringify(actualUser));

              // 재인증 필요 여부 확인
              checkReAuthRequired(actualUser.id);

              console.log('✅ 자동 로그인 성공 - isAuthenticated: true, user:', actualUser);
            } else {
              console.log('⚠️ 서버에서 사용자 정보 가져오기 실패, localStorage 정보 사용');

              // 서버 연결 실패 시 localStorage 정보 사용
              const storedUser = localStorage.getItem('user');
              if (storedUser) {
                try {
                  const userData = JSON.parse(storedUser);
                  console.log('💾 localStorage에서 사용자 정보 복원:', userData);

                  if (!isMounted) return;

                  setUser(userData);
                  setIsAuthenticated(true);

                  // 재인증 필요 여부 확인
                  checkReAuthRequired(userData.id);

                  console.log('✅ localStorage 정보로 자동 로그인 성공');
                } catch (error) {
                  console.error('사용자 정보 파싱 오류:', error);
                  forceLogout();
                }
              } else {
                console.log('⚠️ 저장된 사용자 정보 없음');
                forceLogout();
              }
            }
          } catch (error) {
            console.log('⚠️ 서버 연결 실패, localStorage 정보 사용:', error.message);

            // 서버 연결 실패 시 localStorage 정보 사용
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
              try {
                const userData = JSON.parse(storedUser);
                console.log('💾 localStorage에서 사용자 정보 복원:', userData);

                if (!isMounted) return;

                setUser(userData);
                setIsAuthenticated(true);

                // 재인증 필요 여부 확인
                checkReAuthRequired(userData.id);

                console.log('✅ localStorage 정보로 자동 로그인 성공');
              } catch (error) {
                console.error('사용자 정보 파싱 오류:', error);
                forceLogout();
              }
            } else {
              console.log('⚠️ 저장된 사용자 정보 없음');
              forceLogout();
            }
          }
        } else {
          console.log('❌ 저장된 토큰 없음 - 로그인 페이지 유지');
          setIsAuthenticated(false);
          setUser(null);
        }
      } catch (error) {
        if (!isMounted) return;

        console.error('❌ AuthContext: 자동 로그인 중 오류 발생:', error);
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
    console.log('✅ 재인증 성공 - 4분간 유효', pagePath ? `(경로: ${pagePath})` : '');
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
      console.log('🔄 getUserInfo 응답:', response.data);
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
  const refreshUserInfo = async () => {
    try {
      console.log('🔄 refreshUserInfo 시작');
      const userInfo = await getUserInfo();
      if (userInfo) {
        console.log('✅ 새로운 사용자 정보:', userInfo);
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
  };

  // 로그인 (Remember Me 지원)
  const login = async (email, password, rememberMe = false) => {
    try {
      console.log('🔐 AuthContext login 호출 시작 - email:', email);

      const requestData = {
        email,
        password,
        rememberMe,
      };

      console.log('🔐 전송할 데이터:', requestData);

      const response = await api.post('/users/signin', requestData);

      console.log('🔐 AuthContext login 응답 데이터:', response);
      console.log('🔐 response.data:', response.data);
      console.log('🔐 response.data.data:', response.data.data);
      console.log('🔐 response.data.data?.token:', response.data.data?.token);
      console.log('🔐 response.data.data?.user:', response.data.data?.user);

      // Axios 응답에서 실제 데이터는 response.data에 있음
      if (response.data && response.data.token && response.data.user) {
        const { token, refreshToken, user: userData } = response.data;
        console.log('🔐 토큰 확인:', token ? '토큰 있음' : '토큰 없음');
        console.log(
          '🔐 Refresh Token 확인:',
          refreshToken ? 'Refresh Token 있음' : 'Refresh Token 없음'
        );

        // Refresh Token을 먼저 저장
        if (refreshToken) {
          AuthService.setRefreshToken(refreshToken);
          console.log('🔐 Refresh Token 저장 완료');
        }

        // Remember Me에 따라 Access Token 저장
        AuthService.setAccessToken(token, rememberMe);
        console.log('🔐 Access Token 저장 완료 - rememberMe:', rememberMe);

        // 토큰 저장 확인
        const savedToken = AuthService.getAccessToken();
        const savedRefreshToken = AuthService.getRefreshToken();
        console.log('🔐 저장된 Access Token 확인:', savedToken ? '토큰 있음' : '토큰 없음');
        console.log(
          '🔐 저장된 Refresh Token 확인:',
          savedRefreshToken ? 'Refresh Token 있음' : 'Refresh Token 없음'
        );

        // 사용자 정보를 localStorage에 저장 (자동 로그인용)
        localStorage.setItem('user', JSON.stringify(userData));
        console.log('💾 사용자 정보 localStorage 저장 완료');

        // 사용자 정보 설정 - 상태 업데이트를 명시적으로 처리
        console.log('🔄 상태 업데이트 시작 - user:', userData);
        setUser(userData);
        console.log('🔄 setUser 완료');

        setIsAuthenticated(true);
        console.log('🔄 setIsAuthenticated(true) 완료');

        // 로그인 시 재인증 상태 초기화
        clearReAuthStatus();
        setReAuthRequired(false);
        setShowReAuthModal(false);

        // 상태 업데이트 확인을 위한 지연
        await new Promise(resolve => setTimeout(resolve, 100));

        console.log('✅ 로그인 성공 - isAuthenticated: true, user:', userData);

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
    console.log('🔒 forceLogout 실행: 토큰 및 인증 상태 초기화');
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

    console.log('🔍 인증 상태 검증:', { hasToken, isAuthStateTrue, user: !!user });

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
