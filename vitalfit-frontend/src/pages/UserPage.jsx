import React from 'react';
import { useUser } from '../utils/hooks';
import {
  getUserStatusText,
  getUserRoleText,
  getUserStatusColor,
  getUserRoleColor,
  formatPhoneNumber,
} from '../utils/userUtils';

const UserPage = () => {
  // 커스텀 훅 사용
  const {
    users,
    centers,
    teams,
    loading,
    error,
    searchTerm,
    selectedCenter,
    selectedTeam,
    showCenterDropdown,
    showTeamDropdown,
    handleCenterChange,
    handleTeamChange,
    handleSearchChange,
    setShowCenterDropdown,
    setShowTeamDropdown,
  } = useUser();

  // 직원 등록 핸들러
  const handleRegisterUser = () => {
    console.log('직원 등록 버튼 클릭됨');
    // TODO: 직원 등록 모달 또는 페이지로 이동
    alert('직원 등록 기능이 준비 중입니다.');
  };

  // 사용자 상세보기 핸들러
  const handleViewUser = userId => {
    console.log('사용자 상세보기:', userId);
    // TODO: 사용자 상세 정보 모달 또는 페이지로 이동
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
      <div className="flex justify-center items-center h-64">
        <div className="text-red-500 text-center">
          <p className="text-lg font-semibold mb-2">오류가 발생했습니다</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-6 h-screen flex flex-col overflow-hidden">
      <div className="flex flex-col gap-6 flex-1 overflow-hidden">
        {/* 최상단 제목 */}
        <div className="text-black text-3xl font-extrabold font-['Nunito'] pt-2">모든 직원</div>

        {/* 필터 및 검색 섹션 */}
        <div className="flex justify-end items-start pr-8 pt-[20px] pl-[30px] flex-shrink-0">
          <div className="flex gap-4 items-center -mt-2">
            {/* 검색창 */}
            <div className="w-[200px] h-[30px] relative">
              <input
                type="text"
                value={searchTerm}
                onChange={e => handleSearchChange(e.target.value)}
                placeholder="이름, 이메일로 검색"
                className="w-full h-full bg-sky-50 rounded-[8px] border border-gray-200 px-3 text-xs font-normal font-['Nunito'] focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
            </div>

            {/* 센터 필터 */}
            <div className="w-[120px] h-[30px] flex flex-col justify-start items-start dropdown-container relative">
              <div className="w-[120px] h-[30px] bg-sky-50 rounded-[8px] border border-gray-200 relative">
                <button
                  onClick={() => setShowCenterDropdown(!showCenterDropdown)}
                  className="w-full h-full flex justify-between items-center px-3"
                >
                  <div className="justify-start text-neutral-400 text-xs font-normal font-['Nunito'] leading-normal">
                    {selectedCenter === 'Select option' ? '센터' : selectedCenter}
                  </div>
                  <svg
                    className="w-3 h-3 text-neutral-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {/* 드롭다운 메뉴 */}
                {showCenterDropdown && (
                  <div className="absolute top-full left-0 w-[120px] bg-white border border-gray-200 rounded-[8px] shadow-lg z-10 mt-1">
                    <div className="py-1">
                      <button
                        onClick={() => handleCenterChange('Select option')}
                        className="w-full px-3 py-1.5 text-left text-xs text-neutral-600 hover:bg-sky-50"
                      >
                        전체
                      </button>
                      {centers.map(center => (
                        <button
                          key={center.id}
                          onClick={() => handleCenterChange(center.name)}
                          className="w-full px-3 py-1.5 text-left text-xs text-neutral-600 hover:bg-sky-50"
                        >
                          {center.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 팀 필터 */}
            <div className="w-[120px] h-[30px] flex flex-col justify-start items-start dropdown-container relative">
              <div className="w-[120px] h-[30px] bg-sky-50 rounded-[8px] border border-gray-200 relative">
                <button
                  onClick={() => setShowTeamDropdown(!showTeamDropdown)}
                  className="w-full h-full flex justify-between items-center px-3"
                >
                  <div className="justify-start text-neutral-400 text-xs font-normal font-['Nunito'] leading-normal">
                    {selectedTeam === 'Select option' ? '팀' : selectedTeam}
                  </div>
                  <svg
                    className="w-3 h-3 text-neutral-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {/* 드롭다운 메뉴 */}
                {showTeamDropdown && (
                  <div className="absolute top-full left-0 w-[120px] bg-white border border-gray-200 rounded-[8px] shadow-lg z-10 mt-1">
                    <div className="py-1">
                      <button
                        onClick={() => handleTeamChange('Select option')}
                        className="w-full px-3 py-1.5 text-left text-xs text-neutral-600 hover:bg-sky-50"
                      >
                        전체
                      </button>
                      {teams.map(team => (
                        <button
                          key={team.id}
                          onClick={() => handleTeamChange(team.name)}
                          className="w-full px-3 py-1.5 text-left text-xs text-neutral-600 hover:bg-sky-50"
                        >
                          {team.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 직원 목록 테이블 */}
        <div className="bg-white flex-1 overflow-hidden rounded-lg shadow-sm border">
          {/* 페이지 표시 */}
          <div className="flex justify-end p-4">
            <div className="text-neutral-600 text-sm font-normal font-['Nunito'] leading-normal">
              page 1
            </div>
          </div>

          {/* 테이블 컨테이너 */}
          <div className="overflow-hidden">
            <div className="overflow-y-auto max-h-[calc(100vh-300px)]">
              {/* 테이블 헤더 */}
              <div className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
                <div className="flex items-center p-4 min-w-max">
                  <div className="w-24 text-neutral-800 text-sm font-semibold font-['Nunito'] leading-normal">
                    직원명
                  </div>
                  <div className="w-20 text-neutral-800 text-sm font-semibold font-['Nunito'] leading-normal">
                    직원 ID
                  </div>
                  <div className="w-40 text-neutral-800 text-sm font-semibold font-['Nunito'] leading-normal">
                    Email
                  </div>
                  <div className="w-32 text-neutral-800 text-sm font-semibold font-['Nunito'] leading-normal">
                    휴대폰 번호
                  </div>
                  <div className="w-24 text-neutral-800 text-sm font-semibold font-['Nunito'] leading-normal">
                    소속 센터
                  </div>
                  <div className="w-20 text-neutral-800 text-sm font-semibold font-['Nunito'] leading-normal">
                    팀
                  </div>
                  <div className="w-24 text-neutral-800 text-sm font-semibold font-['Nunito'] leading-normal">
                    역할
                  </div>
                  <div className="w-20 text-neutral-800 text-sm font-semibold font-['Nunito'] leading-normal">
                    상태
                  </div>
                </div>
              </div>

              {/* 테이블 데이터 */}
              <div className="bg-white">
                {users.length === 0 ? (
                  <div className="flex justify-center items-center h-48">
                    <div className="text-center text-gray-500">
                      <p className="text-lg mb-2">등록된 직원이 없습니다</p>
                      <p className="text-sm">새로운 직원을 등록해보세요</p>
                    </div>
                  </div>
                ) : (
                  users.map(user => (
                    <div key={user.id} className="hover:bg-gray-50 transition-colors duration-200">
                      <div className="flex items-center p-4 min-w-max">
                        <div className="w-24">
                          <button
                            onClick={() => handleViewUser(user.id)}
                            className="text-cyan-600 text-sm font-normal font-['Nunito'] leading-normal hover:text-cyan-800 hover:underline cursor-pointer transition-colors duration-200"
                          >
                            {user.name || '-'}
                          </button>
                        </div>
                        <div className="w-20 text-neutral-600 text-sm font-normal font-['Nunito'] leading-normal">
                          {user.id}
                        </div>
                        <div className="w-40 text-neutral-600 text-sm font-normal font-['Nunito'] leading-normal">
                          {user.email || '-'}
                        </div>
                        <div className="w-32 text-neutral-600 text-sm font-normal font-['Nunito'] leading-normal">
                          {formatPhoneNumber(user.phone) || '-'}
                        </div>
                        <div className="w-24 text-neutral-600 text-sm font-normal font-['Nunito'] leading-normal">
                          {user.center?.name || '-'}
                        </div>
                        <div className="w-20 text-neutral-600 text-sm font-normal font-['Nunito'] leading-normal">
                          {user.team?.name || '-'}
                        </div>
                        <div className="w-24">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getUserRoleColor(user.role)}`}
                          >
                            {getUserRoleText(user.role)}
                          </span>
                        </div>
                        <div className="w-20">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getUserStatusColor(user.status)}`}
                          >
                            {getUserStatusText(user.status)}
                          </span>
                        </div>
                      </div>
                      <div className="h-0 border-b border-gray-100"></div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* 직원 등록 버튼 */}
          <div className="flex justify-start p-6">
            <button
              onClick={handleRegisterUser}
              className="w-52 h-11 p-2.5 bg-gradient-to-br from-blue-400 to-blue-600 rounded-[10px] inline-flex justify-center items-center gap-2.5 hover:from-blue-500 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/15 before:via-transparent before:to-transparent before:pointer-events-none"
            >
              <div className="text-white text-sm font-normal font-['Nunito'] leading-normal">
                직원 등록
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserPage;
