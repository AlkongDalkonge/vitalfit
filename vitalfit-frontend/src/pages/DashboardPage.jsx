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

  // 무한 로딩 방지를 위한 타임아웃 설정
  const [loadingTimeout, setLoadingTimeout] = useState(null);

  // 직급별 정산 확인 함수
  const checkSettlementNotifications = async () => {
    if (hasCheckedDraft) return; // 이미 확인했으면 스킵

    try {
      let response;
      let settlements = [];
      let hasSettlements = false;

      // 직급별로 다른 정산 상태 확인
      if (user?.position_id < 11) {
        // 일반 직원: draft와 rejected 정산 확인
        response = await settlementAPI.checkDraftSettlements(user?.id);
        if (response.success && response.data.hasDraftSettlements) {
          settlements = response.data.draftSettlements;
          hasSettlements = true;
        }
      } else if (user?.position_id === 11) {
        // 센터장: acknowledged 정산 확인
        response = await settlementAPI.checkAcknowledgedSettlements(user?.id);
        if (response.success && response.data.hasAcknowledgedSettlements) {
          settlements = response.data.acknowledgedSettlements;
          hasSettlements = true;
        }
      } else if (user?.position_id === 12) {
        // 회계팀: center_approved 정산 확인
        response = await settlementAPI.checkCenterApprovedSettlements(user?.id);
        if (response.success && response.data.hasCenterApprovedSettlements) {
          settlements = response.data.centerApprovedSettlements;
          hasSettlements = true;
        }
      }

      if (hasSettlements) {
        setDraftSettlements(settlements);
        setShowDraftModal(true);
      }
    } catch (error) {
      console.error('정산 확인 오류:', error);
    } finally {
      setHasCheckedDraft(true);
    }
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      // 인증이 완료되지 않았으면 대기
      if (authLoading) {
        console.log('🔍 인증 로딩 중...');
        return;
      }

      // 인증되지 않은 경우 에러 설정
      if (!isAuthenticated) {
        console.log('❌ 인증되지 않음');
        setError('로그인이 필요합니다.');
        setLoading(false);
        return;
      }

      try {
        console.log('🚀 대시보드 데이터 요청 시작');
        setLoading(true);
        setError(null);

        // 로딩 타임아웃 설정 (30초)
        const timeoutId = setTimeout(() => {
          console.warn('⚠️ 대시보드 데이터 로딩 타임아웃');
          setError('데이터 로딩이 시간 초과되었습니다. 새로고침해주세요.');
          setLoading(false);
        }, 30000);
        setLoadingTimeout(timeoutId);

        const response = await getDashboardStats();
        console.log('📡 대시보드 API 응답:', response);

        // 타임아웃 클리어
        clearTimeout(timeoutId);
        setLoadingTimeout(null);

        // 응답 데이터 구조 검증
        if (response && response.data) {
          setDashboardData(response.data);
          console.log('✅ 대시보드 데이터 설정 완료');
        } else {
          console.warn('⚠️ 응답 데이터 구조가 예상과 다름:', response);
          setDashboardData(response || {});
        }

        // 대시보드 데이터 로드 완료 후 직급별 정산 확인
        await checkSettlementNotifications();
      } catch (err) {
        console.error('❌ 대시보드 데이터 로딩 실패:', err);

        // 타임아웃 클리어
        if (loadingTimeout) {
          clearTimeout(loadingTimeout);
          setLoadingTimeout(null);
        }

        if (err.response?.status === 401) {
          setError('인증이 만료되었습니다. 다시 로그인해주세요.');
        } else if (err.response?.status === 500) {
          setError('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
        } else if (err.message) {
          setError(`데이터를 불러오는데 실패했습니다: ${err.message}`);
        } else {
          setError('대시보드 데이터를 불러오는데 실패했습니다.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();

    // 컴포넌트 언마운트 시 타임아웃 클리어
    return () => {
      if (loadingTimeout) {
        clearTimeout(loadingTimeout);
      }
    };
  }, [isAuthenticated, authLoading, user?.id, user?.position_id]);

  // 통계 데이터 포맷팅
  const formatStats = () => {
    if (!dashboardData) return [];

    try {
      // position 1~11의 활성화된 유저 수 계산
      const activeUsersCount =
        dashboardData.position_stats?.reduce((total, position) => {
          if (position.id >= 1 && position.id <= 11) {
            return total + (position.active_users || 0);
          }
          return total;
        }, 0) || 0;

      // 이번달 total_settlement 합계 계산
      const currentMonthLaborCost =
        dashboardData.position_stats?.reduce((total, position) => {
          if (position.id >= 1 && position.id <= 11) {
            return total + (position.total_settlement || 0);
          }
          return total;
        }, 0) || 0;

      return [
        {
          title: '총 직원 수',
          value: `${activeUsersCount}명`,
          icon: FaUsers,
          color: '#3b82f6',
          change: '+0명',
          changeType: 'increase',
        },
        {
          title: '이번 달 인건비',
          value:
            currentMonthLaborCost >= 10000 ? (
              <span>
                {Math.round(currentMonthLaborCost / 10000)}
                <span className="text-lg">만원</span>
              </span>
            ) : (
              `₩${currentMonthLaborCost.toLocaleString()}`
            ),
          icon: FaMoneyBillWave,
          color: '#ef4444',
          change: '+0%',
          changeType: 'increase',
        },
        {
          title: '정산완료율',
          value: `${dashboardData.overview?.settlement_completion_rate?.value || 0}%`,
          icon: FaPercentage,
          color: '#8b5cf6',
          change: `${(dashboardData.overview?.settlement_completion_rate?.change || 0) >= 0 ? '+' : ''}${dashboardData.overview?.settlement_completion_rate?.change || 0}%`,
          changeType: dashboardData.overview?.settlement_completion_rate?.changeType || 'increase',
        },
      ];
    } catch (error) {
      console.error('통계 데이터 포맷팅 오류:', error);
      return [];
    }
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

    try {
      const recentUsers = dashboardData.recent_users || [];
      const recentMembers = dashboardData.recent_members || [];
      const recentNotices = dashboardData.recent_notices || [];

      return {
        recentUsers,
        recentMembers,
        recentNotices,
      };
    } catch (error) {
      console.error('최근 활동 데이터 포맷팅 오류:', error);
      return {
        recentUsers: [],
        recentMembers: [],
        recentNotices: [],
      };
    }
  };

  // 인증 로딩 중이거나 데이터 로딩 중인 경우
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-6xl mx-auto pt-8">
          <div className="flex flex-col justify-center items-center h-64">
            <div className="text-black text-lg font-semibold mb-4">
              {authLoading ? '인증 상태를 확인하는 중...' : '데이터를 불러오는 중...'}
            </div>
            {/* 로딩 스피너 추가 */}
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            {/* 로딩 시간이 길어질 경우 안내 메시지 */}
            {loading && !authLoading && (
              <div className="text-sm text-gray-500 mt-4 text-center">
                로딩이 오래 걸리는 경우 새로고침을 시도해보세요
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // 에러가 있는 경우
  if (error) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-6xl mx-auto pt-8">
          <div className="flex flex-col justify-center items-center h-64">
            <div className="text-black mb-4 text-lg">{error}</div>
            {error.includes('로그인이 필요') || error.includes('인증이 만료') ? (
              <button
                onClick={() => (window.location.href = '/login')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
              >
                로그인하기
              </button>
            ) : (
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-semibold"
              >
                다시 시도
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // 데이터가 없는 경우
  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-6xl mx-auto pt-8">
          <div className="flex flex-col justify-center items-center h-64">
            <div className="text-black mb-4 text-lg">데이터를 불러올 수 없습니다.</div>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-semibold"
            >
              새로고침
            </button>
          </div>
        </div>
      </div>
    );
  }

  const stats = formatStats();
  const recentActivities = formatRecentActivities();

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto p-5">
        {/* 대시보드 헤더 영역 */}
        <div className="mb-12 pt-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold mb-3 text-black">
                안녕하세요, {user?.name || '사용자'}님!
              </h1>
              <p className="text-black text-sm">오늘의 VitalFit 센터 현황을 확인해보세요.</p>
            </div>
          </div>
        </div>

        {/* 통계 카드 - 헤더 아래에 배치 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-0">
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
                  <h3 className="font-semibold text-gray-800">최근 직원</h3>
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
                      <p className="text-sm text-gray-500 mb-1">최근 직원이 없습니다</p>
                      <p className="text-xs text-gray-400">등록된 직원이 없습니다</p>
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
                <span className="text-sm text-gray-500">지난 달 기준</span>
              </div>
            </div>

            <div className="space-y-4">
              {dashboardData?.center_stats ? (
                dashboardData.center_stats.map((center, index) => (
                  <div
                    key={center.id || index}
                    className="p-4 rounded-lg bg-gradient-to-r from-gray-50 to-blue-50 border border-indigo-100 hover:shadow-md transition-all duration-300"
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
                        <p className="text-lg font-bold text-gray-500">
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
      </div>

      {/* 직급별 정산 알림 모달 */}
      <DraftSettlementModal
        isOpen={showDraftModal}
        onClose={() => setShowDraftModal(false)}
        draftSettlements={draftSettlements}
        userPositionId={user?.position_id}
      />
    </div>
  );
};

export default DashboardPage;
