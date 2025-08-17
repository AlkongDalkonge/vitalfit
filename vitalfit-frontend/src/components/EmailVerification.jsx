import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AuthService from '../utils/auth';
import { toast } from 'react-toastify';

// API 기본 URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

export default function EmailVerification() {
  const location = useLocation();
  const navigate = useNavigate();
  const { login, setUser, setIsAuthenticated } = useAuth();

  // 회원가입 후 전달받은 이메일과 메시지
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']); // 6자리 코드를 배열로 관리
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  // 회원가입 후 전달받은 데이터 설정
  useEffect(() => {
    console.log('📍 EmailVerification 컴포넌트 마운트, location.state:', location.state);

    if (location.state) {
      setEmail(location.state.email || '');
      setMessage(location.state.message || '');
      // 회원가입 후에는 이미 이메일이 발송되었으므로 바로 인증 화면 표시
      setIsVerifying(true);
      console.log('✅ 회원가입 후 데이터 설정 완료:', {
        email: location.state.email,
        message: location.state.message,
      });
    } else {
      console.log('⚠️ location.state가 없음 - 직접 접근한 경우');
    }
  }, [location.state]);

  // 6자리 인증 코드 입력 처리
  const handleCodeChange = (index, value) => {
    // 붙여넣기 처리 (6자리 숫자가 붙여넣어진 경우)
    if (value.length === 6 && /^\d{6}$/.test(value)) {
      const digits = value.split('');
      setVerificationCode(digits);

      // 마지막 입력 필드에 포커스
      const lastInput = document.querySelector(`input[data-index="5"]`);
      if (lastInput) lastInput.focus();
      return;
    }

    // 일반 입력 처리 (한 글자씩)
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newCode = [...verificationCode];
      newCode[index] = value;
      setVerificationCode(newCode);

      // 다음 입력 필드로 자동 이동
      if (value && index < 5) {
        const nextInput = document.querySelector(`input[data-index="${index + 1}"]`);
        if (nextInput) nextInput.focus();
      }
    }
  };

  // 붙여넣기 이벤트 처리
  const handlePaste = e => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();

    console.log('📋 붙여넣기 데이터:', pastedData, '길이:', pastedData.length);

    // 붙여넣은 데이터가 6자리 숫자인지 확인
    if (pastedData.length === 6 && /^\d{6}$/.test(pastedData)) {
      const digits = pastedData.split('');
      setVerificationCode(digits);
      console.log('✅ 6자리 코드 붙여넣기 성공:', digits);

      // 마지막 입력 필드에 포커스
      const lastInput = document.querySelector(`input[data-index="5"]`);
      if (lastInput) lastInput.focus();
    } else {
      console.log('❌ 붙여넣기 실패: 6자리 숫자가 아님');
      // 사용자에게 알림
      toast.error('6자리 숫자 코드를 복사해서 붙여넣어주세요.');
    }
  };

  // 백스페이스로 이전 입력 필드로 이동
  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !verificationCode[index] && index > 0) {
      const prevInput = document.querySelector(`input[data-index="${index - 1}"]`);
      if (prevInput) prevInput.focus();
    }
  };

  const handleSendVerificationCode = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!email) {
      setError('이메일 주소를 입력해주세요.');
      setLoading(false);
      return;
    }

    // 디버깅을 위한 로그
    console.log('🔍 API 호출 시작:', `${API_BASE_URL}/users/send-verification`);
    console.log('📧 전송할 이메일:', email);

    try {
      const response = await fetch(`${API_BASE_URL}/users/send-verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      console.log('📡 응답 상태:', response.status);
      console.log('📡 응답 헤더:', response.headers);

      const data = await response.json();
      console.log('📄 응답 데이터:', data);

      if (response.ok) {
        toast.success('인증 코드가 이메일로 발송되었습니다. 이메일을 확인해주세요.');
        setIsVerifying(true);
      } else {
        setError(data.message || '인증 코드 발송 중 오류가 발생했습니다.');
      }
    } catch (err) {
      console.error('❌ 인증 코드 발송 오류:', err);
      setError('인증 코드 발송 중 오류가 발생했습니다. 네트워크 연결을 확인해주세요.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // 6자리 코드를 문자열로 변환
    const codeString = verificationCode.join('');

    if (codeString.length !== 6) {
      setError('6자리 인증 코드를 모두 입력해주세요.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/users/verify-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, verificationCode: codeString }),
      });

      const data = await response.json();

      if (response.ok) {
        const { token, user: userData } = data;

        if (token && userData) {
          // 토큰을 받았으면 직접 저장하고 자동 로그인
          toast.success('이메일 인증이 완료되었습니다. 로그인 화면으로 이동합니다.');

          // 토큰을 AuthService에 저장
          AuthService.setAccessToken(token, false);

          // 사용자 정보를 AuthContext에 설정
          setUser(userData);
          setIsAuthenticated(true);

          // 대시보드로 이동
          setTimeout(() => {
            navigate('/dashboard');
          }, 2000);
        } else {
          // 토큰이 없으면 로그인 페이지로 이동
          toast.success('이메일 인증이 완료되었습니다. 로그인 페이지로 이동합니다.');
          setTimeout(() => {
            navigate('/login');
          }, 3000);
        }
      } else {
        setError(data.message || '인증 코드가 올바르지 않습니다.');
      }
    } catch (err) {
      console.error('이메일 인증 오류:', err);
      setError('이메일 인증 중 오류가 발생했습니다. 네트워크 연결을 확인해주세요.');
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

      {/* 오른쪽 이메일 인증 폼 섹션 */}
      <div className="flex w-1/2 justify-start items-center">
        <div className="w-[550px] h-[706px] bg-white rounded-r-3xl p-12 shadow-2xl border border-white/30">
          <div className="max-w-xs mx-auto py-12">
            {/* 헤더 */}
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-3">이메일 인증</h2>
              <p className="text-sm text-gray-600">이메일로 발송된 인증 코드를 입력해주세요</p>
            </div>

            {/* 회원가입 후 메시지 표시 */}
            {message && (
              <div className="mb-6 bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg text-sm">
                {message}
              </div>
            )}

            {/* 이메일 인증 폼 */}
            {!isVerifying ? (
              // 첫 번째 단계: 이메일 입력 및 인증 코드 발송
              <form onSubmit={handleSendVerificationCode} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    이메일 주소
                  </label>
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
                    {loading ? '전송 중...' : '인증 코드 발송'}
                  </div>
                </button>
              </form>
            ) : (
              // 두 번째 단계: 인증 코드 입력 및 확인
              <form onSubmit={handleVerifyCode} className="space-y-8">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">인증 코드</label>
                  <div className="flex justify-center space-x-3 mb-3">
                    {verificationCode.map((digit, index) => (
                      <input
                        key={index}
                        type="text"
                        data-index={index}
                        value={digit}
                        onChange={e => handleCodeChange(index, e.target.value)}
                        onKeyDown={e => handleKeyDown(index, e)}
                        onPaste={handlePaste}
                        maxLength={1}
                        className="w-12 h-12 text-center text-lg font-semibold border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
                        placeholder=""
                        required
                        inputMode="numeric"
                        pattern="[0-9]*"
                      />
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 text-center mb-2">
                    이메일로 발송된 6자리 인증 코드를 입력해주세요.
                  </p>
                  <p className="text-xs text-cyan-600 text-center">
                    💡 팁: 6자리 코드를 복사해서 아무 입력 필드에 붙여넣으면 자동으로 입력됩니다!
                  </p>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="Button w-full h-11 p-2.5 bg-gradient-to-r from-cyan-500 to-indigo-600 rounded-[10px] inline-flex justify-center items-center gap-2.5 hover:from-cyan-600 hover:to-indigo-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                >
                  <div className="PrimaryButton justify-start text-white text-sm font-normal font-['Nunito'] leading-normal">
                    {loading ? '인증 중...' : '이메일 인증'}
                  </div>
                </button>
              </form>
            )}

            {/* 이메일 다시 전송 버튼 */}
            <div className="text-center pt-6">
              <p className="text-sm text-gray-600 mb-4">이메일을 받지 못하셨나요?</p>
              <button
                type="button"
                onClick={handleSendVerificationCode}
                disabled={loading}
                className="w-full h-11 p-2.5 bg-gray-100 text-gray-700 rounded-[10px] inline-flex justify-center items-center gap-2.5 hover:bg-gray-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed border border-gray-300"
              >
                <div className="text-sm font-normal">
                  {loading ? '전송 중...' : '이메일 다시 전송'}
                </div>
              </button>
            </div>

            {/* 로그인 버튼 */}
            <div className="text-center pt-6">
              <p className="text-sm text-gray-600 mb-4">이미 계정이 있으신가요?</p>
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
