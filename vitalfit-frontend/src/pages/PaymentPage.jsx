import React, { useMemo, useState } from 'react';
import { useCenter } from '../hooks/useCenter';
import { useTeam } from '../hooks/useTeam';
import { useUserByTeam } from '../hooks/useUser';
import { usePayment } from '../hooks/usePayment';
import { useTrainerSalary } from '../hooks/useTrainerSalary';
import { useBonus } from '../hooks/useBonus';
import { useCarryover } from '../hooks/useCarryover';
import { useCommissionRate } from '../hooks/useCommissionRate';
import { usePTSessionStats } from '../hooks/usePTSessionStats';
import PaymentFilterBar from './PaymentFilterBar';

const PaymentPage = () => {
  const [selectedCenter, setSelectedCenter] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [selectedTrainer, setSelectedTrainer] = useState(null);

  // 이름 검색 & 월 선택
  const [search, setSearch] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('2025-08'); // 'YYYY-MM'

  // 보너스 모달 상태
  const [showBonusModal, setShowBonusModal] = useState(false);

  // HOOKS: 센터 / 팀 / 트레이너 목록
  const { centers, loading: centerLoading, error: centerError } = useCenter();
  const { teams, loading: teamLoading } = useTeam(selectedCenter);
  const { users: trainers, loading: trainerLoading } = useUserByTeam(selectedTeam);

  // 트레이너/월 → payment 데이터 훅
  const trainerId = selectedTrainer; // selectedTrainer는 이미 ID 값
  const [year, month] = useMemo(() => {
    if (!selectedMonth) return [null, null];
    const [y, m] = selectedMonth.split('-').map(Number);
    return [y, m];
  }, [selectedMonth]);

  const {
    payments,
    loading: paymentLoading,
    error: paymentError,
    refresh: refreshPayments,
  } = usePayment(trainerId, year, month);

  // 트레이너 기본급 정보
  const {
    salary: trainerSalary,
    loading: salaryLoading,
    error: salaryError,
  } = useTrainerSalary(trainerId);

  // 트레이너 보너스 정보
  const { bonusData, loading: bonusLoading, error: bonusError } = useBonus(trainerId, year, month);

  // 이월매출 정보
  const {
    carryoverAmount,
    loading: carryoverLoading,
    error: carryoverError,
  } = useCarryover(trainerId, year, month);

  // PT 세션 통계 정보
  const {
    stats: ptSessionStats,
    loading: ptSessionStatsLoading,
    error: ptSessionStatsError,
  } = usePTSessionStats(trainerId, year, month);

  // 선택된 트레이너 정보 가져오기
  const selectedTrainerInfo = useMemo(() => {
    if (!selectedTrainer || !trainers) return null;
    return trainers.find(trainer => trainer.id === selectedTrainer);
  }, [selectedTrainer, trainers]);

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

  // 총매출 (이월매출 포함)
  const totalRevenueWithCarryover = useMemo(() => {
    return totalRevenue + carryoverAmount;
  }, [totalRevenue, carryoverAmount]);

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

  // 수업비 매출 계산 (시간당 수업료 * 정상PT횟수) + (이벤트PT횟수 * 10000)
  const sessionRevenue = useMemo(() => {
    if (!ptSessionStats || !commissionRate) return 0;
    const regularSessions = ptSessionStats.statistics.regular_sessions || 0;
    const freeSessions = ptSessionStats.statistics.free_sessions || 0;
    const hourlyRate = commissionRate.commission_per_session || 0;

    // 정상PT 매출 + 이벤트PT 매출 (이벤트PT는 1회당 10,000원)
    const regularRevenue = regularSessions * hourlyRate;
    const freeRevenue = freeSessions * 10000;

    return regularRevenue + freeRevenue;
  }, [ptSessionStats, commissionRate]);

  return (
    <div className="p-6 space-y-8 max-w-[1200px] mx-auto bg-white rounded-xl shadow">
      {/* 필터 영역 */}
      <PaymentFilterBar
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

      {/* 카드 요약 영역 (임시 고정 값 - 이후 API 연동시 교체) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-yellow-100 p-4 rounded text-center">
          <div className="text-sm text-gray-500">기본급</div>
          <div className="text-xl font-bold text-yellow-800">
            {salaryLoading ? (
              <span className="text-gray-500">로딩 중...</span>
            ) : salaryError ? (
              <span className="text-red-500">오류</span>
            ) : trainerSalary ? (
              `${trainerSalary.base_salary?.toLocaleString()}원`
            ) : (
              <span className="text-gray-500">0원</span>
            )}
          </div>
        </div>
        <div className="bg-blue-50 p-4 rounded text-center">
          <div className="text-sm text-gray-500">수업료</div>
          <div className="text-xl font-bold text-blue-800">
            {paymentLoading ? (
              <span className="text-gray-500">로딩 중...</span>
            ) : paymentError ? (
              <span className="text-red-500">오류</span>
            ) : (
              `${sessionRevenue.toLocaleString()}원`
            )}
          </div>
        </div>
        <div
          className="bg-green-50 p-4 rounded text-center cursor-pointer hover:bg-green-100 transition-colors"
          onClick={() =>
            bonusData && bonusData.bonus_details?.length > 0 && setShowBonusModal(true)
          }
        >
          <div className="text-sm text-gray-500">보너스</div>
          <div className="text-xl font-bold text-green-800">
            {bonusLoading ? (
              <span className="text-gray-500">로딩 중...</span>
            ) : bonusError ? (
              <span className="text-red-500">오류</span>
            ) : bonusData ? (
              `${bonusData.total_bonus?.toLocaleString()}원`
            ) : (
              <span className="text-gray-500">0원</span>
            )}
          </div>
          {bonusData && bonusData.bonus_details?.length > 0 && (
            <div className="text-xs text-green-600 mt-1">클릭하여 상세보기</div>
          )}
        </div>
        <div className="bg-purple-50 p-4 rounded text-center">
          <div className="text-sm text-gray-500">커미션</div>
          <div className="text-xl font-bold text-purple-800">
            {commissionRateLoading ? (
              <span className="text-gray-500">로딩 중...</span>
            ) : commissionRateError ? (
              <span className="text-red-500">오류</span>
            ) : commissionRate ? (
              `${commissionRate.monthly_commission?.toLocaleString()}원`
            ) : (
              <span className="text-gray-500">0원</span>
            )}
          </div>
        </div>
      </div>

      {/* 테이블 + 계산기 레이아웃 */}
      <div className="md:flex gap-6 items-start">
        {/* 테이블 */}
        <div className="w-full md:w-1/2 overflow-x-auto">
          {paymentLoading ? (
            <div className="text-center py-8">로딩 중...</div>
          ) : paymentError ? (
            <div className="text-center py-8 text-red-500">오류: {paymentError}</div>
          ) : (
            <table className="w-full border text-sm">
              <thead className="bg-gray-100 text-left">
                <tr>
                  <th className="p-2 border w-1/3">회원명</th>
                  <th className="p-2 border w-1/3">PT 종류</th>
                  <th className="p-2 border w-1/3 text-right">매출</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="p-4 text-center text-gray-500">
                      {selectedTrainer && year && month
                        ? '해당 기간에 결제 데이터가 없습니다.'
                        : '트레이너와 월을 선택해주세요.'}
                    </td>
                  </tr>
                ) : (
                  filteredPayments.map(payment => (
                    <tr key={payment.id}>
                      <td className="p-2 border">{payment.member_name}</td>
                      <td className="p-2 border">{payment.pt_type}</td>
                      <td className="p-2 border text-right">
                        {payment.payment_amount?.toLocaleString()}원
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* 오른쪽 고정 패널 */}
        <div className="w-full md:w-1/2 space-y-4 sticky top-6">
          <div className="bg-gray-100 p-4 rounded shadow">
            <h2 className="text-base font-bold mb-2">정산 계산기</h2>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>이번달 매출</div>
              <div className="text-right">{totalRevenue.toLocaleString()}원</div>
              <div>이월 매출</div>
              <div className="text-right">
                {carryoverLoading ? (
                  <span className="text-gray-500">로딩 중...</span>
                ) : carryoverError ? (
                  <span className="text-red-500">오류</span>
                ) : (
                  `${carryoverAmount.toLocaleString()}원`
                )}
              </div>
              <div>환불금</div>
              <div className="text-right">0원</div>
              <div className="font-bold text-black bg-yellow-200">총매출</div>
              <div className="text-right font-bold text-black bg-yellow-200">
                {(totalRevenue + carryoverAmount).toLocaleString()}원
              </div>
              <div>시간당 수업료</div>
              <div className="text-right">
                {commissionRateLoading ? (
                  <span className="text-gray-500">로딩 중...</span>
                ) : commissionRateError ? (
                  <span className="text-red-500">오류</span>
                ) : commissionRate ? (
                  `${commissionRate.commission_per_session?.toLocaleString()}원`
                ) : (
                  <span className="text-gray-500">0원</span>
                )}
              </div>
              <div>정상PT횟수</div>
              <div className="text-right">
                {ptSessionStatsLoading ? (
                  <span className="text-gray-500">로딩 중...</span>
                ) : ptSessionStatsError ? (
                  <span className="text-red-500">오류</span>
                ) : ptSessionStats ? (
                  `${ptSessionStats.statistics.regular_sessions}회`
                ) : (
                  <span className="text-gray-500">0회</span>
                )}
              </div>
              <div>이벤트PT횟수</div>
              <div className="text-right">
                {ptSessionStatsLoading ? (
                  <span className="text-gray-500">로딩 중...</span>
                ) : ptSessionStatsError ? (
                  <span className="text-red-500">오류</span>
                ) : ptSessionStats ? (
                  `${ptSessionStats.statistics.free_sessions}회`
                ) : (
                  <span className="text-gray-500">0회</span>
                )}
              </div>
              <div className="font-bold text-black bg-yellow-200">수업비 매출</div>
              <div className="text-right font-bold text-black bg-yellow-200">
                {ptSessionStatsLoading || commissionRateLoading ? (
                  <span className="text-gray-500">로딩 중...</span>
                ) : ptSessionStatsError || commissionRateError ? (
                  <span className="text-red-500">오류</span>
                ) : (
                  `${sessionRevenue.toLocaleString()}원`
                )}
              </div>

              <div className="font-bold text-purple-600">커미션</div>
              <div className="text-right font-bold text-purple-600">
                {commissionRateLoading ? (
                  <span className="text-gray-500">로딩 중...</span>
                ) : commissionRateError ? (
                  <span className="text-red-500">오류</span>
                ) : commissionRate ? (
                  `${commissionRate.monthly_commission?.toLocaleString()}원`
                ) : (
                  <span className="text-gray-500">0원</span>
                )}
              </div>
              <div className="text-blue-600">이월매출</div>
              <div className="text-right text-blue-600">
                {carryoverLoading ? (
                  <span className="text-gray-500">로딩 중...</span>
                ) : carryoverError ? (
                  <span className="text-red-500">오류</span>
                ) : (
                  `${carryoverAmount.toLocaleString()}원`
                )}
              </div>
              <div className="text-red-600">환불금</div>
              <div className="text-right text-red-600">0원</div>
              <div>저번달 이월매출</div>
              <div className="text-right">217,364원</div>
              <div>팀 PT매출</div>
              <div className="text-right">27,478,182원</div>
              <div>센터매출</div>
              <div className="text-right">0원</div>
            </div>
          </div>

          <div className="bg-red-100 p-4 rounded text-center">
            <div className="text-sm text-gray-500">총 급여</div>
            <div className="text-xl font-bold text-yellow-800">
              {(() => {
                const baseSalary = trainerSalary?.base_salary || 0;
                const bonus = bonusData?.total_bonus || 0;
                const commission = commissionRate?.monthly_commission || 0;
                const sessionRevenueAmount = sessionRevenue || 0;
                const totalSalary = baseSalary + bonus + commission + sessionRevenueAmount;
                return `${totalSalary.toLocaleString()}원`;
              })()}
            </div>
          </div>
        </div>
      </div>

      {/* 엑셀 다운로드 버튼 */}
      <div className="flex justify-end mt-6">
        <button className="bg-gradient-to-br from-cyan-500 to-indigo-800 text-white px-6 py-2 rounded">
          엑셀 다운로드
        </button>
      </div>

      {/* 보너스 상세 모달 */}
      {showBonusModal && bonusData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">보너스 상세 내역</h2>
              <button
                onClick={() => setShowBonusModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="mb-4 p-4 bg-green-50 rounded">
              <div className="text-lg font-semibold text-green-800">
                총 보너스: {bonusData.total_bonus?.toLocaleString()}원
              </div>
            </div>

            {bonusData.bonus_details && bonusData.bonus_details.length > 0 ? (
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-700">달성한 보너스 규칙</h3>
                {bonusData.bonus_details.map((detail, index) => (
                  <div key={index} className="border rounded p-3 bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="font-medium text-gray-800">{detail.rule_name}</div>
                        <div className="text-sm text-gray-600">
                          {detail.target_type === 'daily' ? '일별' : '주별'}
                          {detail.threshold_amount?.toLocaleString()}원
                          {detail.achievement_count > 1 ? `${detail.achievement_count}회` : '1회'}{' '}
                          달성
                          {detail.before_11days === 'Y' && ' (11일 이전)'}
                        </div>
                      </div>
                      <div className="text-lg font-bold text-green-600">
                        +{detail.bonus_amount?.toLocaleString()}원
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">달성한 보너스가 없습니다.</div>
            )}

            {bonusData.daily_revenue && Object.keys(bonusData.daily_revenue).length > 0 && (
              <div className="mt-6">
                <h3 className="font-semibold text-gray-700 mb-3">일별 매출 현황</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                  {Object.entries(bonusData.daily_revenue)
                    .sort(([a], [b]) => new Date(a) - new Date(b))
                    .map(([date, amount]) => (
                      <div key={date} className="flex justify-between p-2 bg-white border rounded">
                        <span className="text-gray-600">{new Date(date).getDate()}일</span>
                        <span className="font-medium">{amount?.toLocaleString()}원</span>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {bonusData.weekly_revenue && Object.keys(bonusData.weekly_revenue).length > 0 && (
              <div className="mt-6">
                <h3 className="font-semibold text-gray-700 mb-3">주별 매출 현황</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                  {Object.entries(bonusData.weekly_revenue)
                    .sort(([a], [b]) => parseInt(a) - parseInt(b))
                    .map(([week, amount]) => (
                      <div key={week} className="flex justify-between p-2 bg-white border rounded">
                        <span className="text-gray-600">{week}주차</span>
                        <span className="font-medium">{amount?.toLocaleString()}원</span>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentPage;
