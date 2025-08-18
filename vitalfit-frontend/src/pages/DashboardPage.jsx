import React, { useState, useEffect } from 'react';
import {
  FaUsers,
  FaBuilding,
  FaChartLine,
  FaBell,
  FaCalendarAlt,
  FaDumbbell,
  FaMoneyBillWave,
  FaPercentage,
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
    if (!dashboardData || !dashboardData.overview) return [];

    const { overview } = dashboardData;

    return [
      {
        title: '총 직원 수',
        value: `${overview.total_users?.value || 0}명`,
        icon: FaUsers,
        color: '#3b82f6',
        change: `${(overview.total_users?.change || 0) >= 0 ? '+' : ''}${overview.total_users?.change || 0}명`,
        changeType: overview.total_users?.changeType || 'increase',
      },
      {
        title: '이번 달 인건비',
        value: `₩${(overview.current_month_labor_cost?.value || 0).toLocaleString()}`,
        icon: FaMoneyBillWave,
        color: '#ef4444',
        change: `${(overview.current_month_labor_cost?.change || 0) >= 0 ? '+' : ''}${overview.current_month_labor_cost?.change || 0}%`,
        changeType: overview.current_month_labor_cost?.changeType || 'increase',
      },
      {
        title: '정산완료율',
        value: `${overview.settlement_completion_rate?.value || 0}%`,
        icon: FaPercentage,
        color: '#8b5cf6',
        change: `${(overview.settlement_completion_rate?.change || 0) >= 0 ? '+' : ''}${overview.settlement_completion_rate?.change || 0}%`,
        changeType: overview.settlement_completion_rate?.changeType || 'increase',
      },
    ];
  };

  // 최근 활동 데이터 포맷팅
  const formatRecentActivities = () => {
    if (!dashboardData) {
      return {
        recentUsers: [],
        recentMembers: [],
        recentNotices: [],
      };
    }

    const recentUsers = dashboardData.recent_users || [];
    const recentMembers = dashboardData.recent_members || [];
    const recentNotices = dashboardData.recent_notices || [];

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
      <div className="max-w-7xl mx-auto p-5">
        {/* 대시보드 헤더 영역 - 그라데이션 배경에 직접 표시 */}
        <div className="mb-12 pt-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold mb-3 text-white drop-shadow-lg">
                안녕하세요, 관리자님!
              </h1>
              <p className="text-white text-xl drop-shadow-md">
                오늘의 비탈핏 센터 현황을 확인해보세요.
              </p>
            </div>
          </div>
        </div>

        {/* 통계 카드 - 헤더 아래에 배치 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <div
                key={index}
                className={`rounded-lg p-6 transition-all duration-300 text-white shadow-md hover:-translate-y-1 hover:shadow-lg border-[0.1px] ${
                  index === 0
                    ? 'border-[#a5b4fc]'
                    : index === 1
                      ? 'border-[#a1e1fd]'
                      : 'border-[#b6ecf1]'
                }`}
                style={{
                  background:
                    index === 0
                      ? 'radial-gradient(circle at center -50%, rgba(235,245,255,0.8) 0%, rgba(235,245,255,0.6) 20%, #708aed 60%, #4d6be6 100%)'
                      : index === 1
                        ? 'radial-gradient(circle at center -50%, rgba(235,245,255,0.8) 0%, rgba(235,245,255,0.6) 20%, #74d4fc 60%, #74d4fc 100%)'
                        : 'radial-gradient(circle at center -50%, rgba(235,245,255,0.8) 0%, rgba(235,245,255,0.6) 20%, #80dfe5 60%, #80dfe5 100%)',
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center shadow-md bg-white"
                      style={{ backgroundColor: 'white' }}
                    >
                      <IconComponent
                        size={20}
                        color={index === 0 ? '#4d6be6' : index === 1 ? '#74d4fc' : '#80dfe5'}
                      />
                    </div>
                    <div className="flex flex-col">
                      <div className="text-4xl font-bold text-white drop-shadow-lg mb-2">
                        {stat.value}
                      </div>
                      <span className="text-sm font-medium text-white drop-shadow-md">
                        {stat.title}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-white drop-shadow-md">
                      {stat.change}
                    </span>
                    {stat.changeType === 'increase' ? (
                      <span className="text-white drop-shadow-md">↑</span>
                    ) : (
                      <span className="text-white drop-shadow-md">↓</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* 최근 활동과 지점별 정산현황 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* 최근 활동 */}
          <div
            className="bg-white rounded-xl p-6 border border-gray-100"
            style={{ boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)' }}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800 m-0">최근 활동</h2>
              <div className="flex items-center gap-2">
                <FaBell className="text-gray-400" />
                <span className="text-sm text-gray-500">실시간 업데이트</span>
              </div>
            </div>

            <div className="space-y-6">
              {/* 최근 공지 */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <h3 className="font-semibold text-gray-800">최근 공지</h3>
                </div>
                <div className="space-y-2">
                  {recentActivities.recentNotices?.slice(0, 3).map((notice, index) => (
                    <div
                      key={notice.id || index}
                      className="p-3 rounded-lg bg-blue-50 border border-blue-100 hover:bg-blue-100 transition-colors"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm font-medium text-gray-800 truncate">
                            {notice.title}
                          </p>
                          <p className="text-xs text-gray-500">{notice.author?.name || '관리자'}</p>
                        </div>
                        <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
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

              {/* 새로 생성된 유저 */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 mb-4">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: '#7dd3fc' }}
                  ></div>
                  <h3 className="font-semibold text-gray-800">새로운 직원</h3>
                </div>
                <div className="space-y-2">
                  {recentActivities.recentUsers?.slice(0, 3).map((user, index) => (
                    <div
                      key={user.id || index}
                      className="p-3 rounded-lg border transition-colors"
                      style={{
                        backgroundColor: '#f0f9ff',
                        borderColor: '#bae6fd',
                        '--tw-hover-bg-opacity': '0.8',
                      }}
                      onMouseEnter={e => (e.target.style.backgroundColor = '#e0f2fe')}
                      onMouseLeave={e => (e.target.style.backgroundColor = '#f0f9ff')}
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full overflow-hidden">
                            <img
                              src={
                                user.profileImage ||
                                'https://lh3.googleusercontent.com/pw/AP1GczPHYKy-ftX95akuneOtJAq_BTm0oNlL8mLTK7gUbZJqkYXHB1RDR-gseWYT7G9cVjTsIZyconxHncd5Ph1RASfAHtI75Abk4G9eH9HNtkLAUvHcBfloZzlYUNfcxHPQaTLMmbuZfqZ4I0Pkqf4jS43E=w200-h200-s-no-gm?authuser=0'
                              }
                              alt={`${user.name} 프로필`}
                              className="w-full h-full object-cover"
                              onError={e => {
                                e.target.src =
                                  'https://lh3.googleusercontent.com/pw/AP1GczPHYKy-ftX95akuneOtJAq_BTm0oNlL8mLTK7gUbZJqkYXHB1RDR-gseWYT7G9cVjTsIZyconxHncd5Ph1RASfAHtI75Abk4G9eH9HNtkLAUvHcBfloZzlYUNfcxHPQaTLMmbuZfqZ4I0Pkqf4jS43E=w200-h200-s-no-gm?authuser=0';
                              }}
                            />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-800">{user.name}</p>
                            <p className="text-xs text-gray-500">
                              {user.position?.name || '직책 미정'}
                            </p>
                          </div>
                        </div>
                        <span
                          className="text-xs px-2 py-1 rounded-full"
                          style={{
                            color: '#0369a1',
                            backgroundColor: '#bae6fd',
                          }}
                        >
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
            </div>
          </div>

          {/* 지점별 정산현황 */}
          <div
            className="bg-white rounded-xl p-6 border border-gray-100"
            style={{ boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)' }}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800 m-0">지점별 정산현황</h2>
              <div className="flex items-center gap-2">
                <FaBuilding className="text-gray-400" />
                <span className="text-sm text-gray-500">이번 달 기준</span>
              </div>
            </div>

            <div className="space-y-4">
              {dashboardData?.center_stats ? (
                dashboardData.center_stats.map((center, index) => (
                  <div
                    key={center.id || index}
                    className="p-4 rounded-lg bg-gradient-to-r from-[#e1f4f6] to-[#c3f0f5] border border-indigo-100 hover:shadow-md transition-all duration-300"
                  >
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="font-semibold text-gray-800 text-lg">{center.name}</h3>
                      <span
                        className="text-sm px-2 py-1 rounded-full"
                        style={{
                          color: '#0f766e',
                          backgroundColor: '#b6ecf1',
                        }}
                      >
                        {center.settlement_status || '진행중'}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-white rounded-lg border border-indigo-200">
                        <p className="text-xs text-gray-500 mb-1">총 직원</p>
                        <p className="text-lg font-bold" style={{ color: '#81dee5' }}>
                          {center.total_users || 0}명
                        </p>
                      </div>
                      <div className="text-center p-3 bg-white rounded-lg border border-purple-200">
                        <p className="text-xs text-gray-500 mb-1">정산완료</p>
                        <p className="text-lg font-bold" style={{ color: '#0891b2' }}>
                          {center.settled_users || 0}명
                        </p>
                      </div>
                    </div>
                    <div className="mt-3">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">진행률</span>
                        <span className="font-semibold text-gray-800">
                          {center.total_users > 0
                            ? Math.round(((center.settled_users || 0) / center.total_users) * 100)
                            : 0}
                          %
                        </span>
                      </div>
                      <div className="w-full bg-white rounded-full h-2 mt-1">
                        {console.log(
                          'Progress bar width:',
                          center.total_users > 0
                            ? Math.round(((center.settled_users || 0) / center.total_users) * 100)
                            : 0
                        )}
                        <div
                          className="bg-gradient-to-r from-[#81dee5] to-[#0891b2] h-2 rounded-full transition-all duration-300"
                          style={{
                            width: `${
                              center.total_users > 0
                                ? Math.round(
                                    ((center.settled_users ||
                                      Math.floor(center.total_users * 0.3)) /
                                      center.total_users) *
                                      100
                                  )
                                : 0
                            }%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 rounded-lg bg-gray-50 border border-gray-200 text-center">
                  <FaBuilding className="text-gray-400 mx-auto mb-3 text-2xl" />
                  <p className="text-sm text-gray-500 mb-1">지점별 정산 데이터가 없습니다</p>
                  <p className="text-xs text-gray-400">지점별 정산 현황을 확인할 수 없습니다</p>
                </div>
              )}
            </div>
          </div>
        </div>

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
