import { Routes, Route } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';
import DashboardPage from '../../pages/DashboardPage';
import CenterPage from '../../pages/CenterPage';
import UserPage from '../../pages/UserPage';
import MemberPage from '../../pages/MemberPage';
import MemberPTSessionPage from '../../pages/MemberPTSessionPage';
import PaymentPage from '../../pages/PaymentPage';
import NoticePage from '../../pages/NoticePage';
import NoticeDetailPage from '../../pages/NoticeDetailPage';
import ReportPage from '../../pages/ReportPage';
import AccountPage from '../../pages/AccountPage';
import { useNavigation } from '../../utils/hooks';

export default function Layout() {
  const { activeMenu, handleMenuClick, handleLogoClick, userInfo } = useNavigation();

  return (
    <div className="flex h-screen bg-white overflow-hidden">
      <Sidebar
        activeMenu={activeMenu}
        setActiveMenu={handleMenuClick}
        onLogoClick={handleLogoClick}
      />
      <div className="flex-1 flex flex-col ml-60 h-screen">
        <Header activeMenu={activeMenu} userInfo={userInfo} />
        <main className="flex-1 p-8 bg-white overflow-y-auto">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/center" element={<CenterPage />} />
            <Route path="/user" element={<UserPage />} />
            <Route path="/member" element={<MemberPage />} />
            <Route path="/member/:memberId/pt-sessions" element={<MemberPTSessionPage />} />
            <Route path="/payment" element={<PaymentPage />} />
            <Route path="/notice" element={<NoticePage />} />
            <Route path="/notice/:id" element={<NoticeDetailPage />} />
            <Route path="/report" element={<ReportPage />} />
            <Route path="/account" element={<AccountPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </div>
  );
}
