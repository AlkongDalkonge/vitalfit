import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import PTSessionCreateModal from './PTSessionCreateModal';
import PTSessionEditModal from './PTSessionEditModal';

const MemberPTSessionPage = () => {
  const { memberId } = useParams();
  const [member, setMember] = useState(null);
  const [ptSessions, setPtSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [showYearDropdown, setShowYearDropdown] = useState(false);
  const [showMonthDropdown, setShowMonthDropdown] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingSession, setEditingSession] = useState(null);

  // 현재 년도와 월을 state로 관리 (오늘 날짜 기준)
  const currentDate = new Date();
  const [currentYear, setCurrentYear] = useState(currentDate.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(currentDate.getMonth() + 1); // 0-based이므로 +1

  useEffect(() => {
    fetchMemberPTSessions();
  }, [memberId, currentYear, currentMonth]);

  const fetchMemberPTSessions = async () => {
    try {
      setLoading(true);

      // 디버깅: API 호출 정보 로그
      console.log(`🔍 API 호출: ${memberId}/month/${currentYear}/${currentMonth}`);
      console.log(`📅 UI 표시: ${currentYear}년 ${currentMonth}월`);

      // 멤버의 이번달 PT 세션 조회
      const response = await fetch(
        `http://localhost:3000/api/pt-sessions/member/${memberId}/month/${currentYear}/${currentMonth}`
      );

      if (!response.ok) {
        throw new Error('PT 세션 데이터를 불러오는데 실패했습니다.');
      }

      const data = await response.json();

      if (data.success) {
        setMember(data.data.member);
        setPtSessions(data.data.pt_sessions);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = dateString => {
    return new Date(dateString).toLocaleDateString('ko-KR');
  };

  const formatDateTime = dateTimeString => {
    const date = new Date(dateTimeString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  };

  // 시간 포맷 함수 (HH:MM 형식으로 변환)
  const formatTime = timeString => {
    if (!timeString) return '';
    // HH:MM:SS 형식에서 HH:MM만 추출
    return timeString.substring(0, 5);
  };

  const getSessionTypeText = type => {
    return type === 'regular' ? '일반' : '무료';
  };

  // 년도/월 변경 함수
  const handleYearMonthChange = (year, month) => {
    setCurrentYear(year);
    setCurrentMonth(month);
    setShowDatePicker(false);
  };

  // 년도 옵션 생성 (현재 년도 기준으로 앞뒤 2년)
  const getYearOptions = () => {
    const currentDateYear = new Date().getFullYear();
    const years = [];
    for (let i = currentDateYear - 2; i <= currentDateYear + 2; i++) {
      years.push(i);
    }
    return years;
  };

  // 월 옵션 생성
  const getMonthOptions = () => {
    return Array.from({ length: 12 }, (_, i) => i + 1);
  };

  // 드롭다운 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = event => {
      if (showDatePicker && !event.target.closest('.date-picker-container')) {
        setShowDatePicker(false);
        setShowYearDropdown(false);
        setShowMonthDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDatePicker]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">로딩 중...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-red-500 text-lg">{error}</div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto">
      <div className="flex flex-col gap-6">
        {/* 제목 */}
        <div className="text-black text-xl font-extrabold font-['Nunito'] relative date-picker-container flex items-center gap-2">
          <span>'{member?.name || '고객명'}'님 출결 현황</span>
          <div className="relative">
            <button
              onClick={() => setShowDatePicker(!showDatePicker)}
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
              className="inline-flex items-center justify-center w-6 h-6 cursor-pointer transition-all duration-200 hover:bg-gray-50 rounded -translate-y-0.5"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24">
                <defs>
                  <linearGradient id="calendarGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#9CA3AF" />
                    <stop offset="100%" stopColor="#3B82F6" />
                  </linearGradient>
                </defs>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  stroke="url(#calendarGradient)"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </button>

            {/* 커스텀 툴팁 */}
            {showTooltip && (
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs font-normal px-2 py-1 rounded whitespace-nowrap z-50">
                {currentYear}년 {currentMonth}월
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-gray-800"></div>
              </div>
            )}

            {/* 년도/월 선택 드롭다운 */}
            {showDatePicker && (
              <div className="absolute top-0 left-full ml-2 bg-white border border-gray-200 rounded-lg shadow-xl z-50 p-3 w-48">
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">년도</label>
                    <div className="relative">
                      <button
                        onClick={() => setShowYearDropdown(!showYearDropdown)}
                        className="w-full px-2 py-1.5 text-sm font-normal bg-white border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-left flex justify-between items-center"
                      >
                        <span className="font-normal">{currentYear}년</span>
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
                              onClick={() => {
                                setCurrentYear(year);
                                setShowYearDropdown(false);
                              }}
                              className={`w-full px-2 py-1.5 text-sm font-normal text-left hover:bg-blue-50 ${
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
                        onClick={() => setShowMonthDropdown(!showMonthDropdown)}
                        className="w-full px-2 py-1.5 text-sm font-normal bg-white border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-left flex justify-between items-center"
                      >
                        <span className="font-normal">{currentMonth}월</span>
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
                        <div className="absolute top-full left-0 w-full bg-white border border-gray-300 rounded-b shadow-lg z-[50] max-h-32 overflow-y-auto">
                          {getMonthOptions().map(month => (
                            <button
                              key={month}
                              onClick={() => {
                                setCurrentMonth(month);
                                setShowMonthDropdown(false);
                              }}
                              className={`w-full px-2 py-1.5 text-sm font-normal text-left hover:bg-blue-50 ${
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
                  <div className="flex justify-end space-x-2 pt-1">
                    <button
                      onClick={() => setShowDatePicker(false)}
                      className="px-2 py-1 text-xs text-gray-600 hover:text-gray-800"
                    >
                      취소
                    </button>
                    <button
                      onClick={() => setShowDatePicker(false)}
                      className="relative px-2 py-1 text-xs text-white rounded bg-gradient-to-br from-blue-400 to-blue-600 shadow-lg hover:shadow-xl transition-all duration-200 font-normal before:content-[''] before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/30 before:to-transparent before:rounded before:pointer-events-none"
                    >
                      확인
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* PT 세션 테이블 */}
        <div className="bg-white">
          {/* 테이블 헤더 */}
          <div>
            <div className="grid gap-4 px-6 py-3 grid-cols-[1fr_1fr_1.2fr_1.2fr_1.2fr_1.2fr_2fr_1.5fr]">
              <div className="text-neutral-600 text-xs font-extrabold font-['Nunito']">회차</div>
              <div className="text-neutral-600 text-xs font-extrabold font-['Nunito']">종류</div>
              <div className="text-neutral-600 text-xs font-extrabold font-['Nunito']">
                트레이너
              </div>
              <div className="text-neutral-600 text-xs font-extrabold font-['Nunito']">센터</div>
              <div className="text-neutral-600 text-xs font-extrabold font-['Nunito']">PT 일자</div>
              <div className="text-neutral-600 text-xs font-extrabold font-['Nunito']">PT시간</div>
              <div className="text-neutral-600 text-xs font-extrabold font-['Nunito']">내용</div>
              <div className="text-neutral-600 text-xs font-extrabold font-['Nunito']">
                서명 일시
              </div>
            </div>
          </div>

          {/* 테이블 내용 - 스크롤 영역 추가 */}
          <div className="max-h-96 overflow-y-auto">
            {ptSessions.length > 0 ? (
              ptSessions.map((session, index) => (
                <div
                  key={session.id}
                  className="grid gap-4 px-6 py-4 hover:bg-gray-50 transition-colors grid-cols-[1fr_1fr_1.2fr_1.2fr_1.2fr_1.2fr_2fr_1.5fr]"
                >
                  <div
                    className="text-cyan-600 text-sm font-normal font-['Nunito'] leading-normal hover:text-cyan-800 hover:underline cursor-pointer transition-colors duration-200"
                    onClick={() => {
                      setEditingSession(session);
                      setIsEditModalOpen(true);
                    }}
                  >
                    {String(index + 1).padStart(2, '0')}
                  </div>
                  <div className="text-neutral-800 text-sm font-normal font-['Nunito']">
                    {getSessionTypeText(session.session_type)}
                  </div>
                  <div className="text-neutral-800 text-sm font-normal font-['Nunito'] truncate">
                    {session.trainer?.name || '-'}
                  </div>
                  <div className="text-neutral-800 text-sm font-normal font-['Nunito'] truncate">
                    {session.center?.name || '-'}
                  </div>
                  <div className="text-neutral-800 text-sm font-normal font-['Nunito']">
                    {formatDate(session.session_date)}
                  </div>
                  <div className="text-neutral-800 text-sm font-normal font-['Nunito']">
                    {session.start_time && session.end_time
                      ? `${formatTime(session.start_time)}-${formatTime(session.end_time)}`
                      : formatTime(session.start_time) || '-'}
                  </div>
                  <div className="text-neutral-800 text-sm font-normal font-['Nunito']">
                    {session.notes || '-'}
                  </div>
                  <div className="text-neutral-800 text-sm font-normal font-['Nunito'] truncate">
                    {session.signature_time ? formatDateTime(session.signature_time) : '-'}
                  </div>
                </div>
              ))
            ) : (
              <div className="px-6 py-12 text-center">
                <div className="text-neutral-500 text-sm">이번달 PT 세션이 없습니다.</div>
              </div>
            )}
          </div>
        </div>

        {/* 구분선 */}
        <div className="mt-6 border-t border-gray-200"></div>

        {/* 고객 정보 */}
        <div className="space-y-6">
          <h2 className="text-black text-base font-extrabold font-['Nunito']">고객 정보</h2>
          <div className="grid grid-cols-5 gap-12 px-16">
            <div className="space-y-2">
              <label className="text-neutral-600 text-xs font-extrabold font-['Nunito']">
                연락처
              </label>
              <div className="w-full h-9 rounded-[10px] border border-stone-300 px-3 flex items-center">
                <div className="text-neutral-800 text-sm font-normal font-['Nunito']">
                  {member?.phone || '-'}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-neutral-600 text-xs font-extrabold font-['Nunito']">
                등록일
              </label>
              <div className="w-full h-9 rounded-[10px] border border-stone-300 px-3 flex items-center">
                <div className="text-neutral-800 text-sm font-normal font-['Nunito']">
                  {member?.join_date ? formatDate(member.join_date) : '-'}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-neutral-600 text-xs font-extrabold font-['Nunito']">
                만료일
              </label>
              <div className="w-full h-9 rounded-[10px] border border-stone-300 px-3 flex items-center">
                <div className="text-neutral-800 text-sm font-normal font-['Nunito']">
                  {member?.expire_date ? formatDate(member.expire_date) : '-'}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-neutral-600 text-xs font-extrabold font-['Nunito']">
                잔여 PT
              </label>
              <div className="w-full h-9 rounded-[10px] border border-stone-300 px-3 flex items-center">
                <div className="text-neutral-800 text-sm font-normal font-['Nunito']">
                  {member ? member.total_sessions - member.used_sessions : 0}회
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-neutral-600 text-xs font-extrabold font-['Nunito']">
                잔여 무료PT
              </label>
              <div className="w-full h-9 rounded-[10px] border border-stone-300 px-3 flex items-center">
                <div className="text-neutral-800 text-sm font-normal font-['Nunito']">
                  {member?.free_sessions || 0}회
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* PT 등록 버튼 */}
        <div className="flex justify-start">
          <button
            onClick={() => setIsCreateModalOpen(true)}
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
      </div>

      {/* PT 세션 생성 모달 */}
      <PTSessionCreateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        memberId={memberId}
        member={member}
        onSessionCreated={() => {
          fetchMemberPTSessions(); // 목록 새로고침
          setIsCreateModalOpen(false);
        }}
      />

      {/* PT 세션 수정 모달 */}
      <PTSessionEditModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingSession(null);
        }}
        sessionData={editingSession}
        onSessionUpdated={() => {
          fetchMemberPTSessions(); // 목록 새로고침
          setIsEditModalOpen(false);
          setEditingSession(null);
        }}
        onSessionDeleted={() => {
          fetchMemberPTSessions(); // 목록 새로고침
          setIsEditModalOpen(false);
          setEditingSession(null);
        }}
      />
    </div>
  );
};

export default MemberPTSessionPage;
