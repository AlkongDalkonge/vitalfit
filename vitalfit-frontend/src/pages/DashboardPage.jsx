import React from 'react';
import {
  FaUsers,
  FaBuilding,
  FaUserFriends,
  FaChartLine,
  FaBell,
  FaCalendarAlt,
} from 'react-icons/fa';

const DashboardPage = () => {
  const stats = [
    {
      title: '총 직원 수',
      value: '24명',
      icon: FaUsers,
      color: '#3b82f6',
      change: '+2명',
      changeType: 'increase',
    },
    {
      title: '총 지점 수',
      value: '8개',
      icon: FaBuilding,
      color: '#10b981',
      change: '+1개',
      changeType: 'increase',
    },
    {
      title: '총 고객 수',
      value: '1,234명',
      icon: FaUserFriends,
      color: '#f59e0b',
      change: '+45명',
      changeType: 'increase',
    },
    {
      title: '이번 달 매출',
      value: '₩45,678,000',
      icon: FaChartLine,
      color: '#ef4444',
      change: '+12%',
      changeType: 'increase',
    },
  ];

  const recentActivities = [
    {
      id: 1,
      message: '김철수 직원이 강남센터에 배정되었습니다.',
      time: '10분 전',
      type: 'staff',
    },
    {
      id: 2,
      message: '새로운 고객 5명이 등록되었습니다.',
      time: '30분 전',
      type: 'customer',
    },
    {
      id: 3,
      message: '서초센터 매출이 목표를 달성했습니다.',
      time: '1시간 전',
      type: 'sales',
    },
    {
      id: 4,
      message: '홍대센터에서 새로운 공지사항이 등록되었습니다.',
      time: '2시간 전',
      type: 'notice',
    },
    {
      id: 5,
      message: '월간 리포트가 생성되었습니다.',
      time: '3시간 전',
      type: 'report',
    },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">대시보드</h1>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <div
              key={index}
              className="bg-white rounded-xl p-6 shadow-sm hover:-translate-y-0.5 hover:shadow-md transition-all duration-200"
            >
              <div className="flex justify-between items-center mb-4">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: stat.color }}
                >
                  <IconComponent size={20} color="white" />
                </div>
                <div className="flex items-center">
                  <span
                    className={`text-sm font-semibold px-2 py-1 rounded-md ${
                      stat.changeType === 'increase'
                        ? 'text-green-600 bg-green-100'
                        : 'text-red-600 bg-red-100'
                    }`}
                  >
                    {stat.change}
                  </span>
                </div>
              </div>
              <div className="text-left">
                <h3 className="text-sm text-gray-500 mb-2 font-medium">{stat.title}</h3>
                <p className="text-2xl font-bold text-gray-800 m-0">{stat.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* 최근 활동 */}
      <div className="bg-white rounded-xl p-6 mb-6 shadow-sm">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-xl font-semibold text-gray-800 m-0">최근 활동</h2>
          <FaBell size={16} color="#6b7280" />
        </div>
        <div className="flex flex-col gap-3">
          {recentActivities.map(activity => (
            <div
              key={activity.id}
              className="p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors duration-200"
            >
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-700 m-0 flex-1">{activity.message}</p>
                <span className="text-xs text-gray-400 ml-4">{activity.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 빠른 액션 */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-xl font-semibold text-gray-800 m-0">빠른 액션</h2>
          <FaCalendarAlt size={16} color="#6b7280" />
        </div>
        <div className="flex gap-3 flex-wrap">
          <button className="px-5 py-3 rounded-lg text-sm font-medium bg-cyan-500 text-white border-none cursor-pointer transition-all duration-200 hover:bg-cyan-600 hover:-translate-y-0.5">
            새 직원 등록
          </button>
          <button className="px-5 py-3 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 border border-gray-200 cursor-pointer transition-all duration-200 hover:bg-gray-200 hover:-translate-y-0.5">
            지점 추가
          </button>
          <button className="px-5 py-3 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 border border-gray-200 cursor-pointer transition-all duration-200 hover:bg-gray-200 hover:-translate-y-0.5">
            매출 리포트
          </button>
          <button className="px-5 py-3 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 border border-gray-200 cursor-pointer transition-all duration-200 hover:bg-gray-200 hover:-translate-y-0.5">
            공지사항 작성
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
