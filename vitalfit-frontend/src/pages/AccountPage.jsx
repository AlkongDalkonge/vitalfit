import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';
import PasswordConfirmModal from '../components/PasswordConfirmModal';
import PersonalInfoPage from './PersonalInfoPage';
import MyHistoryPage from './MyHistoryPage';
import MyWorkPage from './MyWorkPage';
import PasswordChangeForm from './PasswordChangePage'; // PasswordChangeForm import
import {
  needsSensitiveActionReAuth,
  setReAuthStatus,
  saveAccountTab,
  getAccountTab,
} from '../utils/reAuthUtils';

const AccountPage = () => {
  const { user, handleNavigation, showReAuthModal, handleReAuthSuccess, closeReAuthModal } =
    useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // localStorage에서 저장된 탭을 가져오거나 기본값 사용
  const [activeTab, setActiveTab] = useState(() => getAccountTab());

  // 재인증 상태 관리
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  // 자동 리다이렉트 관련 상태
  const inactivityTimeoutRef = useRef(null);

  // 탭 정의
  const tabs = [
    { id: 'personal', name: '개인정보' },
    { id: 'password', name: '암호설정' },
    { id: 'history', name: '나의이력' },
    { id: 'work', name: '나의업무' },
  ];

  // 재인증 확인
  useEffect(() => {
    if (user) {
      const userId = user.uid || user.id;
      const currentPath = location.pathname;
      console.log('🔍 AccountPage - 재인증 상태 확인:', {
        userId,
        currentPath,
        needsReAuth: needsSensitiveActionReAuth(userId, currentPath),
        isAuthenticated,
      });

      // 재인증 필요 여부 확인
      if (needsSensitiveActionReAuth(userId, currentPath)) {
        console.log('🔐 AccountPage - 재인증 필요, 모달 표시');
        setShowPasswordModal(true);
        return;
      }

      // 재인증이 완료된 경우
      console.log('✅ AccountPage - 재인증 완료, 페이지 로드');
      setIsAuthenticated(true);
    }
  }, [user]);

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

      setIsAuthenticated(true);
      setShowPasswordModal(false);

      // 토스트 메시지는 PasswordConfirmModal에서만 표시하므로 여기서는 제거
    }
  };

  // 재인증 모달 닫기
  const handlePasswordModalClose = () => {
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
          navigate('/');
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
    // 재인증이 완료된 경우에만 하위 페이지 렌더링
    if (!isAuthenticated) {
      return null;
    }

    switch (activeTab) {
      case 'personal':
        return <PersonalInfoPage />;
      case 'password':
        return <PasswordChangeForm />;
      case 'history':
        return <MyHistoryPage />;
      case 'work':
        return <MyWorkPage />;
      default:
        return <PersonalInfoPage />;
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
      <div className="bg-white border-b mb-6">
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
