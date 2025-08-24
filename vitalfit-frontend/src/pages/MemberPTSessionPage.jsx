import { useParams } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import PTSessionCreateModal from './PTSessionCreateModal';
import PTSessionEditModal from './PTSessionEditModal';
import { usePTSession, useDatePicker } from '../utils/hooks';
import { formatDate, formatDateTime, formatTime, formatYearMonth } from '../utils/dateUtils';
import { getSessionTypeText, getSessionTypeColor } from '../utils/ptSessionUtils';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';

const MemberPTSessionPage = () => {
  const { id: memberId } = useParams();
  const { user: currentUser } = useAuth();
  const yearDropdownRef = useRef(null);
  const monthDropdownRef = useRef(null);

  // PT 세션 조회 권한 체크 함수 - 백엔드에서 권한을 체크하므로 항상 true 반환
  const hasPTSessionPermission = () => {
    return true; // 백엔드에서 권한을 체크하므로 프론트엔드에서는 체크하지 않음
  };

  console.log('🔍 MemberPTSessionPage - memberId:', memberId);
  console.log('🔍 MemberPTSessionPage - useParams():', useParams());
  console.log('🔍 MemberPTSessionPage - window.location.pathname:', window.location.pathname);

  // URL에서 memberId를 직접 추출하는 임시 방법
  const pathname = window.location.pathname;
  const pathMatch = pathname.match(/\/member\/(\d+)\/pt-sessions/);
  const extractedMemberId = pathMatch ? pathMatch[1] : memberId;

  console.log('🔍 MemberPTSessionPage - extractedMemberId:', extractedMemberId);
  console.log('🔍 MemberPTSessionPage - currentUser:', currentUser);
  console.log('🔍 MemberPTSessionPage - currentUser type:', typeof currentUser);
  console.log('🔍 MemberPTSessionPage - currentUser id:', currentUser?.id);
  console.log('🔍 MemberPTSessionPage - currentUser position_id:', currentUser?.position_id);

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

  // PT 세션 관리 권한 체크 함수 - 담당 트레이너만 관리 가능
  const hasPTSessionManagementPermission = () => {
    if (!currentUser || !member) return false;
    
    // 관리자(12, 99)는 모든 권한
    if (currentUser.position_id === 12 || currentUser.position_id === 99) {
      return true;
    }
    
    // 담당 트레이너인지 확인 (타입 변환하여 비교)
    const isTrainer = Number(member.trainer_id) === Number(currentUser.id);
    
    console.log('🔍 PT 세션 관리 권한 체크:', {
      currentUser: {
        id: currentUser.id,
        name: currentUser.name,
        position_id: currentUser.position_id
      },
      member: {
        id: member.id,
        name: member.name,
        trainer_id: member.trainer_id
      },
      isTrainer: isTrainer
    });
    
    return isTrainer;
  };

  console.log('🔍 MemberPTSessionPage - member:', member);
  console.log('🔍 MemberPTSessionPage - member type:', typeof member);
  console.log('🔍 MemberPTSessionPage - member trainer_id:', member?.trainer_id);

  // 권한 체크 디버깅을 위한 useEffect
  useEffect(() => {
    console.log('🔍 useEffect - 권한 체크 디버깅');
    console.log('🔍 useEffect - currentUser:', currentUser);
    console.log('🔍 useEffect - member:', member);
    
    if (currentUser && member) {
      const hasPermission = hasPTSessionManagementPermission();
      console.log('🔍 useEffect - 권한 체크 결과:', hasPermission);
    } else {
      console.log('🔍 useEffect - currentUser 또는 member가 없음');
    }
  }, [currentUser, member]);

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
    console.log('🔍 PT 등록 버튼 클릭됨');
    console.log('🔍 hasPTSessionManagementPermission() 호출 전');
    
    const hasPermission = hasPTSessionManagementPermission();
    console.log('🔍 hasPTSessionManagementPermission() 결과:', hasPermission);
    
    if (!hasPermission) {
      console.log('🔍 권한 없음 - 토스트 메시지 표시');
      toast.warning('PT 세션 등록 권한이 없습니다. 담당 트레이너만 등록할 수 있습니다.');
      return;
    }
    
    console.log('🔍 권한 있음 - 모달 열기');
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

  // 권한 체크
  if (!hasPTSessionPermission()) {
    return (
      <div className="w-full max-w-7xl mx-auto p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800 font-medium">접근 권한이 없습니다</p>
          <p className="text-yellow-700 mt-1">PT 세션을 조회할 권한이 없습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-4 flex flex-col">
      <div className="flex flex-col gap-4 flex-1">
        {/* 최상단 제목 및 멤버 정보 */}
        <div>
          {member && (
            <div className="text-black text-3xl font-extrabold font-['Nunito'] pt-2">
              {member.name}님의 PT세션
            </div>
          )}
        </div>

        {/* 날짜 선택 및 통계 섹션 */}
        <div className="flex justify-between items-center bg-white p-3 rounded-lg shadow-sm border">
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
                      {getYearOptions.map(year => (
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
                      {getMonthOptions.map(month => (
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
          <div className="overflow-y-auto max-h-[calc(100vh-350px)]">
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


                {/* 우측 여유 */}
                <div className="flex-[0.3]"></div>
              </div>
            </div>

            {/* 테이블 데이터 */}
            <div className="bg-white">
              {ptSessions.length === 0 ? (
                <div className="flex justify-center items-center h-32">
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
                          disabled={!hasPTSessionManagementPermission()}
                          className={`text-sm font-medium transition-colors duration-200 ${
                            hasPTSessionManagementPermission()
                              ? 'text-cyan-600 hover:text-cyan-800 hover:underline cursor-pointer'
                              : 'text-gray-400 cursor-not-allowed'
                          }`}
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
        <div className="flex justify-end mt-4 mb-0">
          {(() => {
            const hasPermission = hasPTSessionManagementPermission();
            console.log('🔍 PT 등록 버튼 렌더링 - 권한:', hasPermission);
            return (
              <button
                onClick={handleOpenCreateModal}
                disabled={!hasPermission}
                data-layer="Button"
                data-property-1="Default"
                className={`Button w-40 h-11 p-2.5 rounded-[10px] inline-flex justify-center items-center gap-2.5 transition-all duration-200 shadow-lg hover:shadow-xl relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/15 before:via-transparent before:to-transparent before:pointer-events-none ${
                  hasPermission
                    ? 'bg-gradient-to-br from-blue-400 to-blue-600 hover:from-blue-500 hover:to-blue-700'
                    : 'bg-gray-400 cursor-not-allowed'
                }`}
              >
                <div
                  data-layer="Primary Button"
                  className="PrimaryButton justify-start text-white text-sm font-medium font-['Nunito'] leading-normal drop-shadow-xl"
                >
                  PT 등록
                </div>
              </button>
            );
          })()}
        </div>

        {/* PT 세션 등록 모달 */}
        <PTSessionCreateModal
          isOpen={isCreateModalOpen}
          onClose={handleCloseCreateModal}
          onCreate={handleCreateSession}
          memberId={memberId}
          member={member}
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
