import React, { useState } from 'react';

const UserPage = () => {
  const [showCenterDropdown, setShowCenterDropdown] = useState(false);
  const [showTeamDropdown, setShowTeamDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // 더미 데이터 (껍데기용)
  const dummyUsers = [
    {
      id: 1,
      nickname: 'Sandra',
      name: '김철수',
      position: '센터매니저',
      phone: '010-1234-5678',
      shift: '09:00-18:00',
      customerCount: 45,
      monthlyRevenue: 2500000,
      status: 'active',
      center: '강남센터',
      team: 'A팀',
    },
    {
      id: 2,
      nickname: 'Mike',
      name: '이영희',
      position: '팀장',
      phone: '010-2345-6789',
      shift: '10:00-19:00',
      customerCount: 32,
      monthlyRevenue: 1800000,
      status: 'active',
      center: '서초센터',
      team: 'B팀',
    },
    {
      id: 3,
      nickname: 'Chris',
      name: '박민수',
      position: '트레이너',
      phone: '010-3456-7890',
      shift: '11:00-20:00',
      customerCount: 28,
      monthlyRevenue: 1200000,
      status: 'active',
      center: '홍대센터',
      team: 'C팀',
    },
  ];

  const dummyCenters = ['강남센터', '서초센터', '홍대센터'];
  const dummyTeams = ['A팀', 'B팀', 'C팀'];

  return (
    <div className="w-full max-w-7xl mx-auto p-6">
      <div className="flex flex-col gap-6">
        {/* 최상단 제목 */}
        <div
          data-layer="모든 직원"
          className="text-black text-3xl font-extrabold font-['Nunito'] pt-2"
        >
          모든 직원
        </div>

        {/* 지점 직원수와 검색 및 필터 섹션 */}
        <div className="flex justify-between items-start pr-8 pt-[20px] pl-[30px]">
          {/* 지점 직원수 */}
          <div data-layer="Frame 37" className="Frame37 w-32 h-14 relative">
            <div
              data-layer="250"
              className="left-0 top-0 absolute justify-start text-neutral-800 text-4xl font-extrabold font-['Nunito']"
            >
              {dummyUsers.length}
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
                  onChange={e => setSearchTerm(e.target.value)}
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
              className="w-[120px] h-[30px] flex flex-col justify-start items-start"
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
                        onClick={() => setShowCenterDropdown(false)}
                        className="w-full px-3 py-1.5 text-left text-xs text-neutral-600 hover:bg-sky-50"
                      >
                        Select option
                      </button>
                      {dummyCenters.map((center, index) => (
                        <button
                          key={index}
                          onClick={() => setShowCenterDropdown(false)}
                          className="w-full px-3 py-1.5 text-left text-xs text-neutral-600 hover:bg-sky-50"
                        >
                          {center}
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
              className="w-[120px] h-[30px] flex flex-col justify-start items-start"
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
                        onClick={() => setShowTeamDropdown(false)}
                        className="w-full px-3 py-1.5 text-left text-xs text-neutral-600 hover:bg-sky-50"
                      >
                        Select option
                      </button>
                      {dummyTeams.map((team, index) => (
                        <button
                          key={index}
                          onClick={() => setShowTeamDropdown(false)}
                          className="w-full px-3 py-1.5 text-left text-xs text-neutral-600 hover:bg-sky-50"
                        >
                          {team}
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
        <div className="bg-white rounded-[20px] shadow-sm">
          <div className="flex flex-col gap-6">
            {/* 페이지 표시 */}
            <div className="flex justify-end">
              <div className="w-40 flex justify-start items-center gap-2">
                <div className="text-black text-sm font-normal font-['Nunito'] leading-normal">
                  Showing
                </div>
                <div className="w-[25px] h-[25px] rounded-[5px] outline outline-1 outline-offset-[-0.50px] outline-cyan-500 inline-flex flex-col justify-center items-center gap-2.5">
                  <div className="w-4 h-6 text-center text-cyan-500 text-sm font-normal font-['Nunito'] leading-normal">
                    {dummyUsers.length}
                  </div>
                </div>
                <div className="text-black text-sm font-normal font-['Nunito'] leading-normal">
                  per page
                </div>
              </div>
            </div>

            {/* 테이블 */}
            <div className="overflow-x-auto">
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
                    직급
                  </div>
                  <div className="w-32 text-neutral-600 text-xs font-extrabold font-['Nunito']">
                    고객 수
                  </div>
                  <div className="w-40 text-neutral-600 text-xs font-extrabold font-['Nunito']">
                    연락처
                  </div>
                  <div className="w-32 text-neutral-600 text-xs font-extrabold font-['Nunito']">
                    근무시간
                  </div>
                  <div className="w-32 text-neutral-600 text-xs font-extrabold font-['Nunito']">
                    당월 매출
                  </div>
                  <div className="w-32 text-neutral-600 text-xs font-extrabold font-['Nunito']">
                    재직여부
                  </div>
                </div>

                {/* 데이터 행들 */}
                <div className="flex flex-col gap-4">
                  {dummyUsers.map(user => (
                    <div key={user.id} className="flex flex-col gap-2">
                      <div className="flex justify-start items-center gap-10">
                        <div className="w-32 text-neutral-600 text-sm font-normal font-['Nunito'] leading-normal">
                          {user.nickname}
                        </div>
                        <div className="w-32">
                          <button className="text-left text-cyan-600 text-sm font-normal font-['Nunito'] leading-normal hover:text-cyan-800 hover:underline cursor-pointer transition-colors duration-200">
                            {user.name}
                          </button>
                        </div>
                        <div className="w-32 text-neutral-600 text-sm font-normal font-['Nunito'] leading-normal">
                          {user.center} / {user.team}
                        </div>
                        <div className="w-32 text-neutral-600 text-sm font-normal font-['Nunito'] leading-normal">
                          {user.position}
                        </div>
                        <div className="w-32 text-neutral-600 text-sm font-normal font-['Nunito'] leading-normal">
                          {user.customerCount}명
                        </div>
                        <div className="w-40 text-neutral-600 text-sm font-normal font-['Nunito'] leading-normal">
                          {user.phone}
                        </div>
                        <div className="w-32 text-neutral-600 text-sm font-normal font-['Nunito'] leading-normal">
                          {user.shift}
                        </div>
                        <div className="w-32 text-neutral-600 text-sm font-normal font-['Nunito'] leading-normal">
                          ₩{user.monthlyRevenue.toLocaleString()}
                        </div>
                        <div
                          className={`w-32 text-sm font-normal font-['Nunito'] leading-normal ${
                            user.status === 'active' ? 'text-green-600' : 'text-red-600'
                          }`}
                        >
                          {user.status === 'active' ? '재직중' : '퇴직'}
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
              <button className="w-52 h-11 p-2.5 bg-gradient-to-br from-blue-400 to-blue-600 rounded-[10px] inline-flex justify-center items-center gap-2.5 hover:from-blue-500 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/15 before:via-transparent before:to-transparent before:pointer-events-none">
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
