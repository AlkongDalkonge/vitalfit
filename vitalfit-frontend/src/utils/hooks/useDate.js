import { useState, useEffect } from 'react';

export const useDate = () => {
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    // 매일 자정에 날짜 업데이트
    const updateDate = () => {
      setCurrentDate(new Date());
    };

    // 현재 시간을 기준으로 다음 자정까지의 시간 계산
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const timeUntilMidnight = tomorrow.getTime() - now.getTime();

    // 다음 자정에 타이머 설정
    const timer = setTimeout(updateDate, timeUntilMidnight);

    return () => clearTimeout(timer);
  }, []);

  // YYYY년 M월 D일 형식으로 날짜 반환
  const getFormattedDate = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;
    const day = currentDate.getDate();
    return `${year}년 ${month}월 ${day}일`;
  };

  // YYYY-MM-DD 형식으로 날짜 반환
  const getISODate = () => {
    return currentDate.toISOString().split('T')[0];
  };

  // 요일 반환
  const getDayOfWeek = () => {
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    return days[currentDate.getDay()];
  };

  // 현재 시간 반환
  const getCurrentTime = () => {
    return currentDate.toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return {
    currentDate,
    getFormattedDate,
    getISODate,
    getDayOfWeek,
    getCurrentTime,
  };
};
