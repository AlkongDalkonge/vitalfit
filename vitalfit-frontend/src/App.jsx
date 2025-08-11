import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import SignIn from './components/signIn';
import SignUp from './components/signUp';
import ResetPassword from './components/resetPassword';
import DashboardPage from './pages/DashboardPage';
import CenterPage from './pages/CenterPage';
import UserPage from './pages/UserPage';
import MemberPage from './pages/MemberPage';
import MemberPTSessionPage from './pages/MemberPTSessionPage';
import PaymentPage from './pages/PaymentPage';
import NoticePage from './pages/NoticePage';
import NoticeDetailPage from './pages/NoticeDetailPage';
import ReportPage from './pages/ReportPage';
import AccountPage from './pages/AccountPage';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 레이아웃 없이 독립적으로 보여질 페이지들 */}
        <Route path="/" element={<SignIn />} />
        <Route path="/login" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* 레이아웃이 적용될 페이지들 */}
        <Route path="/dashboard/*" element={<Layout />}>
          <Route index element={<DashboardPage />} />
        </Route>
        <Route path="/center/*" element={<Layout />}>
          <Route index element={<CenterPage />} />
        </Route>
        <Route path="/user/*" element={<Layout />}>
          <Route index element={<UserPage />} />
        </Route>
        <Route path="/member/*" element={<Layout />}>
          <Route index element={<MemberPage />} />
          <Route path=":memberId/pt-sessions" element={<MemberPTSessionPage />} />
        </Route>
        <Route path="/payment/*" element={<Layout />}>
          <Route index element={<PaymentPage />} />
        </Route>
        <Route path="/notice/*" element={<Layout />}>
          <Route index element={<NoticePage />} />
          <Route path=":id" element={<NoticeDetailPage />} />
        </Route>
        <Route path="/report/*" element={<Layout />}>
          <Route index element={<ReportPage />} />
        </Route>
        <Route path="/account/*" element={<Layout />}>
          <Route index element={<AccountPage />} />
        </Route>
      </Routes>
      <ToastContainer position="top-center" autoClose={3000} />
    </BrowserRouter>
  );
}
