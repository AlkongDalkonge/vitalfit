import { useState, useMemo, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useCenter } from '../hooks/useCenter';
import { useTeam, useTeamRevenueStats } from '../hooks/useTeam';
import { useUserByTeam } from '../hooks/useUser';
import { usePayment } from '../hooks/usePayment';
import { useTrainerSalary } from '../hooks/useTrainerSalary';
import { useBonus } from '../hooks/useBonus';
import { useCarryover } from '../hooks/useCarryover';
import { useCommissionRate } from '../hooks/useCommissionRate';
import { usePTSessionStats } from '../hooks/usePTSessionStats';
import { settlementAPI } from '../utils/api';
import SettlementFilterBar from './SettlementFilterBar';
import SettlementSummaryCards from './SettlementSummaryCards';
import SettlementTable from './SettlementTable';
import SettlementCalculator from './SettlementCalculator';
import SettlementBonusModal from './SettlementBonusModal';
import SettlementPDFModal from './SettlementPDFModal';
import { preparePDFData } from '../utils/pdfUtils';

const SettlementPage = () => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [selectedCenter, setSelectedCenter] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [selectedTrainer, setSelectedTrainer] = useState(null);
  const [search, setSearch] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('2025-08');

  // 모달 상태
  const [showBonusModal, setShowBonusModal] = useState(false);
  const [showPDFModal, setShowPDFModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  // 정산 승인 관련 상태
  const [monthlySettlement, setMonthlySettlement] = useState(null);
  const [acknowledgeLoading, setAcknowledgeLoading] = useState(false);
  const [acknowledgeError, setAcknowledgeError] = useState(null);

  // HOOKS: 센터 / 팀 / 트레이너 목록
  const { centers } = useCenter();
  const { teams } = useTeam(selectedCenter);
  const { users: trainers } = useUserByTeam(selectedTeam);

  // URL state에서 전달받은 값들 처리 및 정산 데이터 로드
  useEffect(() => {
    if (location.state) {
      // console.log('📍 location.state 변경됨:', location.state);

      // 상태 업데이트
      if (location.state.selectedMonth) {
        setSelectedMonth(location.state.selectedMonth);
      }
      if (location.state.selectedTrainer) {
        setSelectedTrainer(location.state.selectedTrainer);
      }
      if (location.state.selectedCenter) {
        setSelectedCenter(location.state.selectedCenter);
      }
      if (location.state.selectedTeam) {
        setSelectedTeam(location.state.selectedTeam);
      }

      // 트레이너/월 등 상태는 위에서만 세팅하고,
      // 실제 정산 데이터 로드는 공통 함수(loadMonthlySettlement)에서만 처리
    }
  }, [location.state, user?.position_id]);

  // position_id가 7 이하인 사용자는 본인 정보로 자동 설정
  useEffect(() => {
    if (user && user.position_id <= 7 && centers && teams && trainers) {
      // console.log('🔒 position_id 7 이하 사용자: 본인 정보로 자동 설정', {
      //   userId: user.id,
      //   positionId: user.position_id,
      //   centerId: user.center_id,
      //   teamId: user.team_id
      // });

      // 본인 센터 설정
      if (user.center_id) {
        setSelectedCenter(user.center_id.toString());
      }

      // 본인 팀 설정
      if (user.team_id) {
        setSelectedTeam(user.team_id.toString());
      }

      // 본인 트레이너 설정
      setSelectedTrainer(user.id.toString());
    }
  }, [user, centers, teams, trainers]);

  // 트레이너가 선택되면 해당 트레이너의 팀을 자동으로 설정
  useEffect(() => {
    if (selectedTrainer && trainers && teams) {
      const trainerId = parseInt(selectedTrainer);
      const trainer = trainers.find(t => t.id === trainerId);

      if (trainer && trainer.team_id) {
        setSelectedTeam(trainer.team_id.toString());
      }
    }
  }, [selectedTrainer, trainers, teams]);

  // 트레이너/월 → payment 데이터 훅
  const trainerId = selectedTrainer ? parseInt(selectedTrainer) : null;
  const [year, month] = useMemo(() => {
    if (!selectedMonth) return [null, null];
    const [y, m] = selectedMonth.split('-').map(Number);
    return [y, m];
  }, [selectedMonth]);

  const {
    payments,
    loading: paymentLoading,
    error: paymentError,
  } = usePayment(trainerId, year, month);

  // 트레이너 기본급 정보
  const {
    salary: trainerSalary,
    loading: salaryLoading,
    error: salaryError,
  } = useTrainerSalary(trainerId);

  // 트레이너 보너스 정보
  const { bonusData, loading: bonusLoading, error: bonusError } = useBonus(trainerId, year, month);

  // PT 세션 통계 정보
  const {
    stats: ptSessionStats,
    loading: ptSessionStatsLoading,
    error: ptSessionStatsError,
  } = usePTSessionStats(trainerId, year, month);

  // 선택된 트레이너 정보 가져오기
  const selectedTrainerInfo = useMemo(() => {
    if (!selectedTrainer || !trainers) return null;
    const trainerIdNum = parseInt(selectedTrainer);
    return trainers.find(trainer => trainer.id === trainerIdNum) || null;
  }, [selectedTrainer, trainers]);

  // 선택된 트레이너의 팀 ID
  const trainerTeamId = useMemo(() => {
    if (!selectedTrainerInfo) return null;
    return selectedTrainerInfo.team_id ?? Number(selectedTeam);
  }, [selectedTrainerInfo, selectedTeam]);

  // 팀 매출 통계 정보 (팀장인 경우에만 사용)
  const {
    stats: teamRevenueStats,
    loading: teamRevenueLoading,
    error: teamRevenueError,
  } = useTeamRevenueStats(trainerTeamId, year, month);

  // 검색 필터 (회원명 기준, 부분 일치) - 주석처리
  // const filteredPayments = useMemo(() => {
  //   const q = search?.trim().toLowerCase() ?? '';
  //   if (!q) return payments || [];
  //   return (payments || []).filter(payment =>
  //     String(payment.member_name || '')
  //       .toLowerCase()
  //       .includes(q)
  //   );
  // }, [payments, search]);

  // 검색 필터 비활성화 - 전체 데이터 사용
  const filteredPayments = useMemo(() => {
    return payments || [];
  }, [payments]);

  // 정산 승인 관련 함수들
  // 👉 여러 번 호출되더라도 '마지막 요청'만 반영하기 위한 토큰
  const loadReqRef = useRef(0);

  const loadMonthlySettlement = async () => {
    const myReq = ++loadReqRef.current;

    // 사용자 정보가 로드될 때까지 기다림
    if (!user) {
      return;
    }

    // 선택된 트레이너가 있을 때만 정산 데이터를 가져옴
    if (!selectedTrainer || !year || !month) {
      setMonthlySettlement(null);
      return;
    }

    const targetUserId = Number(selectedTrainer);

    // 회계팀(position_id >= 12)은 모든 정산 확인 가능
    // 관리자(position_id > 12)는 모든 정산 확인 가능

    // position_id가 7 이하인 사용자는 본인의 정산만 확인 가능
    if (user?.position_id <= 7) {
      if (targetUserId !== user.id) {
        setMonthlySettlement(null);
        return;
      }
    }

    try {
      const response = await settlementAPI.getSettlements({
        user_id: targetUserId,
        year: year,
        month: month,
      });

      // ✅ 최신 요청만 반영
      if (myReq !== loadReqRef.current) {
        return;
      }

      if (response.success && response.data.length > 0) {
        const ms = response.data[0];

        // (센터장) API 결과의 center_id로 최종 권한 확인
        if (
          user?.position_id === 11 &&
          ms?.center_id &&
          user?.center_id &&
          ms.center_id !== user.center_id
        ) {
          setMonthlySettlement(null);
          return;
        }

        setMonthlySettlement(ms);
      } else {
        setMonthlySettlement(null);
      }
    } catch (error) {
      console.error('정산 데이터 로드 오류:', error);
      setMonthlySettlement(null);
    }
  };

  const handleAcknowledge = async () => {
    if (!monthlySettlement) return;

    try {
      setAcknowledgeLoading(true);
      setAcknowledgeError(null);

      const response = await settlementAPI.acknowledge(monthlySettlement.id, user?.id);

      if (response.success) {
        toast.success(response.message || '정산 확인이 완료되었습니다.');
        // 정산 데이터 새로고침
        await loadMonthlySettlement();
        // 헤더 알림 카운트 즉시 업데이트
        if (window.refreshNotificationCount) {
          window.refreshNotificationCount();
        }
      } else {
        setAcknowledgeError(response.message || '확인 처리에 실패했습니다.');
      }
    } catch (error) {
      console.error('확인 처리 오류:', error);
      setAcknowledgeError('확인 처리 중 오류가 발생했습니다.');
    } finally {
      setAcknowledgeLoading(false);
    }
  };

  // 센터장 ㅜㅜ 처리
  const handleApprove = async () => {
    if (!monthlySettlement) return;

    try {
      setAcknowledgeLoading(true);
      setAcknowledgeError(null);

      const response = await settlementAPI.approve(monthlySettlement.id, user?.id, user?.center_id);

      if (response.success) {
        toast.success('정산 승인이 완료되었습니다.');
        // 정산 데이터 새로고침
        await loadMonthlySettlement();
        // 헤더 알림 카운트 즉시 업데이트
        if (window.refreshNotificationCount) {
          window.refreshNotificationCount();
        }
      } else {
        setAcknowledgeError(response.message || '승인 처리에 실패했습니다.');
      }
    } catch (error) {
      console.error('승인 처리 오류:', error);
      setAcknowledgeError('승인 처리 중 오류가 발생했습니다.');
    } finally {
      setAcknowledgeLoading(false);
    }
  };

  // 회계팀 최종 승인 처리
  const handleHqApprove = async () => {
    if (!monthlySettlement) return;

    try {
      setAcknowledgeLoading(true);
      setAcknowledgeError(null);

      const response = await settlementAPI.hqApprove(monthlySettlement.id, user?.id);

      if (response.success) {
        toast.success('최종 승인이 완료되었습니다.');
        // 정산 데이터 새로고침
        await loadMonthlySettlement();
        // 헤더 알림 카운트 즉시 업데이트
        if (window.refreshNotificationCount) {
          window.refreshNotificationCount();
        }
      } else {
        setAcknowledgeError(response.message || '최종 승인 처리에 실패했습니다.');
      }
    } catch (error) {
      console.error('최종 승인 처리 오류:', error);
      setAcknowledgeError('최종 승인 처리 중 오류가 발생했습니다.');
    } finally {
      setAcknowledgeLoading(false);
    }
  };

  // 회계팀 반려 처리
  const handleHqReject = async rejectReason => {
    if (!monthlySettlement) return;

    try {
      setAcknowledgeLoading(true);
      setAcknowledgeError(null);

      const response = await settlementAPI.hqReject(monthlySettlement.id, rejectReason, user?.id);

      if (response.success) {
        toast.success('정산이 반려되었습니다.');
        // 정산 데이터 새로고침
        await loadMonthlySettlement();
        // 헤더 알림 카운트 즉시 업데이트
        if (window.refreshNotificationCount) {
          window.refreshNotificationCount();
        }
      } else {
        setAcknowledgeError(response.message || '반려 처리에 실패했습니다.');
      }
    } catch (error) {
      console.error('반려 처리 오류:', error);
      setAcknowledgeError('반려 처리 중 오류가 발생했습니다.');
    } finally {
      setAcknowledgeLoading(false);
    }
  };

  // 센터장인 경우 본인 센터 자동 선택
  useEffect(() => {
    if (user?.position_id === 11 && user?.center_id && !selectedCenter) {
      setSelectedCenter(user.center_id.toString());
    }
  }, [user, selectedCenter]);

  // 🔁 데이터 로드는 이 한 군데에서만 트리거 (로더 단일화)
  useEffect(() => {
    if (user && selectedTrainer && year && month) {
      loadMonthlySettlement();
    } else {
      setMonthlySettlement(null);
    }
  }, [user?.id, selectedTrainer, year, month]);

  // 수업 총매출 계산
  const totalRevenue = useMemo(() => {
    if (!filteredPayments || filteredPayments.length === 0) return 0;
    return filteredPayments.reduce((sum, payment) => {
      return sum + (payment.payment_amount || 0);
    }, 0);
  }, [filteredPayments]);

  // 저번달 이월매출 정보
  const {
    carryoverAmount: previousCarryoverAmount,
    loading: carryoverLoading,
    error: carryoverError,
  } = useCarryover(trainerId, year, month);

  // 이번달 이월매출 계산
  const currentCarryoverAmount = useMemo(() => {
    if (!totalRevenue || totalRevenue <= 10000000) {
      return 0;
    }
    return totalRevenue - 10000000;
  }, [totalRevenue]);

  // 총매출 (저번달 이월매출 포함)
  const totalRevenueWithCarryover = useMemo(() => {
    return totalRevenue + previousCarryoverAmount;
  }, [totalRevenue, previousCarryoverAmount]);

  // 커미션 정책 조회

  const {
    commissionRate,
    loading: commissionRateLoading,
    error: commissionRateError,
  } = useCommissionRate(
    totalRevenueWithCarryover,
    selectedTrainerInfo?.position_id,
    selectedTrainerInfo?.center_id
  );

  // 수업비 매출 계산
  const sessionRevenue = useMemo(() => {
    if (!ptSessionStats || !commissionRate) return 0;

    const regularSessions = ptSessionStats.statistics?.regular_sessions || 0;
    const freeSessions = ptSessionStats.statistics?.free_sessions || 0;
    const hourlyRate = commissionRate.commission_per_session || 0;

    const regularRevenue = regularSessions * hourlyRate;
    const freeRevenue = freeSessions * 10000;

    return regularRevenue + freeRevenue;
  }, [ptSessionStats, commissionRate]);

  // 팀 PT 매출 계산 (팀장인 경우에만)
  const teamPTRevenue = useMemo(() => {
    if (!teamRevenueStats || !selectedTrainerInfo || !selectedTrainer) {
      return 0;
    }

    try {
      const isTeamLeader = selectedTrainerInfo?.position_id === 7;

      if (!isTeamLeader) {
        return 0;
      }

      const teamLeaderRevenue =
        teamRevenueStats.members?.find(member => Number(member.id) === Number(selectedTrainer))?.stats?.revenue
          ?.total || 0;

      const totalTeamRevenue = teamRevenueStats.team_statistics?.total_revenue || 0;

      return Math.max(0, totalTeamRevenue - teamLeaderRevenue);
    } catch (error) {
      console.error('팀 PT 매출 계산 오류:', error);
      return 0;
    }
  }, [teamRevenueStats, selectedTrainerInfo, selectedTrainer]);

  // 팀 PT 인센티브 계산 (팀 PT 매출의 5%)
  const teamPTIncentive = useMemo(() => {
    try {
      return Math.round(teamPTRevenue * 0.05);
    } catch (error) {
      console.error('팀 PT 인센티브 계산 오류:', error);
      return 0;
    }
  }, [teamPTRevenue]);

  // 총 급여 계산
  const totalSalary = useMemo(() => {
    const baseSalary = trainerSalary?.base_salary || 0;
    const bonus = bonusData?.total_bonus || 0;
    const commission = commissionRate?.monthly_commission || 0;

    return baseSalary + sessionRevenue + bonus + commission + teamPTIncentive;
  }, [trainerSalary, sessionRevenue, bonusData, commissionRate, teamPTIncentive]);

  // 원천징수세 계산 (3.3%)
  const withholdingTax = useMemo(() => {
    return Math.round(totalSalary * 0.033);
  }, [totalSalary]);

  // 실지급액 계산 (총 급여 - 원천징수세)
  const netSalary = useMemo(() => {
    return totalSalary - withholdingTax;
  }, [totalSalary, withholdingTax]);

  // PDF 데이터 준비
  const pdfData = useMemo(() => {
    if (!selectedTrainer) return null;

    return preparePDFData({
      selectedMonth,
      trainerSalary,
      sessionRevenue,
      bonusData,
      commissionRate,
      teamPTIncentive,
      previousCarryoverAmount,
      centers,
      selectedCenter,
      selectedTrainerInfo,
      netSalary,
      ptSessionStats,
      totalRevenue,
    });
  }, [
    selectedMonth,
    selectedTrainer,
    selectedCenter,
    trainerSalary,
    sessionRevenue,
    bonusData,
    commissionRate,
    teamPTIncentive,
    previousCarryoverAmount,
    centers,
    selectedTrainerInfo,
    netSalary,
    ptSessionStats,
    totalRevenue,
  ]);

  // 보너스 모달 열기 핸들러
  const handleBonusClick = () => {
    if (bonusData && bonusData.bonus_details?.length > 0) {
      setShowBonusModal(true);
    }
  };

  // 인증 로딩 중일 때 로딩 표시
  if (loading) {
    return (
      <div className="p-6 space-y-8 max-w-[1200px] mx-auto bg-white rounded-xl shadow">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">사용자 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto pt-0 px-6 pb-6 flex flex-col">
      <div className="flex flex-col gap-6 flex-1 pb-0">
        {/* 최상단 제목 */}
        <div
          data-layer="정산시스템"
          className="text-black text-3xl font-extrabold font-['Nunito'] bg-white rounded-lg p-3"
        >
          정산시스템
        </div>

        {/* 필터 영역 */}
        <SettlementFilterBar
        centers={centers}
        teams={teams}
        trainers={trainers}
        selectedCenter={selectedCenter}
        setSelectedCenter={setSelectedCenter}
        selectedTeam={selectedTeam}
        setSelectedTeam={setSelectedTeam}
        selectedTrainer={selectedTrainer}
        setSelectedTrainer={setSelectedTrainer}
        search={search}
        setSearch={setSearch}
        selectedMonth={selectedMonth}
        setSelectedMonth={setSelectedMonth}
        user={user}
      />

      {/* 카드 요약 영역 */}
      <SettlementSummaryCards
        trainerSalary={trainerSalary}
        salaryLoading={salaryLoading}
        salaryError={salaryError}
        sessionRevenue={sessionRevenue}
        paymentLoading={paymentLoading}
        paymentError={paymentError}
        bonusData={bonusData}
        bonusLoading={bonusLoading}
        bonusError={bonusError}
        commissionRate={commissionRate}
        commissionRateLoading={commissionRateLoading}
        commissionRateError={commissionRateError}
        onBonusClick={handleBonusClick}
      />

      {/* 디버그 정보 */}
      {/* <div className="bg-gray-100 p-4 mb-4 rounded text-sm">
        <h4 className="font-bold mb-2">🔍 버튼 로직 디버그</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div>selectedTrainer: {selectedTrainer || 'N/A'}</div>
            <div>selectedMonth: {selectedMonth || 'N/A'}</div>
            <div>monthlySettlement 존재: {monthlySettlement ? '✅ 있음' : '❌ 없음'}</div>
            <div>status: {monthlySettlement?.status || 'N/A'}</div>
            <div>user_id: {monthlySettlement?.user_id || 'N/A'}</div>
            <div>current_user_id: {user?.id || 'N/A'}</div>
            <div>position_id: {user?.position_id || 'N/A'}</div>
            <div>center_id: {user?.center_id || 'N/A'}</div>
            <div>user 로딩: {loading ? '🔄 로딩 중' : '✅ 완료'}</div>
          </div>
          <div>
            <div>is_owner: {monthlySettlement?.user_id === user?.id ? '✅' : '❌'}</div>
            <div>is_center_manager: {user?.position_id === 11 ? '✅' : '❌'}</div>
            <div>is_accounting: {user?.position_id >= 12 ? '✅' : '❌'}</div>
            <div>status_draft: {monthlySettlement?.status === 'draft' ? '✅' : '❌'}</div>
            <div>
              status_acknowledged: {monthlySettlement?.status === 'acknowledged' ? '✅' : '❌'}
            </div>
            <div>
              status_center_approved:{' '}
              {monthlySettlement?.status === 'center_approved' ? '✅' : '❌'}
            </div>
            <div>status_rejected: {monthlySettlement?.status === 'rejected' ? '✅' : '❌'}</div>
          </div>
        </div>
      </div> */}

      {/* 정산 승인 섹션 */}

      {loading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">사용자 정보 로딩 중...</span>
        </div>
      ) : (
        monthlySettlement && (
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">정산 승인</h3>
              <div className="flex items-center gap-2">
                {monthlySettlement.status === 'draft' ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-300">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clipRule="evenodd"
                      />
                    </svg>
                    승인 대기
                  </span>
                ) : monthlySettlement.status === 'acknowledged' ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-300">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    확인 완료
                  </span>
                ) : monthlySettlement.status === 'center_approved' ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-300">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    센터장 승인됨
                  </span>
                ) : monthlySettlement.status === 'hq_approved' ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-300">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    최종 승인됨
                  </span>
                ) : monthlySettlement.status === 'rejected' ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-300">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                    반려됨
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-300">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z"
                        clipRule="evenodd"
                      />
                    </svg>
                    지급완료
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">총 정산금액:</span>
                  <span className="ml-2 font-semibold text-blue-600">
                    {new Intl.NumberFormat('ko-KR').format(monthlySettlement.total_settlement || 0)}
                    원
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">세후 금액:</span>
                  <span className="ml-2 font-semibold text-green-600">
                    {new Intl.NumberFormat('ko-KR').format(monthlySettlement.after_tax_amount || 0)}
                    원
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">정산 기간:</span>
                  <span className="ml-2 font-medium">
                    {monthlySettlement.settlement_year}년 {monthlySettlement.settlement_month}월
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">원천징수:</span>
                  <span className="ml-2 font-medium text-red-600">
                    {new Intl.NumberFormat('ko-KR').format((monthlySettlement.total_settlement || 0) - (monthlySettlement.after_tax_amount || 0))}
                    원 (3.3%)
                  </span>
                </div>
              </div>

              {/* 처리 이력 */}
              <div className="space-y-2 text-xs text-gray-500">
                {monthlySettlement.acknowledged_at && (
                  <div>
                    <span>확인: {monthlySettlement.acknowledgedBy?.name || '알 수 없음'}</span>
                    <span className="ml-2">
                      {new Date(monthlySettlement.acknowledged_at).toLocaleDateString('ko-KR', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                )}
                {monthlySettlement.center_approved_at && (
                  <div>
                    <span>
                      센터장 승인: {monthlySettlement.centerApprovedBy?.name || '알 수 없음'}
                    </span>
                    <span className="ml-2">
                      {new Date(monthlySettlement.center_approved_at).toLocaleDateString('ko-KR', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                )}
                {monthlySettlement.hq_approved_at && (
                  <div>
                    <span>최종 승인: {monthlySettlement.hqApprovedBy?.name || '알 수 없음'}</span>
                    <span className="ml-2">
                      {new Date(monthlySettlement.hq_approved_at).toLocaleDateString('ko-KR', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                )}
                {monthlySettlement.rejected_at && (
                  <div>
                    <span>반려: {monthlySettlement.rejectedBy?.name || '알 수 없음'}</span>
                    <span className="ml-2">
                      {new Date(monthlySettlement.rejected_at).toLocaleDateString('ko-KR', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    {monthlySettlement.reject_reason && (
                      <div className="text-red-600 mt-1">
                        사유: {monthlySettlement.reject_reason}
                      </div>
                    )}
                  </div>
                )}
                {/* paid_by 컬럼이 아직 모델에 없으므로 임시로 주석처리 */}
                {/* {monthlySettlement.paid_at && (
                <div>
                  <span>지급: {monthlySettlement.paidBy?.name || '알 수 없음'}</span>
                  <span className="ml-2">
                    {new Date(monthlySettlement.paid_at).toLocaleDateString('ko-KR', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                  {monthlySettlement.payment_ref && (
                    <span className="ml-2">(참조: {monthlySettlement.payment_ref})</span>
                  )}
                </div>
              )} */}
              </div>

              {/* 액션 버튼 */}
              <div className="pt-3">
                {acknowledgeError && (
                  <div className="text-red-600 text-sm bg-red-50 p-2 rounded mb-3">
                    {acknowledgeError}
                  </div>
                )}

                {/* 직원 확인 버튼 (draft 상태에서 본인 정산) */}
                {monthlySettlement.status === 'draft' && monthlySettlement.user_id === user?.id && (
                  <button
                    onClick={handleAcknowledge}
                    disabled={acknowledgeLoading}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {acknowledgeLoading ? '처리 중...' : '확인'}
                  </button>
                )}

                {/* 직원 확인 대기 메시지 (draft 상태에서 다른 사람 정산) */}
                {monthlySettlement.status === 'draft' && monthlySettlement.user_id !== user?.id && (
                  <div className="text-center py-2">
                    <div className="text-orange-600 bg-orange-50 px-3 py-2 rounded border border-orange-200">
                      <svg className="w-4 h-4 inline mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                          clipRule="evenodd"
                        />
                      </svg>
                      팀원 확인 대기
                    </div>
                  </div>
                )}

                {/* 센터장 승인/반려 버튼 (acknowledged 상태에서 센터장) */}
                {monthlySettlement.status === 'acknowledged' && user?.position_id === 11 && (
                  <div className="space-y-2">
                    <button
                      onClick={handleApprove}
                      disabled={acknowledgeLoading}
                      className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {acknowledgeLoading ? '처리 중...' : '승인'}
                    </button>
                    <button
                      onClick={() => setShowRejectModal(true)}
                      disabled={acknowledgeLoading}
                      className="w-full bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      반려
                    </button>
                  </div>
                )}

                {/* 확인 완료 메시지 (acknowledged 상태에서 센터장이 아닌 경우) */}
                {monthlySettlement.status === 'acknowledged' && user?.position_id !== 11 && (
                  <div className="flex items-center justify-center text-green-600 bg-green-50 py-2 px-4 rounded">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    확인 완료
                  </div>
                )}

                {/* 회계팀 최종 승인/반려 버튼 (center_approved 상태에서 회계팀) */}
                {monthlySettlement.status === 'center_approved' && user?.position_id >= 12 && (
                  <div className="space-y-2">
                    <button
                      onClick={handleHqApprove}
                      disabled={acknowledgeLoading}
                      className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {acknowledgeLoading ? '처리 중...' : '최종 승인'}
                    </button>
                    <button
                      onClick={() => setShowRejectModal(true)}
                      disabled={acknowledgeLoading}
                      className="w-full bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      반려
                    </button>
                  </div>
                )}

                {/* 센터장 승인 완료 메시지 (center_approved 상태에서 회계팀이 아닌 경우) */}
                {monthlySettlement.status === 'center_approved' && user?.position_id < 12 && (
                  <div className="flex items-center justify-center text-blue-600 bg-blue-50 py-2 px-4 rounded">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    센터장 승인 완료
                  </div>
                )}

                {/* 직원 다시 확인 버튼 (rejected 상태에서 본인 정산) */}
                {monthlySettlement.status === 'rejected' &&
                  monthlySettlement.user_id === user?.id && (
                    <button
                      onClick={handleAcknowledge}
                      disabled={acknowledgeLoading}
                      className="w-full bg-orange-600 text-white py-2 px-4 rounded hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {acknowledgeLoading ? '처리 중...' : '다시 확인'}
                    </button>
                  )}

                {/* 반려됨 메시지 (rejected 상태에서 다른 사람 정산) */}
                {monthlySettlement.status === 'rejected' &&
                  monthlySettlement.user_id !== user?.id && (
                    <div className="text-center py-2">
                      <div className="text-red-600 bg-red-50 px-3 py-2 rounded border border-red-200">
                        <svg
                          className="w-4 h-4 inline mr-1"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                            clipRule="evenodd"
                          />
                        </svg>
                        반려됨
                      </div>
                      {monthlySettlement.reject_reason && (
                        <div className="text-xs text-red-600 mt-1">
                          사유: {monthlySettlement.reject_reason}
                        </div>
                      )}
                    </div>
                  )}

                {/* 최종 완료 메시지 (hq_approved, paid 등) */}
                {monthlySettlement.status &&
                  ['hq_approved', 'paid'].includes(monthlySettlement.status) && (
                    <div className="text-center text-gray-600 py-2">
                      {monthlySettlement.status === 'hq_approved' ? '최종 승인 완료' : '지급 완료'}
                    </div>
                  )}
              </div>
            </div>
          </div>
        )
      )}

      {/* 테이블 + 계산기 레이아웃 */}
      <div className="md:flex gap-6 items-start">
        {/* 테이블 */}
        <SettlementTable
          filteredPayments={filteredPayments}
          paymentLoading={paymentLoading}
          paymentError={paymentError}
          selectedTrainer={selectedTrainer}
          year={selectedMonth ? selectedMonth.split('-')[0] : null}
          month={selectedMonth ? selectedMonth.split('-')[1] : null}
        />

        {/* 오른쪽 고정 패널 */}
        <SettlementCalculator
          selectedTrainer={selectedTrainer}
          totalRevenue={totalRevenue}
          previousCarryoverAmount={previousCarryoverAmount}
          carryoverLoading={carryoverLoading}
          carryoverError={carryoverError}
          commissionRate={commissionRate}
          commissionRateLoading={commissionRateLoading}
          commissionRateError={commissionRateError}
          ptSessionStats={ptSessionStats}
          ptSessionStatsLoading={ptSessionStatsLoading}
          ptSessionStatsError={ptSessionStatsError}
          sessionRevenue={sessionRevenue}
          bonusData={bonusData}
          bonusLoading={bonusLoading}
          bonusError={bonusError}
          currentCarryoverAmount={currentCarryoverAmount}
          teamPTRevenue={teamPTRevenue}
          teamRevenueLoading={teamRevenueLoading}
          teamRevenueError={teamRevenueError}
          teamPTIncentive={teamPTIncentive}
          withholdingTax={withholdingTax}
          totalSalary={totalSalary}
          netSalary={netSalary}
          trainerSalary={trainerSalary}
        />
      </div>

      {/* PDF 다운로드 버튼 */}
      <div className="flex justify-end mt-6">
        <button
          onClick={() => setShowPDFModal(true)}
          disabled={!selectedTrainer}
          className={`px-6 py-2 rounded text-white ${
            !selectedTrainer
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-br from-red-500 to-red-700 hover:from-red-600 hover:to-red-800'
          }`}
        >
          PDF 다운로드
        </button>
      </div>

      {/* 보너스 상세 모달 */}
      <SettlementBonusModal
        isOpen={showBonusModal}
        onClose={() => setShowBonusModal(false)}
        bonusData={bonusData}
      />

      {/* PDF 모달 */}
      <SettlementPDFModal
        isOpen={showPDFModal}
        onClose={() => setShowPDFModal(false)}
        pdfData={pdfData}
      />

      {/* 반려 모달 */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">정산 반려</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">반려 사유 *</label>
              <textarea
                value={rejectReason}
                onChange={e => setRejectReason(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                rows="4"
                placeholder="반려 사유를 입력해주세요..."
                required
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectReason('');
                }}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
              >
                취소
              </button>
              <button
                onClick={async () => {
                  if (!rejectReason.trim()) {
                    toast.error('반려 사유를 입력해주세요.');
                    return;
                  }
                  await handleHqReject(rejectReason);
                  setShowRejectModal(false);
                  setRejectReason('');
                }}
                disabled={acknowledgeLoading}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {acknowledgeLoading ? '처리 중...' : '반려'}
              </button>
            </div>
          </div>
        </div>
      )}
        </div>
      </div>
    );
  };

  export default SettlementPage;
