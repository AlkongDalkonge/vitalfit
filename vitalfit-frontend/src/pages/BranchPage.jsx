import React from 'react';
import './BranchPage.css';

const BranchPage = () => {
  return (
    <div className="branch-page">
      <h1>지점 관리</h1>
      <div className="branch-list">
        <h2>지점 목록</h2>
        <div className="branch-item">
          <span>강남센터</span>
          <span>서울시 강남구</span>
        </div>
        <div className="branch-item">
          <span>서초센터</span>
          <span>서울시 서초구</span>
        </div>
        <div className="branch-item">
          <span>홍대센터</span>
          <span>서울시 마포구</span>
        </div>
      </div>
    </div>
  );
};

export default BranchPage; 