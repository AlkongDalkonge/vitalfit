import { useState, useEffect } from 'react';
import { ptSessionAPI } from '../utils/api';

/**
 * 유저별 PT 세션 관련 상태와 로직을 관리하는 커스텀 훅
 */
export const useUserPTSession = userId => {
  // 상태
  const [user, setUser] = useState(null);
  const [ptSessions, setPtSessions] = useState([]);
  const [statistics, setStatistics] = useState({});
  const [monthlyStats, setMonthlyStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 날짜 관련 상태
  const currentDate = new Date();
  const [currentYear, setCurrentYear] = useState(currentDate.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(currentDate.getMonth() + 1);

  // 데이터 가져오기
  const fetchUserPTSessions = async () => {
    if (!userId) return;

    try {
      console.log('🔍 유저 PT 세션 조회 시작:', { userId, currentYear, currentMonth });
      setLoading(true);
      setError(null);

      const response = await ptSessionAPI.getSessionsByUser(userId, {
        year: currentYear,
        month: currentMonth,
      });

      console.log('✅ 유저 PT 세션 조회 응답:', response);

      if (response.success) {
        setUser(response.data.user);
        setPtSessions(response.data.pt_sessions);
        setStatistics(response.data.statistics);
        setMonthlyStats(response.data.monthly_stats);
      } else {
        setError(response.message);
      }
    } catch (err) {
      console.error('❌ 유저 PT 세션 조회 오류:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 년도/월 변경
  const handleYearMonthChange = (year, month) => {
    setCurrentYear(year);
    setCurrentMonth(month);
  };

  // 년도 옵션 생성
  const getYearOptions = () => {
    const currentDateYear = new Date().getFullYear();
    const years = [];
    for (let i = 0; i < 6; i++) {
      years.push(currentDateYear - i);
    }
    return years;
  };

  // 월 옵션 생성
  const getMonthOptions = () => {
    return Array.from({ length: 12 }, (_, i) => i + 1);
  };

  // useEffect로 데이터 가져오기
  useEffect(() => {
    if (userId) {
      fetchUserPTSessions();
    }
  }, [userId, currentYear, currentMonth]);

  return {
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
    fetchUserPTSessions,
  };
};
