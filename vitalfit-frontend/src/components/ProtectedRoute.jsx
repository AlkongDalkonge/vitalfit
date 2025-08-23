import { Navigate, useLocation } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading, user, handleNavigation } = useAuth();
  const location = useLocation();
  const prevPathRef = useRef(location.pathname);

  // 페이지 이동 시 재인증 상태 처리 (경로가 변경될 때만)
  useEffect(() => {
    if (isAuthenticated && user && prevPathRef.current !== location.pathname) {
      handleNavigation(user.id);
      prevPathRef.current = location.pathname;
    }
  }, [location.pathname, isAuthenticated, user, handleNavigation]);

  // 로딩 중일 때는 로딩 화면 표시
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // 인증되지 않은 경우 로그인 페이지로 리다이렉트
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 인증된 경우 자식 컴포넌트 렌더링
  return children;
};

export default ProtectedRoute;
