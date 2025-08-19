import React, { useState } from 'react';
import { settlementAPI } from '../utils/api';
import StatusChip from './StatusChip';

const SettlementApprovalTable = ({ settlements, onActionComplete }) => {
  const [loadingStates, setLoadingStates] = useState({});
  const [errors, setErrors] = useState({});

  // 승인 버튼 클릭
  const handleApprove = async settlementId => {
    try {
      setLoadingStates(prev => ({ ...prev, [settlementId]: true }));
      setErrors(prev => ({ ...prev, [settlementId]: null }));

      const response = await settlementAPI.approve(settlementId);

      if (response.success) {
        onActionComplete();
      } else {
        setErrors(prev => ({
          ...prev,
          [settlementId]: response.message || '승인 처리에 실패했습니다.',
        }));
      }
    } catch (err) {
      console.error('승인 처리 오류:', err);
      setErrors(prev => ({
        ...prev,
        [settlementId]: '승인 처리 중 오류가 발생했습니다.',
      }));
    } finally {
      setLoadingStates(prev => ({ ...prev, [settlementId]: false }));
    }
  };

  // 날짜 포맷팅
  const formatDate = dateString => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // 금액 포맷팅
  const formatCurrency = amount => {
    return new Intl.NumberFormat('ko-KR').format(amount || 0);
  };

  if (settlements.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">승인 대기 중인 정산이 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                직원명
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                정산 기간
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                총 정산금액
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                확인일시
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                상태
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                액션
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {settlements.map(settlement => (
              <tr key={settlement.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {settlement.trainer?.name || `사용자 ${settlement.user_id}`}
                  </div>
                  <div className="text-sm text-gray-500">
                    {settlement.center?.name || '센터 정보 없음'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {settlement.settlement_year}년 {settlement.settlement_month}월
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-semibold text-blue-600">
                    {formatCurrency(settlement.total_settlement)}원
                  </div>
                  <div className="text-xs text-gray-500">
                    기본급: {formatCurrency(settlement.base_salary)}원
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatDate(settlement.acknowledged_at)}
                  {settlement.acknowledgedBy && (
                    <div className="text-xs text-gray-500">{settlement.acknowledgedBy.name}</div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <StatusChip status={settlement.status} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  {errors[settlement.id] && (
                    <div className="text-red-600 text-xs mb-2 bg-red-50 p-2 rounded">
                      {errors[settlement.id]}
                    </div>
                  )}
                  <button
                    onClick={() => handleApprove(settlement.id)}
                    disabled={loadingStates[settlement.id]}
                    className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loadingStates[settlement.id] ? '처리 중...' : '승인'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SettlementApprovalTable;
