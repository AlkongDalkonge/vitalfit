import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

const EmailVerificationModal = ({ isOpen, onClose, email, onVerificationSuccess }) => {
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleInputChange = e => {
    const { value } = e.target;
    // 숫자만 입력 가능하도록 제한
    if (/^\d*$/.test(value) && value.length <= 6) {
      setVerificationCode(value);
      setError('');
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();

    if (!verificationCode || verificationCode.length !== 6) {
      setError('6자리 인증 코드를 입력해주세요.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:3001/api/users/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          verificationCode,
        }),
      });

      if (response.ok) {
        toast.success('이메일 인증이 완료되었습니다!');
        onVerificationSuccess();
        onClose();
      } else {
        const errorData = await response.json();
        setError(errorData.message || '인증 코드가 올바르지 않습니다.');
      }
    } catch (error) {
      console.error('이메일 인증 오류:', error);
      setError('인증 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setIsResending(true);
    setError('');

    try {
      const response = await fetch('http://localhost:3001/api/users/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        toast.success('인증 코드가 재전송되었습니다.');
        setCountdown(60); // 60초 대기
      } else {
        const errorData = await response.json();
        setError(errorData.message || '인증 코드 재전송에 실패했습니다.');
      }
    } catch (error) {
      console.error('인증 코드 재전송 오류:', error);
      setError('인증 코드 재전송 중 오류가 발생했습니다.');
    } finally {
      setIsResending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h2 className="text-xl font-bold text-gray-800 mb-4">이메일 인증</h2>

        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-blue-800 text-sm">
            <strong>{email}</strong>로 전송된 6자리 인증 코드를 입력해주세요.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">인증 코드</label>
            <input
              type="text"
              value={verificationCode}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 text-center text-lg tracking-widest"
              placeholder="000000"
              maxLength={6}
              required
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          <div className="flex justify-center">
            <button
              type="button"
              onClick={handleResendCode}
              disabled={isResending || countdown > 0}
              className="text-sm text-cyan-600 hover:text-cyan-700 disabled:text-gray-400 disabled:cursor-not-allowed"
            >
              {isResending
                ? '전송 중...'
                : countdown > 0
                  ? `${countdown}초 후 재전송 가능`
                  : '인증 코드 재전송'}
            </button>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700 disabled:opacity-50"
            >
              {isLoading ? '인증 중...' : '인증하기'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmailVerificationModal;
