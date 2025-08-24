import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';
import AuthService from '../utils/auth';

const PasswordConfirmModal = ({ isOpen, onClose, onCancel, onSuccess, pagePath = null }) => {
  const { user } = useAuth();
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [hasShownToast, setHasShownToast] = useState(false); // 토스트 중복 방지
  const [isSuccess, setIsSuccess] = useState(false); // 성공 상태 추가
  const completedRef = useRef(false); // 이벤트 중복 방지를 위한 ref
  const successProcessedRef = useRef(false); // 성공 처리 완료 여부

  useEffect(() => {
    if (isOpen) {
      setPassword('');
      setError('');
      setHasShownToast(false); // 모달이 열릴 때마다 토스트 상태 초기화
      setIsSuccess(false); // 성공 상태 초기화
      completedRef.current = false; // 완료 상태 초기화
      successProcessedRef.current = false; // 성공 처리 완료 상태 초기화
    }
  }, [isOpen]);

  // 모달 닫기 핸들러 - 성공 여부에 따라 다른 동작
  const handleClose = () => {
    // 이미 완료된 경우 중복 실행 방지
    if (completedRef.current) {
      return;
    }

    completedRef.current = true; // 완료 상태 설정

    if (isSuccess && successProcessedRef.current) {
      // 성공 시에는 onClose만 호출 (isAuthenticated 영향 없음)
      onClose();
    } else {
      // 취소 시에는 onCancel + onClose 호출
      if (onCancel) {
        onCancel();
      }
      onClose();
    }
  };

  // 취소 버튼 핸들러
  const handleCancel = () => {
    // 이미 완료된 경우 중복 실행 방지
    if (completedRef.current) {
      return;
    }

    completedRef.current = true; // 완료 상태 설정
    setIsSuccess(false); // 취소 상태 명시적 설정
    successProcessedRef.current = false; // 성공 처리 완료 상태 해제

    if (onCancel) {
      onCancel();
    }
    onClose();
  };

  // 성공 처리 완료 후 모달 닫기 (비동기 안전)
  const handleSuccessClose = () => {
    // 성공 상태가 확실히 설정된 후에만 닫기
    if (isSuccess && successProcessedRef.current) {
      handleClose();
    } else {
      // 상태가 설정될 때까지 잠시 대기
      setTimeout(() => {
        if (isSuccess && successProcessedRef.current) {
          handleClose();
        } else {
          // 강제로 닫기
          completedRef.current = true;
          onClose();
        }
      }, 200);
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();

    if (!password.trim()) {
      setError('비밀번호를 입력해주세요.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // 네트워크 상태 확인
      if (!navigator.onLine) {
        setError('인터넷 연결을 확인해주세요.');
        return;
      }

      // AuthService를 사용하여 토큰 가져오기
      const token = AuthService.getAccessToken();

      if (!token) {
        setError('인증 토큰이 없습니다. 다시 로그인해주세요.');
        return;
      }

      // 사용자 ID를 여러 방법으로 시도
      const userId = user?.uid || user?.id || user?.userId;

      // 먼저 간단한 연결 테스트
      try {
        const testResponse = await fetch('http://localhost:3001/api/users/me', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          credentials: 'include',
        });
      } catch (testError) {
        setError('서버에 연결할 수 없습니다. 백엔드 서버가 실행 중인지 확인해주세요.');
        return;
      }

      const response = await fetch('http://localhost:3001/api/users/verify-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ password }),
        credentials: 'include', // HTTP-only 쿠키 포함
      });

      if (response.ok) {
        const result = await response.json();

        // 재인증 토큰 저장 (페이지 경로 포함)
        if (result.reAuthToken && user) {
          const userId = user.uid || user.id || user.userId;
          if (userId) {
            const { setPageReAuthStatus } = await import('../utils/reAuthUtils');

            // 계정 페이지에 대한 재인증인 경우, 하위 경로들도 자동으로 접근 가능하도록 설정
            if (pagePath === '/account' || pagePath?.startsWith('/account/')) {
              // 계정 페이지 전체에 대한 재인증 상태 저장
              setPageReAuthStatus(userId, result.reAuthToken, '/account');
            } else {
              // 기존 로직: 특정 페이지에 대한 재인증 상태 저장
              setPageReAuthStatus(userId, result.reAuthToken, pagePath);
            }
          }
        }

        // 1. 먼저 성공 상태 설정
        setIsSuccess(true);
        successProcessedRef.current = true; // 성공 처리 완료 상태 설정

        // 2. 재인증 성공 시 콜백 실행
        if (onSuccess) {
          try {
            const successResult = await onSuccess(result); // await로 완료 보장
          } catch (error) {
            setIsSuccess(false); // 에러 시 실패 상태로 설정
            successProcessedRef.current = false;
          }
        }

        // 3. 토스트 메시지는 한 번만 표시
        if (!hasShownToast) {
          // 페이지별로 다른 메시지 표시
          let message = '재인증이 완료되었습니다.';
          if (pagePath === '/account') {
            message = '본인 확인 되었습니다.';
          } else if (pagePath === '/account/password-change') {
            message = '본인 확인 되었습니다.';
          }
          toast.success(message);
          setHasShownToast(true);
        }

        // 4. 성공 처리 완료 후 모달 닫기 (비동기 안전)
        handleSuccessClose();
      } else {
        const errorData = await response.json();
        setError(errorData.message || '비밀번호가 일치하지 않습니다.');
      }
    } catch (error) {
      // 더 구체적인 에러 메시지 제공
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        setError('서버에 연결할 수 없습니다. 백엔드 서버가 실행 중인지 확인해주세요.');
      } else if (error.name === 'TypeError' && error.message.includes('JSON')) {
        setError('서버 응답을 처리할 수 없습니다.');
      } else if (error.message.includes('Failed to fetch')) {
        setError('서버에 연결할 수 없습니다. 네트워크 연결과 백엔드 서버 상태를 확인해주세요.');
      } else {
        setError(`재인증 중 오류가 발생했습니다: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="text-center mb-6">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
            <span className="text-2xl">🔒</span>
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">보안 확인</h2>
          <p className="text-gray-600">계정 정보에 접근하려면 비밀번호를 다시 입력해주세요</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">비밀번호</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-12 transition-colors"
                placeholder="비밀번호를 입력하세요"
                required
                autoFocus
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

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex">
                <div className="flex-shrink-0">
                  <span className="text-red-400 text-lg">❌</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              </div>
            </div>
          )}

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={handleCancel} // handleCancel 사용
              disabled={isLoading}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              확인
            </button>
          </div>
        </form>

        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <div className="flex">
            <div className="flex-shrink-0">
              <span className="text-blue-400 text-lg">ℹ️</span>
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-800">
                <strong>보안을 위해</strong> 민감한 정보에 접근할 때는 비밀번호 재확인이 필요합니다.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PasswordConfirmModal;
