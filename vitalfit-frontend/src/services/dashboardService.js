import { apiGet } from '../utils/api';

// 대시보드 통계 조회
export const getDashboardStats = async () => {
  try {
    console.log('🚀 대시보드 통계 API 호출 시작');
    const response = await apiGet('/dashboard/stats');
    console.log('✅ 대시보드 통계 API 응답 성공:', response);
    return response;
  } catch (error) {
    console.error('❌ 대시보드 통계 조회 실패:', error);

    // 에러 응답 구조 확인
    if (error.response) {
      console.error('에러 응답 상태:', error.response.status);
      console.error('에러 응답 데이터:', error.response.data);
    }

    throw error;
  }
};
