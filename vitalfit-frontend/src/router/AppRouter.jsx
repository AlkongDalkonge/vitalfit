import { Routes, Route } from 'react-router-dom';

import DashboardPage from '../pages/DashboardPage';
import CenterPage from '../pages/CenterPage';
import UserPage from '../pages/UserPage';
import MemberPage from '../pages/MemberPage';
import MemberPTSessionPage from '../pages/MemberPTSessionPage';
import PaymentPage from '../pages/PaymentPage';
import NoticePage from '../pages/NoticePage';
import NoticeDetailPage from '../pages/NoticeDetailPage';
import ReportPage from '../pages/ReportPage';
import AccountPage from '../pages/AccountPage';

const AppRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<DashboardPage />} />
      <Route path="/center" element={<CenterPage />} />
      <Route path="/user" element={<UserPage />} />
      <Route path="/member" element={<MemberPage />} />
      <Route path="/member/:memberId/pt-sessions" element={<MemberPTSessionPage />} />
      <Route path="/payment" element={<PaymentPage />} />
      {/* 공지사항 목록 */}
      <Route path="/notice" element={<NoticePage />} />
      <Route path="/notice/:id" element={<NoticeDetailPage />} />
      <Route path="/report" element={<ReportPage />} />
      <Route path="/account" element={<AccountPage />} />
    </Routes>
  );
};

export default AppRouter;
