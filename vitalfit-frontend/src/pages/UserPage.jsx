import React, { useState, useEffect } from 'react';
import { userAPI, centerAPI, teamAPI } from '../utils/api';

const UserPage = () => {
  const [showCenterDropdown, setShowCenterDropdown] = useState(false);
  const [showTeamDropdown, setShowTeamDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState([]);
  const [centers, setCenters] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCenter, setSelectedCenter] = useState('Select option');
  const [selectedTeam, setSelectedTeam] = useState('Select option');

  // API 호출 함수들
  const fetchUsers = async (filters = {}) => {
    try {
      setLoading(true);
      const response = await userAPI.getAllUsers({ limit: 1000, ...filters });
      if (response.success) {
        setUsers(response.data.users);
      }
    } catch (error) {
      console.error('사용자 조회 실패:', error);
      setError('사용자 데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const fetchCenters = async () => {
    try {
      const response = await centerAPI.getAllCenters();
      if (response.success) {
        setCenters(response.data.centers);
      }
    } catch (error) {
      console.error('센터 조회 실패:', error);
    }
  };

  const fetchTeams = async () => {
    try {
      const response = await teamAPI.getAllTeams();
      if (response.success) {
        setTeams(response.data.teams);
      }
    } catch (error) {
      console.error('팀 조회 실패:', error);
    }
  };

  // 초기 데이터 로드
  useEffect(() => {
    const loadData = async () => {
      await Promise.all([fetchUsers(), fetchCenters(), fetchTeams()]);
    };
    loadData();
  }, []);

  // 필터링 함수 (즉시 적용)
  const handleFilter = (newCenter = null, newTeam = null) => {
    const filters = {};
    
    if (searchTerm) {
      filters.search = searchTerm;
    }
    
    // 새로운 값이 있으면 사용, 없으면 현재 상태 사용
    const centerToUse = newCenter || selectedCenter;
    const teamToUse = newTeam || selectedTeam;
    
    if (centerToUse && centerToUse !== 'Select option') {
      const center = centers.find(c => c.name === centerToUse);
      if (center) {
        filters.centerId = center.id;
      }
    }
    
    if (teamToUse && teamToUse !== 'Select option') {
      const team = teams.find(t => t.name === teamToUse);
      if (team) {
        filters.teamId = team.id;
      }
    }
    
    fetchUsers(filters);
  };

  // 직원 등록 핸들러
  const handleRegisterUser = () => {
    console.log('직원 등록 버튼 클릭됨');
    // TODO: 직원 등록 모달 또는 페이지로 이동
    alert('직원 등록 기능이 준비 중입니다.');
  };

  // 상태 텍스트 변환
  const getStatusText = (status) => {
    switch (status) {
      case 'active':
        return '재직중';
      case 'inactive':
        return '휴직중';
      default:
        return '알 수 없음';
    }
  };

  // 역할 텍스트 변환
  const getRoleText = (role) => {
    switch (role) {
      case 'admin':
        return '관리자';
      case 'trainer':
        return '트레이너';
      case 'staff':
        return '직원';
      default:
        return '알 수 없음';
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
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-6 h-screen flex flex-col overflow-hidden">
      <div className="flex flex-col gap-6 flex-1 overflow-hidden">
        {/* 최상단 제목 */}
        <div
          data-layer="모든 직원"
          className="text-black text-3xl font-extrabold font-['Nunito'] pt-2"
        >
          모든 직원
        </div>

        {/* 지점 직원수와 검색 및 필터 섹션 */}
        <div className="flex justify-between items-start pr-8 pt-[20px] pl-[30px] flex-shrink-0">
          {/* 지점 직원수 */}
          <div data-layer="Frame 37" className="Frame37 w-32 h-14 relative">
            <div
              data-layer="250"
              className="left-0 top-0 absolute justify-start text-neutral-800 text-4xl font-extrabold font-['Nunito']"
            >
              {users.length}
            </div>
            <div
              data-layer="지점 직원 수"
              className="left-0 top-[33px] absolute justify-start text-neutral-600 text-sm font-normal font-['Nunito'] leading-normal"
            >
              지점 직원 수
            </div>
          </div>

          {/* 필터 섹션 */}
          <div className="flex gap-8 -mt-2">
            {/* 검색 필드 */}
            <div className="w-[120px] h-[30px] flex flex-col justify-start items-start">
              <div className="w-[120px] h-[30px] rounded-[10px] outline outline-1 outline-offset-[-0.50px] outline-stone-300 relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={e => {
                    setSearchTerm(e.target.value);
                    // 검색어가 변경될 때마다 즉시 필터링 적용
                    setTimeout(() => {
                      handleFilter(selectedCenter, selectedTeam);
                    }, 300); // 300ms 딜레이로 타이핑 중 API 호출 최적화
                  }}
                  placeholder="이름 검색"
                  className="w-full h-full px-3 pr-8 rounded-[10px] outline-none text-xs font-['Nunito'] placeholder:text-neutral-400"
                />
                <div className="absolute right-2 top-2 w-4 h-4">
                  <svg
                    className="w-3 h-3 text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
              </div>
            </div>
            {/* 지점 필터 */}
            <div
              data-layer="Input Field"
              data-property-1="Small"
              className="w-[120px] h-[30px] flex flex-col justify-start items-start dropdown-container"
            >
              <div
                data-layer="Rectangle 3"
                className="w-[120px] h-[30px] bg-sky-50 rounded-[8px] border border-gray-200 relative"
              >
                <button
                  onClick={() => setShowCenterDropdown(!showCenterDropdown)}
                  className="w-full h-full flex justify-between items-center px-3"
                >
                  <div
                    data-layer="Placeholder"
                    className="Placeholder justify-start text-neutral-400 text-xs font-normal font-['Nunito'] leading-normal"
                  >
                    지점
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
                        onClick={() => {
                          setSelectedCenter('Select option');
                          setShowCenterDropdown(false);
                          handleFilter('Select option', selectedTeam);
                        }}
                        className="w-full px-3 py-1.5 text-left text-xs text-neutral-600 hover:bg-sky-50"
                      >
                        Select option
                      </button>
                      {centers.map((center, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            setSelectedCenter(center.name);
                            setShowCenterDropdown(false);
                            handleFilter(center.name, selectedTeam);
                          }}
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
              className="w-[120px] h-[30px] flex flex-col justify-start items-start dropdown-container"
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
                    팀
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
                        onClick={() => {
                          setSelectedTeam('Select option');
                          setShowTeamDropdown(false);
                          handleFilter(selectedCenter, 'Select option');
                        }}
                        className="w-full px-3 py-1.5 text-left text-xs text-neutral-600 hover:bg-sky-50"
                      >
                        Select option
                      </button>
                      {teams.map((team, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            setSelectedTeam(team.name);
                            setShowTeamDropdown(false);
                            handleFilter(selectedCenter, team.name);
                          }}
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
        <div className="bg-white">
          <div className="flex flex-col gap-6">
            {/* 페이지 표시 */}
            <div className="flex justify-end">
              <div className="w-40 flex justify-start items-center gap-2">
                <div className="text-black text-sm font-normal font-['Nunito'] leading-normal">
                  Showing
                </div>
                <div className="w-[25px] h-[25px] rounded-[5px] outline outline-1 outline-offset-[-0.50px] outline-cyan-500 inline-flex flex-col justify-center items-center gap-2.5">
                  <div className="w-4 h-6 text-center text-cyan-500 text-sm font-normal font-['Nunito'] leading-normal">
                    {users.length}
                  </div>
                </div>
                <div className="text-black text-sm font-normal font-['Nunito'] leading-normal">
                  per page
                </div>
              </div>
            </div>

            {/* 테이블 */}
            <div className="overflow-x-auto flex-1 overflow-y-auto">
              <div className="min-w-full">
                {/* 헤더 행 */}
                <div className="flex justify-start items-center gap-10 mb-6">
                  <div className="w-32 text-neutral-600 text-xs font-extrabold font-['Nunito']">
                    닉네임
                  </div>
                  <div className="w-32 text-neutral-600 text-xs font-extrabold font-['Nunito']">
                    이름
                  </div>
                  <div className="w-32 text-neutral-600 text-xs font-extrabold font-['Nunito']">
                    소속
                  </div>
                  <div className="w-32 text-neutral-600 text-xs font-extrabold font-['Nunito']">
                    역할
                  </div>
                  <div className="w-40 text-neutral-600 text-xs font-extrabold font-['Nunito']">
                    연락처
                  </div>
                  <div className="w-32 text-neutral-600 text-xs font-extrabold font-['Nunito']">
                    이메일
                  </div>
                  <div className="w-32 text-neutral-600 text-xs font-extrabold font-['Nunito']">
                    재직여부
                  </div>
                </div>

                                  {/* 데이터 행들 */}
                  <div className="flex flex-col gap-4 max-h-[450px] overflow-y-auto pr-2 custom-scrollbar">
                    {users.map(user => (
                      <div key={user.id} className="flex flex-col gap-2">
                        <div className="flex justify-start items-center gap-10">
                          <div className="w-32 text-neutral-600 text-sm font-normal font-['Nunito'] leading-normal">
                            {user.nickname || '-'}
                          </div>
                          <div className="w-32">
                            <button className="text-left text-cyan-600 text-sm font-normal font-['Nunito'] leading-normal hover:text-cyan-800 hover:underline cursor-pointer transition-colors duration-200">
                              {user.name}
                            </button>
                          </div>
                          <div className="w-32 text-neutral-600 text-sm font-normal font-['Nunito'] leading-normal">
                            {user.center?.name || '-'} / {user.team?.name || '-'}
                          </div>
                          <div className="w-32 text-neutral-600 text-sm font-normal font-['Nunito'] leading-normal">
                            {getRoleText(user.role)}
                          </div>
                          <div className="w-40 text-neutral-600 text-sm font-normal font-['Nunito'] leading-normal">
                            {user.phone || '-'}
                          </div>
                          <div className="w-32 text-neutral-600 text-sm font-normal font-['Nunito'] leading-normal">
                            {user.email || '-'}
                          </div>
                          <div
                            className={`w-32 text-sm font-normal font-['Nunito'] leading-normal ${
                              user.status === 'active' ? 'text-green-600' : 'text-red-600'
                            }`}
                          >
                            {getStatusText(user.status)}
                          </div>
                        </div>
                        <div className="h-0 border-b border-gray-100"></div>
                      </div>
                    ))}
                  </div>
              </div>
            </div>

            {/* 직원 등록 버튼 */}
            <div className="flex justify-start mt-6">
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
    </div>
  );
};

export default UserPage;
