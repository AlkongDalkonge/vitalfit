import { useState, useEffect } from 'react';
import api from '../utils/api';

export const useBonus = (trainerId, year, month) => {
  const [bonusData, setBonusData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!trainerId || !year || !month) {
      setBonusData(null);
      return;
    }

    const fetchBonus = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await api.get(`/bonus/calculate/${trainerId}/${year}/${month}`);
        setBonusData(response.data);
      } catch (err) {
        console.error('보너스 계산 오류:', err);
        setError(err.response?.data?.error || '보너스 계산 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchBonus();
  }, [trainerId, year, month]);

  return {
    bonusData,
    loading,
    error,
    refresh: () => {
      if (trainerId && year && month) {
        const fetchBonus = async () => {
          setLoading(true);
          setError(null);

          try {
            const response = await api.get(`/bonus/calculate/${trainerId}/${year}/${month}`);
            setBonusData(response.data);
          } catch (err) {
            console.error('보너스 계산 오류:', err);
            setError(err.response?.data?.error || '보너스 계산 중 오류가 발생했습니다.');
          } finally {
            setLoading(false);
          }
        };
        fetchBonus();
      }
    },
  };
};
