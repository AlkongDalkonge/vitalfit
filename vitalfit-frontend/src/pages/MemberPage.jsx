import React, { useState, useEffect } from 'react';

const MemberPage = () => {
  const [members, setMembers] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [centerFilter, setCenterFilter] = useState('All memos');
  const [trainerFilter, setTrainerFilter] = useState('All memos');
  const [showCenterDropdown, setShowCenterDropdown] = useState(false);
  const [showTrainerDropdown, setShowTrainerDropdown] = useState(false);
  const [centers, setCenters] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [filteredTrainers, setFilteredTrainers] = useState([]);

  // API 호출 함수들
  const fetchMembers = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/member');
      const data = await response.json();
      if (data.success) {
        setMembers(data.data.members);
        setFilteredMembers(data.data.members);
      }
    } catch (error) {
      console.error('멤버 조회 실패:', error);
    }
  };

  const fetchCenters = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/centers');
      const data = await response.json();
      if (data.success) {
        setCenters(data.data.centers);
      }
    } catch (error) {
      console.error('지점 조회 실패:', error);
    }
  };

  const fetchTrainers = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/users?role=trainer');
      const data = await response.json();
      if (data.success) {
        setTrainers(data.data.users);
        setFilteredTrainers(data.data.users);
      }
    } catch (error) {
      console.error('트레이너 조회 실패:', error);
    }
  };

  // 초기 데이터 로드
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchMembers(), fetchCenters(), fetchTrainers()]);
      setLoading(false);
    };
    loadData();
  }, []);

  // 필터링 함수
  const filterMembers = async () => {
    try {
      let url = 'http://localhost:3000/api/member';
      const params = new URLSearchParams();

      if (centerFilter !== 'All memos') {
        // 지점 이름으로 ID 찾기
        const center = centers.find(c => c.name === centerFilter);
        if (center) {
          params.append('centerId', center.id);
        }
      }

      if (trainerFilter !== 'All memos') {
        // 트레이너 이름으로 ID 찾기
        const trainer = trainers.find(t => t.name === trainerFilter);
        if (trainer) {
          params.append('trainerId', trainer.id);
        }
      }

      if (params.toString()) {
        url += '?' + params.toString();
      }

      const response = await fetch(url);
      const data = await response.json();
      if (data.success) {
        setFilteredMembers(data.data.members);
      }
    } catch (error) {
      console.error('필터링 실패:', error);
    }
  };

  // 지점 필터 변경 시 트레이너 필터 업데이트
  const handleCenterFilterChange = async value => {
    setCenterFilter(value);
    setShowCenterDropdown(false);

    if (value === 'All memos') {
      setFilteredTrainers(trainers);
      setTrainerFilter('All memos');
    } else {
      // 해당 지점의 트레이너만 필터링
      const centerTrainers = trainers.filter(trainer =>
        members.some(member => member.center?.name === value && member.trainer?.id === trainer.id)
      );
      setFilteredTrainers(centerTrainers);
      setTrainerFilter('All memos');
    }

    // API 호출로 필터링
    await filterMembers();
  };

  const handleTrainerFilterChange = async value => {
    setTrainerFilter(value);
    setShowTrainerDropdown(false);

    // API 호출로 필터링
    await filterMembers();
  };

  useEffect(() => {
    // 초기 로드 시에는 필터링하지 않음
    if (members.length > 0) {
      filterMembers();
    }
  }, [centerFilter, trainerFilter]);

  const handleRegisterMember = () => {
    // 고객 등록 모달 또는 페이지로 이동
    console.log('고객 등록');
  };

  const handleViewMore = memberId => {
    // 회원 상세 정보 보기
    console.log('회원 상세보기:', memberId);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-6">
      <div className="flex flex-col gap-6">
        {/* 최상단 제목 */}
        <div data-layer="모든 고객" className="text-black text-xl font-extrabold font-['Nunito']">
          모든 고객
        </div>

        {/* 지점 고객수와 필터 섹션 */}
        <div className="flex justify-between items-start pr-8 pt-[20px] pl-[30px]">
          {/* 지점 고객수 */}
          <div data-layer="Frame 37" className="Frame37 w-32 h-14 relative">
            <div
              data-layer="250"
              className="left-0 top-0 absolute justify-start text-neutral-800 text-4xl font-extrabold font-['Nunito']"
            >
              250
            </div>
            <div
              data-layer="지점 고객 수"
              className="left-0 top-[33px] absolute justify-start text-neutral-600 text-sm font-normal font-['Nunito'] leading-normal"
            >
              지점 고객 수
            </div>
          </div>

          {/* 필터 섹션 */}
          <div className="flex gap-8 -mt-2">
            {/* 지점 필터 */}
            <div
              data-layer="Input Field"
              data-property-1="Small"
              className="InputField w-[120px] h-[30px] flex flex-col justify-start items-start"
            >
              <div
                data-layer="Rectangle 3"
                className="Rectangle3 w-[120px] h-[30px] bg-sky-50 rounded-[8px] border border-gray-200 relative"
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
                        onClick={() => handleCenterFilterChange('All memos')}
                        className="w-full px-3 py-1.5 text-left text-xs text-neutral-600 hover:bg-sky-50"
                      >
                        All memos
                      </button>
                      {centers.map(center => (
                        <button
                          key={center.id}
                          onClick={() => handleCenterFilterChange(center.name)}
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

            {/* 담당 트레이너 필터 */}
            <div
              data-layer="Input Field"
              data-property-1="Small"
              className="InputField w-[120px] h-[30px] flex flex-col justify-start items-start"
            >
              <div
                data-layer="Rectangle 3"
                className="Rectangle3 w-[120px] h-[30px] bg-sky-50 rounded-[8px] border border-gray-200 relative"
              >
                <button
                  onClick={() => setShowTrainerDropdown(!showTrainerDropdown)}
                  className="w-full h-full flex justify-between items-center px-3"
                >
                  <div
                    data-layer="Placeholder"
                    className="Placeholder justify-start text-neutral-400 text-xs font-normal font-['Nunito'] leading-normal"
                  >
                    트레이너
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
                {showTrainerDropdown && (
                  <div className="absolute top-full left-0 w-[120px] bg-white border border-gray-200 rounded-[8px] shadow-lg z-10 mt-1">
                    <div className="py-1">
                      <button
                        onClick={() => handleTrainerFilterChange('All memos')}
                        className="w-full px-3 py-1.5 text-left text-xs text-neutral-600 hover:bg-sky-50"
                      >
                        All memos
                      </button>
                      {filteredTrainers.map(trainer => (
                        <button
                          key={trainer.id}
                          onClick={() => handleTrainerFilterChange(trainer.name)}
                          className="w-full px-3 py-1.5 text-left text-xs text-neutral-600 hover:bg-sky-50"
                        >
                          {trainer.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 회원 목록 테이블 */}
        <div className="bg-white rounded-[20px] shadow-sm">
          <div className="flex flex-col gap-6">
            {/* 페이지 표시 */}
            <div className="flex justify-end">
              <div
                data-layer="Frame 40"
                className="Frame40 w-40 flex justify-start items-center gap-2"
              >
                <div
                  data-layer="Showing"
                  className="Showing justify-start text-black text-sm font-normal font-['Nunito'] leading-normal"
                >
                  Showing
                </div>
                <div
                  data-layer="Frame 39"
                  className="Frame39 w-[25px] h-[25px] rounded-[5px] outline outline-1 outline-offset-[-0.50px] outline-cyan-500 inline-flex flex-col justify-center items-center gap-2.5"
                >
                  <div
                    data-layer="16"
                    className="w-4 h-6 justify-start text-cyan-500 text-sm font-normal font-['Nunito'] leading-normal"
                  >
                    {filteredMembers.length}
                  </div>
                </div>
                <div
                  data-layer="per page"
                  className="PerPage justify-start text-black text-sm font-normal font-['Nunito'] leading-normal"
                >
                  per page
                </div>
              </div>
            </div>

            {/* 테이블 */}
            <div className="overflow-x-auto">
              <div className="min-w-full">
                {/* 헤더 행 */}
                <div className="flex justify-start items-center gap-10 mb-6">
                  <div
                    data-layer="고객명"
                    className="w-32 justify-start text-neutral-600 text-xs font-extrabold font-['Nunito']"
                  >
                    고객명
                  </div>
                  <div
                    data-layer="담당"
                    className="w-32 justify-start text-neutral-600 text-xs font-extrabold font-['Nunito']"
                  >
                    담당
                  </div>
                  <div
                    data-layer="지점"
                    className="w-32 justify-start text-neutral-600 text-xs font-extrabold font-['Nunito']"
                  >
                    지점
                  </div>
                  <div
                    data-layer="연락처"
                    className="w-40 justify-start text-neutral-600 text-xs font-extrabold font-['Nunito']"
                  >
                    연락처
                  </div>
                  <div
                    data-layer="잔여 수업"
                    className="w-32 justify-start text-neutral-600 text-xs font-extrabold font-['Nunito']"
                  >
                    잔여 수업
                  </div>
                  <div
                    data-layer="무료수업"
                    className="w-32 justify-start text-neutral-600 text-xs font-extrabold font-['Nunito']"
                  >
                    무료수업
                  </div>
                  <div
                    data-layer="상태"
                    className="w-32 justify-start text-neutral-600 text-xs font-extrabold font-['Nunito']"
                  >
                    상태
                  </div>
                </div>

                {/* 데이터 행들 */}
                <div className="space-y-4">
                  {filteredMembers.map((member, index) => (
                    <div key={member.id} className="flex flex-col gap-2">
                      <div className="flex justify-start items-center gap-10">
                        <div
                          data-layer="고객명"
                          className="w-32 justify-start text-neutral-600 text-sm font-normal font-['Nunito'] leading-normal"
                        >
                          {member.name}
                        </div>
                        <div
                          data-layer="담당"
                          className="w-32 justify-start text-neutral-600 text-sm font-normal font-['Nunito'] leading-normal"
                        >
                          {member.trainer?.name}
                        </div>
                        <div
                          data-layer="지점"
                          className="w-32 justify-start text-neutral-600 text-sm font-normal font-['Nunito'] leading-normal"
                        >
                          {member.center?.name}
                        </div>
                        <div
                          data-layer="연락처"
                          className="w-40 justify-start text-neutral-600 text-sm font-normal font-['Nunito'] leading-normal"
                        >
                          {member.phone}
                        </div>
                        <div
                          data-layer="잔여수업"
                          className="w-32 justify-start text-neutral-600 text-sm font-normal font-['Nunito'] leading-normal"
                        >
                          {member.remaining_sessions || 0}
                        </div>
                        <div
                          data-layer="무료수업"
                          className="w-32 justify-start text-neutral-600 text-sm font-normal font-['Nunito'] leading-normal"
                        >
                          {member.free_sessions || 0}
                        </div>
                        <div
                          data-layer="상태"
                          className="w-32 justify-start text-neutral-600 text-sm font-normal font-['Nunito'] leading-normal"
                        >
                          {member.status === 'active'
                            ? '활성'
                            : member.status === 'inactive'
                              ? '비활성'
                              : member.status === 'expired'
                                ? '만료'
                                : '탈퇴'}
                        </div>
                      </div>
                      <div data-layer="Line 3" className="h-0 border-b border-gray-100"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 고객 등록 버튼 */}
            <div className="flex justify-start mt-6">
              <button
                onClick={handleRegisterMember}
                data-layer="Button"
                data-property-1="Default"
                className="Button w-52 h-11 p-2.5 bg-gradient-to-br from-cyan-500 to-indigo-800 rounded-[10px] inline-flex justify-center items-center gap-2.5 hover:from-cyan-600 hover:to-indigo-900 transition-all duration-200"
              >
                <div
                  data-layer="Primary Button"
                  className="PrimaryButton justify-start text-white text-sm font-normal font-['Nunito'] leading-normal"
                >
                  고객 등록
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberPage;
