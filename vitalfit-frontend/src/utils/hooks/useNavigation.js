import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getMenuFromPath, getPathFromMenu } from "../../router/routeUtils";

export const useNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeMenu, setActiveMenu] = useState(
    getMenuFromPath(location.pathname)
  );

  // 경로 변경 시 활성 메뉴 업데이트 (대시보드 제외)
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
    setActiveMenu(null); // 대시보드로 이동 시 메뉴 활성화 해제
    navigate("/");
  };

  // 사용자 정보 (실제로는 API에서 가져와야 함)
  const userInfo = {
    name: "김관리",
    role: "관리자",
  };

  return {
    activeMenu,
    handleMenuClick,
    handleLogoClick,
    currentPath: location.pathname,
    userInfo,
  };
};
