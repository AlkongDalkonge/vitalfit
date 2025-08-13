import React from 'react';
import { useUser } from '../utils/hooks';
import {
  getUserStatusText,
  getUserStatusColor,
  formatPhoneNumber,
} from '../utils/userUtils';

const UserPage = () => {
  // 커스텀 훅 사용
  const {
    users,
    filteredUsers,
    centers,
    teams,
    members,
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

  // 사용자가 담당하는 member 수 계산
  const getUserMemberCount = (userId) => {
    console.log('Members data:', members);
    console.log('Looking for trainerId:', userId);
    const userMembers = members.filter(member => {
      console.log('Member trainerId:', member.trainerId, 'Member trainer:', member.trainer);
      return member.trainerId === userId || (member.trainer && member.trainer.id === userId);
    });
    console.log('User members count:', userMembers.length);
    return userMembers.length;
  };

  // 직원 등록 핸들러
  const handleRegisterUser = () => {
    // TODO: 직원 등록 모달 또는 페이지로 이동
    alert('직원 등록 기능이 준비 중입니다.');
  };

  // 사용자 상세보기 핸들러
  const handleViewUser = userId => {
    // TODO: 사용자 상세 정보 모달 또는 페이지로 이동
  };

  // Position 기반 역할 색상 반환
  const getPositionColor = (positionName) => {
    if (!positionName) return 'text-gray-600 bg-gray-50';
    
    const name = positionName.toLowerCase();
    if (name.includes('관리자') || name.includes('admin')) {
      return 'text-purple-600 bg-purple-50';
    } else if (name.includes('매니저') || name.includes('manager')) {
      return 'text-blue-600 bg-blue-50';
    } else if (name.includes('트레이너') || name.includes('trainer')) {
      return 'text-cyan-600 bg-cyan-50';
    } else if (name.includes('직원') || name.includes('staff')) {
      return 'text-green-600 bg-green-50';
    } else {
      return 'text-gray-600 bg-gray-50';
    }
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
    <div className="w-full max-w-7xl mx-auto p-6 min-h-screen flex flex-col">
      <div className="flex flex-col gap-6 flex-1 pb-0">
        {/* 최상단 제목 */}
        <div
          data-layer="모든 직원"
          className="text-black text-3xl font-extrabold font-['Nunito'] bg-white rounded-lg p-4"
        >
          모든 직원
        </div>

        {/* 필터 및 총건수 섹션 */}
        <div className="flex justify-end items-center pr-8 pt-[5px] pl-[30px] flex-shrink-0 bg-white rounded-lg py-2 px-4">
          {/* 필터 및 검색 섹션 */}
          <div className="flex gap-4 items-center">
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
            <div
              data-layer="Input Field"
              data-property-1="Small"
              className="w-[130px] h-[30px] flex flex-col justify-start items-start dropdown-container relative z-50"
            >
              <div
                data-layer="Rectangle 3"
                className="w-[130px] h-[30px] bg-sky-50 rounded-[8px] border border-gray-200 relative"
              >
                <button
                  onClick={() => setShowCenterDropdown(!showCenterDropdown)}
                  className="w-full h-full flex justify-between items-center px-3"
                >
                  <div
                    data-layer="Placeholder"
                    className="Placeholder justify-start text-neutral-400 text-xs font-normal font-['Nunito'] leading-normal"
                  >
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
                  <div className="absolute top-full left-0 w-[130px] bg-white border border-gray-200 rounded-[8px] shadow-lg z-50 mt-1">
                    <div className="py-1">
                      <button
                        onClick={() => handleCenterChange('Select option')}
                        className="w-full px-3 py-1.5 text-left text-xs text-neutral-600 hover:bg-sky-50"
                      >
                        전체선택
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
            <div
              data-layer="Input Field"
              data-property-1="Small"
              className="w-[120px] h-[30px] flex flex-col justify-start items-start dropdown-container relative z-40"
            >
              <div
                data-layer="Rectangle 3"
                className="w-[120px] h-[30px] bg-sky-50 rounded-[8px] border border-gray-200 relative"
              >
                <button
                  onClick={() => setShowTeamDropdown(!showTeamDropdown)}
                  className="w-full h-full flex justify-between items-center px-3"
                >
                  <div
                    data-layer="Placeholder"
                    className="Placeholder justify-start text-neutral-400 text-xs font-normal font-['Nunito'] leading-normal"
                  >
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
                  <div className="absolute top-full left-0 w-[120px] bg-white border border-gray-200 rounded-[8px] shadow-lg z-30 mt-1">
                    <div className="py-1">
                      <button
                        onClick={() => handleTeamChange('Select option')}
                        className="w-full px-3 py-1.5 text-left text-xs text-neutral-600 hover:bg-sky-50"
                      >
                        전체선택
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

            {/* 총건수 */}
            <div
              data-layer="Frame 40"
              className="Frame40 inline-flex justify-start items-center gap-2"
            >
              <div
                data-layer="총"
                className="justify-start text-black text-sm font-normal font-['Nunito'] leading-normal"
              >
                총
              </div>
              <div
                data-layer="Frame 39"
                className="Frame39 w-8 h-8 p-2 rounded-[4px] outline outline-[0.5px] outline-offset-[-0.25px] outline-cyan-500 inline-flex flex-col justify-center items-center gap-2"
              >
                <div
                  data-layer="12"
                  className="flex items-center justify-center text-cyan-500 text-sm font-normal font-['Nunito'] leading-normal"
                >
                  {users.length}
                </div>
              </div>
              <div
                data-layer="건"
                className="justify-start text-black text-sm font-normal font-['Nunito'] leading-normal"
              >
                건
              </div>
            </div>
          </div>
        </div>

        {/* 직원 목록 테이블 */}
        <div className="bg-white mt-1 rounded-lg shadow-sm border border-gray-100">
          <div className="flex flex-col">
            {/* 테이블 컨테이너 */}
            <div className="overflow-hidden">
              <div className="overflow-y-auto max-h-[calc(100vh-350px)] relative">
                {/* 테이블 헤더 */}
                <div className="border-b border-gray-200 sticky top-0 z-30 bg-white shadow-sm relative">
                  <div className="flex items-center p-4 min-w-max gap-4">
                    {/* 좌측 여유 */}
                    <div className="flex-[0.3]"></div>

                    <div
                      data-layer="직책"
                      className="flex-[1] min-w-[80px] justify-start text-neutral-800 text-sm font-semibold font-['Nunito'] leading-normal"
                    >
                      직책
                    </div>
                    <div
                      data-layer="직원명"
                      className="flex-[1] min-w-[80px] justify-start text-neutral-800 text-sm font-semibold font-['Nunito'] leading-normal"
                    >
                      직원명
                    </div>
                    <div
                      data-layer="연락처"
                      className="flex-[1.5] min-w-[100px] justify-start text-neutral-800 text-sm font-semibold font-['Nunito'] leading-normal"
                    >
                      연락처
                    </div>
                    <div
                      data-layer="고객 수"
                      className="flex-[1] min-w-[80px] justify-start text-neutral-800 text-sm font-semibold font-['Nunito'] leading-normal"
                    >
                      고객 수
                    </div>
                    <div
                      data-layer="당월 매출"
                      className="flex-[1] min-w-[80px] justify-start text-neutral-800 text-sm font-semibold font-['Nunito'] leading-normal"
                    >
                      당월 매출
                    </div>
                    <div
                      data-layer="소속"
                      className="flex-[1] min-w-[80px] justify-start text-neutral-800 text-sm font-semibold font-['Nunito'] leading-normal"
                    >
                      소속
                    </div>
                    <div
                      data-layer="상태"
                      className="flex-[1] min-w-[80px] justify-start text-neutral-800 text-sm font-semibold font-['Nunito'] leading-normal"
                    >
                      상태
                    </div>

                    {/* 우측 여유 */}
                    <div className="flex-[0.3]"></div>
                  </div>
                </div>

                {/* 테이블 데이터 */}
                <div>
                  {filteredUsers.length === 0 ? (
                    <div className="flex justify-center items-center h-48">
                      <div className="text-center text-gray-500">
                        <p className="text-lg mb-2">등록된 직원이 없습니다</p>
                        <p className="text-sm">새로운 직원을 등록해보세요</p>
                      </div>
                    </div>
                  ) : (
                    filteredUsers.map((user, index) => (
                      <div
                        key={user.id}
                        className="hover:bg-gray-50 transition-colors duration-200 relative z-10"
                      >
                        <div className="flex items-center p-4 min-w-max gap-4">
                          {/* 좌측 여유 */}
                          <div className="flex-[0.3]"></div>

                          <div data-layer="직책" className="flex-[1] min-w-[80px] justify-start">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${getPositionColor(user.position?.name)}`}
                            >
                              {user.position?.name || '-'}
                            </span>
                          </div>
                          <div data-layer="직원명" className="flex-[1] min-w-[80px] justify-start">
                            <button
                              onClick={() => handleViewUser(user.id)}
                              className="text-cyan-600 text-sm font-normal font-['Nunito'] leading-normal hover:text-cyan-800 hover:underline cursor-pointer transition-colors duration-200"
                            >
                              {user.name || '-'}
                            </button>
                          </div>
                          <div
                            data-layer="연락처"
                            className="flex-[1.5] min-w-[100px] justify-start text-neutral-600 text-sm font-normal font-['Nunito'] leading-normal"
                          >
                            {formatPhoneNumber(user.phone) || '-'}
                          </div>
                          <div
                            data-layer="고객 수"
                            className="flex-[1] min-w-[80px] justify-start text-neutral-600 text-sm font-normal font-['Nunito'] leading-normal"
                          >
                            {getUserMemberCount(user.id)}
                          </div>
                          <div
                            data-layer="당월 매출"
                            className="flex-[1] min-w-[80px] justify-start text-neutral-600 text-sm font-normal font-['Nunito'] leading-normal"
                          >
                            -
                          </div>
                          <div
                            data-layer="소속"
                            className="flex-[1] min-w-[80px] justify-start text-neutral-600 text-sm font-normal font-['Nunito'] leading-normal"
                          >
                            {user.center?.name || '-'}
                          </div>
                          <div data-layer="상태" className="flex-[1] min-w-[80px] justify-start">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${getUserStatusColor(user.status)}`}
                            >
                              {getUserStatusText(user.status)}
                            </span>
                          </div>

                          {/* 우측 여유 */}
                          <div className="flex-[0.3]"></div>
                        </div>
                        <div className="h-0 border-b border-gray-50"></div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* 직원 등록 버튼 */}
            <div className="flex justify-start mt-16 mb-0">
              <button
                onClick={handleRegisterUser}
                data-layer="Button"
                data-property-1="Default"
                className="Button w-52 h-11 p-2.5 bg-gradient-to-br from-blue-400 to-blue-600 rounded-[10px] inline-flex justify-center items-center gap-2.5 hover:from-blue-500 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/15 before:via-transparent before:to-transparent before:pointer-events-none"
              >
                <div
                  data-layer="Primary Button"
                  className="PrimaryButton justify-start text-white text-sm font-normal font-['Nunito'] leading-normal"
                >
                  직원 등록
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserPage;
