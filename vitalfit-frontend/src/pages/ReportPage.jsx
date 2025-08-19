import { useState, useEffect } from 'react';
import { useTeam, useTeamRevenueStats } from '../hooks/useTeam';
import { useCenter } from '../hooks/useCenter';
import { useDatePicker } from '../hooks/useDatePicker';
import { FaUsers, FaChartLine, FaDumbbell, FaMoneyBillWave } from 'react-icons/fa';

const ReportPage = () => {
  const [selectedCenter, setSelectedCenter] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState(null);

  const { centers, loading: centersLoading } = useCenter();
  const { teams, loading: teamsLoading } = useTeam(selectedCenter);
  const { selectedYear, selectedMonth, DatePickerComponent } = useDatePicker();

  const {
    stats: teamStats,
    loading: statsLoading,
    error: statsError,
  } = useTeamRevenueStats(selectedTeam, selectedYear, selectedMonth);

  // 센터 선택 시 팀 목록 초기화
  useEffect(() => {
    setSelectedTeam(null);
  }, [selectedCenter]);

  // 로딩 상태
  const loading = centersLoading || teamsLoading || statsLoading;

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">팀 PT 매출 리포트</h1>

      {/* 필터 섹션 */}
      <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">필터 설정</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 센터 선택 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">센터 선택</label>
            <select
              value={selectedCenter || ''}
              onChange={e => setSelectedCenter(e.target.value ? Number(e.target.value) : null)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">전체 센터</option>
              {centers.map(center => (
                <option key={center.id} value={center.id}>
                  {center.name}
                </option>
              ))}
            </select>
          </div>

          {/* 팀 선택 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">팀 선택</label>
            <select
              value={selectedTeam || ''}
              onChange={e => setSelectedTeam(e.target.value ? Number(e.target.value) : null)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={!selectedCenter}
            >
              <option value="">팀을 선택하세요</option>
              {teams.map(team => (
                <option key={team.id} value={team.id}>
                  {team.name}
                </option>
              ))}
            </select>
          </div>

          {/* 날짜 선택 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">조회 기간</label>
            <DatePickerComponent />
          </div>
        </div>
      </div>

      {/* 로딩 상태 */}
      {loading && (
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex justify-center items-center h-32">
            <div className="text-gray-500">데이터를 불러오는 중...</div>
          </div>
        </div>
      )}

      {/* 에러 상태 */}
      {statsError && (
        <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
          <div className="text-red-500 text-center">{statsError}</div>
        </div>
      )}

      {/* 팀 매출 통계 */}
      {teamStats && !loading && (
        <div className="space-y-6">
          {/* 팀 전체 통계 */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              {teamStats.team.name} 팀 전체 통계 ({selectedYear}년 {selectedMonth}월)
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center">
                  <FaUsers className="text-blue-500 mr-2" />
                  <div>
                    <div className="text-sm text-gray-600">팀원 수</div>
                    <div className="text-xl font-bold text-gray-800">
                      {teamStats.team_statistics.members_count}명
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center">
                  <FaDumbbell className="text-green-500 mr-2" />
                  <div>
                    <div className="text-sm text-gray-600">총 PT 세션</div>
                    <div className="text-xl font-bold text-gray-800">
                      {teamStats.team_statistics.total_sessions}회
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 rounded-lg p-4">
                <div className="flex items-center">
                  <FaChartLine className="text-yellow-500 mr-2" />
                  <div>
                    <div className="text-sm text-gray-600">완료된 세션</div>
                    <div className="text-xl font-bold text-gray-800">
                      {teamStats.team_statistics.completed_sessions}회
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-purple-50 rounded-lg p-4">
                <div className="flex items-center">
                  <FaMoneyBillWave className="text-purple-500 mr-2" />
                  <div>
                    <div className="text-sm text-gray-600">총 매출</div>
                    <div className="text-xl font-bold text-gray-800">
                      ₩{teamStats.team_statistics.total_revenue.toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 팀원별 상세 통계 */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">팀원별 상세 통계</h3>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-700">팀원</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-700">역할</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-700">총 세션</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-700">완료 세션</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-700">정규 세션</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-700">무료 세션</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-700">총 수업시간</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-700">총 매출</th>
                  </tr>
                </thead>
                <tbody>
                  {teamStats.members.map(member => (
                    <tr key={member.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div>
                          <div className="font-medium text-gray-800">{member.name}</div>
                          {member.nickname && (
                            <div className="text-sm text-gray-500">{member.nickname}</div>
                          )}
                        </div>
                      </td>
                      <td className="text-center py-3 px-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            member.is_leader
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {member.is_leader ? '팀장' : '팀원'}
                        </span>
                      </td>
                      <td className="text-center py-3 px-4 font-medium">
                        {member.stats.pt_sessions.total}회
                      </td>
                      <td className="text-center py-3 px-4 font-medium">
                        {member.stats.pt_sessions.completed}회
                      </td>
                      <td className="text-center py-3 px-4 font-medium">
                        {member.stats.pt_sessions.regular}회
                      </td>
                      <td className="text-center py-3 px-4 font-medium">
                        {member.stats.pt_sessions.free}회
                      </td>
                      <td className="text-center py-3 px-4 font-medium">
                        {member.stats.pt_sessions.total_hours}시간
                      </td>
                      <td className="text-center py-3 px-4 font-bold text-green-600">
                        ₩{member.stats.revenue.total.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 매출 분포 차트 (간단한 텍스트 형태) */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">매출 분포</h3>

            <div className="space-y-3">
              {teamStats.members
                .sort((a, b) => b.stats.revenue.total - a.stats.revenue.total)
                .map((member, index) => {
                  const percentage =
                    teamStats.team_statistics.total_revenue > 0
                      ? (
                          (member.stats.revenue.total / teamStats.team_statistics.total_revenue) *
                          100
                        ).toFixed(1)
                      : 0;

                  return (
                    <div key={member.id} className="flex items-center">
                      <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-medium text-gray-800">
                            {member.name} {member.is_leader && '(팀장)'}
                          </span>
                          <span className="text-sm text-gray-600">{percentage}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                      <div className="ml-4 text-right">
                        <div className="font-bold text-gray-800">
                          ₩{member.stats.revenue.total.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}

      {/* 데이터가 없을 때 */}
      {!loading && !teamStats && selectedTeam && (
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="text-center text-gray-500">
            선택한 팀의 {selectedYear}년 {selectedMonth}월 데이터가 없습니다.
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportPage;
