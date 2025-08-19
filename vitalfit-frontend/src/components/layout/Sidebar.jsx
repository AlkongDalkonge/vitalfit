import React from 'react';
import { MENU_CONFIG } from '../../router/routeUtils';
import { useIcons } from '../../utils/hooks';

export default function Sidebar({ activeMenu = null, setActiveMenu, onLogoClick }) {
  const { getMenuIcon } = useIcons();

  return (
    <aside className="w-60 bg-white border-r border-gray-200 h-screen flex flex-col fixed left-0 top-0">
      {/* 로고 */}
      <div
        className="p-16 flex flex-col items-center justify-center gap-3 bg-white h-48 box-border cursor-pointer"
        onClick={onLogoClick}
      >
        <img src="/logo.png" alt="Logo" className="w-16 h-16" />
        <div className="flex flex-col items-center text-center">
          <span className="text-base font-bold text-gray-800 leading-tight">VitalFit</span>
          <span className="text-xs text-gray-500 leading-tight">ERP System</span>
        </div>
      </div>

      {/* 메뉴 */}
      <nav className="flex-1 pb-6 overflow-y-auto">
        <ul className="list-none p-0 m-0">
          {MENU_CONFIG.map(item => {
            const isActive = activeMenu === item.name;
            const IconComponent = getMenuIcon(item.name);
            return (
              <li
                key={item.name}
                className={`flex items-center px-6 py-3 gap-3 text-gray-700 text-sm font-medium transition-all duration-300 ease-in-out mb-3 relative cursor-pointer hover:bg-gradient-to-r hover:from-blue-50/80 hover:to-cyan-50/80 hover:text-gray-800 hover:translate-x-0.5 ${
                  isActive
                    ? 'border-gradient-left font-semibold'
                    : ''
                }`}
                onClick={() => setActiveMenu(item.name)}
              >
                <div
                  className={`flex items-center justify-center w-4 h-4 transition-all duration-300 ease-in-out ${
                    isActive ? 'scale-110' : 'hover:scale-105'
                  }`}
                >
                  <div
                    className={`transition-all duration-300 ease-in-out ${
                      isActive 
                        ? 'bg-gradient-to-r from-blue-500 to-blue-400 p-0.5 rounded' 
                        : 'hover:bg-gradient-to-r hover:from-blue-400/60 hover:to-cyan-400/60 hover:p-0.5 hover:rounded'
                    }`}
                  >
                    <IconComponent 
                      size={14} 
                      color={isActive ? '#ffffff' : '#374151'} 
                      className="transition-all duration-300 ease-in-out"
                    />
                  </div>
                </div>
                <span
                  className={`transition-all duration-300 ease-in-out ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent'
                      : 'hover:bg-gradient-to-r hover:from-blue-600/70 hover:to-cyan-600/70 hover:bg-clip-text hover:text-transparent'
                  }`}
                >
                  {item.name}
                </span>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
