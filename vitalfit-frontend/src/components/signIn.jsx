import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // 이미 로그인된 상태라면 대시보드로 리다이렉트
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const loginSubmit = async e => {
    e.preventDefault();
    console.log('로그인 요청:', { email, password });
    setLoading(true);
    setError('');

    try {
      const result = await login(email, password);

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
    <div className="min-h-screen flex bg-gradient-to-br from-cyan-500 to-indigo-800">
      {/* 왼쪽 박스 섹션 */}
      <div className="flex w-1/2 justify-end items-center">
        <div className="w-[550px] h-[706px] bg-white/20 backdrop-blur-sm rounded-l-3xl shadow-2xl border border-white/30 overflow-hidden">
          <img src="/img/main.jpg" alt="Main Image" className="w-full h-full object-cover" />
        </div>
      </div>

      {/* 오른쪽 로그인 폼 섹션 */}
      <div className="flex w-1/2 justify-start items-center">
        <div className="w-[550px] bg-white rounded-r-3xl p-8 shadow-2xl border border-white/30">
          <div className="max-w-xs mx-auto py-8">
            {/* 헤더 */}
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">VitalFit 관리시스템</h2>
              <p className="text-gray-600">건강한 라이프스타일을 위한 최고의 선택</p>
            </div>

            {/* 로그인 폼 */}
            <form onSubmit={loginSubmit} className="space-y-8">
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

              <div className="flex items-center justify-end">
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
                className="Button w-full h-11 p-2.5 bg-gradient-to-r from-cyan-500 to-indigo-600 rounded-[10px] inline-flex justify-center items-center gap-2.5 hover:from-cyan-600 hover:to-indigo-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                <div className="PrimaryButton justify-start text-white text-sm font-normal font-['Nunito'] leading-normal">
                  {loading ? '로그인 중...' : '로그인'}
                </div>
              </button>

              <div className="text-center pt-4">
                <p className="text-sm text-gray-600 mb-6">계정이 없으신가요?</p>
                <button
                  type="button"
                  onClick={handleSignUp}
                  className="Button w-24 h-11 p-2.5 rounded-[10px] outline outline-1 outline-offset-[-0.50px] outline-cyan-500 inline-flex justify-center items-center gap-2.5"
                >
                  <div className="PrimaryButton justify-start text-cyan-500 text-sm font-normal font-['Nunito'] leading-normal">
                    Sign Up
                  </div>
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
    </div>
  );
}
