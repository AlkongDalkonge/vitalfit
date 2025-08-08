import { apiGet } from '../utils/api';

// 대시보드 통계 조회
export const getDashboardStats = async () => {
  try {
    const response = await apiGet('/dashboard/stats');
    return response;
  } catch (error) {
    console.error('대시보드 통계 조회 실패:', error);
    throw error;
  }
};
