import { useParams } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import { useUserPTSession, useDatePicker } from '../utils/hooks';
import { formatDate, formatDateTime, formatTime } from '../utils/dateUtils';
import { getSessionTypeText, getSessionTypeColor } from '../utils/ptSessionUtils';

const UserPTSessionPage = () => {
  const { userId } = useParams();
  const yearDropdownRef = useRef(null);
  const monthDropdownRef = useRef(null);

  console.log('🔍 UserPTSessionPage - userId:', userId);
  console.log('🔍 UserPTSessionPage - useParams():', useParams());
  console.log('🔍 UserPTSessionPage - window.location.pathname:', window.location.pathname);

  // URL에서 userId를 직접 추출하는 임시 방법
  const pathname = window.location.pathname;
  const pathMatch = pathname.match(/\/user\/(\d+)\/pt-sessions/);
  const extractedUserId = pathMatch ? pathMatch[1] : userId;

  console.log('🔍 UserPTSessionPage - extractedUserId:', extractedUserId);

  // 커스텀 훅 사용
  const {
    user,
    ptSessions,
    statistics,
    monthlyStats,
    loading,
    error,
    currentYear,
    currentMonth,
    handleYearMonthChange,
    getYearOptions,
    getMonthOptions,
  } = useUserPTSession(extractedUserId);

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
        {/* 최상단 제목 및 유저 정보 */}
        <div>
          {user && (
            <div className="text-black text-3xl font-extrabold font-['Nunito'] pt-2">
              {user.name}님의 PT세션
            </div>
          )}
        </div>

        {/* 날짜 선택 및 통계 섹션 */}
        <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center gap-16 pl-8">
            {/* 총 PT세션 */}
            <div className="text-center">
              <div className="text-2xl font-bold text-cyan-600">
                {statistics.total_sessions || 0}
              </div>
              <div className="text-sm text-gray-600">총 PT세션</div>
            </div>

            {/* 구분선 */}
            <div className="h-12 w-px bg-gray-200"></div>

            {/* 일반 PT 정보 */}
            <div className="text-center">
              <div className="text-2xl font-bold text-black">
                {statistics.regular_sessions || 0}
              </div>
              <div className="text-sm text-gray-600">일반 PT</div>
            </div>

            {/* 구분선 */}
            <div className="h-12 w-px bg-gray-200"></div>

            {/* 보너스 PT 정보 */}
            <div className="text-center">
              <div className="text-2xl font-bold text-black">{statistics.free_sessions || 0}</div>
              <div className="text-sm text-gray-600">보너스 PT</div>
            </div>

            {/* 구분선 */}
            <div className="h-12 w-px bg-gray-200"></div>

            {/* 총 수업시간 정보 */}
            <div className="text-center">
              <div className="text-2xl font-bold text-black">
                {statistics.total_session_hours || 0}h
              </div>
              <div className="text-sm text-gray-600">총 수업시간</div>
            </div>
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

                <div className="flex-[1] min-w-[60px] justify-start text-neutral-800 text-sm font-semibold font-['Nunito'] leading-normal">
                  회차
                </div>
                <div className="flex-[1] min-w-[80px] justify-start">
                  <span className="text-neutral-800 text-sm font-semibold font-['Nunito'] leading-normal">
                    종류
                  </span>
                </div>
                <div className="flex-[1] min-w-[160px] justify-start text-neutral-800 text-sm font-semibold font-['Nunito'] leading-normal">
                  멤버
                </div>
                <div className="flex-[1.5] min-w-[120px] justify-start text-neutral-800 text-sm font-semibold font-['Nunito'] leading-normal">
                  PT 일자
                </div>
                <div className="flex-[1.5] min-w-[120px] justify-start text-neutral-800 text-sm font-semibold font-['Nunito'] leading-normal">
                  PT시간
                </div>
                <div className="flex-[2] min-w-[150px] justify-start text-neutral-800 text-sm font-semibold font-['Nunito'] leading-normal">
                  내용
                </div>
                <div className="flex-[1] min-w-[100px] justify-start text-neutral-800 text-sm font-semibold font-['Nunito'] leading-normal">
                  상태
                </div>

                {/* 우측 여유 */}
                <div className="flex-[0.5]"></div>
              </div>
            </div>

            {/* 테이블 데이터 */}
            <div className="bg-white">
              {ptSessions.length === 0 ? (
                <div className="flex justify-center items-center h-48">
                  <div className="text-center text-gray-500">
                    <p className="text-lg mb-2">등록된 PT 세션이 없습니다</p>
                    <p className="text-sm">선택한 기간에 PT 세션 기록이 없습니다</p>
                  </div>
                </div>
              ) : (
                ptSessions.map((session, index) => (
                  <div key={session.id} className="hover:bg-gray-50 transition-colors duration-200">
                    <div className="flex items-center p-4 min-w-max gap-4">
                      {/* 좌측 여유 */}
                      <div className="flex-[0.3]"></div>

                      <div className="flex-[1] min-w-[60px] justify-start">
                        <span className="text-cyan-600 text-sm font-medium">{index + 1}</span>
                      </div>
                      <div className="flex-[1] min-w-[80px] justify-start">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getSessionTypeColor(session.session_type)} justify-start`}
                        >
                          {getSessionTypeText(session.session_type)}
                        </span>
                      </div>
                      <div className="flex-[1] min-w-[160px] justify-start text-neutral-600 text-sm font-normal font-['Nunito'] leading-normal">
                        {session.member?.name || '-'}
                      </div>
                      <div className="flex-[1.5] min-w-[120px] justify-start text-neutral-600 text-sm font-normal font-['Nunito'] leading-normal">
                        {formatDate(session.session_date)}
                      </div>
                      <div className="flex-[1.5] min-w-[120px] justify-start text-neutral-600 text-sm font-normal font-['Nunito'] leading-normal">
                        {formatTime(session.start_time)} - {formatTime(session.end_time)}
                      </div>
                      <div className="flex-[2] min-w-[150px] justify-start text-neutral-600 text-sm font-normal font-['Nunito'] leading-normal">
                        <div className="max-w-[150px] truncate" title={session.notes}>
                          {session.notes || '-'}
                        </div>
                      </div>
                      <div className="flex-[1] min-w-[100px] justify-start">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            session.end_time
                              ? 'text-green-600 bg-green-50'
                              : 'text-yellow-600 bg-yellow-50'
                          }`}
                        >
                          {session.end_time ? '완료' : '진행중'}
                        </span>
                      </div>

                      {/* 우측 여유 */}
                      <div className="flex-[0.5]"></div>
                    </div>
                    <div className="h-0 border-b border-gray-50"></div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserPTSessionPage;
