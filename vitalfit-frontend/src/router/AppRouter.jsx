import { Routes, Route } from 'react-router-dom';

import SignIn from '../components/signIn';
import SignUp from '../components/signUp';
import ResetPassword from '../components/resetPassword';
import EmailVerification from '../components/EmailVerification';
import DashboardPage from '../pages/DashboardPage';
import CenterPage from '../pages/CenterPage';
import UserPage from '../pages/UserPage';
import MemberPage from '../pages/MemberPage';
import MemberPTSessionPage from '../pages/MemberPTSessionPage';
import PayPage from '../pages/PayPage';
import PaymentPage from '../pages/PaymentPage';
import PaymentHistoryPage from '../pages/PaymentHistoryPage';
import NoticePage from '../pages/NoticePage';
import NoticeDetailPage from '../pages/NoticeDetailPage';
import ReportPage from '../pages/ReportPage';
import AccountPage from '../pages/AccountPage';
import { ROUTES } from './routeUtils';

const AppRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<SignIn />} />
      <Route path="/login" element={<SignIn />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/verify-email" element={<EmailVerification />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/center" element={<CenterPage />} />
      <Route path="/user" element={<UserPage />} />
      <Route path="/member/:memberId/pt-sessions" element={<MemberPTSessionPage />} />
      <Route path="/member" element={<MemberPage />} />
      <Route path="/pay" element={<PayPage />} />
      <Route path="/payment" element={<PaymentPage />} />
      <Route path="/payment-history/:memberId" element={<PaymentHistoryPage />} />
      {/* 공지사항 목록 */}
      <Route path="/notice" element={<NoticePage />} />
      <Route path="/notice/:id" element={<NoticeDetailPage />} />
      <Route path="/report" element={<ReportPage />} />
      <Route path="/account" element={<AccountPage />} />
    </Routes>
  );
};

export default AppRouter;
