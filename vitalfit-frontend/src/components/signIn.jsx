import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const loginSubmit = async e => {
    e.preventDefault();
    console.log('로그인 요청:', { email, password });
    setLoading(true);
    setError('');

    try {
      const result = await login(email, password, rememberMe);

      if (result.success) {
        console.log('로그인 성공');
        navigate('/dashboard');
      } else {
        setError(result.message || '로그인에 실패했습니다.');
      }
    } catch (err) {
      setError('로그인 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = () => {
    // 비밀번호 재설정 페이지로 이동
    navigate('/reset-password');
  };

  const handleSignUp = () => {
    // 회원가입 페이지로 이동
    navigate('/signup');
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

          {/* 이미지 추가 방법 1: 로고 이미지 사용 */}
          <div className="w-64 h-64 bg-white bg-opacity-10 rounded-full flex items-center justify-center mb-8">
            <img src="/logo.png" alt="VitalFit Logo" className="w-32 h-32 object-contain" />
          </div>

          {/* 이미지 추가 방법 2: 배경 이미지 사용 */}
          {/* 
          <div 
            className="w-64 h-64 rounded-full mb-8"
            style={{
              backgroundImage: 'url(/fitness-bg.jpg)',
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          />
          */}

          {/* 이미지 추가 방법 3: 온라인 이미지 사용 */}
          {/* 
          <div className="w-64 h-64 rounded-full mb-8 overflow-hidden">
            <img 
              src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop" 
              alt="Fitness" 
              className="w-full h-full object-cover"
            />
          </div>
          */}

          <div className="text-center">
            <p className="text-lg opacity-90">함께 건강한 미래를 만들어가세요</p>
          </div>
        </div>
      </div>

      {/* 오른쪽 로그인 폼 섹션 */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* 헤더 */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome back!</h2>
            <p className="text-gray-600">로그인하여 계속하세요</p>
          </div>

          {/* 로그인 폼 */}
          <form onSubmit={loginSubmit} className="space-y-6">
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">비밀번호</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-colors"
                required
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-cyan-600 focus:ring-cyan-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-700">Remember me</label>
              </div>
              <button
                type="button"
                onClick={handlePasswordReset}
                className="text-sm text-cyan-600 hover:text-cyan-500 transition-colors"
              >
                비밀번호 재설정
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-cyan-500 to-indigo-600 text-white py-3 px-4 rounded-lg hover:from-cyan-600 hover:to-indigo-700 focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '로그인 중...' : '로그인'}
            </button>

            <div className="text-center">
              <span className="text-sm text-gray-600">계정이 없으신가요? </span>
              <button
                type="button"
                onClick={handleSignUp}
                className="text-sm text-cyan-600 hover:text-cyan-500 transition-colors"
              >
                Sign Up
              </button>
            </div>
          </form>

          {/* 에러 메시지 */}
          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
