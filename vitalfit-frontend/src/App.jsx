import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import SignIn from './components/signIn';
import SignUp from './components/signUp';
import ResetPassword from './components/resetPassword';
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
        <Route path="/dashboard/*" element={<Layout />} />
        <Route path="/center/*" element={<Layout />} />
        <Route path="/user/*" element={<Layout />} />
        <Route path="/member/*" element={<Layout />} />
        <Route path="/payment/*" element={<Layout />} />
        <Route path="/notice/*" element={<Layout />} />
        <Route path="/report/*" element={<Layout />} />
        <Route path="/account/*" element={<Layout />} />
      </Routes>
      <ToastContainer position="top-center" autoClose={3000} />
    </BrowserRouter>
  );
}
