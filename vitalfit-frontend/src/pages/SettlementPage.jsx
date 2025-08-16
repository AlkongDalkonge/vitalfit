import { useState, useMemo } from 'react';
import { useCenter } from '../hooks/useCenter';
import { useTeam, useTeamRevenueStats } from '../hooks/useTeam';
import { useUserByTeam } from '../hooks/useUser';
import { usePayment } from '../hooks/usePayment';
import { useTrainerSalary } from '../hooks/useTrainerSalary';
import { useBonus } from '../hooks/useBonus';
import { useCarryover } from '../hooks/useCarryover';
import { useCommissionRate } from '../hooks/useCommissionRate';
import { usePTSessionStats } from '../hooks/usePTSessionStats';
import SettlementFilterBar from './SettlementFilterBar';
import SettlementSummaryCards from './SettlementSummaryCards';
import SettlementTable from './SettlementTable';
import SettlementCalculator from './SettlementCalculator';
import SettlementBonusModal from './SettlementBonusModal';
import SettlementPDFModal from './SettlementPDFModal';
import { preparePDFData } from '../utils/pdfUtils';

const SettlementPage = () => {
  const [selectedCenter, setSelectedCenter] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [selectedTrainer, setSelectedTrainer] = useState(null);
  const [search, setSearch] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('2025-08');

  // 모달 상태
  const [showBonusModal, setShowBonusModal] = useState(false);
  const [showPDFModal, setShowPDFModal] = useState(false);

  // HOOKS: 센터 / 팀 / 트레이너 목록
  const { centers } = useCenter();
  const { teams } = useTeam(selectedCenter);
  const { users: trainers } = useUserByTeam(selectedTeam);

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
    return selectedTrainerInfo.teamId || selectedTeam;
  }, [selectedTrainerInfo, selectedTeam]);

  // 팀 매출 통계 정보 (팀장인 경우에만 사용)
  const {
    stats: teamRevenueStats,
    loading: teamRevenueLoading,
    error: teamRevenueError,
  } = useTeamRevenueStats(trainerTeamId, year, month);

  // 검색 필터 (회원명 기준, 부분 일치)
  const filteredPayments = useMemo(() => {
    const q = search?.trim().toLowerCase() ?? '';
    if (!q) return payments || [];
    return (payments || []).filter(payment =>
      String(payment.member_name || '')
        .toLowerCase()
        .includes(q)
    );
  }, [payments, search]);

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
        teamRevenueStats.members?.find(member => member.id === selectedTrainer)?.stats?.revenue
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

  return (
    <div className="p-6 space-y-8 max-w-[1200px] mx-auto bg-white rounded-xl shadow">
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
    </div>
  );
};

export default SettlementPage;
