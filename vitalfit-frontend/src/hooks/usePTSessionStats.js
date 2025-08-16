import { useState, useEffect } from 'react';
import { ptSessionStatsAPI } from '../utils/api';

export const usePTSessionStats = (trainerId, year, month) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!trainerId || !year || !month) {
      setStats(null);
      setError(null);
      return;
    }

    const fetchStats = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await ptSessionStatsAPI.getTrainerStats(trainerId, year, month);

        if (response.success) {
          setStats(response.data);
        } else {
          setError(response.message || '데이터를 가져오는데 실패했습니다.');
        }
      } catch (err) {
        console.error('PT 세션 통계 조회 오류:', err);
        setError(err.response?.data?.message || '서버 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [trainerId, year, month]);

  const refresh = () => {
    if (trainerId && year && month) {
      setStats(null);
      setError(null);
      // useEffect가 다시 실행되도록 강제로 상태를 변경
      setLoading(true);
    }
  };

  return {
    stats,
    loading,
    error,
    refresh,
  };
};
