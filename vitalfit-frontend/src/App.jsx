import { BrowserRouter, Routes, Route } from 'react-router-dom';
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
import SettlementPage from './pages/SettlementPage';
import PayPage from './pages/PayPage';
import PaymentHistoryPage from './pages/PaymentHistoryPage';
import PersonalInfoPage from './pages/PersonalInfoPage';
import AccountPage from './pages/AccountPage';
import NoticePage from './pages/NoticePage';
import NoticeDetailPage from './pages/NoticeDetailPage';
import MyWorkPage from './pages/MyWorkPage';
import MyHistoryPage from './pages/MyHistoryPage';
import ReportPage from './pages/ReportPage';
import PasswordChangePage from './pages/PasswordChangePage';
import EmailVerificationPage from './pages/EmailVerificationPage';

import { AuthProvider } from './contexts/AuthContext';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <TokenRefreshNotification />
        <Routes>
          {/* 공개 라우트 */}
          <Route path="/login" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/email-verification" element={<EmailVerification />} />
          <Route path="/email-verification-page" element={<EmailVerificationPage />} />

          {/* 보호된 라우트 */}
          <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route index element={<DashboardPage />} />
            <Route path="centers" element={<CenterPage />} />
            <Route path="users" element={<UserPage />} />
            <Route path="members" element={<MemberPage />} />
            <Route path="member/:id/pt-sessions" element={<MemberPTSessionPage />} />
            <Route path="settlement" element={<SettlementPage />} />
            <Route path="pay" element={<PayPage />} />
            <Route path="payment-history" element={<PaymentHistoryPage />} />
            <Route path="payment-history/:memberId" element={<PaymentHistoryPage />} />
            <Route path="personal-info" element={<PersonalInfoPage />} />
            <Route path="account" element={<AccountPage />} />
            <Route path="notices" element={<NoticePage />} />
            <Route path="notices/:id" element={<NoticeDetailPage />} />
            <Route path="my-work" element={<MyWorkPage />} />
            <Route path="my-history" element={<MyHistoryPage />} />
            <Route path="report" element={<ReportPage />} />
            <Route path="password-change" element={<PasswordChangePage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
