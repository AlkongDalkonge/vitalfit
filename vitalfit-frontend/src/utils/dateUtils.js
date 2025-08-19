/**
 * 날짜 관련 유틸리티 함수들
 */

// 날짜를 한국어 형식으로 포맷
export const formatDate = dateString => {
  if (!dateString) return '-';

  try {
    return new Date(dateString).toLocaleDateString('ko-KR');
  } catch (error) {
    console.error('날짜 포맷팅 오류:', error);
    return '-';
  }
};

// 날짜와 시간을 포맷
export const formatDateTime = dateTimeString => {
  if (!dateTimeString) return '-';

  try {
    const date = new Date(dateTimeString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  } catch (error) {
    console.error('날짜시간 포맷팅 오류:', error);
    return '-';
  }
};

// 시간만 포맷 (HH:MM)
export const formatTime = timeString => {
  if (!timeString) return '';

  try {
    // HH:MM:SS 형식에서 HH:MM만 추출
    return timeString.substring(0, 5);
  } catch (error) {
    console.error('시간 포맷팅 오류:', error);
    return '';
  }
};

// ISO 날짜 문자열을 input[type="date"] 형식으로 변환
export const toInputDateFormat = dateString => {
  if (!dateString) return '';

  try {
    return new Date(dateString).toISOString().split('T')[0];
  } catch (error) {
    console.error('Input 날짜 형식 변환 오류:', error);
    return '';
  }
};

// 두 날짜 사이의 일수 계산
export const getDaysBetween = (startDate, endDate) => {
  try {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  } catch (error) {
    console.error('날짜 차이 계산 오류:', error);
    return 0;
  }
};

// 날짜가 유효한지 검증
export const isValidDate = dateString => {
  try {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date);
  } catch (error) {
    return false;
  }
};

// 현재 날짜를 기준으로 년도 옵션 생성
export const getYearOptions = (range = 2) => {
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let i = currentYear - range; i <= currentYear + range; i++) {
    years.push(i);
  }
  return years;
};

// 월 옵션 생성 (1-12)
export const getMonthOptions = () => {
  return Array.from({ length: 12 }, (_, i) => i + 1);
};

// 날짜를 "YYYY년 MM월" 형식으로 포맷
export const formatYearMonth = (year, month) => {
  return `${year}년 ${month}월`;
};

// 오늘 날짜 가져오기 (YYYY-MM-DD 형식)
export const getTodayString = () => {
  return new Date().toISOString().split('T')[0];
};
