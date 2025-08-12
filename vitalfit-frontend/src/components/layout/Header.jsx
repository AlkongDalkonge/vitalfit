import { useIcons, useDate } from '../../utils/hooks';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useState } from 'react';
import AuthService from '../../utils/auth';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api';

export default function Header({ activeMenu = null, userInfo }) {
  const { getMenuIcon } = useIcons();
  const { getFormattedDate } = useDate();
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [showPasswordModal, setShowPasswordModal] = useState(false);

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

  // 비밀번호 변경 모달 열기
  const handlePasswordChange = () => {
    setShowPasswordModal(true);
  };

  // 공통 스타일: 사용자 이름과 동일한 글씨체와 스타일
  const textStyle = 'text-base font-semibold text-gray-800 cursor-pointer select-none';

  return (
    <>
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

          <div className="flex items-center gap-4 font-semibold text-gray-800 select-none">
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
                src="/profileDefault.png"
                alt="기본 프로필"
                className="w-10 h-10 rounded-full border-2 border-gray-200 object-cover"
              />
            )}

            {/* 사용자 이름 | 비밀번호 변경 | 로그아웃 */}
            <span className={textStyle}>{currentUser?.name || '관리자'}</span>
            <span className="text-gray-400 select-none">|</span>
            <span
              onClick={handlePasswordChange}
              className={`${textStyle} hover:text-blue-600`}
              role="button"
              tabIndex={0}
              onKeyPress={e => {
                if (e.key === 'Enter') handlePasswordChange();
              }}
            >
              비밀번호 변경
            </span>
            <span className="text-gray-400 select-none">|</span>
            <span
              onClick={handleLogout}
              className={`${textStyle} hover:text-red-500`}
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

      {/* 비밀번호 변경 모달 */}
      {showPasswordModal && <PasswordChangeModal onClose={() => setShowPasswordModal(false)} />}
    </>
  );
}

// 비밀번호 변경 모달 컴포넌트
const PasswordChangeModal = ({ onClose }) => {
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // 비밀번호 표시/숨김 상태 추가
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);

  const handlePasswordChange = e => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePasswordSubmit = async e => {
    e.preventDefault();

    if (
      !passwordData.currentPassword ||
      !passwordData.newPassword ||
      !passwordData.confirmNewPassword
    ) {
      setMessage({ type: 'error', text: '모든 필드를 입력해주세요.' });
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setMessage({ type: 'error', text: '새 비밀번호는 최소 8자 이상이어야 합니다.' });
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmNewPassword) {
      setMessage({ type: 'error', text: '새 비밀번호와 새 비밀번호 확인이 일치하지 않습니다.' });
      return;
    }

    if (passwordData.currentPassword === passwordData.newPassword) {
      setMessage({ type: 'error', text: '새 비밀번호는 현재 비밀번호와 달라야 합니다.' });
      return;
    }

    setIsLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await axios.put(`${API_BASE_URL}/users/change-password`, passwordData, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${AuthService.getAccessToken()}`,
        },
      });

      if (response.data.success) {
        setMessage({ type: 'success', text: response.data.message });
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmNewPassword: '',
        });
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        setMessage({ type: 'error', text: response.data.message });
      }
    } catch (error) {
      console.error('비밀번호 변경 오류:', error);
      setMessage({
        type: 'error',
        text: error.response?.data?.message || '비밀번호 변경 중 오류가 발생했습니다.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[9999]">
      <div className="bg-white rounded-[10px] p-6 w-full max-w-md mx-4 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold">비밀번호 수정</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {message.text && (
          <div
            className={`mb-4 p-3 rounded-lg text-sm ${
              message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">현재 비밀번호</label>
            <div className="relative">
              <input
                type={showCurrentPassword ? 'text' : 'password'}
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                className="w-full h-12 rounded-[10px] border border-stone-300 px-3 focus:outline-none focus:ring-2 focus:ring-cyan-500 pr-10"
                placeholder="현재 비밀번호를 입력하세요"
                required
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700 transition-colors"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              >
                {showCurrentPassword ? '😵‍💫' : '🥺'}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">새 비밀번호</label>
            <div className="relative">
              <input
                type={showNewPassword ? 'text' : 'password'}
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                className="w-full h-12 rounded-[10px] border border-stone-300 px-3 focus:outline-none focus:ring-2 focus:ring-cyan-500 pr-10"
                placeholder="새 비밀번호를 입력하세요 (최소 8자)"
                required
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700 transition-colors"
                onClick={() => setShowNewPassword(!showNewPassword)}
              >
                {showNewPassword ? '😵‍💫' : '🥺'}
              </button>
            </div>
            <small className="text-xs text-gray-500">최소 8자 이상 입력해주세요.</small>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">새 비밀번호 확인</label>
            <div className="relative">
              <input
                type={showConfirmNewPassword ? 'text' : 'password'}
                name="confirmNewPassword"
                value={passwordData.confirmNewPassword}
                onChange={handlePasswordChange}
                className="w-full h-12 rounded-[10px] border border-stone-300 px-3 focus:outline-none focus:ring-2 focus:ring-cyan-500 pr-10"
                placeholder="새 비밀번호를 다시 입력하세요"
                required
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700 transition-colors"
                onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
              >
                {showConfirmNewPassword ? '😵‍💫' : '🥺'}
              </button>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-11 px-4 border border-gray-300 rounded-[10px] text-gray-700 text-sm font-normal"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 h-11 px-4 bg-gradient-to-br from-cyan-500 to-indigo-800 rounded-[10px] text-white text-sm font-normal disabled:opacity-50"
            >
              {isLoading ? '변경 중...' : '비밀번호 변경'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
