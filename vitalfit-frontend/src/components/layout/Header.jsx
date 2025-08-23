import { useIcons, useDate } from '../../utils/hooks';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useState, useEffect } from 'react';
import { settlementAPI } from '../../utils/api';
import SettlementNotificationModal from '../SettlementNotificationModal';

export default function Header({ activeMenu = null, userInfo, className = '' }) {
  const { getMenuIcon } = useIcons();
  const { getFormattedDate, getDayOfWeek } = useDate(); // 요일 함수 추가
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isDashboard = location.pathname === '/';
  const [notificationCount, setNotificationCount] = useState(0);
  const [showNotificationModal, setShowNotificationModal] = useState(false);

  const IconComponent = activeMenu ? getMenuIcon(activeMenu) : null;

  // 현재 사용자 정보
  const currentUser = userInfo || user;

  // 로그아웃 처리
  const handleLogout = async () => {
    try {
      await logout();
      // toast.success('로그아웃되었습니다.'); // 주석처리됨
      navigate('/login');
    } catch (error) {
      // toast.error('로그아웃 중 오류가 발생했습니다.'); // 주석처리됨
    }
  };

  // 알림 개수 로드 함수
  const loadNotificationCount = async () => {
    if (!user?.id) return;
    
    try {
      const response = await settlementAPI.getNotifications(user.id);
      if (response.success && response.data.hasNotifications) {
        setNotificationCount(response.data.count);
      } else {
        setNotificationCount(0);
      }
    } catch (error) {
      console.error('알림 개수 로드 오류:', error);
      setNotificationCount(0);
    }
  };

  // 알림 개수 즉시 업데이트 함수 (외부에서 호출 가능)
  const refreshNotificationCount = () => {
    loadNotificationCount();
  };

  // 전역에서 refreshNotificationCount 함수 사용 가능하도록 설정
  useEffect(() => {
    window.refreshNotificationCount = refreshNotificationCount;
    return () => {
      delete window.refreshNotificationCount;
    };
  }, [user?.id]);

  // 알림 개수 로드
  useEffect(() => {
    loadNotificationCount();

    // 30초마다 알림 개수 새로고침
    const interval = setInterval(loadNotificationCount, 30000);
    return () => clearInterval(interval);
  }, [user?.id]);

  // 내 계정 페이지로 이동
  const handleAccountClick = () => {
    navigate('/account');
  };

  // 알림 모달 열기
  const handleNotificationClick = () => {
    setShowNotificationModal(true);
  };

  const textStyle = 'text-sm font-medium text-gray-800 cursor-pointer select-none';

  // 날짜 + 요일
  const today = getFormattedDate(); // YYYY-MM-DD
  const dayOfWeek = getDayOfWeek(); // ex: 월요일, Tuesday 등

  return (
    <header
      className={`h-16 flex justify-between items-center px-8 ${isDashboard ? 'bg-transparent border-transparent' : 'bg-white'} ${className}`}
    >
      <div className="flex items-center text-lg font-bold text-gray-800 gap-2">
        {activeMenu ? (
          <>
            <div className="bg-gradient-to-r from-blue-500 to-blue-400 p-0.5 rounded">
              <IconComponent size={14} color="#ffffff" />
            </div>
            {activeMenu}
          </>
        ) : (
          <span></span>
        )}
      </div>

      <div className="flex items-center gap-16">
        {/* 날짜 + 요일 표시 */}
        <span className="text-sm font-medium text-gray-500">
          {today} ({dayOfWeek})
        </span>

        {/* 메시지 알림 버튼 */}
        <div className="relative">
          <button
            onClick={handleNotificationClick}
            className="relative p-2 text-gray-600 hover:text-blue-600 transition-colors duration-200"
            title="알림 확인"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            {notificationCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium animate-pulse">
                {notificationCount > 9 ? '9+' : notificationCount}
              </span>
            )}
          </button>
        </div>

        <div className="flex items-center gap-4 font-medium text-gray-800 select-none">
          {/* 프로필 이미지 - 클릭 가능 */}
          <div
            onClick={handleAccountClick}
            className="cursor-pointer hover:opacity-80 transition-opacity"
            role="button"
            tabIndex={0}
            onKeyPress={e => {
              if (e.key === 'Enter') handleAccountClick();
            }}
          >
            {currentUser?.profile_image_url ? (
              <img
                src={
                  currentUser.profile_image_url.startsWith('http')
                    ? currentUser.profile_image_url
                    : `http://localhost:3001${currentUser.profile_image_url}`
                }
                alt="profile"
                className="w-10 h-10 rounded-full border-2 border-gray-200 object-cover"
              />
            ) : (
              <img
                src="https://lh3.googleusercontent.com/pw/AP1GczPHYKy-ftX95akuneOtJAq_BTm0oNlL8mLTK7gUbZJqkYXHB1RDR-gseWYT7G9cVjTsIZyconxHncd5Ph1RASfAHtI75Abk4G9eH9HNtkLAUvHcBfloZzlYUNfcxHPQaTLMmbuZfqZ4I0Pkqf4jS43E=w200-h200-s-no-gm?authuser=0"
                alt="기본 프로필"
                className="w-10 h-10 rounded-full border-2 border-gray-200 object-cover"
              />
            )}
          </div>

          {/* 사용자 이름 - 클릭 가능 */}
          <span
            onClick={handleAccountClick}
            className={`${textStyle} hover:text-blue-600 transition-colors`}
            role="button"
            tabIndex={0}
            onKeyPress={e => {
              if (e.key === 'Enter') handleAccountClick();
            }}
          >
            {currentUser?.name || '관리자'}님
          </span>
          <span
            onClick={handleLogout}
            className={`${textStyle} hover:text-red-500 mr-8`}
            role="button"
            tabIndex={0}
            onKeyPress={e => {
              if (e.key === 'Enter') handleLogout();
            }}
          >
            로그아웃
          </span>
        </div>
      </div>

      {/* 알림 모달 */}
      <SettlementNotificationModal
        isOpen={showNotificationModal}
        onClose={() => setShowNotificationModal(false)}
      />
    </header>
  );
}
