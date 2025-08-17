import { useParams } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import PTSessionCreateModal from './PTSessionCreateModal';
import PTSessionEditModal from './PTSessionEditModal';
import { usePTSession, useDatePicker } from '../utils/hooks';
import { formatDate, formatDateTime, formatTime, formatYearMonth } from '../utils/dateUtils';
import { getSessionTypeText, getSessionTypeColor } from '../utils/ptSessionUtils';

const MemberPTSessionPage = () => {
  const { memberId } = useParams();
  const yearDropdownRef = useRef(null);
  const monthDropdownRef = useRef(null);

  console.log('🔍 MemberPTSessionPage - memberId:', memberId);
  console.log('🔍 MemberPTSessionPage - useParams():', useParams());
  console.log('🔍 MemberPTSessionPage - window.location.pathname:', window.location.pathname);

  // URL에서 memberId를 직접 추출하는 임시 방법
  const pathname = window.location.pathname;
  const pathMatch = pathname.match(/\/member\/(\d+)\/pt-sessions/);
  const extractedMemberId = pathMatch ? pathMatch[1] : memberId;
  
  console.log('🔍 MemberPTSessionPage - extractedMemberId:', extractedMemberId);

  // 커스텀 훅 사용
  const {
    member,
    ptSessions,
    loading,
    error,
    isCreateModalOpen,
    isEditModalOpen,
    editingSession,
    currentYear,
    currentMonth,
    handleCreateSession,
    handleUpdateSession,
    handleEditSession,
    handleCloseEditModal,
    handleYearMonthChange,
    getYearOptions,
    getMonthOptions,
    setIsCreateModalOpen,
    fetchMemberPTSessions,
  } = usePTSession(extractedMemberId);

  const {
    showYearDropdown,
    showMonthDropdown,
    toggleYearDropdown,
    toggleMonthDropdown,
    setShowYearDropdown,
    setShowMonthDropdown,
  } = useDatePicker();

  // 년도/월 변경 핸들러
  const handleYearChange = year => {
    handleYearMonthChange(year, currentMonth);
    setShowYearDropdown(false);
  };

  const handleMonthChange = month => {
    handleYearMonthChange(currentYear, month);
    setShowMonthDropdown(false);
  };

  // PT 세션 등록 모달 열기
  const handleOpenCreateModal = () => {
    setIsCreateModalOpen(true);
  };

  // PT 세션 등록 모달 닫기
  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
  };

  // 드롭다운 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = event => {
      if (yearDropdownRef.current && !yearDropdownRef.current.contains(event.target)) {
        setShowYearDropdown(false);
      }
      if (monthDropdownRef.current && !monthDropdownRef.current.contains(event.target)) {
        setShowMonthDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [setShowYearDropdown, setShowMonthDropdown]);

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
      <div className="flex flex-col gap-6 flex-1">
        {/* 최상단 제목 및 멤버 정보 */}
        <div>
          {member && (
            <div className="text-black text-3xl font-extrabold font-['Nunito'] pt-2">
              {member.name}님의 PT세션
            </div>
          )}
        </div>

        {/* 날짜 선택 및 통계 섹션 */}
        <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center gap-16 pl-8">
            {/* 총 세션 수 */}
            <div className="text-center">
              <div className="text-2xl font-bold text-cyan-600">{ptSessions.length}</div>
              <div className="text-sm text-gray-600">이번 달 PT</div>
            </div>

            {/* 구분선 */}
            <div className="h-12 w-px bg-gray-200"></div>

            {/* 잔여 세션 정보 */}
            {member && (
              <div className="text-center">
                <div className="text-2xl font-bold text-black">
                  {member.remaining_sessions || 0}
                </div>
                <div className="text-sm text-gray-600">잔여 PT</div>
              </div>
            )}

            {/* 구분선 */}
            <div className="h-12 w-px bg-gray-200"></div>

            {/* 보너스 잔여 세션 정보 */}
            {member && (
              <div className="text-center">
                <div className="text-2xl font-bold text-black">
                  {member.remaining_free_sessions || 0}
                </div>
                <div className="text-sm text-gray-600">보너스 잔여 PT</div>
              </div>
            )}

            {/* 구분선 */}
            <div className="h-12 w-px bg-gray-200"></div>

            {/* 누적 PT 정보 */}
            {member && (
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {(member.actual_used_sessions || 0) + (member.actual_used_free_sessions || 0)}
                </div>
                <div className="text-sm text-gray-600">누적 PT</div>
              </div>
            )}
          </div>

          {/* 날짜 필터 섹션 */}
          <div className="flex gap-4 items-center">
            {/* 년도 필터 */}
            <div
              ref={yearDropdownRef}
              data-layer="Input Field"
              data-property-1="Small"
              className="w-[120px] h-[30px] flex flex-col justify-start items-start dropdown-container relative z-50"
            >
              <div
                data-layer="Rectangle 3"
                className="w-[120px] h-[30px] bg-sky-50 rounded-[8px] border border-gray-200 relative"
              >
                <button
                  onClick={toggleYearDropdown}
                  className="w-full h-full flex justify-between items-center px-3"
                >
                  <div
                    data-layer="Placeholder"
                    className={`Placeholder justify-start text-xs font-normal font-['Nunito'] leading-normal ${
                      currentYear ? 'text-black' : 'text-neutral-400'
                    }`}
                  >
                    {currentYear}년
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

                {/* 년도 드롭다운 메뉴 */}
                {showYearDropdown && (
                  <div className="absolute top-full left-0 w-[120px] bg-white border border-gray-200 rounded-[8px] shadow-lg z-50 mt-1">
                    <div className="py-1">
                      {getYearOptions().map(year => (
                        <button
                          key={year}
                          onClick={() => handleYearChange(year)}
                          className="w-full px-3 py-1.5 text-left text-xs text-neutral-600 hover:bg-sky-50"
                        >
                          {year}년
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 월 필터 */}
            <div
              ref={monthDropdownRef}
              data-layer="Input Field"
              data-property-1="Small"
              className="w-[120px] h-[30px] flex flex-col justify-start items-start dropdown-container relative z-40"
            >
              <div
                data-layer="Rectangle 3"
                className="w-[120px] h-[30px] bg-sky-50 rounded-[8px] border border-gray-200 relative"
              >
                <button
                  onClick={toggleMonthDropdown}
                  className="w-full h-full flex justify-between items-center px-3"
                >
                  <div
                    data-layer="Placeholder"
                    className={`Placeholder justify-start text-xs font-normal font-['Nunito'] leading-normal ${
                      currentMonth ? 'text-black' : 'text-neutral-400'
                    }`}
                  >
                    {currentMonth}월
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

                {/* 월 드롭다운 메뉴 */}
                {showMonthDropdown && (
                  <div className="absolute top-full left-0 w-[120px] bg-white border border-gray-200 rounded-[8px] shadow-lg z-30 mt-1">
                    <div className="py-1">
                      {getMonthOptions().map(month => (
                        <button
                          key={month}
                          onClick={() => handleMonthChange(month)}
                          className="w-full px-3 py-1.5 text-left text-xs text-neutral-600 hover:bg-sky-50"
                        >
                          {month}월
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* PT 세션 테이블 */}
        <div className="overflow-hidden rounded-lg shadow-sm border border-gray-100">
          <div className="overflow-y-auto max-h-[calc(100vh-400px)]">
            {/* 테이블 헤더 */}
            <div className="border-b border-gray-200 sticky top-0 z-10 bg-white">
              <div className="flex items-center p-4 min-w-max gap-4">
                {/* 좌측 여유 */}
                <div className="flex-[0.3]"></div>

                <div className="flex-[0.9] min-w-[60px] justify-start text-neutral-800 text-sm font-semibold font-['Nunito'] leading-normal">
                  회차
                </div>
                <div className="flex-[1] min-w-[80px] justify-start">
                  <span className="text-neutral-800 text-sm font-semibold font-['Nunito'] leading-normal">
                    종류
                  </span>
                </div>
                <div className="flex-[2] min-w-[160px] justify-start text-neutral-800 text-sm font-semibold font-['Nunito'] leading-normal">
                  소속
                </div>
                <div className="flex-[1.5] min-w-[120px] justify-start text-neutral-800 text-sm font-semibold font-['Nunito'] leading-normal">
                  PT 일자
                </div>
                <div className="flex-[1.5] min-w-[120px] justify-start text-neutral-800 text-sm font-semibold font-['Nunito'] leading-normal">
                  PT시간
                </div>
                <div className="flex-[1.5] min-w-[150px] justify-start text-neutral-800 text-sm font-semibold font-['Nunito'] leading-normal">
                  내용
                </div>
                <div className="flex-[1] min-w-[100px] justify-start text-neutral-800 text-sm font-semibold font-['Nunito'] leading-normal">
                  서명 일시
                </div>

                {/* 우측 여유 */}
                <div className="flex-[0.3]"></div>
              </div>
            </div>

            {/* 테이블 데이터 */}
            <div className="bg-white">
              {ptSessions.length === 0 ? (
                <div className="flex justify-center items-center h-48">
                  <div className="text-center text-gray-500">
                    <p className="text-lg mb-2">등록된 PT 세션이 없습니다</p>
                    <p className="text-sm">새로운 PT 세션을 등록해보세요</p>
                  </div>
                </div>
              ) : (
                ptSessions.map((session, index) => (
                  <div key={session.id} className="hover:bg-gray-50 transition-colors duration-200">
                    <div className="flex items-center p-4 min-w-max gap-4">
                      {/* 좌측 여유 */}
                      <div className="flex-[0.3]"></div>

                      <div className="flex-[0.9] min-w-[60px] justify-start">
                        <button
                          onClick={() => handleEditSession(session)}
                          className="text-cyan-600 text-sm font-medium hover:text-cyan-800 hover:underline cursor-pointer transition-colors duration-200"
                        >
                          {index + 1}
                        </button>
                      </div>
                      <div className="flex-[1] min-w-[80px] justify-start">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getSessionTypeColor(session.session_type)} justify-start`}
                        >
                          {getSessionTypeText(session.session_type)}
                        </span>
                      </div>
                      <div className="flex-[2] min-w-[160px] justify-start text-neutral-600 text-sm font-normal font-['Nunito'] leading-normal">
                        {session.center?.name || '-'}/{session.trainer?.name || '-'}
                      </div>
                      <div className="flex-[1.5] min-w-[120px] justify-start text-neutral-600 text-sm font-normal font-['Nunito'] leading-normal">
                        {formatDate(session.session_date)}
                      </div>
                      <div className="flex-[1.5] min-w-[120px] justify-start text-neutral-600 text-sm font-normal font-['Nunito'] leading-normal">
                        {formatTime(session.start_time)} - {formatTime(session.end_time)}
                      </div>
                      <div className="flex-[1.5] min-w-[150px] justify-start text-neutral-600 text-sm font-normal font-['Nunito'] leading-normal">
                        <div className="max-w-[150px] truncate" title={session.notes}>
                          {session.notes || '-'}
                        </div>
                      </div>
                      <div className="flex-[1] min-w-[100px] justify-start text-neutral-600 text-sm font-normal font-['Nunito'] leading-normal">
                        {session.signed_at ? formatDateTime(session.signed_at) : '-'}
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

        {/* PT 세션 등록 버튼 */}
        <div className="flex justify-start mt-8 pb-6">
          <button
            onClick={handleOpenCreateModal}
            data-layer="Button"
            data-property-1="Default"
            className="Button w-52 h-11 p-2.5 bg-gradient-to-br from-blue-400 to-blue-600 rounded-[10px] inline-flex justify-center items-center gap-2.5 hover:from-blue-500 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/15 before:via-transparent before:to-transparent before:pointer-events-none"
          >
            <div
              data-layer="Primary Button"
              className="PrimaryButton justify-start text-white text-sm font-normal font-['Nunito'] leading-normal"
            >
              PT 등록
            </div>
          </button>
        </div>

        {/* PT 세션 등록 모달 */}
        <PTSessionCreateModal
          isOpen={isCreateModalOpen}
          onClose={handleCloseCreateModal}
          onCreate={handleCreateSession}
          memberId={memberId}
        />

        {/* PT 세션 수정 모달 */}
        <PTSessionEditModal
          isOpen={isEditModalOpen}
          onClose={handleCloseEditModal}
          onUpdate={handleUpdateSession}
          session={editingSession}
        />
      </div>
    </div>
  );
};

export default MemberPTSessionPage;
