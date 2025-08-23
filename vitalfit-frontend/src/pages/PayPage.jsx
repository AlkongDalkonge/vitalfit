import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MemberEditModal from './MemberEditModal';
import MemberCreateModal from './MemberCreateModal';
import { useMember, useFilters } from '../utils/hooks';
import { getStatusText } from '../utils/memberUtils';

const PayPage = () => {
  const navigate = useNavigate();

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
    fetchMembers,
    handleEditMember,
    handleCloseEditModal,
    handleUpdateMember,
    handleCreateMember,
    handleCloseCreateModal,
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

  const handleViewPaymentHistory = memberId => {
    console.log('결제내역 조회 클릭됨, memberId:', memberId);
    console.log('이동할 경로:', `/payment-history/${memberId}`);
    navigate(`/payment-history/${memberId}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-4 flex flex-col">
      <div className="flex flex-col gap-4 flex-1 pb-0">
        {/* 최상단 제목 */}
        <div
          data-layer="PT 결제"
          className="text-black text-3xl font-extrabold font-['Nunito'] bg-white rounded-lg p-3"
        >
          PT 결제
        </div>

        {/* 필터 및 총건수 섹션 */}
        <div className="flex justify-end items-center pr-8 pt-[5px] pl-[30px] flex-shrink-0 bg-white rounded-lg py-1 px-3">
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
        <div className="overflow-hidden rounded-lg shadow-sm border border-gray-100">
          <div className="overflow-y-auto max-h-[calc(100vh-350px)]">
            {/* 테이블 헤더 */}
            <div className="border-b border-gray-200 sticky top-0 z-10 bg-white">
              <div className="flex items-center p-4 min-w-max gap-4">
                {/* 좌측 여유 */}
                <div className="flex-[0.3]"></div>

                <div className="flex-[1] min-w-[80px] justify-start text-neutral-800 text-sm font-semibold font-['Nunito'] leading-normal">
                  고객명
                </div>
                <div className="flex-[2] min-w-[120px] justify-start text-neutral-800 text-sm font-semibold font-['Nunito'] leading-normal">
                  휴대폰 번호
                </div>
                <div className="flex-[2.5] min-w-[180px] justify-start text-neutral-800 text-sm font-semibold font-['Nunito'] leading-normal">
                  소속
                </div>
                <div className="flex-[1] min-w-[90px] justify-start text-neutral-800 text-sm font-semibold font-['Nunito'] leading-normal">
                  잔여 PT
                </div>
                <div className="flex-[1] min-w-[90px] justify-start text-neutral-800 text-sm font-semibold font-['Nunito'] leading-normal">
                  상태
                </div>
                <div className="flex-[1] min-w-[90px] justify-start text-neutral-800 text-sm font-semibold font-['Nunito'] leading-normal">
                  결제 내역
                </div>

                {/* 우측 여유 */}
                <div className="flex-[0.3]"></div>
              </div>
            </div>

            {/* 테이블 데이터 */}
            <div className="bg-white">
              {filteredMembers.length === 0 ? (
                <div className="flex justify-center items-center h-32">
                  <div className="text-center text-gray-500">
                    <p className="text-lg mb-2">등록된 회원이 없습니다</p>
                    <p className="text-sm">새로운 회원을 등록해보세요</p>
                  </div>
                </div>
              ) : (
                filteredMembers.map((member, index) => (
                  <div key={member.id} className="hover:bg-gray-50 transition-colors duration-200">
                    <div className="flex items-center p-4 min-w-max gap-4">
                      {/* 좌측 여유 */}
                      <div className="flex-[0.3]"></div>

                      <div className="flex-[1] min-w-[80px] justify-start">
                        <button
                          onClick={() => handleViewMore(member.id)}
                          className="text-cyan-600 text-sm font-medium hover:text-cyan-800 hover:underline cursor-pointer transition-colors duration-200"
                        >
                          {member.name}
                        </button>
                      </div>
                      <div className="flex-[2] min-w-[120px] justify-start text-neutral-600 text-sm font-normal font-['Nunito'] leading-normal">
                        {member.phone}
                      </div>
                      <div className="flex-[2.5] min-w-[180px] justify-start text-neutral-600 text-sm font-normal font-['Nunito'] leading-normal">
                        {member.center?.name || '-'}/{member.trainer?.name || '-'}
                      </div>
                      <div className="flex-[1] min-w-[90px] justify-start text-neutral-600 text-sm font-normal font-['Nunito'] leading-normal">
                        {member.remaining_sessions || 0}
                      </div>
                      <div className="flex-[1] min-w-[90px] justify-start text-neutral-600 text-sm font-normal font-['Nunito'] leading-normal">
                        {getStatusText(member.status)}
                      </div>
                      <div className="flex-[1] min-w-[90px] justify-start">
                        <button
                          onClick={() => handleViewPaymentHistory(member.id)}
                          className="text-cyan-600 text-sm font-medium hover:text-cyan-800 hover:underline cursor-pointer transition-colors duration-200"
                        >
                          조회
                        </button>
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

export default PayPage;
