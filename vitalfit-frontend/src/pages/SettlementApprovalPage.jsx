import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import SettlementCard from '../components/SettlementCard';
import SettlementApprovalTable from '../components/SettlementApprovalTable';
import SettlementPaymentTable from '../components/SettlementPaymentTable';
import { settlementAPI } from '../utils/api';

const SettlementApprovalPage = () => {
  const { user } = useAuth();
  const [settlements, setSettlements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);

  // 권한 체크 함수들
  const isEmployee = () => user?.position_id === 1 || user?.position_id === 2;
  const isTeamLeader = () => user?.position_id === 7;
  const isCenterManager = () => user?.position_id === 11;
  const isManager = () => isTeamLeader() || isCenterManager();
  const isFinance = () => user?.position_id === 12;
  const isAdmin = () => user?.position_id === 9;

  // 권한 디버그 로그
  // console.log('🔍 권한 체크 디버그:', {
  //   user_position_id: user?.position_id,
  //   isEmployee: isEmployee(),
  //   isTeamLeader: isTeamLeader(),
  //   isCenterManager: isCenterManager(),
  //   isManager: isManager(),
  //   isFinance: isFinance(),
  //   isAdmin: isAdmin(),
  // });

  // 정산 데이터 로드
  const loadSettlements = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        year: selectedYear,
        month: selectedMonth,
        ...(isManager() && !isAdmin() && { center_id: user?.center_id }),
        ...(isEmployee() && !isAdmin() && { user_id: user?.id }),
      };

      const response = await settlementAPI.getSettlements(params);

      if (response.success) {
        setSettlements(response.data);
      } else {
        setError(response.message || '정산 데이터를 불러오는데 실패했습니다.');
      }
    } catch (err) {
      console.error('정산 데이터 로드 오류:', err);
      setError('정산 데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettlements();
  }, [selectedYear, selectedMonth, user]);

  // 센터장 승인 처리
  const handleApprove = async settlementId => {
    try {
      const response = await settlementAPI.approve(settlementId, user?.id, user?.center_id);

      if (response.success) {
        toast.success('정산 승인이 완료되었습니다.');
        loadSettlements(); // 데이터 새로고침
        // 헤더 알림 카운트 즉시 업데이트
        if (window.refreshNotificationCount) {
          window.refreshNotificationCount();
        }
      } else {
        toast.error(response.message || '승인 처리 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('승인 처리 오류:', error);
      toast.error('승인 처리 중 오류가 발생했습니다.');
    }
  };



  // 승인 처리 후 데이터 새로고침
  const handleActionComplete = () => {
    loadSettlements();
  };

  // 직원 화면: 본인 정산 카드
  const renderEmployeeView = () => {
    const mySettlements = settlements.filter(s => s.user_id === user?.id);

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">내 정산 확인</h1>
          <div className="flex gap-2">
            <select
              value={selectedYear}
              onChange={e => setSelectedYear(Number(e.target.value))}
              className="border border-gray-300 rounded px-3 py-2"
            >
              {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
                <option key={year} value={year}>
                  {year}년
                </option>
              ))}
            </select>
            <select
              value={selectedMonth}
              onChange={e => setSelectedMonth(Number(e.target.value))}
              className="border border-gray-300 rounded px-3 py-2"
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                <option key={month} value={month}>
                  {month}월
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">정산 데이터를 불러오는 중...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-600">{error}</p>
            <button
              onClick={loadSettlements}
              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              다시 시도
            </button>
          </div>
        ) : mySettlements.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600">해당 월의 정산 데이터가 없습니다.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {mySettlements.map(settlement => (
              <SettlementCard
                key={settlement.id}
                settlement={settlement}
                userRole="employee"
                user={user}
                onActionComplete={handleActionComplete}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  // 지점장 화면: 승인 대기 목록
  const renderManagerView = () => {
    const pendingSettlements = settlements.filter(s => s.status === 'acknowledged');

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">정산 승인</h1>
          <div className="flex gap-2">
            <select
              value={selectedYear}
              onChange={e => setSelectedYear(Number(e.target.value))}
              className="border border-gray-300 rounded px-3 py-2"
            >
              {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
                <option key={year} value={year}>
                  {year}년
                </option>
              ))}
            </select>
            <select
              value={selectedMonth}
              onChange={e => setSelectedMonth(Number(e.target.value))}
              className="border border-gray-300 rounded px-3 py-2"
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                <option key={month} value={month}>
                  {month}월
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">정산 데이터를 불러오는 중...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-600">{error}</p>
            <button
              onClick={loadSettlements}
              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              다시 시도
            </button>
          </div>
        ) : (
          <SettlementApprovalTable
            settlements={pendingSettlements}
            user={user}
            onActionComplete={handleActionComplete}
          />
        )}
      </div>
    );
  };

  // 회계 화면: 지급 처리 목록
  const renderFinanceView = () => {
    const confirmedSettlements = settlements.filter(s => s.status === 'center_approved');

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">정산 지급 처리</h1>
          <div className="flex gap-2">
            <select
              value={selectedYear}
              onChange={e => setSelectedYear(Number(e.target.value))}
              className="border border-gray-300 rounded px-3 py-2"
            >
              {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
                <option key={year} value={year}>
                  {year}년
                </option>
              ))}
            </select>
            <select
              value={selectedMonth}
              onChange={e => setSelectedMonth(Number(e.target.value))}
              className="border border-gray-300 rounded px-3 py-2"
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                <option key={month} value={month}>
                  {month}월
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">정산 데이터를 불러오는 중...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-600">{error}</p>
            <button
              onClick={loadSettlements}
              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              다시 시도
            </button>
          </div>
        ) : (
          <SettlementPaymentTable
            settlements={confirmedSettlements}
            onActionComplete={handleActionComplete}
          />
        )}
      </div>
    );
  };

  // 센터장 화면: 본인 센터 승인 관리
  const renderCenterManagerView = () => {
    const pendingApprovals = settlements.filter(s => s.status === 'acknowledged');

    return (
      <div className="space-y-6">
        {/* 디버그 정보 표시 */}
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          <h3 className="font-bold mb-2">🔍 디버그 정보</h3>
          <div className="text-sm space-y-1">
            <div>
              <strong>사용자:</strong> {JSON.stringify(user)}
            </div>
            <div>
              <strong>사용자 position_id:</strong> {user?.position_id}
            </div>
            <div>
              <strong>정산 데이터 개수:</strong> {settlements.length}
            </div>
            <div>
              <strong>승인 대기 개수:</strong> {pendingApprovals.length}
            </div>
            <div>
              <strong>정산 상태들:</strong> {settlements.map(s => `${s.id}:${s.status}`).join(', ')}
            </div>
            <div>
              <strong>승인 대기 목록:</strong>{' '}
              {pendingApprovals.map(s => `${s.id}:${s.trainer?.name}`).join(', ')}
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">센터 정산 승인</h1>
          <div className="flex gap-2">
            <select
              value={selectedYear}
              onChange={e => setSelectedYear(Number(e.target.value))}
              className="border border-gray-300 rounded px-3 py-2"
            >
              {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
                <option key={year} value={year}>
                  {year}년
                </option>
              ))}
            </select>
            <select
              value={selectedMonth}
              onChange={e => setSelectedMonth(Number(e.target.value))}
              className="border border-gray-300 rounded px-3 py-2"
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                <option key={month} value={month}>
                  {month}월
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">정산 데이터를 불러오는 중...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-600">{error}</p>
            <button
              onClick={loadSettlements}
              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              다시 시도
            </button>
          </div>
        ) : (
          <div className="grid gap-6">
            {/* 승인 대기 목록 */}
            <div>
              <h2 className="text-lg font-semibold mb-4">
                승인 대기 ({pendingApprovals.length}건)
              </h2>
              {pendingApprovals.length > 0 ? (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          직원
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
                          액션
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {pendingApprovals.map(settlement => (
                        <tr key={settlement.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {settlement.trainer?.name || '알 수 없음'}
                            </div>
                            <div className="text-sm text-gray-500">
                              {settlement.trainer?.nickname}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {settlement.settlement_year}년 {settlement.settlement_month}월
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Intl.NumberFormat('ko-KR').format(
                              settlement.total_settlement || 0
                            )}
                            원
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {settlement.acknowledged_at
                              ? new Date(settlement.acknowledged_at).toLocaleDateString('ko-KR')
                              : '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => handleApprove(settlement.id)}
                              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                            >
                              승인
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <p className="text-gray-500">승인 대기 중인 정산이 없습니다.</p>
                </div>
              )}
            </div>

            {/* 승인 완료 목록 */}
            <div>
              <h2 className="text-lg font-semibold mb-4">승인 완료</h2>
              <SettlementApprovalTable
                settlements={settlements.filter(s => s.status === 'confirmed')}
                user={user}
                onActionComplete={handleActionComplete}
              />
            </div>
          </div>
        )}
      </div>
    );
  };

  // 관리자 화면: 전체 관리
  const renderAdminView = () => {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">정산 관리</h1>
          <div className="flex gap-2">
            <select
              value={selectedYear}
              onChange={e => setSelectedYear(Number(e.target.value))}
              className="border border-gray-300 rounded px-3 py-2"
            >
              {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
                <option key={year} value={year}>
                  {year}년
                </option>
              ))}
            </select>
            <select
              value={selectedMonth}
              onChange={e => setSelectedMonth(Number(e.target.value))}
              className="border border-gray-300 rounded px-3 py-2"
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                <option key={month} value={month}>
                  {month}월
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">정산 데이터를 불러오는 중...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-600">{error}</p>
            <button
              onClick={loadSettlements}
              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              다시 시도
            </button>
          </div>
        ) : (
          <div className="grid gap-6">
            {/* 승인 대기 목록 */}
            <div>
              <h2 className="text-lg font-semibold mb-4">승인 대기</h2>
              <SettlementApprovalTable
                settlements={settlements.filter(s => s.status === 'acknowledged')}
                user={user}
                onActionComplete={handleActionComplete}
              />
            </div>

            {/* 지급 대기 목록 */}
            <div>
              <h2 className="text-lg font-semibold mb-4">지급 대기</h2>
              <SettlementPaymentTable
                settlements={settlements.filter(s => s.status === 'center_approved')}
                onActionComplete={handleActionComplete}
              />
            </div>
          </div>
        )}
      </div>
    );
  };

  // 권한에 따른 화면 렌더링
  const renderContent = () => {
    if (isAdmin()) {
      return renderAdminView();
    } else if (isFinance()) {
      return renderFinanceView();
    } else if (isCenterManager()) {
      return renderCenterManagerView();
    } else if (isTeamLeader()) {
      return renderManagerView();
    } else if (isEmployee()) {
      return renderEmployeeView();
    } else {
      return (
        <div className="text-center py-8">
          <p className="text-gray-600">정산 승인 권한이 없습니다.</p>
        </div>
      );
    }
  };

  return <div className="p-6 max-w-7xl mx-auto">{renderContent()}</div>;
};

export default SettlementApprovalPage;
