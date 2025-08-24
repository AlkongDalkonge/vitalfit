import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// API 기본 URL 설정
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

export default function ResetPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasSent, setHasSent] = useState(false);

  const navigate = useNavigate();

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
      console.log('🔄 비밀번호 재설정 요청:', email);

      const response = await fetch(`${API_BASE_URL}/api/users/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      console.log('📡 API 응답 상태:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('✅ 비밀번호 재설정 성공:', data);
        setSuccess('임시 비밀번호가 이메일로 발송되었습니다. 이메일을 확인해주세요.');
        setHasSent(true);
      } else {
        const errorData = await response
          .json()
          .catch(() => ({ message: '알 수 없는 오류가 발생했습니다.' }));
        console.error('❌ 비밀번호 재설정 실패:', errorData);
        setError(errorData.message || '비밀번호 재설정 중 오류가 발생했습니다.');
      }
    } catch (err) {
      console.error('❌ 비밀번호 재설정 네트워크 오류:', err);
      setError('비밀번호 재설정 중 오류가 발생했습니다. 네트워크 연결을 확인해주세요.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = () => {
    navigate('/login');
  };

  const handleResend = () => {
    setSuccess('');
    setHasSent(false);
    setEmail(''); // 이메일 입력 필드 초기화
  };

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

      {/* 오른쪽 비밀번호 재설정 폼 섹션 */}
      <div className="flex w-1/2 justify-start items-center">
        <div className="w-[550px] h-[706px] bg-white rounded-r-3xl p-12 shadow-2xl border border-white/30">
          <div className="max-w-xs mx-auto py-12">
            {/* 헤더 */}
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-3">비밀번호 재설정</h2>
              <p className="text-sm text-gray-600">
                이메일 주소를 입력하시면 임시 비밀번호를 보내드립니다
              </p>
            </div>

            {/* 비밀번호 재설정 폼 */}
            <form onSubmit={handleSubmit} className="space-y-8">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">이메일 주소</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Enter email address"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-colors"
                  required
                  disabled={hasSent} // 이미 전송된 경우 비활성화
                />
              </div>

              <button
                type="submit"
                disabled={loading || hasSent}
                className="Button w-full h-11 p-2.5 bg-gradient-to-r from-cyan-500 to-indigo-600 rounded-[10px] inline-flex justify-center items-center gap-2.5 hover:from-cyan-600 hover:to-indigo-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                <div className="PrimaryButton justify-start text-white text-sm font-normal font-['Nunito'] leading-normal">
                  {loading ? '전송 중...' : hasSent ? '전송 완료' : '임시 비밀번호 전송'}
                </div>
              </button>

              {/* 재전송 버튼 - 이미 전송된 경우에만 표시 */}
              {hasSent && (
                <button
                  type="button"
                  onClick={handleResend}
                  className="Button w-full h-11 p-2.5 bg-gradient-to-r from-gray-500 to-gray-600 rounded-[10px] inline-flex justify-center items-center gap-2.5 hover:from-gray-600 hover:to-gray-700 transition-all duration-200 shadow-lg"
                >
                  <div className="PrimaryButton justify-start text-white text-sm font-normal font-['Nunito'] leading-normal">
                    다시 보내기
                  </div>
                </button>
              )}

              <div className="text-center pt-4">
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
              <div className="mt-8 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-xs">
                {error}
              </div>
            )}

            {/* 성공 메시지 */}
            {success && (
              <div className="mt-8 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-xs">
                {success}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
