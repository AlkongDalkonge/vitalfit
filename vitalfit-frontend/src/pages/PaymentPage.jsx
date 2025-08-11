import React, { useMemo, useState } from 'react';
import { useCenter } from '../hooks/useCenter';
import { useTeam } from '../hooks/useTeam';
import { useUserByTeam } from '../hooks/useUser';
import PaymentFilterBar from './PaymentFilterBar';

const PaymentPage = () => {
  const [selectedCenter, setSelectedCenter] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [selectedTrainer, setSelectedTrainer] = useState(null);

  // 이름 검색 & 월 선택
  const [search, setSearch] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('2025-08'); // 'YYYY-MM'

  // HOOKS: 센터 / 팀 / 트레이너 목록
  const { centers, loading: centerLoading, error: centerError } = useCenter();
  const { teams, loading: teamLoading } = useTeam(selectedCenter);
  const { users: trainers, loading: trainerLoading } = useUserByTeam(selectedTeam);

  // 트레이너/월 → 요약 데이터 훅
  const trainerId = selectedTrainer?.id ?? null;
  const [year, month] = useMemo(() => {
    if (!selectedMonth) return [null, null];
    const [y, m] = selectedMonth.split('-').map(Number);
    return [y, m];
  }, [selectedMonth]);

  // const trainerId = 3; // 임시 하드코딩
  // const year = 2025; // 임시 하드코딩
  // const month = 7; // 임시 하드코딩

  // const {
  //   data: ptSummary,
  //   loading: ptLoading,
  //   error: ptError,
  //   refetch: refetchSummary,
  // } = usePTSummary(trainerId, year, month);

  // 검색 필터 (회원명 기준, 부분 일치)
  // const filteredRows = useMemo(() => {
  //   const q = search?.trim().toLowerCase() ?? '';
  //   if (!q) return ptSummary || [];
  //   return (ptSummary || []).filter(r =>
  //     String(r.member_name || '')
  //       .toLowerCase()
  //       .includes(q)
  //   );
  // }, [ptSummary, search]);

  return (
    <div className="p-6 space-y-8 max-w-[1200px] mx-auto bg-white rounded-xl shadow">
      {/* 필터 영역 */}
      <PaymentFilterBar
        centers={centers}
        teams={teams}
        trainers={trainers}
        selectedCenter={selectedCenter}
        setSelectedCenter={setSelectedCenter}
        selectedTeam={selectedTeam}
        setSelectedTeam={setSelectedTeam}
        selectedTrainer={selectedTrainer}
        setSelectedTrainer={setSelectedTrainer}
        search={search}
        setSearch={setSearch}
        selectedMonth={selectedMonth}
        setSelectedMonth={setSelectedMonth}
      />

      {/* 카드 요약 영역 (임시 고정 값 - 이후 API 연동시 교체) */}
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
