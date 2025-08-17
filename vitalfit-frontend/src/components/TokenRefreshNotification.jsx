import React, { useState, useEffect } from 'react';

const TokenRefreshNotification = () => {
  const [showNotification, setShowNotification] = useState(false);
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    // 전역 함수로 등록하여 AuthService에서 호출할 수 있도록 함
    window.showRefreshFailureNotification = () => {
      setShowNotification(true);
      setCountdown(10);
    };

    return () => {
      delete window.showRefreshFailureNotification;
    };
  }, []);

  useEffect(() => {
    let timer;
    if (showNotification && countdown > 0) {
      timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
    } else if (countdown === 0) {
      setShowNotification(false);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [showNotification, countdown]);

  const handleLogin = () => {
    setShowNotification(false);
    window.location.href = '/login';
  };

  const handleDismiss = () => {
    setShowNotification(false);
  };

  if (!showNotification) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
        <div className="flex items-center mb-4">
          <div className="flex-shrink-0">
            <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-lg font-medium text-gray-900">세션 만료</h3>
          </div>
        </div>
        
        <div className="mb-4">
          <p className="text-sm text-gray-500">
            보안을 위해 세션이 만료되었습니다. 다시 로그인해주세요.
          </p>
          <p className="text-xs text-gray-400 mt-2">
            {countdown}초 후 자동으로 로그인 페이지로 이동합니다.
          </p>
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={handleLogin}
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            로그인하기
          </button>
          <button
            onClick={handleDismiss}
            className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};

export default TokenRefreshNotification;
