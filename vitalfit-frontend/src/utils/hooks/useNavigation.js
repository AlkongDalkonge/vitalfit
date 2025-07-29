import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getMenuFromPath, getPathFromMenu } from '../../router/routeUtils';

export const useNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeMenu, setActiveMenu] = useState(getMenuFromPath(location.pathname));

  // 경로 변경 시 활성 메뉴 업데이트
  useEffect(() => {
    setActiveMenu(getMenuFromPath(location.pathname));
  }, [location.pathname]);

  // 메뉴 클릭 시 라우팅 처리
  const handleMenuClick = (menuName) => {
    setActiveMenu(menuName);
    const path = getPathFromMenu(menuName);
    navigate(path);
  };

  // 로고 클릭 시 대시보드로 이동
  const handleLogoClick = () => {
    navigate('/');
  };

  return {
    activeMenu,
    handleMenuClick,
    handleLogoClick,
    currentPath: location.pathname
  };
}; 