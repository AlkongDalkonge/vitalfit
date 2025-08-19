/**
 * PT 세션 관련 유틸리티 함수들
 */

// 세션 타입 텍스트 변환
export const getSessionTypeText = type => {
  switch (type) {
    case 'regular':
      return '일반';
    case 'free':
      return '무료';
    default:
      return '알 수 없음';
  }
};

// 세션 상태 텍스트 변환
export const getSessionStatusText = status => {
  switch (status) {
    case 'scheduled':
      return '예정';
    case 'completed':
      return '완료';
    case 'cancelled':
      return '취소';
    case 'no_show':
      return '노쇼';
    default:
      return '알 수 없음';
  }
};

// 세션 상태별 색상 클래스 반환
export const getSessionStatusColor = status => {
  switch (status) {
    case 'scheduled':
      return 'text-blue-600 bg-blue-50';
    case 'completed':
      return 'text-green-600 bg-green-50';
    case 'cancelled':
      return 'text-red-600 bg-red-50';
    case 'no_show':
      return 'text-orange-600 bg-orange-50';
    default:
      return 'text-gray-600 bg-gray-50';
  }
};

// 세션 타입별 색상 클래스 반환
export const getSessionTypeColor = type => {
  switch (type) {
    case 'regular':
      return 'text-cyan-600 bg-cyan-50';
    case 'free':
      return 'text-purple-600 bg-purple-50';
    default:
      return 'text-gray-600 bg-gray-50';
  }
};

// 세션 데이터 검증
export const validateSessionData = sessionData => {
  const errors = {};

  if (!sessionData.trainer_id) {
    errors.trainer_id = '트레이너는 필수입니다.';
  }

  if (!sessionData.center_id) {
    errors.center_id = '센터는 필수입니다.';
  }

  if (!sessionData.session_date) {
    errors.session_date = 'PT 일자는 필수입니다.';
  }

  if (!sessionData.start_time) {
    errors.start_time = '시작 시간은 필수입니다.';
  }

  if (!sessionData.end_time) {
    errors.end_time = '종료 시간은 필수입니다.';
  }

  // 시간 유효성 검증
  if (sessionData.start_time && sessionData.end_time) {
    if (sessionData.start_time >= sessionData.end_time) {
      errors.end_time = '종료 시간은 시작 시간보다 늦어야 합니다.';
    }
  }

  // 과거 날짜 검증 (편집 모드가 아닌 경우)
  if (sessionData.session_date && !sessionData.id) {
    const sessionDate = new Date(sessionData.session_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (sessionDate < today) {
      errors.session_date = '과거 날짜는 선택할 수 없습니다.';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

// 세션 시간 계산 (분 단위)
export const calculateSessionDuration = (startTime, endTime) => {
  if (!startTime || !endTime) return 0;

  try {
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);

    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;

    return endMinutes - startMinutes;
  } catch (error) {
    console.error('세션 시간 계산 오류:', error);
    return 0;
  }
};

// 세션 시간을 문자열로 포맷 (예: "90분")
export const formatSessionDuration = (startTime, endTime) => {
  const duration = calculateSessionDuration(startTime, endTime);
  return duration > 0 ? `${duration}분` : '';
};

// 세션 통계 계산
export const calculateSessionStats = sessions => {
  const stats = {
    total: sessions.length,
    completed: 0,
    scheduled: 0,
    cancelled: 0,
    noShow: 0,
    regular: 0,
    free: 0,
  };

  sessions.forEach(session => {
    // 상태별 카운트
    switch (session.status) {
      case 'completed':
        stats.completed++;
        break;
      case 'scheduled':
        stats.scheduled++;
        break;
      case 'cancelled':
        stats.cancelled++;
        break;
      case 'no_show':
        stats.noShow++;
        break;
    }

    // 타입별 카운트
    switch (session.type) {
      case 'regular':
        stats.regular++;
        break;
      case 'free':
        stats.free++;
        break;
    }
  });

  return stats;
};

// 세션 목록을 날짜순으로 정렬
export const sortSessionsByDate = (sessions, ascending = false) => {
  return [...sessions].sort((a, b) => {
    const dateA = new Date(`${a.session_date} ${a.start_time}`);
    const dateB = new Date(`${b.session_date} ${b.start_time}`);

    return ascending ? dateA - dateB : dateB - dateA;
  });
};

// 특정 월의 세션 필터링
export const filterSessionsByMonth = (sessions, year, month) => {
  return sessions.filter(session => {
    const sessionDate = new Date(session.session_date);
    return sessionDate.getFullYear() === year && sessionDate.getMonth() + 1 === month;
  });
};
