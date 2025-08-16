// import React from 'react'; // React 17+ JSX Transform

const SettlementTable = ({
  filteredPayments,
  paymentLoading,
  paymentError,
  selectedTrainer,
  year,
  month,
}) => {
  return (
    <div className="w-full md:w-1/2 overflow-x-auto">
      {paymentLoading ? (
        <div className="text-center py-8">로딩 중...</div>
      ) : paymentError ? (
        <div className="text-center py-8 text-red-500">오류: {paymentError}</div>
      ) : !selectedTrainer ? (
        <div className="text-center py-8 text-gray-500">트레이너를 선택해주세요.</div>
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
  );
};

export default SettlementTable;
