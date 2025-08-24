import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';
import PasswordConfirmModal from '../components/PasswordConfirmModal';
import PersonalInfoPage from './PersonalInfoPage';
import MyHistoryPage from './MyHistoryPage';
import MyWorkPage from './MyWorkPage';
import PasswordChangeForm from './PasswordChangePage';
import { setReAuthStatus, saveAccountTab, getAccountTab } from '../utils/reAuthUtils';

const AccountPage = () => {
  const { user, handleNavigation, refreshUserInfo } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // localStorage에서 저장된 탭을 가져오거나 기본값 사용
  const [activeTab, setActiveTab] = useState(() => getAccountTab());

  // 재인증 상태 관리
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  // 재인증 완료 후 원래 작업 계속
  const [pendingAction, setPendingAction] = useState(null);
  const pendingActionExecutedRef = useRef(false); // pendingAction 중복 실행 방지

  // 페이지 진입 시간 추적 및 자동 이동 로직
  const [pageEnterTime, setPageEnterTime] = useState(null);
  const autoRedirectTimerRef = useRef(null);
  const STAY_TIME_LIMIT = 5 * 60 * 1000; // 5분 (밀리초)

  // 페이지 진입 시 시간 기록
  useEffect(() => {
    if (location.pathname === '/account') {
      const enterTime = Date.now();
      setPageEnterTime(enterTime);
      console.log('🕐 AccountPage 진입 시간 기록:', new Date(enterTime).toLocaleString());

      // 5분 후 자동 이동 타이머 설정
      autoRedirectTimerRef.current = setTimeout(() => {
        console.log('⏰ 5분 경과 - 대시보드로 자동 이동');
        toast.info('5분간 활동이 없어 대시보드로 이동합니다.');
        navigate('/dashboard');
      }, STAY_TIME_LIMIT);
    }

    // 컴포넌트 언마운트 시 타이머 정리
    return () => {
      if (autoRedirectTimerRef.current) {
        clearTimeout(autoRedirectTimerRef.current);
        autoRedirectTimerRef.current = null;
      }
    };
  }, [location.pathname, navigate]);

  // 사용자 활동 감지 시 타이머 리셋
  useEffect(() => {
    const resetTimer = () => {
      if (autoRedirectTimerRef.current) {
        clearTimeout(autoRedirectTimerRef.current);
        autoRedirectTimerRef.current = setTimeout(() => {
          console.log('⏰ 5분 경과 - 대시보드로 자동 이동');
          toast.info('5분간 활동이 없어 대시보드로 이동합니다.');
          navigate('/dashboard');
        }, STAY_TIME_LIMIT);
        console.log('🔄 사용자 활동 감지 - 자동 이동 타이머 리셋');
      }
    };

    // 사용자 활동 이벤트 리스너 등록
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    events.forEach(event => {
      document.addEventListener(event, resetTimer, true);
    });

    // 컴포넌트 언마운트 시 이벤트 리스너 정리
    return () => {
      events.forEach(event => {
        document.removeEventListener(event, resetTimer, true);
      });
    };
  }, [navigate]);

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
      console.log('🔍 현재 상태:', {
        isAuthenticated,
        showPasswordModal,
        hasPendingAction: !!pendingAction,
      });

      setIsAuthenticated(false);
      setShowPasswordModal(true);

      console.log('🔄 상태 설정 후:', {
        isAuthenticated: false,
        showPasswordModal: true,
      });
    }
  }, [user, location.pathname]);

  // showPasswordModal 상태 변화 추적
  useEffect(() => {
    console.log('🔍 showPasswordModal 상태 변화:', {
      showPasswordModal,
      isAuthenticated,
      hasPendingAction: !!pendingAction,
      timestamp: new Date().toISOString(),
    });
  }, [showPasswordModal, isAuthenticated, pendingAction]);

  // isAuthenticated 상태 변화 추적
  useEffect(() => {
    console.log('🔍 isAuthenticated 상태 변화:', {
      isAuthenticated,
      showPasswordModal,
      hasPendingAction: !!pendingAction,
      pendingActionExecuted: pendingActionExecutedRef.current,
      timestamp: new Date().toISOString(),
      stack: new Error().stack?.split('\n').slice(1, 4).join('\n'), // 호출 스택 추가
    });
  }, [isAuthenticated, showPasswordModal, pendingAction]);

  // isAuthenticated 상태 변화 시 추가 로그
  useEffect(() => {
    if (isAuthenticated) {
      console.log('🎉 isAuthenticated가 true로 설정됨! 하위 페이지 렌더링 가능');
      console.log('🔍 현재 상태:', {
        showPasswordModal,
        hasPendingAction: !!pendingAction,
        activeTab,
      });
    } else {
      console.log('🔒 isAuthenticated가 false로 설정됨. 하위 페이지 렌더링 불가');
    }
  }, [isAuthenticated]);

  // pendingAction 상태 변화 추적
  useEffect(() => {
    console.log('🔍 pendingAction 상태 변화:', {
      hasPendingAction: !!pendingAction,
      pendingActionType: pendingAction ? 'function' : 'null',
      pendingAction: pendingAction,
      isExecuted: pendingActionExecutedRef.current,
      timestamp: new Date().toISOString(),
    });
  }, [pendingAction]);

  // 재인증 상태 변화 추적
  useEffect(() => {
    console.log('🔍 재인증 상태 변화:', {
      isAuthenticated,
      showPasswordModal,
      hasPendingAction: !!pendingAction,
      pendingActionExecuted: pendingActionExecutedRef.current,
      timestamp: new Date().toISOString(),
    });
  }, [isAuthenticated, showPasswordModal, pendingAction]);

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
  const handlePasswordSuccess = async result => {
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

      // 상태 업데이트 전 로그
      console.log('🔄 isAuthenticated 상태 업데이트 전:', isAuthenticated);
      setIsAuthenticated(true);
      console.log('🔄 isAuthenticated 상태 업데이트 후 (setState 호출됨)');

      // 상태 업데이트가 제대로 반영되는지 확인하고 강제 업데이트
      setTimeout(() => {
        if (!isAuthenticated) {
          console.log('⚠️ isAuthenticated 상태가 업데이트되지 않음, 강제 업데이트');
          setIsAuthenticated(true);
        } else {
          console.log('✅ isAuthenticated 상태가 정상적으로 업데이트됨');
        }
      }, 100);

      // setShowPasswordModal(false) 제거 - PasswordConfirmModal에서 자동으로 닫힘

      // pendingAction 중복 실행 방지
      pendingActionExecutedRef.current = false;

      // 재인증 성공 후 최신 사용자 정보 동기화 (DB 최신 내용 반영)
      try {
        console.log('🔄 재인증 성공 후 최신 사용자 정보 동기화 시작');
        if (refreshUserInfo && typeof refreshUserInfo === 'function') {
          await refreshUserInfo();
          console.log('✅ 최신 사용자 정보 동기화 완료');
        }
      } catch (syncError) {
        console.warn('⚠️ 최신 사용자 정보 동기화 실패:', syncError);
        // 동기화 실패 시에도 계속 진행
      }

      // pendingAction이 있는 경우 즉시 실행 (비동기 처리 보장)
      if (
        pendingAction &&
        typeof pendingAction === 'function' &&
        !pendingActionExecutedRef.current
      ) {
        console.log('🔄 AccountPage - pendingAction 즉시 실행 시작');
        try {
          console.log('⏰ pendingAction 실행 시작');
          pendingActionExecutedRef.current = true; // 실행 상태 설정

          // pendingAction 실행
          await pendingAction(); // await로 완료 보장

          console.log('✅ pendingAction 실행 완료');
        } catch (error) {
          console.error('❌ pendingAction 실행 실패:', error);
          // 에러가 발생해도 실행 상태는 유지 (중복 실행 방지)
        }

        // 실행 완료 후 pendingAction 초기화
        setPendingAction(null);
      } else if (pendingAction && pendingActionExecutedRef.current) {
        console.log('⚠️ pendingAction이 이미 실행됨 - 중복 실행 방지');
        setPendingAction(null);
      } else if (pendingAction) {
        console.log('⚠️ AccountPage - pendingAction이 함수가 아님:', pendingAction);
        console.log('⚠️ pendingAction 타입:', typeof pendingAction);
        console.log('⚠️ pendingAction 내용:', pendingAction);
        setPendingAction(null);
      } else {
        console.log('⚠️ pendingAction이 없음 - 저장 작업이 설정되지 않음');
      }

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
      pendingActionExecutedRef.current = false; // 실행 상태 초기화
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
    console.log('🔒 AccountPage - 재인증 모달 닫기');

    // pendingAction이 있는 경우 (재인증 성공 후 모달 닫기)는 성공으로 간주
    if (pendingAction) {
      console.log('✅ pendingAction이 있음 - 재인증 성공 후 모달 닫기로 간주');
      setShowPasswordModal(false);
      // isAuthenticated는 true로 유지하여 하위 페이지가 렌더링되도록 함
      return;
    }

    // pendingAction이 없는 경우 (단순 모달 닫기)는 취소로 처리
    console.log('❌ AccountPage - 단순 모달 닫기 (재인증 취소)');
    setShowPasswordModal(false);
    // 재인증이 취소되었으므로 isAuthenticated를 false로 유지
    // 하위 페이지가 렌더링되지 않도록 함
  };

  // 재인증 취소 처리
  const handlePasswordModalCancel = () => {
    console.log('❌ AccountPage - 재인증 취소 처리');

    // pendingAction 초기화
    setPendingAction(null);
    pendingActionExecutedRef.current = false; // 실행 상태 초기화

    // 모달 닫기
    setShowPasswordModal(false);

    // 재인증이 취소되었으므로 isAuthenticated를 false로 유지
    // 하위 페이지가 렌더링되지 않도록 함
    console.log('❌ 재인증 취소 - isAuthenticated를 false로 유지');
  };

  // 탭 변경 핸들러
  const handleTabChange = tabId => {
    // 재인증이 완료된 경우에만 탭 변경 허용
    if (!isAuthenticated) {
      console.log('❌ 재인증 미완료 - 탭 변경 불가:', tabId);
      toast.warning('본인 확인 후 탭을 변경할 수 있습니다.');
      return;
    }

    console.log('✅ 탭 변경:', { from: activeTab, to: tabId });
    setActiveTab(tabId);
    saveAccountTab(tabId);

    // 탭 변경 시 자동 이동 타이머 리셋
    if (autoRedirectTimerRef.current) {
      clearTimeout(autoRedirectTimerRef.current);
      autoRedirectTimerRef.current = setTimeout(() => {
        console.log('⏰ 5분 경과 - 대시보드로 자동 이동');
        toast.info('5분간 활동이 없어 대시보드로 이동합니다.');
        navigate('/dashboard');
      }, STAY_TIME_LIMIT);
      console.log('🔄 탭 변경 - 자동 이동 타이머 리셋');
    }
  };

  // 현재 활성 탭에 해당하는 컴포넌트 렌더링
  const renderActiveTab = () => {
    console.log('🔍 renderActiveTab 호출:', {
      isAuthenticated,
      activeTab,
      timestamp: new Date().toISOString(),
      user: !!user,
      showPasswordModal,
      hasPendingAction: !!pendingAction,
    });

    // 재인증이 완료된 경우에만 하위 페이지 렌더링
    if (!isAuthenticated) {
      return null;
    }

    switch (activeTab) {
      case 'personal':
        return <PersonalInfoPage onReAuthRequired={resetReAuthStatus} />;
      case 'password':
        return <PasswordChangeForm onReAuthRequired={resetReAuthStatus} />;
      case 'history':
        return <MyHistoryPage onReAuthRequired={resetReAuthStatus} />;
      case 'work':
        return <MyWorkPage onReAuthRequired={resetReAuthStatus} />;
      default:
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
      {/* 탭 네비게이션 - 재인증 완료 후에만 활성화 */}
      <div className="bg-white border-b">
        <nav className="flex space-x-8">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              disabled={!isAuthenticated} // 재인증 완료 전에는 비활성화
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : isAuthenticated
                    ? 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    : 'border-transparent text-gray-400 cursor-not-allowed' // 비활성화 상태 스타일
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
          <div key={`authenticated-${isAuthenticated}-${Date.now()}`}>{renderActiveTab()}</div>
        ) : (
          // 재인증이 필요한 경우 안내 메시지 표시 (배경 화면 유지)
          <div className="bg-white rounded-lg p-8 text-center"></div>
        )}
      </div>

      {/* 재인증 모달 */}
      <PasswordConfirmModal
        isOpen={showPasswordModal}
        onClose={handlePasswordModalClose}
        onCancel={handlePasswordModalCancel}
        onSuccess={handlePasswordSuccess}
        pagePath="/account"
      />
    </div>
  );
};

export default AccountPage;
