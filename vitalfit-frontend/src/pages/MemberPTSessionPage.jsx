import { useParams } from 'react-router-dom';
import PTSessionCreateModal from './PTSessionCreateModal';
import PTSessionEditModal from './PTSessionEditModal';
import { usePTSession, useDatePicker } from '../utils/hooks';
import { formatDate, formatDateTime, formatTime, formatYearMonth } from '../utils/dateUtils';
import { getSessionTypeText, getSessionTypeColor } from '../utils/ptSessionUtils';

const MemberPTSessionPage = () => {
  const { memberId } = useParams();

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
  } = usePTSession(memberId);

  const {
    showDatePicker,
    showYearDropdown,
    showMonthDropdown,
    toggleDatePicker,
    toggleYearDropdown,
    toggleMonthDropdown,
    closeDatePicker,
    setShowYearDropdown,
    setShowMonthDropdown,
  } = useDatePicker();

  // 년도/월 변경 핸들러
  const handleYearChange = year => {
    // currentYear와 currentMonth는 usePTSession에서 관리됨
    // 실제 날짜 변경은 fetchMemberPTSessions를 다시 호출해야 함
    handleYearMonthChange(year, currentMonth);
    setShowYearDropdown(false);
  };

  const handleMonthChange = month => {
    // currentYear와 currentMonth는 usePTSession에서 관리됨
    // 실제 날짜 변경은 fetchMemberPTSessions를 다시 호출해야 함
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

            {/* 무료 잔여 세션 정보 */}
            {member && (
              <div className="text-center">
                <div className="text-2xl font-bold text-black">{member.remaining_free_sessions || 0}</div>
                <div className="text-sm text-gray-600">무료 잔여 PT</div>
              </div>
            )}

            {/* 구분선 */}
            <div className="h-12 w-px bg-gray-200"></div>

            {/* 누적 PT 정보 */}
            {member && (
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-500">{(member.actual_used_sessions || 0) + (member.actual_used_free_sessions || 0)}</div>
                <div className="text-sm text-gray-600">누적 PT</div>
              </div>
            )}
          </div>

          {/* 날짜 선택기 */}
          <div className="relative">
            <button
              onClick={toggleDatePicker}
              className="flex items-center gap-2 px-4 py-2 bg-sky-50 rounded-lg hover:bg-sky-100 transition-colors duration-200"
            >
              <span className="font-medium">{formatYearMonth(currentYear, currentMonth)}</span>
              <svg
                className="w-4 h-4 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </button>

            {/* 날짜 선택 드롭다운 */}
            {showDatePicker && (
              <div className="absolute top-full right-0 mt-2 p-4 bg-white border border-gray-300 rounded-lg shadow-lg z-50 min-w-[240px]">
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">년도</label>
                    <div className="relative">
                      <button
                        onClick={toggleYearDropdown}
                        className="w-full px-2 py-1.5 text-sm bg-white border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-left flex justify-between items-center"
                      >
                        <span>{currentYear}년</span>
                        <svg
                          className="w-4 h-4"
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
                      {showYearDropdown && (
                        <div className="absolute top-full left-0 w-full bg-white border border-gray-300 rounded-b shadow-lg z-[100] max-h-32 overflow-y-auto">
                          {getYearOptions().map(year => (
                            <button
                              key={year}
                              onClick={() => handleYearChange(year)}
                              className={`w-full px-2 py-1.5 text-sm text-left hover:bg-blue-50 ${
                                currentYear === year ? 'bg-blue-100 text-blue-600 font-medium' : ''
                              }`}
                            >
                              {year}년
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">월</label>
                    <div className="relative">
                      <button
                        onClick={toggleMonthDropdown}
                        className="w-full px-2 py-1.5 text-sm bg-white border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-left flex justify-between items-center"
                      >
                        <span>{currentMonth}월</span>
                        <svg
                          className="w-4 h-4"
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
                      {showMonthDropdown && (
                        <div className="absolute top-full left-0 w-full bg-white border border-gray-300 rounded-b shadow-lg z-50 max-h-32 overflow-y-auto">
                          {getMonthOptions().map(month => (
                            <button
                              key={month}
                              onClick={() => handleMonthChange(month)}
                              className={`w-full px-2 py-1.5 text-sm text-left hover:bg-blue-50 ${
                                currentMonth === month
                                  ? 'bg-blue-100 text-blue-600 font-medium'
                                  : ''
                              }`}
                            >
                              {month}월
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex justify-end space-x-2 pt-1">
                  <button
                    onClick={closeDatePicker}
                    className="px-2 py-1 text-xs text-gray-600 hover:text-gray-800"
                  >
                    취소
                  </button>
                  <button
                    onClick={closeDatePicker}
                    className="px-2 py-1 text-xs text-white rounded bg-gradient-to-br from-blue-400 to-blue-600 shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    확인
                  </button>
                </div>
              </div>
            )}
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
