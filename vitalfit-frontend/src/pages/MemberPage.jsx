import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import MemberEditModal from './MemberEditModal';
import MemberCreateModal from './MemberCreateModal';
import { useMember, useFilters } from '../utils/hooks';
import { getStatusText, statusOptions } from '../utils/memberUtils';

const MemberPage = () => {
  const navigate = useNavigate();

  // 드롭다운 위치 상태
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });

  // 커스텀 훅 사용
  const {
    members,
    filteredMembers,
    loading,
    setLoading,
    searchTerm,
    isEditModalOpen,
    editingMember,
    isCreateModalOpen,
    statusDropdowns,
    fetchMembers,
    handleEditMember,
    handleCloseEditModal,
    handleUpdateMember,
    handleCreateMember,
    handleCloseCreateModal,
    handleStatusChange,
    toggleStatusDropdown,
    handleSearchChange,
    updateFilteredMembers,
    setIsCreateModalOpen,
  } = useMember();

  const {
    centerFilter,
    trainerFilter,
    showCenterDropdown,
    showTrainerDropdown,
    centers,
    filteredTrainers,
    buildImmediateFilters,
    handleCenterFilterChange,
    handleTrainerFilterChange,
    loadInitialData,
    setShowCenterDropdown,
    setShowTrainerDropdown,
  } = useFilters();

  // 초기 데이터 로드
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([loadInitialData(), fetchMembers()]);
      setLoading(false);
    };
    loadData();
  }, []);

  // 즉시 필터링 적용 함수
  const filterMembersImmediate = async (centerId, trainerName) => {
    try {
      const filters = buildImmediateFilters(centerId, trainerName);
      await fetchMembers(filters);

      // 검색어가 있으면 검색 필터링도 적용
      if (searchTerm) {
        const searchFiltered = members.filter(member =>
          member.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
        updateFilteredMembers(searchFiltered);
      }
    } catch (error) {
      console.error('즉시 필터링 실패:', error);
    }
  };

  // 필터 변경 핸들러들
  const onCenterFilterChange = value => {
    handleCenterFilterChange(value, filterMembersImmediate);
  };

  const onTrainerFilterChange = value => {
    handleTrainerFilterChange(value, filterMembersImmediate);
  };

  // 기타 핸들러들
  const handleRegisterMember = () => {
    setIsCreateModalOpen(true);
  };

  const handleViewMore = memberId => {
    const member = members.find(m => m.id === memberId);
    if (member) {
      handleEditMember(member);
    }
  };

  const handleViewPTSessions = memberId => {
    navigate(`/member/${memberId}/pt-sessions`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-6 min-h-screen flex flex-col">
      <div className="flex flex-col gap-6 flex-1">
        {/* 최상단 제목 */}
        <div
          data-layer="모든 고객"
          className="text-black text-3xl font-extrabold font-['Nunito'] bg-white rounded-lg p-4"
        >
          모든 고객
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
                placeholder="이름으로 검색"
                className="w-full h-full bg-sky-50 rounded-[8px] border border-gray-200 px-3 text-xs font-normal font-['Nunito'] focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
            </div>

            {/* 지점 필터 */}
            <div
              data-layer="Input Field"
              data-property-1="Small"
              className="w-[120px] h-[30px] flex flex-col justify-start items-start dropdown-container relative z-50"
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
                  <div className="absolute top-full left-0 w-[120px] bg-white border border-gray-200 rounded-[8px] shadow-lg z-50 mt-1">
                    <div className="py-1">
                      <button
                        onClick={() => onCenterFilterChange('Select option')}
                        className="w-full px-3 py-1.5 text-left text-xs text-neutral-600 hover:bg-sky-50"
                      >
                        전체선택
                      </button>
                      {centers.map(center => (
                        <button
                          key={center.id}
                          onClick={() => onCenterFilterChange(center.name)}
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
              className="w-[120px] h-[30px] flex flex-col justify-start items-start dropdown-container relative z-40"
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
                  <div className="absolute top-full left-0 w-[120px] bg-white border border-gray-200 rounded-[8px] shadow-lg z-30 mt-1">
                    <div className="py-1">
                      <button
                        onClick={() => onTrainerFilterChange('Select option')}
                        className="w-full px-3 py-1.5 text-left text-xs text-neutral-600 hover:bg-sky-50"
                      >
                        전체선택
                      </button>
                      {filteredTrainers.map(trainer => (
                        <button
                          key={trainer.id}
                          onClick={() => onTrainerFilterChange(trainer.name)}
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
                  {filteredMembers.length}
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

        {/* 회원 목록 테이블 */}
        <div className="bg-white mt-1 rounded-lg shadow-sm border border-gray-100">
          <div className="flex flex-col">
            {/* 테이블 컨테이너 */}
            <div className="overflow-hidden">
              <div className="overflow-y-auto max-h-[calc(100vh-450px)] relative">
                {/* 테이블 헤더 */}
                <div className="border-b border-gray-200 sticky top-0 z-30 bg-white shadow-sm relative">
                  <div className="flex items-center p-4 min-w-max gap-4">
                    {/* 좌측 여유 */}
                    <div className="flex-[0.3]"></div>

                    <div
                      data-layer="고객명"
                      className="flex-[1] min-w-[80px] justify-start text-neutral-800 text-sm font-semibold font-['Nunito'] leading-normal"
                    >
                      고객명
                    </div>
                    <div
                      data-layer="휴대폰 번호"
                      className="flex-[2] min-w-[120px] justify-start text-neutral-800 text-sm font-semibold font-['Nunito'] leading-normal"
                    >
                      휴대폰 번호
                    </div>
                    <div
                      data-layer="소속"
                      className="flex-[2.5] min-w-[180px] justify-start text-neutral-800 text-sm font-semibold font-['Nunito'] leading-normal"
                    >
                      소속
                    </div>
                    <div
                      data-layer="남은 세션"
                      className="flex-[1] min-w-[90px] justify-start text-neutral-800 text-sm font-semibold font-['Nunito'] leading-normal"
                    >
                      남은 세션
                    </div>
                    <div
                      data-layer="상태"
                      className="flex-[1] min-w-[90px] justify-start text-neutral-800 text-sm font-semibold font-['Nunito'] leading-normal"
                    >
                      상태
                    </div>
                    <div
                      data-layer="PT 기록"
                      className="flex-[1] min-w-[90px] justify-start text-neutral-800 text-sm font-semibold font-['Nunito'] leading-normal"
                    >
                      PT 기록
                    </div>

                    {/* 우측 여유 */}
                    <div className="flex-[0.3]"></div>
                  </div>
                </div>

                {/* 테이블 데이터 */}
                <div>
                  {filteredMembers.map((member, index) => (
                    <div
                      key={member.id}
                      className="hover:bg-gray-50 transition-colors duration-200 relative z-10"
                    >
                      <div className="flex items-center p-4 min-w-max gap-4">
                        {/* 좌측 여유 */}
                        <div className="flex-[0.3]"></div>

                        <div data-layer="고객명" className="flex-[1] min-w-[80px] justify-start">
                          <button
                            onClick={() => handleViewMore(member.id)}
                            className="text-cyan-600 text-sm font-normal font-['Nunito'] leading-normal hover:text-cyan-800 hover:underline cursor-pointer transition-colors duration-200"
                          >
                            {member.name}
                          </button>
                        </div>
                        <div
                          data-layer="휴대폰 번호"
                          className="flex-[2] min-w-[120px] justify-start text-neutral-600 text-sm font-normal font-['Nunito'] leading-normal"
                        >
                          {member.phone}
                        </div>
                        <div
                          data-layer="소속"
                          className="flex-[2.5] min-w-[180px] justify-start text-neutral-600 text-sm font-normal font-['Nunito'] leading-normal"
                        >
                          {member.center?.name || '-'}/{member.trainer?.name || '-'}
                        </div>

                        <div
                          data-layer="남은 세션"
                          className="flex-[1] min-w-[90px] justify-start text-neutral-600 text-sm font-normal font-['Nunito'] leading-normal"
                        >
                          {member.total_sessions - member.used_sessions}
                        </div>
                        <div
                          data-layer="상태"
                          className="flex-[1] min-w-[90px] justify-start relative z-20"
                        >
                          <button
                            onClick={e => {
                              const rect = e.currentTarget.getBoundingClientRect();
                              setDropdownPosition({
                                top: rect.bottom + window.scrollY,
                                left: rect.left + window.scrollX,
                              });
                              toggleStatusDropdown(member.id);
                            }}
                            data-dropdown="status"
                            className="flex items-center gap-1 text-neutral-600 text-sm font-normal font-['Nunito'] leading-normal hover:text-neutral-800 transition-colors duration-200"
                          >
                            {getStatusText(member.status)}
                            <svg
                              className="w-3 h-3"
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

                          {statusDropdowns[member.id] &&
                            createPortal(
                              <div
                                className="fixed w-24 bg-white border border-gray-200 rounded-md shadow-lg z-[9999]"
                                style={{
                                  top: dropdownPosition.top,
                                  left: dropdownPosition.left,
                                }}
                              >
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
                              </div>,
                              document.body
                            )}
                        </div>
                        <div data-layer="PT 기록" className="flex-[1] min-w-[90px] justify-start">
                          <button
                            onClick={() => handleViewPTSessions(member.id)}
                            className="text-cyan-600 text-sm font-normal font-['Nunito'] leading-normal hover:text-cyan-800 hover:underline cursor-pointer transition-colors duration-200"
                          >
                            조회
                          </button>
                        </div>

                        {/* 우측 여유 */}
                        <div className="flex-[0.3]"></div>
                      </div>
                      <div className="h-0 border-b border-gray-50"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 고객 등록 버튼 */}
            <div className="flex justify-start mt-8">
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
