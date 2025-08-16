// import React from 'react'; // React 17+ JSX Transform

const SettlementSummaryCards = ({
  trainerSalary,
  salaryLoading,
  salaryError,
  sessionRevenue,
  paymentLoading,
  paymentError,
  bonusData,
  bonusLoading,
  bonusError,
  commissionRate,
  commissionRateLoading,
  commissionRateError,
  onBonusClick,
}) => {
  return (
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
        onClick={onBonusClick}
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
  );
};

export default SettlementSummaryCards;
