import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ptSessionAPI } from '../utils/api';
import { formatDate, formatTime } from '../utils/dateUtils';
import { useCenter } from '../hooks/useCenter';
import { useUser } from '../hooks/useUser';
import PTSessionModal from '../components/PTSessionModal';
import { isTrainer, isTeamLeader, isManager, isCenterManager, isAdmin } from '../utils/auth';

const PTSchedulePage = () => {
  const { user, refreshUserInfo } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const [calendarData, setCalendarData] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedCenter, setSelectedCenter] = useState('1');
  const [selectedTrainer, setSelectedTrainer] = useState('all');
  const [centers, setCenters] = useState([]);
  const [trainers, setTrainers] = useState([]);

  // 모달 관련 상태
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const modalMode = 'modify'; // 수정 모드만 허용

  // 실제 DB에서 센터 및 트레이너 데이터 가져오기
  const { centers: dbCenters } = useCenter();
  const { users: dbUsers } = useUser();

  // 사용자 권한 확인
  const canViewAllCenters = isCenterManager(user) || isAdmin(user);
  const canViewAllTrainers = isManager(user) || isCenterManager(user) || isAdmin(user);
  const isCurrentUserTrainer = isTrainer(user) || isTeamLeader(user);

  // 센터 및 트레이너 데이터 설정
  useEffect(() => {
    if (!user || !user.position_id) {
      console.log('🔍 사용자 정보 부족, 센터/트레이너 데이터 설정 건너뜀');
      return;
    }

    if (dbCenters && dbCenters.length > 0) {
      let centerList;

      if (canViewAllCenters) {
        // 센터장 이상: 모든 센터 조회 가능
        centerList = dbCenters.map(center => ({
          id: center.id.toString(),
          name: center.name,
        }));
      } else {
        // 트레이너: 자신의 센터만 조회
        centerList = dbCenters
          .filter(center => center.id.toString() === user.center_id?.toString())
          .map(center => ({
            id: center.id.toString(),
            name: center.name,
          }));
      }

      setCenters(centerList);

      // 트레이너는 자신의 센터로 고정
      if (!canViewAllCenters && centerList.length > 0) {
        setSelectedCenter(centerList[0].id);
      }
    }
  }, [dbCenters, user, canViewAllCenters]);

  useEffect(() => {
    if (!user || !user.position_id) {
      console.log('🔍 사용자 정보 부족, 트레이너 데이터 설정 건너뜀');
      return;
    }

    if (dbUsers && dbUsers.length > 0) {
      let trainerList;

      if (canViewAllTrainers) {
        // 매니저 이상: 모든 트레이너 조회 가능
        trainerList = dbUsers
          .filter(user => user.position_id >= 3) // 트레이너 이상
          .map(user => ({
            id: user.id.toString(),
            name: user.name,
            center_id: user.center_id?.toString(),
          }));
      } else if (isCurrentUserTrainer) {
        // 트레이너: 자신만 조회
        trainerList = [
          {
            id: user.id.toString(),
            name: user.name,
            center_id: user.center_id?.toString(),
          },
        ];
        setSelectedTrainer(user.id.toString());
      }

      setTrainers(trainerList);
    }
  }, [dbUsers, user, canViewAllTrainers, isCurrentUserTrainer]);

  // 사용자 정보가 없으면 새로고침 시도 (한 번만)
  const [hasRefreshed, setHasRefreshed] = useState(false);

  useEffect(() => {
    // 사용자 정보가 없고, 아직 새로고침하지 않았고, 로딩이 완료된 경우에만 실행
    if (!user && !hasRefreshed && !loading) {
      console.log('🔍 사용자 정보 부족, 새로고침 시도');
      setHasRefreshed(true);
      // 무한 루프 방지를 위해 한 번만 호출
      refreshUserInfo();
    }
  }, [user, hasRefreshed, loading, refreshUserInfo]);

  // 사용자 정보 로딩 상태 디버깅
  useEffect(() => {
    console.log('🔍 사용자 정보 상태 변경:', {
      loading,
      user: user ? { id: user.id, name: user.name, position_id: user.position_id } : null,
      hasRefreshed,
    });
  }, [loading, user, hasRefreshed]);

  // 달력 데이터 가져오기
  useEffect(() => {
    if (!user || !user.position_id) {
      console.log('🔍 사용자 정보 부족, 달력 데이터 가져오기 건너뜀');
      return;
    }

    // 사용자 정보가 완전히 로드된 후에만 달력 데이터 가져오기
    if (user.id && user.position_id && user.center_id) {
      console.log('🔍 사용자 정보 완전 로드, 달력 데이터 가져오기 시작');
      fetchCalendarData();
    } else {
      console.log('🔍 사용자 정보 불완전, 달력 데이터 가져오기 건너뜀:', {
        id: user.id,
        position_id: user.position_id,
        center_id: user.center_id,
      });
    }
  }, [currentYear, currentMonth, selectedCenter, selectedTrainer, user]);

  const fetchCalendarData = async () => {
    try {
      setLoading(true);

      // API 호출 파라미터 설정 (센터 정보만)
      const params = {
        year: currentYear,
        month: currentMonth,
      };

      // 센터 정보 추가 (관리자인 경우)
      if (canViewAllCenters && selectedCenter && selectedCenter !== 'all') {
        params.center_id = selectedCenter;
      }

      // 백엔드 엔드포인트에 맞게 수정
      let response;

      // 트레이너로 로그인한 경우: 자신의 PT 세션만 조회
      if (isCurrentUserTrainer && !canViewAllTrainers) {
        response = await ptSessionAPI.getSessionsByUser(user.id, {
          year: params.year,
          month: params.month,
        });
      }
      // 관리자로 로그인한 경우
      else if (canViewAllTrainers) {
        if (selectedTrainer && selectedTrainer !== 'all') {
          // 특정 트레이너 선택: 해당 트레이너의 PT 세션만 조회
                  const trainerParams = {
          year: params.year,
          month: params.month,
        };
        
        // 센터 ID가 선택된 경우 쿼리 파라미터에 추가
        if (canViewAllCenters && selectedCenter && selectedCenter !== 'all') {
          trainerParams.center_id = selectedCenter;
        }
        
        response = await ptSessionAPI.getSessionsByUser(selectedTrainer, trainerParams);
        } else {
          // 전체 트레이너 선택: 센터의 모든 PT 세션 조회
          response = await ptSessionAPI.getPTSessionsByMonth(params.year, params.month);
        }
      }

      if (response.success) {
        const sessions = response.data.pt_sessions || response.data || [];
        const dailyData = processSessionsForCalendar(sessions);
        setCalendarData(dailyData);
      } else {
        console.error('API 응답 실패:', response.message);
        setCalendarData({});
      }
    } catch (error) {
      console.error('달력 데이터 조회 실패:', error);
      setCalendarData({});
    } finally {
      setLoading(false);
    }
  };

  // 센터별 트레이너 필터링
  const getFilteredTrainers = () => {
    if (isCurrentUserTrainer && !canViewAllTrainers) {
      // 트레이너는 자신만 표시
      return trainers;
    }
    return trainers.filter(trainer => trainer.center_id?.toString() === selectedCenter);
  };

  // 선택된 트레이너 이름 가져오기
  const getSelectedTrainerName = () => {
    if (selectedTrainer === 'all') return '전체';
    const trainer = trainers.find(t => t.id === selectedTrainer);
    return trainer ? trainer.name : 'Unknown';
  };

  // 센터 변경 핸들러
  const handleCenterChange = e => {
    const newCenter = e.target.value;
    setSelectedCenter(newCenter);
    setSelectedTrainer('all');
  };

  // 트레이너 변경 핸들러
  const handleTrainerChange = e => {
    const newTrainer = e.target.value;
    setSelectedTrainer(newTrainer);
  };

  // 세션 데이터를 달력용으로 가공
  const processSessionsForCalendar = sessions => {
    const dailyData = {};

    sessions.forEach(session => {
      const date = session.session_date;
      if (!dailyData[date]) {
        dailyData[date] = {
          sessions: [],
          sessionTypes: new Set(),
        };
      }
      dailyData[date].sessions.push(session);
      dailyData[date].sessionTypes.add(session.session_type);
    });

    return dailyData;
  };

  // 달력 그리드 생성
  const generateCalendarGrid = () => {
    const firstDay = new Date(currentYear, currentMonth - 1, 1);
    const lastDay = new Date(currentYear, currentMonth, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days = [];
    const currentDate = new Date(startDate);

    while (currentDate <= lastDay || days.length < 42) {
      days.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return days;
  };

  // 월 변경
  const changeMonth = direction => {
    if (direction === 'prev') {
      if (currentMonth === 1) {
        setCurrentMonth(12);
        setCurrentYear(currentYear - 1);
      } else {
        setCurrentMonth(currentMonth - 1);
      }
    } else {
      if (currentMonth === 12) {
        setCurrentMonth(1);
        setCurrentYear(currentYear + 1);
      } else {
        setCurrentMonth(1);
        setCurrentYear(currentYear + 1);
      }
    }
  };

  // 선택된 날의 세션 정보
  const getSelectedDateSessions = () => {
    const dateStr = selectedDate.toISOString().split('T')[0];
    return calendarData[dateStr]?.sessions || [];
  };

  // 세션 상태 변경 핸들러
  const handleSessionStatusChange = async (sessionId, newStatus, endTime) => {
    try {
      // 권한 체크: 자신의 세션이거나 관리자 권한이 있는 경우만 수정 가능
      const session = getSelectedDateSessions().find(s => s.id === sessionId);
      if (!session) return;

      const canEdit = session.trainer_id?.toString() === user.id?.toString() || canViewAllTrainers;

      if (!canEdit) {
        alert('자신의 PT 세션만 수정할 수 있습니다.');
        return;
      }

      const response = await ptSessionAPI.updatePTSession(sessionId, {
        end_time: endTime,
      });

      if (response.success) {
        console.log('세션 상태 변경 성공:', response.data);
        await fetchCalendarData();
      } else {
        console.error('세션 상태 변경 실패:', response.message);
      }
    } catch (error) {
      console.error('세션 상태 변경 오류:', error);
    }
  };

  // 수업변경 모달 열기 핸들러
  const handleModifyClick = session => {
    // 권한 체크: 자신의 세션이거나 관리자 권한이 있는 경우만 수정 가능
    const canEdit = session.trainer_id?.toString() === user.id?.toString() || canViewAllTrainers;

    if (!canEdit) {
      alert('자신의 PT 세션만 수정할 수 있습니다.');
      return;
    }

    setSelectedSession(session);
    setShowSessionModal(true);
  };

  // 모달 닫기 핸들러
  const handleCloseModal = () => {
    setShowSessionModal(false);
    setSelectedSession(null);
  };

  // 사용자 정보가 로드되지 않았거나 권한 정보가 없는 경우
  if (loading || !user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">사용자 정보를 불러오는 중...</p>

          {/* 디버깅 정보 표시 */}
          <div className="mt-4 p-4 bg-gray-100 rounded-lg text-left max-w-md mx-auto">
            <h3 className="font-semibold text-gray-800 mb-2">디버깅 정보:</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <div>Loading: {loading ? 'true' : 'false'}</div>
              <div>User exists: {user ? 'true' : 'false'}</div>
              {user && (
                <>
                  <div>User ID: {user.id}</div>
                  <div>User Name: {user.name}</div>
                  <div>Position ID: {user.position_id || 'null'}</div>
                  <div>Center ID: {user.center_id || 'null'}</div>
                </>
              )}
            </div>
          </div>

          {!user || !user.position_id ? (
            <p className="text-sm text-gray-500 mt-2">권한 정보를 확인하고 있습니다.</p>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      {/* 왼쪽: 달력 영역 (67%) */}
      <div className="w-8/12 h-screen">
        <div className="bg-white h-full">
          {/* 헤더 영역 - 트레이너별 PT 일정관리 */}
          <div className="p-4 border-b border-gray-200">
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-2">
                  {isCurrentUserTrainer && !canViewAllTrainers
                    ? `${user.name} PT 일정관리`
                    : selectedTrainer === 'all'
                      ? `${user.name} 관리자 PT 일정관리`
                      : `${getSelectedTrainerName()} PT 일정관리`}
                </h2>
                <p className="text-gray-600">
                  {isCurrentUserTrainer && !canViewAllTrainers
                    ? '내 PT 수업 일정을 관리하세요'
                    : 'PT 수업 일정을 관리하세요'}
                </p>
              </div>

              {/* 센터 및 트레이너 선택 (한 줄에 배치) */}
              <div className="flex gap-4">
                {/* 센터 선택 */}
                {canViewAllCenters && (
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      센터 선택
                    </label>
                    <select
                      value={selectedCenter}
                      onChange={handleCenterChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {centers.map(center => (
                        <option key={center.id} value={center.id}>
                          {center.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* 트레이너 선택 */}
                {canViewAllTrainers && (
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      트레이너 선택
                    </label>
                    <select
                      value={selectedTrainer}
                      onChange={handleTrainerChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">전체 트레이너</option>
                      {getFilteredTrainers().map(trainer => (
                        <option key={trainer.id} value={trainer.id}>
                          {trainer.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 달력 헤더 */}
          <div className="flex items-center justify-between mb-6 p-6 pb-0">
            <button
              onClick={() => changeMonth('prev')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              ←
            </button>
            <h2 className="text-xl font-bold text-gray-800">
              {currentYear}년 {currentMonth}월
            </h2>
            <button
              onClick={() => changeMonth('next')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              →
            </button>
          </div>

          {/* 요일 헤더 */}
          <div className="grid grid-cols-7 gap-1 mb-2 px-6">
            {['일', '월', '화', '수', '목', '금', '토'].map(day => (
              <div key={day} className="text-center text-sm font-medium text-gray-600 py-2">
                {day}
              </div>
            ))}
          </div>

          {/* 달력 그리드 */}
          <div className="grid grid-cols-7 gap-1 px-6">
            {generateCalendarGrid().map((date, index) => {
              const dateStr = date.toISOString().split('T')[0];
              const dayData = calendarData[dateStr];
              const isCurrentMonth = date.getMonth() === currentMonth - 1;
              const isSelected = date.toDateString() === selectedDate.toDateString();
              const isToday = date.toDateString() === new Date().toDateString();

              return (
                <div
                  key={index}
                  className={`min-h-[80px] p-2 border border-gray-200 cursor-pointer transition-all hover:bg-gray-50 ${
                    isCurrentMonth ? 'bg-white' : 'bg-gray-100'
                  } ${isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : ''} ${
                    isToday ? 'ring-2 ring-blue-300' : ''
                  }`}
                  onClick={() => setSelectedDate(date)}
                >
                  <div
                    className={`text-sm font-medium mb-1 ${
                      isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                    } ${isToday ? 'text-blue-600' : ''}`}
                  >
                    {date.getDate()}
                  </div>

                  {dayData && dayData.sessions.length > 0 ? (
                    <div className="space-y-1">
                      {/* PT 세션 정보 표시 */}
                      {dayData.sessions.slice(0, 3).map((session, idx) => {
                        const hasFree = session.session_type === 'free';
                        const hasIncomplete = !session.end_time;
                        const isCompleted =
                          session.end_time !== null && session.end_time !== undefined;

                        let displayStyle = '';
                        if (hasFree) {
                          displayStyle = 'border-b-2 border-purple-500';
                        }

                        return (
                          <div key={idx} className="relative">
                            <div
                              className={`text-xs text-gray-800 px-1 py-0.5 rounded truncate ${displayStyle}`}
                            >
                              {/* 완료/미완료 상태 표시 */}
                              {isCompleted ? (
                                <span className="text-green-500 mr-1">✓</span>
                              ) : (
                                <span className="text-red-500 mr-1">○</span>
                              )}
                              {/* 시간 + 회원명 표시 */}
                              {session.start_time?.substring(0, 5)}{' '}
                              {session.member?.name || 'Unknown'}
                              {hasFree && <span className="text-purple-500 ml-1">(무료)</span>}
                            </div>
                          </div>
                        );
                      })}
                      {dayData.sessions.length > 3 && (
                        <div className="text-xs bg-gray-100 text-gray-600 px-1 py-0.5 rounded text-center">
                          +{dayData.sessions.length - 3}
                        </div>
                      )}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 오른쪽: 상세 정보 영역 (33%) */}
      <div className="w-4/12 h-screen flex flex-col">
        {/* 일일 요약 (수업신청 현황 공간으로 이동) */}
        <div className="bg-white p-6 border-b border-gray-200">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-700 border-b border-gray-200 pb-2">
              {formatDate(selectedDate)} 일일 요약
            </h3>
            <DaySummary sessions={getSelectedDateSessions()} />
          </div>
        </div>

        {/* 시간대별 스케줄 */}
        <div className="bg-white flex-1 overflow-y-auto">
          <div className="p-6 space-y-4">
            <h3 className="text-lg font-semibold text-gray-700 border-b border-gray-200 pb-2 sticky top-0 bg-white z-10">
              {formatDate(selectedDate)} PT 스케줄
            </h3>
            {getSelectedDateSessions().length > 0 ? (
              <div className="space-y-3">
                {(() => {
                  // 시간대별로 그룹화
                  const timeSlots = {};
                  getSelectedDateSessions().forEach(session => {
                    const time = session.start_time?.substring(0, 5) || 'Unknown';
                    if (!timeSlots[time]) {
                      timeSlots[time] = [];
                    }
                    timeSlots[time].push(session);
                  });

                  // 시간순으로 정렬
                  const sortedTimes = Object.keys(timeSlots).sort();

                  return sortedTimes.map(time => (
                    <TimeSlot
                      key={time}
                      time={time}
                      sessions={timeSlots[time]}
                      currentUser={user}
                      canViewAllTrainers={canViewAllTrainers}
                    />
                  ));
                })()}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-gray-400 text-6xl mb-4">📅</div>
                <p className="text-gray-500 text-lg">선택된 날에 PT 수업이 없습니다</p>
                <p className="text-gray-400 text-sm mt-2">다른 날짜를 선택해보세요</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* PT 세션 모달 */}
      <PTSessionModal
        isOpen={showSessionModal}
        onClose={handleCloseModal}
        session={selectedSession}
        mode={modalMode}
      />
    </div>
  );
};

// 시간대별 세션 표시
const TimeSlot = ({ time, sessions, currentUser, canViewAllTrainers }) => {
  return (
    <div className="border-l-4 border-blue-500 pl-4">
      <div className="text-lg font-medium text-blue-600 mb-2">{time}</div>
      <div className="space-y-3">
        {sessions.map(session => (
          <div key={session.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            {/* 트레이너 정보 */}
            <div className="flex items-center justify-between mb-2">
              <div className="font-medium text-gray-800">
                {session.trainer?.name || 'Unknown'} 트레이너
              </div>
              <div className="text-right">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    session.session_type === 'free'
                      ? 'bg-purple-100 text-purple-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {session.session_type === 'free' ? '서비스' : '일반'}
                </span>
              </div>
            </div>

            {/* 회원 정보 */}
            <div className="text-sm text-gray-600 mb-2">
              회원: {session.member?.name || 'Unknown'}
            </div>

            {/* 시간 정보 */}
            <div className="text-xs text-gray-500 space-y-1 mb-3">
              <div>
                시간: {formatTime(session.start_time)} -{' '}
                {session.end_time ? formatTime(session.end_time) : '미정'}
              </div>
              {session.notes && <div>메모: {session.notes}</div>}
            </div>

            {/* 완료/미완료 상태 표시 (버튼 제거) */}
            <div className="flex items-center justify-end">
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  session.end_time ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}
              >
                {session.end_time ? '완료' : '미완료'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// 일일 요약 정보
const DaySummary = ({ sessions }) => {
  const regularCount = sessions.filter(s => s.session_type === 'regular').length;
  const freeCount = sessions.filter(s => s.session_type === 'free').length;
  const completedCount = sessions.filter(s => s.end_time).length;
  const pendingCount = sessions.length - completedCount;

  return (
    <div className="border-t border-gray-200 pt-4">
      <h3 className="text-lg font-semibold text-gray-700 mb-3">일일 요약</h3>
      <div className="grid grid-cols-4 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{sessions.length}</div>
          <div className="text-sm text-gray-600">총 세션</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">{completedCount}</div>
          <div className="text-sm text-gray-600">완료</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">{freeCount}</div>
          <div className="text-sm text-gray-600">무료</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-red-600">{pendingCount}</div>
          <div className="text-sm text-red-600">미완료</div>
        </div>
      </div>
    </div>
  );
};

export default PTSchedulePage;
