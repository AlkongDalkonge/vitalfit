// import React from 'react'; // React 17+ JSX Transform

const SettlementCalculator = ({
  selectedTrainer,
  totalRevenue,
  previousCarryoverAmount,
  carryoverLoading,
  carryoverError,
  commissionRate,
  commissionRateLoading,
  commissionRateError,
  ptSessionStats,
  ptSessionStatsLoading,
  ptSessionStatsError,
  sessionRevenue,
  bonusData,
  bonusLoading,
  bonusError,
  currentCarryoverAmount,
  teamPTRevenue,
  teamRevenueLoading,
  teamRevenueError,
  teamPTIncentive,
  withholdingTax,
  netSalary,
  trainerSalary,
}) => {
  return (
    <div className="w-full md:w-1/2 space-y-4 sticky top-6">
      <div className="bg-gray-100 p-4 rounded shadow">
        <h2 className="text-base font-bold mb-2">정산 계산기</h2>
        {!selectedTrainer ? (
          <div className="text-center py-8 text-gray-500">
            트레이너를 선택하면 정산 정보가 표시됩니다.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>이번달 매출</div>
            <div className="text-right">{totalRevenue.toLocaleString()}원</div>

            <div>저번달 이월 매출</div>
            <div className="text-right">
              {carryoverLoading ? (
                <span className="text-gray-500">로딩 중...</span>
              ) : carryoverError ? (
                <span className="text-red-500">오류</span>
              ) : (
                `${previousCarryoverAmount.toLocaleString()}원`
              )}
            </div>

            <div>환불금</div>
            <div className="text-right">0원</div>

            <div className="font-bold text-black bg-yellow-200">총매출</div>
            <div className="text-right font-bold text-black bg-yellow-200">
              {(totalRevenue + previousCarryoverAmount).toLocaleString()}원
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

            <div className="font-bold text-green-600">보너스</div>
            <div className="text-right font-bold text-green-600">
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

            <div className="text-blue-600">이번달 이월매출</div>
            <div className="text-right text-blue-600">
              {currentCarryoverAmount.toLocaleString()}원
            </div>

            <div className="text-red-600">환불금</div>
            <div className="text-right text-red-600">0원</div>

            <div>팀 PT 매출</div>
            <div className="text-right">
              {teamRevenueLoading ? (
                <span className="text-gray-500">로딩 중...</span>
              ) : teamRevenueError ? (
                <span className="text-red-500">오류</span>
              ) : (
                `${(teamPTRevenue || 0).toLocaleString()}원`
              )}
            </div>

            <div>팀 PT 인센티브</div>
            <div className="text-right">
              {teamRevenueLoading ? (
                <span className="text-gray-500">로딩 중...</span>
              ) : teamRevenueError ? (
                <span className="text-red-500">오류</span>
              ) : (
                `${(teamPTIncentive || 0).toLocaleString()}원`
              )}
            </div>

            <div className="text-red-600">원천징수세 (3.3%)</div>
            <div className="text-right text-red-600">
              {!selectedTrainer ? (
                <span className="text-gray-500">0원</span>
              ) : (
                `${withholdingTax.toLocaleString()}원`
              )}
            </div>
          </div>
        )}
      </div>

      <div className="bg-red-100 p-4 rounded text-center">
        <div className="text-sm text-gray-500">총 급여</div>
        <div className="text-xl font-bold text-yellow-800">
          {!selectedTrainer ? (
            <span className="text-gray-500">트레이너를 선택해주세요</span>
          ) : (
            (() => {
              const baseSalary = trainerSalary?.base_salary || 0;
              const bonus = bonusData?.total_bonus || 0;
              const commission = commissionRate?.monthly_commission || 0;
              const sessionRevenueAmount = sessionRevenue || 0;
              const teamIncentive = teamPTIncentive || 0;
              const totalSalary =
                baseSalary + bonus + commission + sessionRevenueAmount + teamIncentive;
              return `${totalSalary.toLocaleString()}원`;
            })()
          )}
        </div>
      </div>

      <div className="bg-green-100 p-4 rounded text-center">
        <div className="text-sm text-gray-500">세후 실지급액</div>
        <div className="text-xl font-bold text-green-800">
          {!selectedTrainer ? (
            <span className="text-gray-500">트레이너를 선택해주세요</span>
          ) : (
            `${netSalary.toLocaleString()}원`
          )}
        </div>
      </div>
    </div>
  );
};

export default SettlementCalculator;
