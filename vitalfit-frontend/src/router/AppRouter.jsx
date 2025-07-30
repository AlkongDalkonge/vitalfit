import React from "react";
import { Routes, Route } from "react-router-dom";

import DashboardPage from "../pages/DashboardPage";
import CenterPage from "../pages/CenterPage";
import UserPage from "../pages/UserPage";
import MemberPage from "../pages/MemberPage";
import PaymentPage from "../pages/PaymentPage";
import NoticePage from "../pages/NoticePage";
import ReportPage from "../pages/ReportPage";
import AccountPage from "../pages/AccountPage";

const AppRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<DashboardPage />} />
      <Route path="/center" element={<CenterPage />} />
      <Route path="/user" element={<UserPage />} />
      <Route path="/member" element={<MemberPage />} />
      <Route path="/payment" element={<PaymentPage />} />
      <Route path="/notice" element={<NoticePage />} />
      <Route path="/report" element={<ReportPage />} />
      <Route path="/account" element={<AccountPage />} />
    </Routes>
  );
};

export default AppRouter;
