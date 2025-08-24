import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { paymentAPI, memberAPI, apiGet } from '../utils/api';
import PaymentCreateModal from './PaymentCreateModal';
import PaymentEditModal from './PaymentEditModal';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';

const PaymentHistoryPage = () => {
  const { memberId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  console.log('PaymentHistoryPage 렌더링됨, memberId:', memberId);

  // PT 결제 조회 권한 체크 함수
  const hasPaymentPermission = () => {
    if (!currentUser || !member) return false;

    // 관리자(12, 99)는 모든 권한
    if (currentUser.position_id === 12 || currentUser.position_id === 99) {
      return true;
    }

    // 포지션 1~6: 본인 담당 멤버의 PT 결제만 조회 가능
    if (currentUser.position_id >= 1 && currentUser.position_id <= 6) {
      return Number(member.trainer_id) === Number(currentUser.id);
    }

    // 포지션 7~10: 소속 팀 멤버의 PT 결제 조회 가능
    if (currentUser.position_id >= 7 && currentUser.position_id <= 10) {
      return true; // 팀 권한은 백엔드에서 처리
    }

    // 포지션 11: 소속 센터 멤버의 PT 결제 조회 가능
    if (currentUser.position_id === 11) {
      return true; // 센터 권한은 백엔드에서 처리
    }

    return false;
  };

  // PT 결제 관리 권한 체크 함수 - 담당 트레이너만 관리 가능
  const hasPaymentManagementPermission = () => {
    if (!currentUser || !member) return false;

    // 관리자(12, 99)는 모든 권한
    if (currentUser.position_id === 12 || currentUser.position_id === 99) {
      return true;
    }

    // 담당 트레이너인지 확인 (타입 변환하여 비교)
    const isTrainer = Number(member.trainer_id) === Number(currentUser.id);

    console.log('🔍 PT 결제 관리 권한 체크:', {
      currentUser: {
        id: currentUser.id,
        name: currentUser.name,
        position_id: currentUser.position_id,
      },
      member: {
        id: member.id,
        name: member.name,
        trainer_id: member.trainer_id,
      },
      isTrainer: isTrainer,
    });

    return isTrainer;
  };

  const [member, setMember] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 결제 등록 모달 상태
  const [isPaymentCreateModalOpen, setIsPaymentCreateModalOpen] = useState(false);

  // 결제 수정 모달 상태
  const [isPaymentEditModalOpen, setIsPaymentEditModalOpen] = useState(false);
  const [selectedPaymentId, setSelectedPaymentId] = useState(null);

  useEffect(() => {
    console.log('PaymentHistoryPage useEffect 실행됨, memberId:', memberId);
    loadData();
  }, [memberId]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('PaymentHistoryPage 로드됨, memberId:', memberId);

      // 멤버 정보와 결제 내역을 동시에 로드
      console.log('API 호출 시작 - memberId:', memberId);
      console.log('호출할 API:', `/members/${memberId}/payments`);

      const [memberResponse, paymentsResponse] = await Promise.all([
        memberAPI.getMember(memberId),
        apiGet(`/members/${memberId}/payments`),
      ]);

      console.log('멤버 응답:', memberResponse);
      console.log('결제 응답:', paymentsResponse);

      if (memberResponse.success) {
        setMember(memberResponse.data.member);
      } else {
        console.error('멤버 조회 실패:', memberResponse);
        setError(`멤버 정보를 불러올 수 없습니다: ${memberResponse.message}`);
      }

      if (paymentsResponse.success) {
        setPayments(paymentsResponse.data.payments || []);
      } else {
        console.error('결제 조회 실패:', paymentsResponse);
        setError(`결제 내역을 불러올 수 없습니다: ${paymentsResponse.message}`);
      }
    } catch (error) {
      console.error('데이터 로드 실패:', error);
      setError(`데이터를 불러오는 중 오류가 발생했습니다: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = dateString => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR');
  };

  const formatCurrency = amount => {
    if (!amount) return '0원';
    return new Intl.NumberFormat('ko-KR').format(amount) + '원';
  };

  const getPaymentMethodText = method => {
    const methods = {
      cash: '현금',
      card: '카드',
      transfer: '계좌이체',
      mobile: '모바일결제',
    };
    return methods[method] || method;
  };

  const getStatusText = status => {
    const statuses = {
      active: '활성',
      inactive: '비활성',
      pending: '대기',
      cancelled: '취소',
    };
    return statuses[status] || status;
  };

  // 결제 등록 관련 핸들러들
  const handleRegisterPayment = () => {
    // 권한 체크
    if (!hasPaymentManagementPermission()) {
      toast.warning('PT 결제 등록 권한이 없습니다.');
      return;
    }
    setIsPaymentCreateModalOpen(true);
  };

  const handleClosePaymentCreateModal = () => {
    setIsPaymentCreateModalOpen(false);
  };

  const handleCreatePayment = newPayment => {
    // 결제 생성 후 데이터 새로고침
    console.log('새 결제 생성:', newPayment);
    setIsPaymentCreateModalOpen(false);
    loadData(); // 결제 내역 새로고침
  };

  // 결제 수정 관련 핸들러들
  const handleEditPayment = paymentId => {
    // 권한 체크
    if (!hasPaymentManagementPermission()) {
      toast.warning('PT 결제 수정 권한이 없습니다.');
      return;
    }
    setSelectedPaymentId(paymentId);
    setIsPaymentEditModalOpen(true);
  };

  const handleClosePaymentEditModal = () => {
    setIsPaymentEditModalOpen(false);
    setSelectedPaymentId(null);
  };

  const handleUpdatePayment = updatedPayment => {
    console.log('결제가 수정되었습니다:', updatedPayment);
    loadData(); // 데이터 새로고침
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-7xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => navigate('/pay')}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            돌아가기
          </button>
        </div>
      </div>
    );
  }

  // 권한 체크
  if (!hasPaymentPermission()) {
    return (
      <div className="w-full max-w-7xl mx-auto p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800 font-medium">접근 권한이 없습니다</p>
          <p className="text-yellow-700 mt-1">PT 결제 내역을 조회할 권한이 없습니다.</p>
          <button
            onClick={() => navigate('/pay')}
            className="mt-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
          >
            돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto pt-0 px-6 pb-6 min-h-screen flex flex-col">
      <div className="flex flex-col gap-6 flex-1">
        {/* 헤더 */}
        <div className="flex items-center justify-between bg-white rounded-lg p-4 shadow-sm">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/pay')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path
                  d="M15 10L5 10M5 10L10 15M5 10L10 5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <div className="py-0">
              <h1 className="text-2xl font-bold text-gray-900">결제 내역</h1>
              <p className="text-gray-600">
                멤버 ID: {memberId} - {member?.name} ({member?.phone})
              </p>
            </div>
          </div>
        </div>

        {/* 요약 정보 섹션 */}
        {payments.length > 0 && (
          <div className="flex justify-between items-center bg-white p-3 rounded-lg shadow-sm border">
            <div className="flex items-center gap-16 pl-8">
              {/* 총 결제 금액 */}
              <div className="text-center">
                <div className="text-2xl font-bold text-cyan-600">
                  {formatCurrency(payments.reduce((sum, p) => sum + (p.payment_amount || 0), 0))}
                </div>
                <div className="text-sm text-gray-600">총 결제 금액</div>
              </div>

              {/* 구분선 */}
              <div className="h-12 w-px bg-gray-200"></div>

              {/* 총 PT세션 */}
              <div className="text-center">
                <div className="text-2xl font-bold text-black">
                  {payments.reduce((sum, p) => sum + (p.session_count || 0), 0)}회
                </div>
                <div className="text-sm text-gray-600">총 PT세션</div>
              </div>

              {/* 구분선 */}
              <div className="h-12 w-px bg-gray-200"></div>

              {/* 총 보너스세션 */}
              <div className="text-center">
                <div className="text-2xl font-bold text-black">
                  {payments.reduce((sum, p) => sum + (p.free_session_count || 0), 0)}회
                </div>
                <div className="text-sm text-gray-600">총 보너스세션</div>
              </div>
            </div>
          </div>
        )}

        {/* 결제 내역 테이블 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">결제 내역 목록</h2>
            <p className="text-sm text-gray-600 mt-1">
              총 {payments.length}건의 결제 내역이 있습니다.
            </p>
          </div>

          {payments.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-gray-400 mb-4">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" className="mx-auto">
                  <path
                    d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <p className="text-gray-500">결제 내역이 없습니다.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      회차
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      결제일
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      결제금액
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      PT세션 수
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      보너스세션 수
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      결제방법
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      담당트레이너
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      메모
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {payments.map((payment, index) => (
                    <tr key={payment.id} className="hover:bg-gray-50">
                      <td
                        className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 font-medium cursor-pointer hover:text-blue-800 hover:underline"
                        onClick={() => handleEditPayment(payment.id)}
                        title="클릭하여 결제 수정"
                      >
                        {payments.length - index}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(payment.payment_date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatCurrency(payment.payment_amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {payment.session_count || 0}회
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {payment.free_session_count || 0}회
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {getPaymentMethodText(payment.payment_method)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {payment.trainer?.name || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                        {payment.notes || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* 결제 등록 버튼 */}
        <div className="flex justify-end mt-6">
          <button
            onClick={handleRegisterPayment}
            disabled={!hasPaymentManagementPermission()}
            className={`Button w-40 h-11 p-2.5 rounded-[10px] inline-flex justify-center items-center gap-2.5 transition-all duration-200 shadow-lg hover:shadow-xl relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/15 before:via-transparent before:to-transparent before:pointer-events-none ${
              hasPaymentManagementPermission()
                ? 'bg-gradient-to-br from-blue-400 to-blue-600 hover:from-blue-500 hover:to-blue-700'
                : 'bg-gray-400 cursor-not-allowed'
            }`}
          >
            <div
              data-layer="Primary Button"
              className="PrimaryButton justify-start text-white text-sm font-medium font-['Nunito'] leading-normal drop-shadow-xl"
            >
              결제 등록
            </div>
          </button>
        </div>

        {/* 결제 등록 모달 */}
        <PaymentCreateModal
          isOpen={isPaymentCreateModalOpen}
          onClose={handleClosePaymentCreateModal}
          onCreate={handleCreatePayment}
          memberId={memberId}
        />

        {/* 결제 수정 모달 */}
        <PaymentEditModal
          isOpen={isPaymentEditModalOpen}
          onClose={handleClosePaymentEditModal}
          onUpdate={handleUpdatePayment}
          paymentId={selectedPaymentId}
          memberId={memberId}
        />
      </div>
    </div>
  );
};

export default PaymentHistoryPage;
