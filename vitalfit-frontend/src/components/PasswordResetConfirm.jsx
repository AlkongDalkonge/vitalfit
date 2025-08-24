import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';

export default function PasswordResetConfirm() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [resetCode, setResetCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // URL에서 이메일 파라미터 가져오기
  const email = searchParams.get('email');

  useEffect(() => {
    if (!email) {
      toast.error('이메일 정보가 없습니다. 비밀번호 재설정을 다시 요청해주세요.');
      navigate('/reset-password');
    }
  }, [email, navigate]);

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // 입력값 검증
    if (!resetCode || resetCode.length !== 6) {
      setError('6자리 인증 코드를 입력해주세요.');
      setLoading(false);
      return;
    }

    try {
      // 6자리 코드만으로 비밀번호 재설정 확인
      const response = await fetch('/api/users/confirm-password-reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resetCode,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('비밀번호가 성공적으로 재설정되었습니다. 로그인해주세요.');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setError(data.message || '비밀번호 재설정에 실패했습니다.');
      }
    } catch (err) {
      console.error('비밀번호 재설정 오류:', err);
      setError('비밀번호 재설정 중 오류가 발생했습니다. 네트워크 연결을 확인해주세요.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!email) return;

    setLoading(true);
    try {
      const response = await fetch('/api/users/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('인증 코드가 다시 발송되었습니다. 이메일을 확인해주세요.');
      } else {
        toast.error(data.message || '인증 코드 재발송에 실패했습니다.');
      }
    } catch (err) {
      toast.error('인증 코드 재발송 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  if (!email) {
    return null;
  }

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-cyan-500 to-indigo-800">
      {/* 왼쪽 박스 섹션 */}
      <div className="flex w-1/2 justify-end items-center">
        <div className="w-[550px] h-[706px] bg-white/20 backdrop-blur-sm rounded-l-3xl shadow-2xl border border-white/30 overflow-hidden">
          <img
            src="/img/infovitalfit.png"
            alt="Main Image"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* 오른쪽 비밀번호 재설정 확인 폼 섹션 */}
      <div className="flex w-1/2 justify-start items-center">
        <div className="w-[550px] h-[706px] bg-white rounded-r-3xl p-12 shadow-2xl border border-white/30">
          <div className="max-w-xs mx-auto py-12">
            {/* 헤더 */}
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-3">비밀번호 재설정</h2>
              <p className="text-sm text-gray-600">이메일로 받은 6자리 코드를 입력해주세요</p>
              <p className="text-xs text-gray-500 mt-2">{email}</p>
            </div>

            {/* 비밀번호 재설정 확인 폼 */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 인증 코드 입력 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  인증 코드 (6자리)
                </label>
                <input
                  type="text"
                  value={resetCode}
                  onChange={e => setResetCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  maxLength={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-colors text-center text-lg font-mono tracking-widest"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  이메일로 발송된 6자리 숫자 코드를 입력하세요
                </p>
              </div>

              {/* 에러 메시지 */}
              {error && (
                <div className="text-red-600 text-sm text-center bg-red-50 p-3 rounded-lg">
                  {error}
                </div>
              )}

              {/* 제출 버튼 */}
              <button
                type="submit"
                disabled={loading}
                className="Button w-full h-11 p-2.5 bg-gradient-to-r from-cyan-500 to-indigo-600 rounded-[10px] inline-flex justify-center items-center gap-2.5 hover:from-cyan-600 hover:to-indigo-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                <div className="PrimaryButton justify-start text-white text-sm font-normal font-['Nunito'] leading-normal">
                  {loading ? '처리 중...' : '비밀번호 재설정'}
                </div>
              </button>
            </form>

            {/* 인증 코드 재발송 */}
            <div className="text-center mt-6">
              <button
                type="button"
                onClick={handleResendCode}
                disabled={loading}
                className="text-sm text-cyan-600 hover:text-cyan-700 underline disabled:opacity-50"
              >
                인증 코드를 받지 못하셨나요? 다시 발송
              </button>
            </div>

            {/* 로그인으로 돌아가기 */}
            <div className="text-center mt-8">
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="text-sm text-gray-600 hover:text-gray-700 underline"
              >
                로그인으로 돌아가기
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
