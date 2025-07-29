/**
 * 메뉴별 SVG를 정확히 반영 (지점, 직원, 고객, 정산시스템, 알림/공지, 분석리포트, 내계정)
 * fill은 isActive에 따라 url(#menuGradient) 또는 #272525로 동적으로 적용
 */
import React from "react";
import "./Sidebar.css";
import { MENU_CONFIG } from "../../router/routeUtils";
import { useIcons } from "../../utils/hooks";

export default function Sidebar({ activeMenu = "직원", setActiveMenu, onLogoClick }) {
  const { getMenuIcon } = useIcons();

  return (
    <aside className="sidebar">
      {/* 로고 */}
      <div className="logo-area" onClick={onLogoClick} style={{ cursor: 'pointer' }}>
        <img src="/logo.png" alt="Logo" className="logo-image" />
        <div className="logo-text">
          <span className="title">UiUxOtor</span>
          <span className="subtitle">ERP System</span>
        </div>
      </div>

      {/* 메뉴 */}
      <nav className="menu">
        <ul>
          {MENU_CONFIG.map((item) => {
            const isActive = activeMenu === item.name;
            const IconComponent = getMenuIcon(item.name);
            return (
              <li
                key={item.name}
                className={`menu-item ${isActive ? "active" : ""}`}
                onClick={() => setActiveMenu && setActiveMenu(item.name)}
                style={{ cursor: "pointer" }}
              >
                <div className="menu-icon">
                  <IconComponent 
                    size={20} 
                    color={isActive ? "#11add6" : "#374151"}
                  />
                </div>
                <span>{item.name}</span>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
