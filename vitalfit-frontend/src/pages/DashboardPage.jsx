import React, { useState, useEffect } from 'react';
import {
  FaUsers,
  FaBuilding,
  FaUserFriends,
  FaChartLine,
  FaBell,
  FaCalendarAlt,
  FaDumbbell,
} from 'react-icons/fa';
import { getDashboardStats } from '../services/dashboardService';
import { useAuth } from '../contexts/AuthContext';

const DashboardPage = () => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      // 인증이 완료되지 않았으면 대기
      if (authLoading) return;
      
      // 인증되지 않은 경우 에러 설정
      if (!isAuthenticated) {
        setError('로그인이 필요합니다.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await getDashboardStats();
        setDashboardData(response.data);
      } catch (err) {
        if (err.response?.status === 401) {
          setError('인증이 만료되었습니다. 다시 로그인해주세요.');
        } else {
          setError('대시보드 데이터를 불러오는데 실패했습니다.');
        }
        console.error('대시보드 데이터 로딩 실패:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [isAuthenticated, authLoading]);

  // 통계 데이터 포맷팅
  const formatStats = () => {
    if (!dashboardData) return [];

    const { overview } = dashboardData;
    
    return [
      {
        title: '총 직원 수',
        value: `${overview.total_users.value}명`,
        icon: FaUsers,
        color: '#3b82f6',
        change: `${overview.total_users.change >= 0 ? '+' : ''}${overview.total_users.change}명`,
        changeType: overview.total_users.changeType,
      },
      {
        title: '총 지점 수',
        value: `${overview.total_centers.value}개`,
        icon: FaBuilding,
        color: '#10b981',
        change: `${overview.total_centers.change >= 0 ? '+' : ''}${overview.total_centers.change}개`,
        changeType: overview.total_centers.changeType,
      },
      {
        title: '총 고객 수',
        value: `${overview.total_members.value}명`,
        icon: FaUserFriends,
        color: '#f59e0b',
        change: `${overview.total_members.change >= 0 ? '+' : ''}${overview.total_members.change}명`,
        changeType: overview.total_members.changeType,
      },
      {
        title: '이번 달 매출',
        value: `₩${overview.current_month_revenue.value.toLocaleString()}`,
        icon: FaChartLine,
        color: '#ef4444',
        change: `${overview.current_month_revenue.change >= 0 ? '+' : ''}${overview.current_month_revenue.change}%`,
        changeType: overview.current_month_revenue.changeType,
      },
      {
        title: '이번 달 PT 세션',
        value: `${overview.current_month_sessions.value}회`,
        icon: FaDumbbell,
        color: '#8b5cf6',
        change: `${overview.current_month_sessions.change >= 0 ? '+' : ''}${overview.current_month_sessions.change}회`,
        changeType: overview.current_month_sessions.changeType,
      },
    ];
  };

  // 최근 활동 데이터 포맷팅
  const formatRecentActivities = () => {
    if (!dashboardData?.recent_activities) return [];

    return dashboardData.recent_activities.map(activity => ({
      id: activity.id,
      message: activity.message,
      time: new Date(activity.time).toLocaleString('ko-KR', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      type: activity.type,
    }));
  };

  // 인증 로딩 중이거나 데이터 로딩 중인 경우
  if (authLoading || loading) {
    return (
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">대시보드</h1>
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-500">
            {authLoading ? '인증 상태를 확인하는 중...' : '데이터를 불러오는 중...'}
          </div>
        </div>
      </div>
    );
  }

  // 에러가 있는 경우
  if (error) {
    return (
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">대시보드</h1>
        <div className="flex flex-col justify-center items-center h-64">
          <div className="text-red-500 mb-4">{error}</div>
          {error.includes('로그인이 필요') || error.includes('인증이 만료') ? (
            <button 
              onClick={() => window.location.href = '/login'} 
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              로그인하기
            </button>
          ) : (
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              다시 시도
            </button>
          )}
        </div>
      </div>
    );
  }

  const stats = formatStats();
  const recentActivities = formatRecentActivities();

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">대시보드</h1>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        {stats.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <div
              key={index}
              className="bg-white rounded-xl p-4 shadow-sm hover:-translate-y-0.5 hover:shadow-md transition-all duration-200"
            >
              <div className="m-3">
                <div className="flex items-center gap-3 mb-2">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: stat.color }}
                  >
                    <IconComponent size={20} color="white" />
                  </div>
                  <div className="flex-1">
                    <span className="text-sm text-gray-500 font-medium">{stat.title}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="text-2xl font-bold text-gray-800">{stat.value}</div>
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

      {/* 센터별 통계 */}
      {dashboardData?.center_stats && dashboardData.center_stats.length > 0 && (
        <div className="bg-white rounded-xl p-6 mb-6 shadow-sm">
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-xl font-semibold text-gray-800 m-0">센터별 현황</h2>
            <FaBuilding size={16} color="#6b7280" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {dashboardData.center_stats.map((center, index) => (
              <div key={center.id} className="p-4 rounded-lg bg-gray-50">
                <h3 className="font-semibold text-gray-800 mb-2">{center.name}</h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">직원:</span>
                    <span className="font-medium">{center.active_users}/{center.total_users}명</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">회원:</span>
                    <span className="font-medium">{center.active_members}/{center.total_members}명</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 직급별 통계 */}
      {dashboardData?.position_stats && dashboardData.position_stats.length > 0 && (
        <div className="bg-white rounded-xl p-6 mb-6 shadow-sm">
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-xl font-semibold text-gray-800 m-0">직급별 현황</h2>
            <FaUsers size={16} color="#6b7280" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {dashboardData.position_stats
              .filter(position => position.total_users > 0)
              .map((position, index) => (
                <div key={position.id} className="p-4 rounded-lg bg-gray-50">
                  <h3 className="font-semibold text-gray-800 mb-2">{position.name}</h3>
                  <div className="text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">활성:</span>
                      <span className="font-medium">{position.active_users}명</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">전체:</span>
                      <span className="font-medium">{position.total_users}명</span>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

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
