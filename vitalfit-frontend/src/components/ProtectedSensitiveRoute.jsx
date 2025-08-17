import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import PasswordConfirmModal from './PasswordConfirmModal';
import {
  needsSensitiveActionReAuth,
  setPageReAuthStatus,
  isPageReAuthValid,
} from '../utils/reAuthUtils';

const ProtectedSensitiveRoute = ({ children, pagePath }) => {
  const { user } = useAuth();
  const [isReAuthenticated, setIsReAuthenticated] = useState(false);
  const [showReAuthModal, setShowReAuthModal] = useState(false);

  // 페이지 진입 시 재인증 필요 여부 확인
  useEffect(() => {
    if (user && pagePath) {
      const userId = user.uid || user.id || user.userId;

      console.log('🔐 ProtectedSensitiveRoute - 재인증 상태 확인:', {
        userId,
        pagePath,
        isReAuthenticated,
        needsReAuth: needsSensitiveActionReAuth(userId, pagePath),
        isPageValid: isPageReAuthValid(userId, pagePath),
      });

      // 현재 페이지에 대한 재인증 상태 확인
      if (isPageReAuthValid(userId, pagePath)) {
        console.log('✅ ProtectedSensitiveRoute - 이미 재인증됨');
        setIsReAuthenticated(true);
        setShowReAuthModal(false);
      } else {
        // 계정 페이지에 대한 재인증이 있는지 확인 (하위 경로 접근을 위해)
        if (pagePath.startsWith('/account/') && isPageReAuthValid(userId, '/account')) {
          console.log('✅ 계정 페이지 재인증으로 하위 경로 접근 허용:', pagePath);
          setIsReAuthenticated(true);
          setShowReAuthModal(false);
        } else {
          console.log('🔐 ProtectedSensitiveRoute - 재인증 필요, 모달 표시');
          setIsReAuthenticated(false);
          setShowReAuthModal(true);
        }
      }
    }
  }, [user, pagePath]);

  // 재인증 성공 시 처리
  const handleReAuthSuccess = async result => {
    if (user && pagePath) {
      const userId = user.uid || user.id || user.userId;

      console.log('✅ ProtectedSensitiveRoute - 재인증 성공');

      // 페이지별 독립 재인증 상태 저장
      if (result.reAuthToken) {
        setPageReAuthStatus(userId, result.reAuthToken, pagePath);
        console.log('✅ 페이지별 재인증 토큰 저장됨:', pagePath);
      }

      setIsReAuthenticated(true);
      setShowReAuthModal(false);
    }
  };

  // 재인증 모달 닫기
  const handleReAuthModalClose = () => {
    setShowReAuthModal(false);
    // 재인증이 완료되지 않으면 계정 페이지로 돌아가기
    if (!isReAuthenticated) {
      console.log('🔙 재인증 없이 페이지 닫기 - 계정 페이지로 이동');
      window.history.back();
    }
  };

  // 사용자 정보가 없으면 로딩 표시
  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">사용자 정보를 불러오는 중...</h2>
          <p className="text-gray-600">잠시만 기다려주세요.</p>
        </div>
      </div>
    );
  }

  // 재인증이 완료되지 않았으면 모달만 표시
  if (!isReAuthenticated) {
    console.log('🔐 ProtectedSensitiveRoute - 재인증 모달 표시 상태:', {
      isReAuthenticated,
      showReAuthModal,
      user: !!user,
      userId: user?.uid || user?.id || user?.userId,
      pagePath,
    });

    return (
      <>
        {/* 재인증 모달 */}
        <PasswordConfirmModal
          isOpen={showReAuthModal}
          onClose={handleReAuthModalClose}
          onSuccess={handleReAuthSuccess}
          pagePath={pagePath}
        />
      </>
    );
  }

  // 재인증이 완료되었으면 자식 컴포넌트 렌더링
  return children;
};

export default ProtectedSensitiveRoute;
