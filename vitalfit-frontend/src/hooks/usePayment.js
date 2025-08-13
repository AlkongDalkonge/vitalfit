import { useState, useEffect, useCallback } from 'react';
import { paymentAPI } from '../utils/api';

/**
 * PaymentPage용: 선택된 트레이너와 월에 따른 payment 데이터를 가져오는 훅
 * @param {number|null} trainerId - 선택된 트레이너 ID
 * @param {number|null} year - 선택된 년도
 * @param {number|null} month - 선택된 월
 */
export const usePayment = (trainerId, year, month) => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPayments = useCallback(async () => {
    console.log('🔄 usePayment fetchPayments 호출:', { trainerId, year, month });

    if (!trainerId || !year || !month) {
      console.log('❌ 필수 파라미터 누락:', { trainerId, year, month });
      setPayments([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log(
        '📡 API 호출:',
        `/api/payments?trainer_id=${trainerId}&year=${year}&month=${month}`
      );
      const response = await paymentAPI.getPaymentsByTrainerAndMonth(trainerId, year, month);
      console.log('✅ API 응답:', response);

      if (response.success) {
        setPayments(response.data || []);
      } else {
        setError(response.message || '결제 데이터를 불러오는데 실패했습니다.');
        setPayments([]);
      }
    } catch (err) {
      console.error('❌ 결제 데이터 가져오기 실패:', err);
      setError('결제 데이터를 불러오는데 실패했습니다.');
      setPayments([]);
    } finally {
      setLoading(false);
    }
  }, [trainerId, year, month]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const refresh = useCallback(() => {
    fetchPayments();
  }, [fetchPayments]);

  return {
    payments,
    loading,
    error,
    refresh,
  };
};
