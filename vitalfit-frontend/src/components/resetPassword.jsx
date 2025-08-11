import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// API 기본 URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

export default function ResetPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

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
        setError(data.message || '비밀번호 재설정 중 오류가 발생했습니다.');
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
    <div className="min-h-screen flex">
      {/* 왼쪽 이미지 섹션 */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-cyan-500 to-indigo-800 relative">
        <div className="absolute inset-0 bg-black bg-opacity-20"></div>
        <div className="relative z-10 flex flex-col justify-center items-center text-white p-12">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">VitalFit</h1>
            <p className="text-xl opacity-90">건강한 라이프스타일을 위한 최고의 선택</p>
          </div>

          <div className="w-64 h-64 bg-white bg-opacity-10 rounded-full flex items-center justify-center mb-8">
            <img src="/logo.png" alt="VitalFit Logo" className="w-32 h-32 object-contain" />
          </div>

          <div className="text-center">
            <p className="text-lg opacity-90">함께 건강한 미래를 만들어가세요</p>
          </div>
        </div>
      </div>

      {/* 오른쪽 비밀번호 재설정 폼 섹션 */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* 헤더 */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">비밀번호 재설정</h2>
            <p className="text-gray-600">이메일 주소를 입력하시면 재설정 링크를 보내드립니다</p>
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
              className="w-full bg-gradient-to-r from-cyan-500 to-indigo-600 text-white py-3 px-4 rounded-lg hover:from-cyan-600 hover:to-indigo-700 focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '전송 중...' : '재설정 링크 전송'}
            </button>

            <div className="text-center">
              <span className="text-sm text-gray-600">비밀번호를 기억하셨나요? </span>
              <button
                type="button"
                onClick={handleSignIn}
                className="text-sm text-cyan-600 hover:text-cyan-500 transition-colors"
              >
                로그인
              </button>
            </div>
          </form>

          {/* 에러 메시지 */}
          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* 성공 메시지 */}
          {success && (
            <div className="mt-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
              {success}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
