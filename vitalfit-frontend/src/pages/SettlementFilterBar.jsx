// import React from 'react'; // React 17+ JSX Transform

const SettlementFilterBar = ({
  centers,
  teams,
  trainers,
  selectedCenter,
  setSelectedCenter,
  selectedTeam,
  setSelectedTeam,
  selectedTrainer,
  setSelectedTrainer,
  search,
  setSearch,
  selectedMonth,
  setSelectedMonth,
}) => {
  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <div className="flex flex-wrap items-end gap-4">
        {/* 센터 선택 */}
        <div className="flex-1 min-w-[150px]">
          <label className="block text-sm font-medium text-gray-700 mb-1">센터</label>
          <select
            value={selectedCenter || ''}
            onChange={e => {
              setSelectedCenter(e.target.value || null);
              setSelectedTeam(null);
              setSelectedTrainer(null);
            }}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">전체 센터</option>
            {centers?.map(center => (
              <option key={center.id} value={center.id}>
                {center.name}
              </option>
            ))}
          </select>
        </div>

        {/* 팀 선택 */}
        <div className="flex-1 min-w-[150px]">
          <label className="block text-sm font-medium text-gray-700 mb-1">팀</label>
          <select
            value={selectedTeam || ''}
            onChange={e => {
              setSelectedTeam(e.target.value || null);
              setSelectedTrainer(null);
            }}
            disabled={!selectedCenter}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
          >
            <option value="">전체 팀</option>
            {teams?.map(team => (
              <option key={team.id} value={team.id}>
                {team.name}
              </option>
            ))}
          </select>
        </div>

        {/* 트레이너 선택 */}
        <div className="flex-1 min-w-[150px]">
          <label className="block text-sm font-medium text-gray-700 mb-1">트레이너</label>
          <select
            value={selectedTrainer || ''}
            onChange={e => setSelectedTrainer(e.target.value || null)}
            disabled={!selectedTeam}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
          >
            <option value="">트레이너 선택</option>
            {trainers?.map(trainer => (
              <option key={trainer.id} value={trainer.id}>
                {trainer.name}
              </option>
            ))}
          </select>
        </div>

        {/* 년도 선택 */}
        <div className="min-w-[120px]">
          <label className="block text-sm font-medium text-gray-700 mb-1">년도</label>
          <select
            value={selectedMonth ? selectedMonth.split('-')[0] : ''}
            onChange={e => {
              const month = selectedMonth ? selectedMonth.split('-')[1] : '01';
              setSelectedMonth(`${e.target.value}-${month}`);
            }}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">년도 선택</option>
            {Array.from({ length: 10 }, (_, i) => {
              const year = new Date().getFullYear() - 5 + i;
              return (
                <option key={year} value={year}>
                  {year}년
                </option>
              );
            })}
          </select>
        </div>

        {/* 월 선택 */}
        <div className="min-w-[120px]">
          <label className="block text-sm font-medium text-gray-700 mb-1">월</label>
          <select
            value={selectedMonth ? selectedMonth.split('-')[1] : ''}
            onChange={e => {
              const year = selectedMonth ? selectedMonth.split('-')[0] : new Date().getFullYear();
              setSelectedMonth(`${year}-${e.target.value}`);
            }}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">월 선택</option>
            {Array.from({ length: 12 }, (_, i) => {
              const month = String(i + 1).padStart(2, '0');
              return (
                <option key={month} value={month}>
                  {month}월
                </option>
              );
            })}
          </select>
        </div>

        {/* 검색 */}
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium text-gray-700 mb-1">회원명 검색</label>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="회원명을 입력하세요"
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>
    </div>
  );
};

export default SettlementFilterBar;
