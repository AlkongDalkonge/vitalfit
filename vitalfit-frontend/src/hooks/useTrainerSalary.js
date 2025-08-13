import { useState, useEffect, useCallback } from 'react';
import { paymentAPI } from '../utils/api';

/**
 * 트레이너의 기본급 정보를 가져오는 커스텀 훅
 * @param {number|null} trainerId - 선택된 트레이너 ID
 */
export const useTrainerSalary = trainerId => {
  const [salary, setSalary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSalary = useCallback(async () => {
    if (!trainerId) {
      setSalary(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await paymentAPI.getTrainerSalary(trainerId);

      if (response.success) {
        setSalary(response.data);
      } else {
        setError(response.message || '기본급 정보를 불러오는데 실패했습니다.');
        setSalary(null);
      }
    } catch (err) {
      console.error('기본급 정보 가져오기 실패:', err);
      setError('기본급 정보를 불러오는데 실패했습니다.');
      setSalary(null);
    } finally {
      setLoading(false);
    }
  }, [trainerId]);

  useEffect(() => {
    fetchSalary();
  }, [fetchSalary]);

  const refresh = useCallback(() => {
    fetchSalary();
  }, [fetchSalary]);

  return {
    salary,
    loading,
    error,
    refresh,
  };
};
