import React from 'react';
import { Routes, Route } from "react-router-dom";

// 페이지 컴포넌트들 import
import DashboardPage from "../pages/DashboardPage";
import BranchPage from "../pages/BranchPage";
import StaffPage from "../pages/StaffPage";
import CustomerPage from "../pages/CustomerPage";
import SettlementPage from "../pages/SettlementPage";
import NotificationPage from "../pages/NotificationPage";
import ReportPage from "../pages/ReportPage";
import AccountPage from "../pages/AccountPage";

const AppRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<DashboardPage />} />
      <Route path="/branch" element={<BranchPage />} />
      <Route path="/staff" element={<StaffPage />} />
      <Route path="/customer" element={<CustomerPage />} />
      <Route path="/settlement" element={<SettlementPage />} />
      <Route path="/notification" element={<NotificationPage />} />
      <Route path="/report" element={<ReportPage />} />
      <Route path="/account" element={<AccountPage />} />
    </Routes>
  );
};

export default AppRouter; 