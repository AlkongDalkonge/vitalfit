import React from 'react';
import './StaffPage.css';

const StaffPage = () => {
  const staffData = [
    { id: 1, name: '김철수', position: '매니저', branch: '강남센터' },
    { id: 2, name: '이영희', position: '트레이너', branch: '서초센터' },
    { id: 3, name: '박민수', position: '트레이너', branch: '홍대센터' },
    { id: 4, name: '정수진', position: '매니저', branch: '강남센터' },
  ];

  return (
    <div className="staff-page">
      <h1>직원 관리</h1>
      <div className="staff-grid">
        {staffData.map((staff) => (
          <div key={staff.id} className="staff-card">
            <div className="staff-info">
              <div className="staff-avatar">
                {staff.name.charAt(0)}
              </div>
              <div>
                <h3>{staff.name}</h3>
                <p>{staff.position}</p>
              </div>
            </div>
            <p>소속: {staff.branch}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StaffPage; 