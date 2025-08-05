import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MemberEditModal from './MemberEditModal';
import MemberCreateModal from './MemberCreateModal';
import { memberAPI, centerAPI, userAPI } from '../utils/api';

const MemberPage = () => {
  const navigate = useNavigate();
  const [members, setMembers] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [centerFilter, setCenterFilter] = useState('Select option');
  const [trainerFilter, setTrainerFilter] = useState('Select option');
  const [showCenterDropdown, setShowCenterDropdown] = useState(false);
  const [showTrainerDropdown, setShowTrainerDropdown] = useState(false);
  const [centers, setCenters] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [filteredTrainers, setFilteredTrainers] = useState([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [statusDropdowns, setStatusDropdowns] = useState({});

  // API 호출 함수들
  const fetchMembers = async (filters = {}) => {
    try {
      const response = await memberAPI.getAllMembers({ limit: 1000, ...filters });
      if (response.success) {
        setMembers(response.data.members);
        setFilteredMembers(response.data.members);
      }
    } catch (error) {
      console.error('멤버 조회 실패:', error);
    }
  };

  const fetchCenters = async () => {
    try {
      const response = await centerAPI.getAllCenters();
      if (response.success) {
        setCenters(response.data.centers);
      }
    } catch (error) {
      console.error('지점 조회 실패:', error);
    }
  };

  const fetchTrainers = async () => {
    try {
      const response = await userAPI.getAllUsers({ role: 'trainer' });
      if (response.success) {
        setTrainers(response.data.users);
        setFilteredTrainers(response.data.users);
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
      const filters = {};

      if (centerFilter !== 'Select option') {
        // 지점 이름으로 ID 찾기
        const center = centers.find(c => c.name === centerFilter);
        if (center) {
          filters.centerId = center.id;
        }
      }

      if (trainerFilter !== 'Select option') {
        // 트레이너 이름으로 ID 찾기
        const trainer = trainers.find(t => t.name === trainerFilter);
        if (trainer) {
          filters.trainerId = trainer.id;
        }
      }

      await fetchMembers(filters);
    } catch (error) {
      console.error('필터링 실패:', error);
    }
  };

  // 즉시 필터링 적용 함수
  const filterMembersImmediate = async (centerId, trainerName) => {
    try {
      const filters = {};

      if (centerId) {
        filters.centerId = centerId;
      }

      if (trainerName && trainerName !== 'Select option') {
        // 트레이너 이름으로 ID 찾기
        const trainer = trainers.find(t => t.name === trainerName);
        if (trainer) {
          filters.trainerId = trainer.id;
        }
      }

      await fetchMembers(filters);
    } catch (error) {
      console.error('즉시 필터링 실패:', error);
    }
  };

  // 지점 필터 변경 시 트레이너 필터 업데이트 (즉시 적용)
  const handleCenterFilterChange = async value => {
    setCenterFilter(value);
    setShowCenterDropdown(false);

    if (value === 'Select option') {
      setFilteredTrainers(trainers);
      setTrainerFilter('Select option');
      // 즉시 필터링 적용
      await filterMembersImmediate(null, 'Select option');
    } else {
      // 해당 지점의 트레이너만 필터링 (개선된 로직)
      const center = centers.find(c => c.name === value);
      if (center) {
        const centerTrainers = trainers.filter(trainer => trainer.center_id === center.id);
        setFilteredTrainers(centerTrainers);
      } else {
        setFilteredTrainers([]);
      }
      setTrainerFilter('Select option');
      // 즉시 필터링 적용
      await filterMembersImmediate(center.id, 'Select option');
    }
  };

  const handleTrainerFilterChange = async value => {
    setTrainerFilter(value);
    setShowTrainerDropdown(false);

    // 즉시 필터링 적용
    const center = centers.find(c => c.name === centerFilter);
    const centerId = center ? center.id : null;
    await filterMembersImmediate(centerId, value);
  };

  // useEffect 제거 - 즉시 필터링으로 대체

  // 드롭다운 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = event => {
      if (!event.target.closest('[data-dropdown="status"]')) {
        setStatusDropdowns({});
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleRegisterMember = () => {
    setIsCreateModalOpen(true);
  };

  const handleViewMore = memberId => {
    // 회원 상세 정보 보기
    console.log('회원 상세보기:', memberId);
  };

  // 멤버 수정 모달 열기
  const handleEditMember = member => {
    setEditingMember(member);
    setIsEditModalOpen(true);
  };

  // 멤버 수정 모달 닫기
  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditingMember(null);
  };

  // 멤버 정보 업데이트
  const handleUpdateMember = updatedMember => {
    // 로컬 상태 업데이트
    setMembers(prevMembers =>
      prevMembers.map(member => (member.id === updatedMember.id ? updatedMember : member))
    );
    setFilteredMembers(prevMembers =>
      prevMembers.map(member => (member.id === updatedMember.id ? updatedMember : member))
    );

    // 모달 닫기
    handleCloseEditModal();
  };

  // 새 멤버 생성
  const handleCreateMember = newMember => {
    // 로컬 상태에 새 멤버 추가
    setMembers(prevMembers => [newMember, ...prevMembers]);
    setFilteredMembers(prevMembers => [newMember, ...prevMembers]);

    // 모달 닫기
    setIsCreateModalOpen(false);
  };

  // 고객 등록 모달 닫기
  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
  };

  // PT 세션 조회 페이지로 이동
  const handleViewPTSessions = memberId => {
    navigate(`/member/${memberId}/pt-sessions`);
  };

  // 상태 변경 처리
  const handleStatusChange = async (memberId, newStatus) => {
    try {
      const response = await memberAPI.updateMember(memberId, { status: newStatus });
      
      if (response.success) {
        // 로컬 상태 업데이트
        setMembers(prevMembers =>
          prevMembers.map(member =>
            member.id === memberId ? { ...member, status: newStatus } : member
          )
        );
        setFilteredMembers(prevMembers =>
          prevMembers.map(member =>
            member.id === memberId ? { ...member, status: newStatus } : member
          )
        );
      }
    } catch (error) {
      console.error('상태 변경 오류:', error);
    }

    // 드롭다운 닫기
    setStatusDropdowns(prev => ({ ...prev, [memberId]: false }));
  };

  // 상태 드롭다운 토글
  const toggleStatusDropdown = memberId => {
    setStatusDropdowns(prev => ({
      ...prev,
      [memberId]: !prev[memberId],
    }));
  };

  // 상태 텍스트 변환
  const getStatusText = status => {
    switch (status) {
      case 'active':
        return '활성';
      case 'inactive':
        return '비활성';
      case 'expired':
        return '만료';
      case 'withdrawn':
        return '탈퇴';
      default:
        return '알 수 없음';
    }
  };

  // 상태 옵션들
  const statusOptions = [
    { value: 'active', label: '활성' },
    { value: 'inactive', label: '비활성' },
    { value: 'expired', label: '만료' },
    { value: 'withdrawn', label: '탈퇴' },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-6 h-screen flex flex-col overflow-hidden">
      <div className="flex flex-col gap-6 flex-1 overflow-hidden">
        {/* 최상단 제목 */}
        <div
          data-layer="모든 고객"
          className="text-black text-3xl font-extrabold font-['Nunito'] pt-2"
        >
          모든 고객
        </div>

        {/* 지점 고객수와 필터 섹션 */}
        <div className="flex justify-between items-start pr-8 pt-[20px] pl-[30px] flex-shrink-0">
          {/* 지점 고객수 */}
          <div data-layer="Frame 37" className="Frame37 w-32 h-14 relative">
            <div
              data-layer="250"
              className="left-0 top-0 absolute justify-start text-neutral-800 text-4xl font-extrabold font-['Nunito']"
            >
              {filteredMembers.length}
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
                        onClick={() => handleCenterFilterChange('Select option')}
                        className="w-full px-3 py-1.5 text-left text-xs text-neutral-600 hover:bg-sky-50"
                      >
                        Select option
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
              className="w-[120px] h-[30px] flex flex-col justify-start items-start dropdown-container"
            >
              <div
                data-layer="Rectangle 3"
                className="w-[120px] h-[30px] bg-sky-50 rounded-[8px] border border-gray-200 relative"
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
                        onClick={() => handleTrainerFilterChange('Select option')}
                        className="w-full px-3 py-1.5 text-left text-xs text-neutral-600 hover:bg-sky-50"
                      >
                        Select option
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
        <div className="bg-white">
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
                    className="w-4 h-6 text-center text-cyan-500 text-sm font-normal font-['Nunito'] leading-normal"
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
            <div className="overflow-x-auto flex-1 overflow-y-auto">
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
                  <div
                    data-layer="PT 기록"
                    className="w-32 justify-start text-neutral-600 text-xs font-extrabold font-['Nunito']"
                  >
                    PT 기록
                  </div>
                </div>

                {/* 데이터 행들 */}
                <div className="space-y-4 max-h-[450px] overflow-y-auto pr-2 custom-scrollbar">
                  {filteredMembers.map((member, index) => (
                    <div key={member.id} className="flex flex-col gap-2">
                      <div className="flex justify-start items-center gap-10">
                        <div data-layer="고객명" className="w-32 justify-start">
                          <button
                            onClick={() => handleEditMember(member)}
                            className="text-left text-cyan-600 text-sm font-normal font-['Nunito'] leading-normal hover:text-cyan-800 hover:underline cursor-pointer transition-colors duration-200"
                          >
                            {member.name}
                          </button>
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
                        <div data-layer="상태" data-dropdown="status" className="w-32 relative">
                          <button
                            onClick={() => toggleStatusDropdown(member.id)}
                            className="w-full text-left px-2 py-1 text-neutral-600 text-sm font-normal font-['Nunito'] leading-normal hover:bg-gray-100 rounded cursor-pointer transition-colors duration-200"
                          >
                            <span className="flex justify-between items-center">
                              {getStatusText(member.status)}
                              <svg
                                className="w-3 h-3 ml-1"
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
                            </span>
                          </button>

                          {statusDropdowns[member.id] && (
                            <div className="absolute top-full left-0 w-24 bg-white border border-gray-200 rounded-md shadow-lg z-20 mt-1">
                              <div className="py-1">
                                {statusOptions.map(option => (
                                  <button
                                    key={option.value}
                                    onClick={() => handleStatusChange(member.id, option.value)}
                                    className={`w-full px-3 py-1.5 text-left text-xs hover:bg-gray-100 transition-colors duration-200 ${
                                      member.status === option.value
                                        ? 'bg-cyan-50 text-cyan-600 font-medium'
                                        : 'text-neutral-600'
                                    }`}
                                  >
                                    {option.label}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                        <div data-layer="PT 기록" className="w-32 justify-start">
                          <button
                            onClick={() => handleViewPTSessions(member.id)}
                            className="text-cyan-600 text-sm font-normal font-['Nunito'] leading-normal hover:text-cyan-800 hover:underline cursor-pointer transition-colors duration-200"
                          >
                            조회
                          </button>
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
                className="Button w-52 h-11 p-2.5 bg-gradient-to-br from-blue-400 to-blue-600 rounded-[10px] inline-flex justify-center items-center gap-2.5 hover:from-blue-500 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/15 before:via-transparent before:to-transparent before:pointer-events-none"
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

        {/* 멤버 수정 모달 */}
        <MemberEditModal
          isOpen={isEditModalOpen}
          onClose={handleCloseEditModal}
          member={editingMember}
          onUpdate={handleUpdateMember}
        />

        {/* 멤버 등록 모달 */}
        <MemberCreateModal
          isOpen={isCreateModalOpen}
          onClose={handleCloseCreateModal}
          onCreate={handleCreateMember}
        />
      </div>
    </div>
  );
};

export default MemberPage;

