import React, { useState } from 'react';
import { settlementAPI } from '../utils/api';
import StatusChip from './StatusChip';

const SettlementApprovalTable = ({ settlements, user, onActionComplete }) => {
  const [loadingStates, setLoadingStates] = useState({});
  const [errors, setErrors] = useState({});
  const [showRejectModal, setShowRejectModal] = useState({});
  const [rejectReasons, setRejectReasons] = useState({});

  // 승인 버튼 클릭
  const handleApprove = async settlementId => {
    try {
      setLoadingStates(prev => ({ ...prev, [settlementId]: true }));
      setErrors(prev => ({ ...prev, [settlementId]: null }));

      const response = await settlementAPI.approve(settlementId, user?.id, user?.center_id);

      if (response.success) {
        onActionComplete();
        // 헤더 알림 카운트 즉시 업데이트
        if (window.refreshNotificationCount) {
          window.refreshNotificationCount();
        }
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

  // 센터장 반려 버튼 클릭
  const handleRejectClick = settlementId => {
    setShowRejectModal(prev => ({ ...prev, [settlementId]: true }));
    setRejectReasons(prev => ({ ...prev, [settlementId]: '' }));
  };

  // 반려 처리 (센터장/회계팀)
  const handleReject = async settlementId => {
    const rejectReason = rejectReasons[settlementId];
    if (!rejectReason || rejectReason.trim() === '') {
      setErrors(prev => ({
        ...prev,
        [settlementId]: '반려 사유를 입력해주세요.',
      }));
      return;
    }

    try {
      setLoadingStates(prev => ({ ...prev, [settlementId]: true }));
      setErrors(prev => ({ ...prev, [settlementId]: null }));

      // 하나의 API로 모든 반려 처리
      const response = await settlementAPI.hqReject(settlementId, rejectReason, user?.id);

      if (response.success) {
        onActionComplete();
        // 헤더 알림 카운트 즉시 업데이트
        if (window.refreshNotificationCount) {
          window.refreshNotificationCount();
        }
        setShowRejectModal(prev => ({ ...prev, [settlementId]: false }));
        setRejectReasons(prev => ({ ...prev, [settlementId]: '' }));
      } else {
        setErrors(prev => ({
          ...prev,
          [settlementId]: response.message || '반려 처리에 실패했습니다.',
        }));
      }
    } catch (err) {
      console.error('반려 처리 오류:', err);
      setErrors(prev => ({
        ...prev,
        [settlementId]: '반려 처리 중 오류가 발생했습니다.',
      }));
    } finally {
      setLoadingStates(prev => ({ ...prev, [settlementId]: false }));
    }
  };

  // 반려 모달 닫기
  const handleCloseRejectModal = settlementId => {
    setShowRejectModal(prev => ({ ...prev, [settlementId]: false }));
    setRejectReasons(prev => ({ ...prev, [settlementId]: '' }));
    setErrors(prev => ({ ...prev, [settlementId]: null }));
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
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleApprove(settlement.id)}
                      disabled={loadingStates[settlement.id]}
                      className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loadingStates[settlement.id] ? '처리 중...' : '승인'}
                    </button>
                    {/* 센터장(position_id=11) 또는 회계팀(position_id>=12)만 반려 버튼 표시 */}
                    {(user?.position_id === 11 || user?.position_id === 12) && (
                      <button
                        onClick={() => handleRejectClick(settlement.id)}
                        disabled={loadingStates[settlement.id]}
                        className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        반려
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 반려 모달들 */}
      {settlements.map(
        settlement =>
          showRejectModal[settlement.id] && (
            <div
              key={`modal-${settlement.id}`}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            >
              <div className="bg-white rounded-lg p-6 w-96 max-w-md">
                <h3 className="text-lg font-semibold mb-4">정산 반려</h3>
                <p className="text-sm text-gray-600 mb-4">
                  {settlement.trainer?.name || `사용자 ${settlement.user_id}`}의 정산을
                  반려하시겠습니까?
                </p>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    반려 사유 *
                  </label>
                  <textarea
                    value={rejectReasons[settlement.id] || ''}
                    onChange={e =>
                      setRejectReasons(prev => ({
                        ...prev,
                        [settlement.id]: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    rows="3"
                    placeholder="반려 사유를 입력해주세요..."
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => handleCloseRejectModal(settlement.id)}
                    className="px-4 py-2 text-gray-600 bg-gray-200 rounded hover:bg-gray-300"
                  >
                    취소
                  </button>
                  <button
                    onClick={() => handleReject(settlement.id)}
                    disabled={loadingStates[settlement.id]}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loadingStates[settlement.id] ? '처리 중...' : '반려'}
                  </button>
                </div>
              </div>
            </div>
          )
      )}
    </div>
  );
};

export default SettlementApprovalTable;
