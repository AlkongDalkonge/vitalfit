import { 
  FaBuilding, 
  FaUsers, 
  FaUserFriends, 
  FaCalculator, 
  FaBell, 
  FaChartBar, 
  FaUserCircle,
  FaTachometerAlt,
  FaChartLine,
  FaCalendarAlt
} from "react-icons/fa";

export const useIcons = () => {
  // 메뉴 아이콘 맵
  const menuIcons = {
    "지점": FaBuilding,
    "직원": FaUsers,
    "고객": FaUserFriends,
    "정산시스템": FaCalculator,
    "알림/공지": FaBell,
    "분석리포트": FaChartBar,
    "내계정": FaUserCircle,
  };

  // 대시보드 아이콘 맵
  const dashboardIcons = {
    "users": FaUsers,
    "building": FaBuilding,
    "userFriends": FaUserFriends,
    "chartLine": FaChartLine,
    "bell": FaBell,
    "calendar": FaCalendarAlt,
    "tachometer": FaTachometerAlt,
  };

  // 메뉴 아이콘 가져오기
  const getMenuIcon = (menuName) => {
    return menuIcons[menuName] || FaUsers;
  };

  // 대시보드 아이콘 가져오기
  const getDashboardIcon = (iconName) => {
    return dashboardIcons[iconName] || FaChartLine;
  };

  // 모든 아이콘 맵 가져오기
  const getAllIcons = () => {
    return {
      ...menuIcons,
      ...dashboardIcons
    };
  };

  return {
    menuIcons,
    dashboardIcons,
    getMenuIcon,
    getDashboardIcon,
    getAllIcons
  };
}; 