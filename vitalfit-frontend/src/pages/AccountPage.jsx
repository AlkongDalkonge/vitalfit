import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';
import PasswordConfirmModal from '../components/PasswordConfirmModal';
import PersonalInfoPage from './PersonalInfoPage';
import MyHistoryPage from './MyHistoryPage';
import MyWorkPage from './MyWorkPage';
import PasswordChangeForm from './PasswordChangePage';
import {
  needsSensitiveActionReAuth,
  setReAuthStatus,
  saveAccountTab,
  getAccountTab,
} from '../utils/reAuthUtils';

const AccountPage = () => {
  const {
    user,
    handleNavigation,
    showReAuthModal,
    handleReAuthSuccess,
    closeReAuthModal,
    reAuthRequired,
  } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // localStorage에서 저장된 탭을 가져오거나 기본값 사용
  const [activeTab, setActiveTab] = useState(() => getAccountTab());

  // 재인증 상태 관리 - AuthContext에서 가져옴
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  // 재인증 완료 후 원래 작업 계속
  const [pendingAction, setPendingAction] = useState(null);

  // 자동 리다이렉트 관련 상태
  const inactivityTimeoutRef = useRef(null);

  // 탭 정의
  const tabs = [
    { id: 'personal', name: '개인정보' },
    { id: 'password', name: '암호설정' },
    { id: 'history', name: '나의이력' },
    { id: 'work', name: '나의업무' },
  ];

  // /account 경로 접근 시 재인증 강제
  useEffect(() => {
    if (user && location.pathname === '/account') {
      console.log('🔐 AccountPage - /account 경로 접근, 재인증 강제');
      setIsAuthenticated(false);
      setShowPasswordModal(true);
    }
  }, [user, location.pathname]);

  // AuthContext의 재인증 상태를 사용하여 isAuthenticated 업데이트
  useEffect(() => {
    console.log('🔄 AuthContext 상태 변화 감지:', { user: !!user, reAuthRequired });

    if (user && !reAuthRequired) {
      console.log('✅ AuthContext - 재인증 불필요, isAuthenticated를 true로 설정');
      setIsAuthenticated(true);
    } else if (user && reAuthRequired) {
      console.log('🔐 AuthContext - 재인증 필요, isAuthenticated를 false로 설정');
      setIsAuthenticated(false);
    }
  }, [user, reAuthRequired]);

  // isAuthenticated 상태 변화 추적
  useEffect(() => {
    console.log('🔍 isAuthenticated 상태 변화:', {
      isAuthenticated,
      timestamp: new Date().toISOString(),
      activeTab,
      user: !!user,
      stack: new Error().stack?.split('\n').slice(1, 4).join('\n'),
    });
  }, [isAuthenticated, activeTab, user]);

  // pendingAction 상태 변화 추적
  useEffect(() => {
    console.log('🔍 pendingAction 상태 변화:', {
      hasPendingAction: !!pendingAction,
      pendingActionType: pendingAction ? 'function' : 'null',
      timestamp: new Date().toISOString(),
    });
  }, [pendingAction]);

  // 페이지 이동 시 재인증 상태 처리 (비밀번호 변경 페이지로 이동할 때는 제외)
  useEffect(() => {
    if (
      user &&
      location.pathname === '/account' &&
      !location.pathname.includes('/password-change')
    ) {
      // 계정 페이지에 있을 때만 재인증 상태 처리
      handleNavigation(user.id);
    }
  }, [location.pathname, user, handleNavigation]);

  // 재인증 성공 시 처리
  const handlePasswordSuccess = result => {
    if (user) {
      const userId = user.uid || user.id;
      console.log('✅ AccountPage - 재인증 성공, 하위 페이지 로드 시작');

      // 재인증 토큰이 있으면 저장 (페이지 경로 포함)
      if (result.reAuthToken) {
        setReAuthStatus(userId, result.reAuthToken, '/account');
        console.log('✅ 재인증 토큰 저장됨 (경로: /account)');
      }

      // 재인증 상태를 즉시 true로 설정하여 하위 페이지가 렌더링되도록 함
      console.log(
        '🔐 재인증 완료 - isAuthenticated를 true로 설정 (이전 상태:',
        isAuthenticated,
        ')'
      );
      setIsAuthenticated(true);
      setShowPasswordModal(false);

      // 상태 업데이트가 완료된 후 pendingAction 실행을 보장
      setTimeout(() => {
        console.log('⏰ 상태 업데이트 후 pendingAction 실행 준비');
        console.log('⏰ 현재 pendingAction 상태:', {
          hasPendingAction: !!pendingAction,
          pendingActionType: pendingAction ? 'function' : 'null',
          pendingAction: pendingAction,
        });

        // 재인증 완료 후 원래 작업 실행
        if (pendingAction && typeof pendingAction === 'function') {
          console.log('🔄 AccountPage - 원래 작업 실행:', pendingAction);
          try {
            console.log('⏰ pendingAction 실행 시작');
            pendingAction();
            console.log('✅ pendingAction 실행 완료');
          } catch (error) {
            console.error('❌ pendingAction 실행 실패:', error);
          }
          setPendingAction(null);
        } else if (pendingAction) {
          console.log('⚠️ AccountPage - pendingAction이 함수가 아님:', pendingAction);
          console.log('⚠️ pendingAction 타입:', typeof pendingAction);
          console.log('⚠️ pendingAction 내용:', pendingAction);
          setPendingAction(null);
        } else {
          console.log('⚠️ pendingAction이 없음 - 저장 작업이 설정되지 않음');
        }
      }, 200); // 상태 업데이트를 위한 충분한 시간

      // 토스트 메시지는 PasswordConfirmModal에서만 표시하므로 여기서는 제거
    }
  };

  // 재인증 상태 초기화 (각 저장 작업마다 호출)
  const resetReAuthStatus = action => {
    console.log('🔄 AccountPage - 재인증 상태 초기화', action);
    console.log('🔄 action 타입:', typeof action);
    console.log('🔄 action 내용:', action);

    // action이 함수인지 확인
    if (typeof action === 'function') {
      console.log('✅ action이 함수임 - pendingAction 설정');
      console.log('✅ pendingAction 설정 전 상태:', {
        pendingAction: !!pendingAction,
        isAuthenticated,
      });
      setPendingAction(action);
      setIsAuthenticated(false);
      setShowPasswordModal(true);
      console.log('✅ pendingAction 설정 완료');
    } else {
      console.error('❌ AccountPage - action이 함수가 아님:', action);
      console.error('❌ action 타입:', typeof action);
      console.error('❌ action 내용:', action);
      // action이 함수가 아니면 재인증만 요구
      setIsAuthenticated(false);
      setShowPasswordModal(true);
    }
  };

  // 재인증 모달 닫기
  const handlePasswordModalClose = () => {
    console.log('❌ AccountPage - 재인증 모달 닫기');

    // pendingAction이 있는 경우 (재인증 성공 후 모달 닫기)는 취소로 처리하지 않음
    if (pendingAction) {
      console.log('⚠️ pendingAction이 있음 - 재인증 성공 후 모달 닫기로 간주');
      setShowPasswordModal(false);
      return;
    }

    console.log('❌ AccountPage - 재인증 취소');
    setShowPasswordModal(false);
    // 모달을 닫으면 계정 페이지에 머물러 있기 (대시보드로 이동하지 않음)
    // navigate('/dashboard') 제거
  };

  // 5분 자동 리다이렉트 로직 (보안 강화)
  useEffect(() => {
    if (!user || !isAuthenticated) return;

    // 사용자 활동 감지 함수들
    const resetInactivityTimer = () => {
      // 기존 타이머가 있다면 제거
      if (inactivityTimeoutRef.current) {
        clearTimeout(inactivityTimeoutRef.current);
      }

      // 5분 후 자동으로 대시보드로 이동하는 타이머 설정
      inactivityTimeoutRef.current = setTimeout(
        () => {
          console.log('⏰ AccountPage - 5분 경과, 보안을 위해 대시보드로 이동');
          toast.info('보안을 위해 대시보드로 이동합니다.');
          navigate('/dashboard');
        },
        5 * 60 * 1000
      ); // 5분
    };

    // 페이지 로드 시 타이머 시작
    resetInactivityTimer();

    // 사용자 활동 이벤트 리스너들
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];

    const handleUserActivity = () => {
      resetInactivityTimer();
    };

    // 이벤트 리스너 등록
    events.forEach(event => {
      document.addEventListener(event, handleUserActivity, true);
    });

    // 컴포넌트 언마운트 시 정리
    return () => {
      if (inactivityTimeoutRef.current) {
        clearTimeout(inactivityTimeoutRef.current);
      }
      events.forEach(event => {
        document.removeEventListener(event, handleUserActivity, true);
      });
    };
  }, [user, isAuthenticated, navigate]);

  // 탭 변경 시 localStorage에 저장
  const handleTabChange = tabId => {
    // 모든 탭을 같은 페이지 내에서 처리
    setActiveTab(tabId);
    saveAccountTab(tabId);
  };

  // 현재 활성 탭에 해당하는 컴포넌트 렌더링
  const renderActiveTab = () => {
    console.log('🔍 renderActiveTab 호출:', {
      isAuthenticated,
      activeTab,
      timestamp: new Date().toISOString(),
      user: !!user,
    });

    // 재인증이 완료된 경우에만 하위 페이지 렌더링
    if (!isAuthenticated) {
      console.log('❌ 재인증 미완료 - 하위 페이지 렌더링 안함');
      return null;
    }

    console.log('✅ 재인증 완료 - 하위 페이지 렌더링:', activeTab);

    switch (activeTab) {
      case 'personal':
        console.log('📱 PersonalInfoPage 렌더링');
        return <PersonalInfoPage onReAuthRequired={resetReAuthStatus} />;
      case 'password':
        console.log('🔐 PasswordChangeForm 렌더링');
        return <PasswordChangeForm onReAuthRequired={resetReAuthStatus} />;
      case 'history':
        console.log('📚 MyHistoryPage 렌더링');
        return <MyHistoryPage onReAuthRequired={resetReAuthStatus} />;
      case 'work':
        console.log('💼 MyWorkPage 렌더링');
        return <MyWorkPage onReAuthRequired={resetReAuthStatus} />;
      default:
        console.log('📱 PersonalInfoPage 렌더링 (기본값)');
        return <PersonalInfoPage onReAuthRequired={resetReAuthStatus} />;
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        사용자 정보를 불러오는 중...
      </div>
    );
  }

  // 재인증이 필요한 경우에도 배경 화면을 유지하고 모달만 표시
  return (
    <div className="w-full">
      {/* 탭 네비게이션 - 항상 표시 */}
      <div className="bg-white border-b">
        <nav className="flex space-x-8">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* 탭 콘텐츠 - 재인증 완료 시에만 렌더링 */}
      <div className="w-full">
        {isAuthenticated ? (
          renderActiveTab()
        ) : (
          // 재인증이 필요한 경우 안내 메시지 표시 (배경 화면 유지)
          <div className="bg-white rounded-lg p-8 text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 mb-4">
              <span className="text-3xl">🔒</span>
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">보안 확인 필요</h2>
            <p className="text-gray-600">계정 정보에 접근하려면 비밀번호를 다시 입력해주세요</p>
          </div>
        )}
      </div>

      {/* 재인증 모달 */}
      <PasswordConfirmModal
        isOpen={showPasswordModal}
        onClose={handlePasswordModalClose}
        onSuccess={handlePasswordSuccess}
        pagePath="/account"
      />
      {console.log('🔍 AccountPage - PasswordConfirmModal props:', {
        isOpen: showPasswordModal,
        onClose: !!handlePasswordModalClose,
        onSuccess: !!handlePasswordSuccess,
        pagePath: '/account',
      })}

      {/* 기존 재인증 모달 (AuthContext에서 관리) */}
      <PasswordConfirmModal
        isOpen={showReAuthModal}
        onClose={closeReAuthModal}
        onSuccess={handleReAuthSuccess}
      />
    </div>
  );
};

export default AccountPage;
