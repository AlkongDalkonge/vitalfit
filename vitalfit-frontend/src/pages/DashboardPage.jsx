import React from 'react';
import './DashboardPage.css';
import { 
  FaUsers, 
  FaBuilding, 
  FaUserFriends, 
  FaChartLine,
  FaBell,
  FaCalendarAlt
} from "react-icons/fa";

const DashboardPage = () => {
  const stats = [
    { 
      title: '총 직원 수', 
      value: '24명', 
      icon: FaUsers, 
      color: '#3b82f6',
      change: '+2명',
      changeType: 'increase'
    },
    { 
      title: '총 지점 수', 
      value: '8개', 
      icon: FaBuilding, 
      color: '#10b981',
      change: '+1개',
      changeType: 'increase'
    },
    { 
      title: '총 고객 수', 
      value: '1,234명', 
      icon: FaUserFriends, 
      color: '#f59e0b',
      change: '+45명',
      changeType: 'increase'
    },
    { 
      title: '이번 달 매출', 
      value: '₩45,678,000', 
      icon: FaChartLine, 
      color: '#ef4444',
      change: '+12%',
      changeType: 'increase'
    }
  ];

  const recentActivities = [
    { id: 1, message: '김철수 직원이 강남센터에 배정되었습니다.', time: '10분 전', type: 'staff' },
    { id: 2, message: '새로운 고객 5명이 등록되었습니다.', time: '30분 전', type: 'customer' },
    { id: 3, message: '서초센터 매출이 목표를 달성했습니다.', time: '1시간 전', type: 'sales' },
    { id: 4, message: '홍대센터에서 새로운 공지사항이 등록되었습니다.', time: '2시간 전', type: 'notice' },
    { id: 5, message: '월간 리포트가 생성되었습니다.', time: '3시간 전', type: 'report' }
  ];

  return (
    <div className="dashboard-page">
      <h1>대시보드</h1>
      
      {/* 통계 카드 */}
      <div className="stats-grid">
        {stats.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <div key={index} className="stat-card">
              <div className="stat-header">
                <div className="stat-icon" style={{ backgroundColor: stat.color }}>
                  <IconComponent size={20} color="white" />
                </div>
                <div className="stat-change">
                  <span className={`change-value ${stat.changeType}`}>
                    {stat.change}
                  </span>
                </div>
              </div>
              <div className="stat-content">
                <h3 className="stat-title">{stat.title}</h3>
                <p className="stat-value">{stat.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* 최근 활동 */}
      <div className="dashboard-section">
        <div className="section-header">
          <h2>최근 활동</h2>
          <FaBell size={16} color="#6b7280" />
        </div>
        <div className="activity-list">
          {recentActivities.map((activity) => (
            <div key={activity.id} className="activity-item">
              <div className="activity-content">
                <p className="activity-message">{activity.message}</p>
                <span className="activity-time">{activity.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 빠른 액션 */}
      <div className="dashboard-section">
        <div className="section-header">
          <h2>빠른 액션</h2>
          <FaCalendarAlt size={16} color="#6b7280" />
        </div>
        <div className="quick-actions">
          <button className="action-btn primary">새 직원 등록</button>
          <button className="action-btn secondary">고객 추가</button>
          <button className="action-btn secondary">공지사항 작성</button>
          <button className="action-btn secondary">리포트 생성</button>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage; 