import { useIcons, useDate } from '../../utils/hooks';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

export default function Header({ activeMenu = null, userInfo, className = '' }) {
  const { getMenuIcon } = useIcons();
  const { getFormattedDate, getDayOfWeek } = useDate(); // 요일 함수 추가
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const IconComponent = activeMenu ? getMenuIcon(activeMenu) : null;

  // 현재 사용자 정보
  const currentUser = userInfo || user;

  // 로그아웃 처리
  const handleLogout = async () => {
    try {
      await logout();
      toast.success('로그아웃되었습니다.');
      navigate('/login');
    } catch (error) {
      toast.error('로그아웃 중 오류가 발생했습니다.');
    }
  };

  // 내 계정 페이지로 이동
  const handleAccountClick = () => {
    navigate('/account');
  };

  const textStyle = 'text-sm font-medium text-gray-800 cursor-pointer select-none';

  // 날짜 + 요일
  const today = getFormattedDate(); // YYYY-MM-DD
  const dayOfWeek = getDayOfWeek(); // ex: 월요일, Tuesday 등

  return (
    <header className={`h-20 bg-white flex justify-between items-center px-8 border-b border-gray-100 ${className}`}>
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
    </header>
  );
}
