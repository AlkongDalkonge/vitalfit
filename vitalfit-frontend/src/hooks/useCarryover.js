import { useState, useEffect } from 'react';
import { carryoverAPI } from '../utils/api';

export const useCarryover = (trainerId, year, month) => {
  const [carryoverAmount, setCarryoverAmount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCarryover = async () => {
      if (!trainerId || !year || !month) {
        setCarryoverAmount(0);
        setError(null);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await carryoverAPI.getCarryover(trainerId, year, month);

        if (response.success) {
          setCarryoverAmount(response.data.carryover_amount || 0);
        } else {
          setError(response.message || '이월매출 조회에 실패했습니다.');
          setCarryoverAmount(0);
        }
      } catch (err) {
        console.error('이월매출 조회 실패:', err);
        setError('이월매출 조회 중 오류가 발생했습니다.');
        setCarryoverAmount(0);
      } finally {
        setLoading(false);
      }
    };

    fetchCarryover();
  }, [trainerId, year, month]);

  return {
    carryoverAmount,
    loading,
    error,
  };
};
