import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';
import { useNavigation } from '../../utils/hooks';

export default function Layout() {
  const { activeMenu, handleMenuClick, handleLogoClick, userInfo } = useNavigation();
  const location = useLocation();
  const isDashboard = location.pathname === '/';

  return (
    <div className="flex h-screen bg-white overflow-hidden">
      <Sidebar
        activeMenu={activeMenu}
        setActiveMenu={handleMenuClick}
        onLogoClick={handleLogoClick}
      />
      <div className="flex-1 flex flex-col ml-60 h-screen relative">
        <Header
          activeMenu={activeMenu}
          userInfo={userInfo}
          className={
            isDashboard
              ? 'absolute top-0 left-0 right-0 z-10 bg-transparent border-transparent'
              : ''
          }
        />
        <main
          className={`flex-1 ${isDashboard ? '' : 'p-8'} ${isDashboard ? 'bg-transparent' : 'bg-white'} overflow-y-auto`}
        >
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  );
}
