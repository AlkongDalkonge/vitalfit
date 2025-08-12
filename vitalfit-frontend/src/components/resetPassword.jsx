import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// API 기본 URL
const API_BASE_URL = 'http://localhost:3001/api';

export default function ResetPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSignUpButton, setShowSignUpButton] = useState(false);

  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading } = useAuth();

  // 비밀번호 재설정 화면 진입 시 이미 인증된 사용자라면 대시보드로 리다이렉트
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      console.log('이미 로그인된 사용자, 대시보드로 리다이렉트');
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, authLoading, navigate]);

  // 로딩 중일 때는 로딩 화면 표시
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cyan-500 to-indigo-800">
        <div className="bg-white/20 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/30">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto"></div>
          <p className="text-white text-center mt-4">로그인 상태 확인 중...</p>
        </div>
      </div>
    );
  }

  // 이미 인증된 경우 로딩 화면 표시 (리다이렉트 중)
  if (isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cyan-500 to-indigo-800">
        <div className="bg-white/20 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/30">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto"></div>
          <p className="text-white text-center mt-4">대시보드로 이동 중...</p>
        </div>
      </div>
    );
  }

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (!email) {
      setError('이메일 주소를 입력해주세요.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/users/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('임시 비밀번호가 이메일로 발송되었습니다. 이메일을 확인해주세요.');
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        // 탈퇴된 계정인 경우 특별한 메시지 표시
        if (data.code === 'ACCOUNT_DEACTIVATED') {
          setError('탈퇴된 계정입니다. 회원가입을 다시 진행해주세요.');
          // 회원가입 페이지로 이동하는 버튼 표시를 위한 상태 추가
          setShowSignUpButton(true);
        } else {
          setError(data.message || '비밀번호 재설정 중 오류가 발생했습니다.');
        }
      }
    } catch (err) {
      console.error('비밀번호 재설정 오류:', err);
      setError('비밀번호 재설정 중 오류가 발생했습니다. 네트워크 연결을 확인해주세요.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-cyan-500 to-indigo-800">
      {/* 왼쪽 박스 섹션 */}
      <div className="flex w-1/2 justify-end items-center">
        <div className="w-[550px] h-[706px] bg-white/20 backdrop-blur-sm rounded-l-3xl shadow-2xl border border-white/30 overflow-hidden">
          <img
            src="/img/infovitalfit.png"
            alt="VitalFit Info"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* 오른쪽 비밀번호 재설정 폼 섹션 */}
      <div className="flex w-1/2 justify-start items-center">
        <div className="w-[550px] h-[706px] bg-white rounded-r-3xl p-8 shadow-2xl border border-white/30">
          <div className="max-w-xs mx-auto py-6">
            {/* 헤더 */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">VitalFit 관리시스템</h2>
              <p className="text-sm text-gray-600">비밀번호 재설정</p>
            </div>

            {/* 비밀번호 재설정 폼 */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">이메일 주소</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Enter email address"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-colors"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="Button w-full h-11 p-2.5 bg-gradient-to-r from-cyan-500 to-indigo-600 rounded-[10px] inline-flex justify-center items-center gap-2.5 hover:from-cyan-600 hover:to-indigo-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                <div className="PrimaryButton justify-start text-white text-sm font-normal font-['Nunito'] leading-normal">
                  {loading ? '전송 중...' : '재설정 링크 전송'}
                </div>
              </button>

              <div className="text-center pt-2">
                <p className="text-sm text-gray-600 mb-4">비밀번호를 기억하셨나요?</p>
                <button
                  type="button"
                  onClick={handleSignIn}
                  className="Button w-24 h-11 p-2.5 rounded-[10px] bg-gradient-to-r from-cyan-500 to-indigo-600 p-[1px] inline-flex justify-center items-center gap-2.5 shadow-md"
                >
                  <div className="w-full h-full bg-white rounded-[9px] flex items-center justify-center">
                    <div className="PrimaryButton justify-start bg-gradient-to-r from-cyan-500 to-indigo-600 bg-clip-text text-transparent text-sm font-normal font-['Nunito'] leading-normal">
                      로그인
                    </div>
                  </div>
                </button>
              </div>
            </form>

            {/* 에러 메시지 */}
            {error && (
              <div className="mt-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-xs">
                {error}
                {/* 탈퇴된 계정인 경우 회원가입 버튼 표시 */}
                {showSignUpButton && (
                  <div className="mt-3 pt-3 border-t border-red-200">
                    <button
                      type="button"
                      onClick={() => navigate('/signup')}
                      className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors text-sm"
                    >
                      회원가입 하기
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* 성공 메시지 */}
            {success && (
              <div className="mt-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-xs">
                {success}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
