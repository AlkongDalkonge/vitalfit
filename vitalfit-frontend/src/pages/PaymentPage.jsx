import React from 'react';

const PaymentPage = () => {
  return (
    <div className="p-6 space-y-8 max-w-[1200px] mx-auto bg-white rounded-xl shadow">
      {/* 필터 영역 */}
      <div className="flex flex-wrap gap-4 items-center">
        <select className="border rounded p-2">
          <option>지점 선택</option>
        </select>
        <select className="border rounded p-2">
          <option>팀 선택</option>
        </select>
        <select className="border rounded p-2">
          <option>직급 선택</option>
        </select>
        <select className="border rounded p-2">
          <option>트레이너 선택</option>
        </select>
        <select className="ml-auto border rounded p-2">
          <option>2025년 08월</option>
          <option>2025년 07월</option>
        </select>
      </div>

      {/* 카드 요약 영역 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-yellow-100 p-4 rounded text-center">
          <div className="text-sm text-gray-500">보너스</div>
          <div className="text-xl font-bold text-yellow-800">200,000원</div>
        </div>
        <div className="bg-blue-50 p-4 rounded text-center">
          <div className="text-sm text-gray-500">수업 총매출</div>
          <div className="text-xl font-bold text-blue-800">10,316,000원</div>
        </div>
        <div className="bg-green-50 p-4 rounded text-center">
          <div className="text-sm text-gray-500">PT 이벤트 매출</div>
          <div className="text-xl font-bold text-green-800">320,000원</div>
        </div>
        <div className="bg-purple-50 p-4 rounded text-center">
          <div className="text-sm text-gray-500">커미션</div>
          <div className="text-xl font-bold text-purple-800">700,000원</div>
        </div>
      </div>

      {/* 테이블 + 계산기 레이아웃 */}
      <div className="md:flex gap-6 items-start">
        {/* 테이블 */}
        <div className="w-full md:w-1/2 overflow-x-auto">
          <table className="w-full border text-sm">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="p-2 border w-1/3">회원명</th>
                <th className="p-2 border w-1/3">PT 종류</th>
                <th className="p-2 border w-1/3 text-right">매출</th>
              </tr>
            </thead>
            <tbody>
              {[...Array(20)].map((_, idx) => (
                <tr key={idx}>
                  <td className="p-2 border">회원 {idx + 1}</td>
                  <td className="p-2 border">일반매출</td>
                  <td className="p-2 border text-right">
                    {(100000 + idx * 10000).toLocaleString()}원
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 오른쪽 고정 패널 */}
        <div className="w-full md:w-1/2 space-y-4 sticky top-6">
          <div className="bg-gray-100 p-4 rounded shadow">
            <h2 className="text-base font-bold mb-2">정산 계산기</h2>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>일반매출</div>
              <div className="text-right">10,098,636원</div>
              <div>66/99매출</div>
              <div className="text-right">0원</div>
              <div>고정수업매출</div>
              <div className="text-right">0원</div>
              <div className="font-bold">순매출</div>
              <div className="text-right font-bold text-black bg-black text-white px-1 rounded">
                10,316,000원
              </div>
              <div>PT이벤트매출</div>
              <div className="text-right">320,000원</div>
              <div>수업비 매출</div>
              <div className="text-right">10,000,000원</div>
              <div>커미션 매출</div>
              <div className="text-right">10,000,000원</div>
              <div className="font-bold text-purple-600">커미션</div>
              <div className="text-right font-bold text-purple-600">700,000원</div>
              <div className="text-blue-600">이월매출</div>
              <div className="text-right text-blue-600">316,000원</div>
              <div className="text-red-600">환불금</div>
              <div className="text-right text-red-600">0원</div>
              <div>저번달 이월매출</div>
              <div className="text-right">217,364원</div>
              <div>팀 PT매출</div>
              <div className="text-right">27,478,182원</div>
              <div>센터매출</div>
              <div className="text-right">0원</div>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded">
            <h2 className="text-sm font-bold mb-2">팀장 메뉴</h2>
            <label className="flex items-center gap-2 mb-1">
              <input type="checkbox" /> 1000만원
            </label>
            <label className="flex items-center gap-2 mb-1">
              <input type="checkbox" /> 1200만원
            </label>
            <label className="flex items-center gap-2 mb-1">
              <input type="checkbox" /> 1500만원
            </label>
          </div>

          <div className="bg-gray-50 p-4 rounded">
            <h2 className="text-sm font-bold mb-2">과장 메뉴</h2>
            <label className="flex items-center gap-2 mb-1">
              센터매출 인센(%):
              <input type="number" className="border rounded p-1 w-16" />
            </label>
            <label className="flex items-center gap-2 mb-1">
              센매 인센:
              <input type="number" className="border rounded p-1 w-16" />
            </label>
          </div>

          <div className="bg-yellow-100 p-4 rounded text-center">
            <div className="text-sm text-gray-500">영업지원금</div>
            <div className="text-xl font-bold text-yellow-800">1,800,000원</div>
          </div>
        </div>
      </div>

      {/* 엑셀 다운로드 버튼 */}
      <div className="flex justify-end mt-6">
        <button className="bg-gradient-to-br from-cyan-500 to-indigo-800 text-white px-6 py-2 rounded">
          엑셀 다운로드
        </button>
      </div>
    </div>
  );
};

export default PaymentPage;
