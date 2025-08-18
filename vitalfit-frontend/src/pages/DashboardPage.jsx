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
import { settlementAPI } from '../utils/api';
import DraftSettlementModal from '../components/DraftSettlementModal';

const DashboardPage = () => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Draft 정산 알림 관련 상태
  const [showDraftModal, setShowDraftModal] = useState(false);
  const [draftSettlements, setDraftSettlements] = useState([]);
  const [hasCheckedDraft, setHasCheckedDraft] = useState(false);

  // Draft 정산 확인 함수
  const checkDraftSettlements = async () => {
    if (hasCheckedDraft) return; // 이미 확인했으면 스킵

    // position_id가 11 이상인 사용자(admin, 회계팀, 센터장)는 draft 정산 확인하지 않음
    if (user?.position_id >= 11) {
      console.log('승인자 권한이므로 draft 정산 확인하지 않음:', {
        position_id: user?.position_id,
      });
      setHasCheckedDraft(true);
      return;
    }

    try {
      const response = await settlementAPI.checkDraftSettlements(user?.id);
      if (response.success && response.data.hasDraftSettlements) {
        setDraftSettlements(response.data.draftSettlements);
        setShowDraftModal(true);
      }
    } catch (error) {
      console.error('Draft 정산 확인 오류:', error);
    } finally {
      setHasCheckedDraft(true);
    }
  };

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

        // 대시보드 데이터 로드 완료 후 draft 정산 확인
        await checkDraftSettlements();
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
    const recentUsers = dashboardData?.recent_users || [];
    const recentMembers = dashboardData?.recent_members || [];
    const recentNotices = dashboardData?.recent_notices || [];

    return {
      recentUsers,
      recentMembers,
      recentNotices,
    };
  };

  // 인증 로딩 중이거나 데이터 로딩 중인 경우
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#5e5dfa] from-0% via-[#a4e6ef] via-20% to-white to-30%">
        <div className="max-w-6xl mx-auto pt-8">
          <div className="flex justify-center items-center h-64">
            <div className="text-white text-lg font-semibold">
              {authLoading ? '인증 상태를 확인하는 중...' : '데이터를 불러오는 중...'}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 에러가 있는 경우
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#5e5dfa] from-0% via-[#a4e6ef] via-20% to-white to-30%">
        <div className="max-w-6xl mx-auto pt-8">
          <div className="flex flex-col justify-center items-center h-64">
            <div className="text-white mb-4 text-lg">{error}</div>
            {error.includes('로그인이 필요') || error.includes('인증이 만료') ? (
              <button
                onClick={() => (window.location.href = '/login')}
                className="px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-gray-100 transition-colors font-semibold"
              >
                로그인하기
              </button>
            ) : (
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-white text-gray-600 rounded-lg hover:bg-gray-100 transition-colors font-semibold"
              >
                다시 시도
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  const stats = formatStats();
  const recentActivities = formatRecentActivities();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#5e5dfa] from-0% via-[#a4e6ef] via-20% to-white to-30%">
      <div className="max-w-7xl mx-auto pt-8">
        {/* 대시보드 헤더 영역 - 그라데이션 배경에 직접 표시 */}
        <div className="mb-12">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold mb-3 text-white drop-shadow-lg">
                안녕하세요, 관리자님!
              </h1>
              <p className="text-white text-xl drop-shadow-md">
                오늘의 비탈핏 센터 현황을 확인해보세요.
              </p>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <FaCalendarAlt className="text-gray-400 drop-shadow-sm" />
                <span className="text-gray-400 drop-shadow-sm font-medium">
                  {new Date().toLocaleDateString('ko-KR', {
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <FaBell className="text-gray-400 drop-shadow-sm" />
                <span className="text-gray-400 drop-shadow-sm font-medium">08:00 - 18:00</span>
              </div>
              <div className="relative">
                <FaBell className="text-gray-400 text-xl cursor-pointer hover:text-gray-500 transition-colors drop-shadow-sm" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>

        {/* 통계 카드 - 헤더 아래에 배치 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-12">
          {stats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-xl p-6 shadow-lg hover:-translate-y-1 hover:shadow-xl transition-all duration-300 border border-gray-100"
              >
                <div className="flex flex-col items-start mb-4">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center shadow-md mb-2"
                    style={{ backgroundColor: stat.color }}
                  >
                    <IconComponent size={20} color="white" />
                  </div>
                  <span className="text-sm text-gray-600 font-medium">{stat.title}</span>
                </div>
                <div className="flex justify-between items-end">
                  <div className="text-2xl font-bold text-gray-800">{stat.value}</div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-sm font-semibold px-3 py-1 rounded-full ${
                        stat.changeType === 'increase'
                          ? 'text-green-600 bg-green-50'
                          : 'text-red-600 bg-red-50'
                      }`}
                    >
                      {stat.change}
                    </span>
                    {stat.changeType === 'increase' ? (
                      <span className="text-green-500">↗️</span>
                    ) : (
                      <span className="text-red-500">↘️</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* 최근 활동 */}
        <div className="bg-white rounded-xl p-6 mb-8 shadow-lg border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800 m-0">최근 활동</h2>
            <div className="flex items-center gap-2">
              <FaBell className="text-gray-400" />
              <span className="text-sm text-gray-500">실시간 업데이트</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 새로 생성된 유저 */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <h3 className="font-semibold text-gray-800">새로운 직원</h3>
              </div>
              <div className="space-y-2">
                {recentActivities.recentUsers?.slice(0, 3).map((user, index) => (
                  <div
                    key={user.id || index}
                    className="p-3 rounded-lg bg-blue-50 border border-blue-100 hover:bg-blue-100 transition-colors"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium text-gray-800">{user.name}</p>
                        <p className="text-xs text-gray-500">
                          {user.position?.name || '직책 미정'}
                        </p>
                      </div>
                      <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                        {new Date(user.createdAt).toLocaleDateString('ko-KR')}
                      </span>
                    </div>
                  </div>
                ))}
                {(!recentActivities.recentUsers || recentActivities.recentUsers.length === 0) && (
                  <div className="p-4 rounded-lg bg-gray-50 border border-gray-200 text-center">
                    <p className="text-sm text-gray-500 mb-1">새로운 직원이 없습니다</p>
                    <p className="text-xs text-gray-400">오늘 생성된 직원이 없습니다</p>
                  </div>
                )}
              </div>
            </div>

            {/* 새로 생성된 멤버 */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <h3 className="font-semibold text-gray-800">새로운 회원</h3>
              </div>
              <div className="space-y-2">
                {recentActivities.recentMembers?.slice(0, 3).map((member, index) => (
                  <div
                    key={member.id || index}
                    className="p-3 rounded-lg bg-green-50 border border-green-100 hover:bg-green-100 transition-colors"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium text-gray-800">{member.name}</p>
                        <p className="text-xs text-gray-500">
                          {member.center?.name || '센터 미정'}
                        </p>
                      </div>
                      <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                        {new Date(member.createdAt).toLocaleDateString('ko-KR')}
                      </span>
                    </div>
                  </div>
                ))}
                {(!recentActivities.recentMembers ||
                  recentActivities.recentMembers.length === 0) && (
                  <div className="p-4 rounded-lg bg-gray-50 border border-gray-200 text-center">
                    <p className="text-sm text-gray-500 mb-1">새로운 회원이 없습니다</p>
                    <p className="text-xs text-gray-400">오늘 생성된 회원이 없습니다</p>
                  </div>
                )}
              </div>
            </div>

            {/* 알림/공지 */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                <h3 className="font-semibold text-gray-800">최근 공지</h3>
              </div>
              <div className="space-y-2">
                {recentActivities.recentNotices?.slice(0, 3).map((notice, index) => (
                  <div
                    key={notice.id || index}
                    className="p-3 rounded-lg bg-orange-50 border border-orange-100 hover:bg-orange-100 transition-colors"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium text-gray-800 truncate">{notice.title}</p>
                        <p className="text-xs text-gray-500">{notice.author?.name || '관리자'}</p>
                      </div>
                      <span className="text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded-full">
                        {new Date(notice.createdAt).toLocaleDateString('ko-KR')}
                      </span>
                    </div>
                  </div>
                ))}
                {(!recentActivities.recentNotices ||
                  recentActivities.recentNotices.length === 0) && (
                  <div className="p-4 rounded-lg bg-gray-50 border border-gray-200 text-center">
                    <p className="text-sm text-gray-500 mb-1">최근 공지가 없습니다</p>
                    <p className="text-xs text-gray-400">오늘 생성된 공지가 없습니다</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 센터별 통계 */}
        {dashboardData?.center_stats && dashboardData.center_stats.length > 0 && (
          <div className="bg-white rounded-xl p-6 mb-6 shadow-lg border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800 m-0">센터별 현황</h2>
              <div className="flex items-center gap-2">
                <FaBuilding className="text-gray-400" />
                <span className="text-sm text-gray-500">전체 센터</span>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {dashboardData.center_stats.map((center, index) => (
                <div
                  key={center.id}
                  className="p-6 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <h3 className="font-bold text-gray-800 text-lg">{center.name}</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-blue-100">
                      <span className="text-gray-600 font-medium">직원</span>
                      <span className="font-bold text-blue-600">
                        {center.active_users}/{center.total_users}명
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-green-100">
                      <span className="text-gray-600 font-medium">회원</span>
                      <span className="font-bold text-green-600">
                        {center.active_members}/{center.total_members}명
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 직급별 통계 */}
        {dashboardData?.position_stats && dashboardData.position_stats.length > 0 && (
          <div className="bg-white rounded-xl p-6 mb-6 shadow-lg border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800 m-0">직급별 현황</h2>
              <div className="flex items-center gap-2">
                <FaUsers className="text-gray-400" />
                <span className="text-sm text-gray-500">전체 직원</span>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {dashboardData.position_stats
                .filter(position => position.total_users > 0)
                .map((position, index) => (
                  <div
                    key={position.id}
                    className="p-6 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 hover:shadow-lg transition-all duration-300"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                      <h3 className="font-bold text-gray-800 text-lg">{position.name}</h3>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-purple-100">
                        <span className="text-gray-600 font-medium">활성</span>
                        <span className="font-bold text-purple-600">{position.active_users}명</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-pink-100">
                        <span className="text-gray-600 font-medium">전체</span>
                        <span className="font-bold text-pink-600">{position.total_users}명</span>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* 빠른 액션 */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800 m-0">빠른 액션</h2>
            <div className="flex items-center gap-2">
              <FaCalendarAlt className="text-gray-400" />
              <span className="text-sm text-gray-500">즉시 실행</span>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button className="px-6 py-4 rounded-xl text-sm font-bold bg-gradient-to-r from-blue-500 to-blue-600 text-white border-none cursor-pointer transition-all duration-300 hover:from-blue-600 hover:to-blue-700 hover:-translate-y-1 hover:shadow-lg shadow-md">
              새 직원 등록
            </button>
            <button className="px-6 py-4 rounded-xl text-sm font-bold bg-gradient-to-r from-green-500 to-green-600 text-white border-none cursor-pointer transition-all duration-300 hover:from-green-600 hover:to-green-700 hover:-translate-y-1 hover:shadow-lg shadow-md">
              지점 추가
            </button>
            <button className="px-6 py-4 rounded-xl text-sm font-bold bg-gradient-to-r from-purple-500 to-purple-600 text-white border-none cursor-pointer transition-all duration-300 hover:from-purple-600 hover:to-purple-700 hover:-translate-y-1 hover:shadow-lg shadow-md">
              매출 리포트
            </button>
            <button className="px-6 py-4 rounded-xl text-sm font-bold bg-gradient-to-r from-orange-500 to-orange-600 text-white border-none cursor-pointer transition-all duration-300 hover:from-orange-600 hover:to-orange-700 hover:-translate-y-1 hover:shadow-lg shadow-md">
              공지사항 작성
            </button>
          </div>
        </div>
      </div>

      {/* Draft 정산 알림 모달 */}
      <DraftSettlementModal
        isOpen={showDraftModal}
        onClose={() => setShowDraftModal(false)}
        draftSettlements={draftSettlements}
      />
    </div>
  );
};

export default DashboardPage;
