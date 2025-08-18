import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // 에러 상태 변경 시 토스티로 표시
  useEffect(() => {
    if (error) {
      showToastOnce('error', error, 'error');
      // 에러 토스티 표시 후 에러 상태 초기화 (중복 토스티 방지)
      const timer = setTimeout(() => {
        setError('');
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // 비밀번호 표시/숨김 상태 추가
  const [showPassword, setShowPassword] = useState(false);

  // 중복 토스티 방지를 위한 토스티 ID 관리
  const [toastIds, setToastIds] = useState({
    loginInfo: null,
    loginSuccess: null,
    error: null,
  });

  const { login, isAuthenticated, loading: authLoading, user } = useAuth();
  const navigate = useNavigate();

  // 중복 토스티 방지 헬퍼 함수
  const showToastOnce = useCallback(
    (type, message, toastKey) => {
      // 기존 토스티가 있다면 제거
      if (toastIds[toastKey]) {
        toast.dismiss(toastIds[toastKey]);
      }

      // 새 토스티 표시하고 ID 저장
      const toastId = toast[type](message, {
        toastId: toastKey, // 동일한 키로 중복 방지
        autoClose: type === 'error' ? 5000 : 3000,
      });

      setToastIds(prev => ({
        ...prev,
        [toastKey]: toastId,
      }));

      return toastId;
    },
    [toastIds]
  );

  // 페이지 로드 시 저장된 이메일과 Remember Me 설정 불러오기
  useEffect(() => {
    const savedEmail = localStorage.getItem('savedEmail');
    const savedRememberMe = localStorage.getItem('rememberMe');

    if (savedEmail && savedRememberMe === 'true') {
      setEmail(savedEmail);
      setRememberMe(true);
    } else if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(false);
    }
  }, []);

  // 컴포넌트 언마운트 시 모든 토스티 정리
  useEffect(() => {
    return () => {
      Object.values(toastIds).forEach(id => {
        if (id) {
          toast.dismiss(id);
        }
      });
    };
  }, [toastIds]);

  // 로그인된 상태에서 로그인 페이지 접속 시 대시보드로 리다이렉트 (뒤로 가기 방지)
  useEffect(() => {
    console.log(
      '🔍 signIn useEffect 실행 - authLoading:',
      authLoading,
      'isAuthenticated:',
      isAuthenticated,
      'user:',
      user
    );

    if (!authLoading && isAuthenticated && user) {
      console.log('🚀 로그인 성공! 대시보드로 리다이렉트 시작');

      // replace를 사용하여 히스토리에서 로그인 페이지를 대체 (뒤로 가기 방지)
      console.log('📍 대시보드로 이동 (replace):', '/dashboard');
      navigate('/', { replace: true });
    }
  }, [authLoading, isAuthenticated, user, navigate]);

  // 로그인 성공 후 상태 변경 방지
  useEffect(() => {
    if (isAuthenticated && user) {
      // 로그인 성공 시 이 컴포넌트의 상태를 정리
      setEmail('');
      setPassword('');
      setError('');
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  // 인증 상태 확인 중일 때 로딩 화면 표시
  if (authLoading) {
    return (
      <div className="min-h-screen flex bg-gradient-to-br from-cyan-500 to-indigo-800">
        <div className="flex w-full justify-center items-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-white text-lg font-semibold">로그인중...</p>
          </div>
        </div>
      </div>
    );
  }

  // 이미 로그인된 상태라면 로딩 화면 표시
  if (isAuthenticated) {
    return (
      <div className="min-h-screen flex bg-gradient-to-br from-cyan-500 to-indigo-800">
        <div className="flex w-full justify-center items-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-white text-lg font-semibold">로그인중...</p>
          </div>
        </div>
      </div>
    );
  }

  const loginSubmit = async e => {
    e.preventDefault();
    console.log('🔐 로그인 요청 시작:', { email, password, rememberMe });
    setLoading(true);
    setError('');

    try {
      // AuthContext의 login 함수 직접 호출
      console.log('🔐 AuthContext login 호출 시작');
      const result = await login(email, password, rememberMe);
      console.log('🔐 AuthContext login 결과:', result);

      if (result.success) {
        console.log('✅ 로그인 성공!');
        showToastOnce('success', '로그인되었습니다.', 'loginSuccess');

        // 이메일 저장 설정 (Remember Me가 체크된 경우에만)
        if (rememberMe) {
          localStorage.setItem('savedEmail', email);
          console.log('💾 이메일 저장됨 (Remember Me):', email);
        } else {
          localStorage.removeItem('savedEmail');
          console.log('🗑️ 이메일 저장 제거됨');
        }

        // 즉시 대시보드로 이동 (상태 변경 문제 방지)
        console.log('📍 로그인 성공 후 즉시 대시보드로 이동');
        navigate('/', { replace: true });
      } else {
        console.log('❌ 로그인 실패:', result.message);
        setError(result.message || '로그인에 실패했습니다.');
      }
    } catch (err) {
      console.error('❌ 로그인 중 오류 발생:', err);
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

  // 로그인 화면
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

      {/* 오른쪽 로그인 폼 섹션 */}
      <div className="flex w-1/2 justify-start items-center">
        <div className="w-[550px] h-[706px] bg-white rounded-r-3xl p-8 shadow-2xl border border-white/30">
          <div className="max-w-xs mx-auto py-6">
            {/* 헤더 */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">VitalFit 관리시스템</h2>
              <p className="text-sm text-gray-600">건강한 라이프스타일을 위한 최고의 선택</p>
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
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-colors pr-10"
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700 transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? '★' : '☆'}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={e => setRememberMe(e.target.checked)}
                    className="h-4 w-4 text-cyan-600 focus:ring-cyan-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-700">자동 로그인 유지</label>
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
                className="Button w-full h-11 p-2.5 bg-gradient-to-r from-cyan-500 to-indigo-600 rounded-[10px] inline-flex justify-center items-center gap-2.5 hover:from-cyan-600 hover:to-indigo-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                <div className="PrimaryButton justify-start text-white text-sm font-normal font-['Nunito'] leading-normal">
                  {loading ? '로그인 중...' : '로그인'}
                </div>
              </button>

              <div className="text-center pt-2">
                <p className="text-sm text-gray-600 mb-4">계정이 없으신가요?</p>
                <button
                  type="button"
                  onClick={handleSignUp}
                  className="Button w-24 h-11 p-2.5 rounded-[10px] bg-gradient-to-r from-cyan-500 to-indigo-600 p-[1px] inline-flex justify-center items-center gap-2.5 shadow-md"
                >
                  <div className="w-full h-full bg-white rounded-[9px] flex items-center justify-center">
                    <div className="PrimaryButton justify-start bg-gradient-to-r from-cyan-500 to-indigo-600 bg-clip-text text-transparent text-sm font-normal font-['Nunito'] leading-normal">
                      회원가입
                    </div>
                  </div>
                </button>
              </div>
            </form>

            {/* 에러 메시지 */}
            {error && (
              <div className="mt-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-xs">
                {error}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
