import React from 'react';
import { useNavigate } from 'react-router-dom';

const DraftSettlementModal = ({ isOpen, onClose, draftSettlements, userPositionId }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  // 직급별 메시지 및 제목 설정
  const getModalContent = () => {
    if (userPositionId < 11) {
      return {
        title: '정산 확인 알림',
        subtitle: '확인 대기 중인 정산이 있습니다',
        description: '다음 정산들을 확인해주세요.',
        statusText: '확인 대기',
        statusColor: 'bg-gray-100 text-gray-800'
      };
    } else if (userPositionId === 11) {
      return {
        title: '팀원 정산 승인 알림',
        subtitle: '승인 대기 중인 팀원 정산이 있습니다',
        description: '다음 팀원들의 정산을 승인해주세요.',
        statusText: '승인 대기',
        statusColor: 'bg-blue-100 text-blue-800'
      };
    } else if (userPositionId >= 12) {
      return {
        title: '최종 정산 승인 알림',
        subtitle: '최종 승인 대기 중인 정산이 있습니다',
        description: '다음 정산들을 최종 승인해주세요.',
        statusText: '최종 승인 대기',
        statusColor: 'bg-green-100 text-green-800'
      };
    }
  };

  const modalContent = getModalContent();

  const handleGoToSettlement = settlement => {
    const yearMonth = `${settlement.settlement_year}-${String(settlement.settlement_month).padStart(2, '0')}`;
    navigate('/settlement', {
      state: {
        selectedMonth: yearMonth,
        selectedTrainer: settlement.user_id.toString(),
        selectedCenter: settlement.center_id?.toString(),
        selectedTeam: settlement.trainer?.team_id?.toString(),
        trainerInfo: {
          id: settlement.user_id,
          name: settlement.trainer?.name,
          nickname: settlement.trainer?.nickname,
          position_id: settlement.trainer?.position_id,
          team_id: settlement.trainer?.team_id,
        },
        centerInfo: {
          id: settlement.center_id,
          name: settlement.center?.name,
        },
      },
    });
    onClose();
  };

  const formatCurrency = amount => {
    return new Intl.NumberFormat('ko-KR').format(amount || 0);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center mr-3">
              <svg className="w-6 h-6 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{modalContent.title}</h3>
              <p className="text-sm text-gray-600">{modalContent.subtitle}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* 내용 */}
        <div className="p-6">
          <div className="mb-4">
            <p className="text-gray-700 mb-4">
              {modalContent.description}
            </p>
          </div>

          {/* 정산 목록 */}
          <div className="space-y-3 mb-6">
            {draftSettlements.map(settlement => (
              <div
                key={settlement.id}
                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => handleGoToSettlement(settlement)}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {settlement.settlement_year}년 {settlement.settlement_month}월 정산
                    </h4>
                    <p className="text-sm text-gray-600">
                      {settlement.center?.name || '센터 정보 없음'}
                    </p>
                  </div>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    settlement.status === 'rejected' 
                      ? 'bg-red-100 text-red-800' 
                      : modalContent.statusColor
                  }`}>
                    {settlement.status === 'rejected' ? '반려됨' : modalContent.statusText}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">총 정산금액:</span>
                  <span className="font-semibold text-blue-600">
                    {formatCurrency(settlement.total_settlement)}원
                  </span>
                </div>
                {settlement.status === 'rejected' && settlement.reject_reason && (
                  <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs">
                    <span className="text-red-700 font-medium">반려 사유:</span>
                    <p className="text-red-600 mt-1">{settlement.reject_reason}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* 버튼 */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              나중에
            </button>
            {draftSettlements.length === 1 && (
              <button
                onClick={() => handleGoToSettlement(draftSettlements[0])}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                지금 확인
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DraftSettlementModal;
