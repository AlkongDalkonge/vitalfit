import React from 'react';

/**
 * PaymentPage 상단 필터 영역만 분리한 컴포넌트
 * - 부모(PaymentPage)에서 상태를 모두 관리하는 "Controlled Component" 방식
 * - 센터 → 팀 → 트레이너 순서로 연동
 */
const PaymentFilterBar = ({
  centers = [],
  teams = [],
  trainers = [],
  // 선택 상태
  selectedCenter,
  setSelectedCenter,
  selectedTeam,
  setSelectedTeam,
  selectedTrainer,
  setSelectedTrainer,
  // 이름 검색
  search,
  setSearch,
  // 월 선택
  selectedMonth,
  setSelectedMonth,
}) => {
  return (
    <div className="flex flex-wrap gap-4 items-center">
      {/* 지점 */}
      <select
        className="border rounded p-2"
        value={selectedCenter ?? ''}
        onChange={e => {
          const v = e.target.value ? Number(e.target.value) : null;
          setSelectedCenter(v);
          // 지점이 바뀌면 팀/트레이너 초기화
          setSelectedTeam(null);
          setSelectedTrainer(null);
        }}
      >
        <option value="">지점 선택</option>
        {centers.map(center => (
          <option key={center.id} value={center.id}>
            {center.name}
          </option>
        ))}
      </select>

      {/* 팀 */}
      <select
        className="border rounded p-2"
        value={selectedTeam ?? ''}
        onChange={e => {
          const v = e.target.value ? Number(e.target.value) : null;
          setSelectedTeam(v);
          setSelectedTrainer(null);
        }}
        disabled={!selectedCenter}
      >
        <option value="">팀 선택</option>
        {teams.map(team => (
          <option key={team.id} value={team.id}>
            {team.name}
          </option>
        ))}
      </select>

      {/* 트레이너 */}
      <select
        className="border rounded p-2"
        value={selectedTrainer ?? ''}
        onChange={e => {
          const v = e.target.value ? Number(e.target.value) : null;
          setSelectedTrainer(v);
        }}
        disabled={!selectedTeam}
      >
        <option value="">트레이너 선택</option>
        {trainers.map(trainer => (
          <option key={trainer.id} value={trainer.id}>
            {trainer.name}
          </option>
        ))}
      </select>

      {/* 이름 검색 */}
      <input
        type="text"
        className="border rounded p-2"
        placeholder="이름 검색 (예: 김트레이너)"
        value={search}
        onChange={e => setSearch(e.target.value)}
      />

      {/* 날짜(월) */}
      <select
        className="ml-auto border rounded p-2"
        value={selectedMonth}
        onChange={e => setSelectedMonth(e.target.value)}
      >
        <option value="2025-08">2025년 08월</option>
        <option value="2025-07">2025년 07월</option>
      </select>
    </div>
  );
};

export default PaymentFilterBar;
