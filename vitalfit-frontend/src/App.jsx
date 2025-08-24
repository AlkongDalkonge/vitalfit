import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Layout from './components/layout/Layout';
import SignIn from './components/signIn';
import SignUp from './components/signUp';
import ResetPassword from './components/resetPassword';
import EmailVerification from './components/EmailVerification';
import ProtectedRoute from './components/ProtectedRoute';
import TokenRefreshNotification from './components/TokenRefreshNotification';

import DashboardPage from './pages/DashboardPage';
import CenterPage from './pages/CenterPage';
import UserPage from './pages/UserPage';
import MemberPage from './pages/MemberPage';
import MemberPTSessionPage from './pages/MemberPTSessionPage';
import UserPTSessionPage from './pages/UserPTSessionPage';
import SettlementPage from './pages/SettlementPage';
import PayPage from './pages/PayPage';
import PTSchedulePage from './pages/PTSchedulePage';
import PaymentHistoryPage from './pages/PaymentHistoryPage';
import PersonalInfoPage from './pages/PersonalInfoPage';
import AccountPage from './pages/AccountPage';
import NoticePage from './pages/NoticePage';
import NoticeDetailPage from './pages/NoticeDetailPage';
import MyWorkPage from './pages/MyWorkPage';
import MyHistoryPage from './pages/MyHistoryPage';
import ReportPage from './pages/ReportPage';
import AnalyticsReportPage from './pages/AnalyticsReportPage';
import PasswordChangePage from './pages/PasswordChangePage';
import EmailVerificationPage from './pages/EmailVerificationPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 레이아웃 없이 독립적으로 보여질 페이지들 */}
        <Route path="/login" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/verify-email" element={<EmailVerification />} />

      {/* 보호된 라우트 */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="centers" element={<CenterPage />} />
        <Route path="users" element={<UserPage />} />
        <Route path="user/:userId/pt-sessions" element={<UserPTSessionPage />} />
        <Route path="members" element={<MemberPage />} />
        <Route path="member/:id/pt-sessions" element={<MemberPTSessionPage />} />
        <Route path="settlement" element={<SettlementPage />} />
        <Route path="pay" element={<PayPage />} />
        <Route path="pt-schedule" element={<PTSchedulePage />} />
        <Route path="payment-history" element={<PaymentHistoryPage />} />
        <Route path="payment-history/:memberId" element={<PaymentHistoryPage />} />
        <Route path="personal-info" element={<PersonalInfoPage />} />
        <Route path="account" element={<AccountPage />} />
        <Route path="notices" element={<NoticePage />} />
        <Route path="notices/:id" element={<NoticeDetailPage />} />
        <Route path="notice/:id" element={<NoticeDetailPage />} />
        <Route path="my-work" element={<MyWorkPage />} />
        <Route path="my-history" element={<MyHistoryPage />} />
        <Route path="report" element={<ReportPage />} />
        <Route path="analytics" element={<AnalyticsReportPage />} />
        <Route path="password-change" element={<PasswordChangePage />} />
      </Route>
    </Routes>
    <ToastContainer position="top-center" autoClose={3000} />
  </BrowserRouter>
  );
}

export default App;
