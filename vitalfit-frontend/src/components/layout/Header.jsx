import { useIcons, useDate } from '../../utils/hooks';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

// 백엔드 서버 URL
const API_BASE_URL = 'http://localhost:3001';

export default function Header({ activeMenu = null, userInfo }) {
  const { getMenuIcon } = useIcons();
  const { getFormattedDate } = useDate();
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const IconComponent = activeMenu ? getMenuIcon(activeMenu) : null;

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('로그아웃되었습니다.');
      navigate('/login');
    } catch (error) {
      toast.error('로그아웃 중 오류가 발생했습니다.');
    }
  };

  // 사용자 정보 (props로 받은 userInfo가 있으면 사용, 없으면 AuthContext의 user 사용)
  const currentUser = userInfo || user;

  // 프로필 이미지 URL 생성
  const profileImageUrl = currentUser?.profile_image_url
    ? `${API_BASE_URL}${currentUser.profile_image_url}`
    : 'https://placehold.co/32x32';

  return (
    <header className="h-20 bg-white flex justify-between items-center px-8 border-b border-gray-100">
      <div className="flex items-center text-lg font-bold text-gray-800 gap-2">
        {activeMenu ? (
          <>
            <div className="bg-gradient-to-r from-blue-500 to-blue-400 p-0.5 rounded">
              <IconComponent size={14} color="#ffffff" />
            </div>
            {activeMenu}
          </>
        ) : (
          <span>반갑습니다, {currentUser?.name || '관리자'}님!</span>
        )}
      </div>
      <div className="flex items-center gap-16">
        <span className="text-sm text-gray-500 font-medium">{getFormattedDate()}</span>
        <div className="flex items-center gap-8">
          <img
            src={profileImageUrl}
            alt="profile"
            className="w-10 h-10 rounded-full border-2 border-gray-200 object-cover"
            onError={e => {
              e.target.src = 'https://placehold.co/32x32';
            }}
          />
          <span className="text-base font-semibold text-gray-800">
            {currentUser?.name || '관리자'}
          </span>
          <button
            onClick={handleLogout}
            className="text-sm text-gray-500 hover:text-red-500 transition-colors mr-4"
          >
            로그아웃
          </button>
        </div>
      </div>
    </header>
  );
}
