import React, { useState } from 'react';
import { settlementAPI } from '../utils/api';
import StatusChip from './StatusChip';

const SettlementCard = ({ settlement, userRole, onActionComplete }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 확인 버튼 클릭
  const handleAcknowledge = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await settlementAPI.acknowledge(settlement.id);

      if (response.success) {
        onActionComplete();
      } else {
        setError(response.message || '확인 처리에 실패했습니다.');
      }
    } catch (err) {
      console.error('확인 처리 오류:', err);
      setError('확인 처리 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 승인 버튼 클릭
  const handleApprove = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await settlementAPI.approve(settlement.id);

      if (response.success) {
        onActionComplete();
      } else {
        setError(response.message || '승인 처리에 실패했습니다.');
      }
    } catch (err) {
      console.error('승인 처리 오류:', err);
      setError('승인 처리 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 지급 버튼 클릭
  const handlePay = async paymentRef => {
    try {
      setLoading(true);
      setError(null);

      const response = await settlementAPI.pay(settlement.id, { payment_ref: paymentRef });

      if (response.success) {
        onActionComplete();
      } else {
        setError(response.message || '지급 처리에 실패했습니다.');
      }
    } catch (err) {
      console.error('지급 처리 오류:', err);
      setError('지급 처리 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
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

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
      {/* 헤더 */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {settlement.trainer?.name || `사용자 ${settlement.user_id}`}
          </h3>
          <p className="text-sm text-gray-600">
            {settlement.settlement_year}년 {settlement.settlement_month}월
          </p>
        </div>
        <StatusChip status={settlement.status} />
      </div>

      {/* 정산 정보 */}
      <div className="space-y-3 mb-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">실제 매출:</span>
            <span className="ml-2 font-medium">{formatCurrency(settlement.actual_revenue)}원</span>
          </div>
          <div>
            <span className="text-gray-600">이월 매출:</span>
            <span className="ml-2 font-medium">
              {formatCurrency(settlement.carryover_from_prev)}원
            </span>
          </div>
          <div>
            <span className="text-gray-600">기본급:</span>
            <span className="ml-2 font-medium">{formatCurrency(settlement.base_salary)}원</span>
          </div>
          <div>
            <span className="text-gray-600">PT 수수료:</span>
            <span className="ml-2 font-medium">
              {formatCurrency(settlement.pt_commission_total)}원
            </span>
          </div>
          <div>
            <span className="text-gray-600">월간 커미션:</span>
            <span className="ml-2 font-medium">
              {formatCurrency(settlement.monthly_commission)}원
            </span>
          </div>
          <div>
            <span className="text-gray-600">팀 인센티브:</span>
            <span className="ml-2 font-medium">
              {formatCurrency(settlement.team_pt_incentive)}원
            </span>
          </div>
          <div>
            <span className="text-gray-600">보너스:</span>
            <span className="ml-2 font-medium">{formatCurrency(settlement.bonus)}원</span>
          </div>
        </div>

        <div className="border-t pt-3">
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold text-gray-900">총 정산금액:</span>
            <span className="text-xl font-bold text-blue-600">
              {formatCurrency(settlement.total_settlement)}원
            </span>
          </div>
        </div>
      </div>

      {/* 처리 이력 */}
      <div className="space-y-2 mb-4 text-xs text-gray-500">
        {settlement.acknowledged_at && (
          <div>
            <span>확인: {settlement.acknowledgedBy?.name || '알 수 없음'}</span>
            <span className="ml-2">{formatDate(settlement.acknowledged_at)}</span>
          </div>
        )}
        {settlement.manager_approved_at && (
          <div>
            <span>승인: {settlement.managerApprovedBy?.name || '알 수 없음'}</span>
            <span className="ml-2">{formatDate(settlement.manager_approved_at)}</span>
          </div>
        )}
        {settlement.paid_at && (
          <div>
            <span>지급: {settlement.paidBy?.name || '알 수 없음'}</span>
            <span className="ml-2">{formatDate(settlement.paid_at)}</span>
            {settlement.payment_ref && (
              <span className="ml-2">(참조: {settlement.payment_ref})</span>
            )}
          </div>
        )}
      </div>

      {/* 액션 버튼 */}
      <div className="space-y-2">
        {error && <div className="text-red-600 text-sm bg-red-50 p-2 rounded">{error}</div>}

        {/* 직원: 확인 버튼 */}
        {userRole === 'employee' && settlement.status === 'draft' && (
          <button
            onClick={handleAcknowledge}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '처리 중...' : '확인'}
          </button>
        )}

        {/* 직원: 이미 확인됨 */}
        {userRole === 'employee' && settlement.status === 'acknowledged' && (
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

        {/* 지점장: 승인 버튼 */}
        {userRole === 'manager' && settlement.status === 'acknowledged' && (
          <button
            onClick={handleApprove}
            disabled={loading}
            className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '처리 중...' : '승인'}
          </button>
        )}

        {/* 회계: 지급 버튼 */}
        {userRole === 'finance' && settlement.status === 'confirmed' && (
          <PaymentButton onPay={handlePay} loading={loading} paymentRef={settlement.payment_ref} />
        )}
      </div>
    </div>
  );
};

// 지급 버튼 컴포넌트 (지급번호 입력 포함)
const PaymentButton = ({ onPay, loading, paymentRef }) => {
  const [showInput, setShowInput] = useState(false);
  const [inputRef, setInputRef] = useState(paymentRef || '');

  const handlePayClick = () => {
    if (showInput) {
      onPay(inputRef);
      setShowInput(false);
    } else {
      setShowInput(true);
    }
  };

  return (
    <div className="space-y-2">
      {showInput && (
        <input
          type="text"
          placeholder="지급번호 입력 (선택사항)"
          value={inputRef}
          onChange={e => setInputRef(e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
        />
      )}
      <button
        onClick={handlePayClick}
        disabled={loading}
        className="w-full bg-purple-600 text-white py-2 px-4 rounded hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? '처리 중...' : showInput ? '지급 처리' : '지급'}
      </button>
    </div>
  );
};

export default SettlementCard;
