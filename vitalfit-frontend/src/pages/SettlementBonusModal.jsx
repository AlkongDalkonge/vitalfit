// import React from 'react'; // React 17+ JSX Transform

const SettlementBonusModal = ({ isOpen, onClose, bonusData }) => {
  if (!isOpen || !bonusData) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">보너스 상세 내역</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">
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
                      {detail.achievement_count > 1 ? `${detail.achievement_count}회` : '1회'} 달성
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
  );
};

export default SettlementBonusModal;
