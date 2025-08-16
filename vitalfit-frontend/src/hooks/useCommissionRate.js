import { useState, useEffect } from 'react';
import { commissionRateAPI } from '../utils/api';

export const useCommissionRate = (totalRevenue, positionId, centerId) => {
  const [commissionRate, setCommissionRate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCommissionRate = async () => {
      if (totalRevenue === null || totalRevenue === undefined || !positionId) {
        setCommissionRate(null);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await commissionRateAPI.getCommissionRateByRevenue(
          totalRevenue,
          positionId,
          centerId
        );

        if (response.success) {
          setCommissionRate(response.data);
        } else {
          setError(response.message || '커미션 정책을 찾을 수 없습니다.');
        }
      } catch (err) {
        console.error('커미션 정책 조회 오류:', err);
        setError(err.response?.data?.message || '커미션 정책 조회 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchCommissionRate();
  }, [totalRevenue, positionId, centerId]);

  return { commissionRate, loading, error };
};
