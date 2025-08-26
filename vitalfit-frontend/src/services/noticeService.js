import axios from 'axios';

// API 기본 URL 설정
// eslint-disable-next-line no-undef
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

// axios 기본 설정
axios.defaults.baseURL = API_BASE_URL;
axios.defaults.timeout = 10000; // 10초 타임아웃

// 공지사항 API 서비스
export const noticeService = {
  // 공지사항 목록 조회
  getNotices: async (params = {}) => {
    try {
      const { page = 1, limit = 10, search = '', searchType = '전체' } = params;
      const response = await axios.get(`${API_BASE_URL}/api/notices`, {
        params: { page, limit, searchType, search },
      });
      return response.data;
    } catch (error) {
      console.error('공지사항 목록 조회 실패:', error);
      throw error;
    }
  },

  // 공지사항 상세 조회
  getNoticeById: async id => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/notices/${id}`);
      console.log('상세조회::::', response.data);

      return response.data;
    } catch (error) {
      console.error('공지사항 상세 조회 실패:', error);
      throw error;
    }
  },

  // 공지사항 생성
  createNotice: async noticeData => {
    try {
      // FormData 디버깅 출력
      if (noticeData instanceof FormData) {
        for (let [key, value] of noticeData.entries()) {
          console.log(`[FormData] ${key}:`, value);
        }
      }
      
      console.log('API 요청 URL:', `${API_BASE_URL}/api/notices`);
      console.log('요청 데이터 타입:', noticeData instanceof FormData ? 'FormData' : 'Object');
      
      const response = await axios.post('/api/notices', noticeData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 15000, // 15초 타임아웃
      });
      
      console.log('API 응답 성공:', response.data);
      return response.data;
    } catch (error) {
      console.error('공지사항 생성 실패:', error);
      console.error('에러 응답:', error.response?.data);
      console.error('에러 상태:', error.response?.status);
      console.error('에러 메시지:', error.message);
      
      // 더 자세한 에러 정보 제공
      if (error.response) {
        throw new Error(`서버 오류 (${error.response.status}): ${error.response.data?.message || error.message}`);
      } else if (error.request) {
        throw new Error('서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요.');
      } else {
        throw new Error(`요청 설정 오류: ${error.message}`);
      }
    }
  },

  // 공지사항 수정
  updateNotice: async (id, noticeData) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/api/notices/${id}`, noticeData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('공지사항 수정 실패:', error);
      throw error;
    }
  },

  // 공지사항 삭제
  deleteNotice: async id => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/api/notices/${id}`);
      return response.data;
    } catch (error) {
      console.error('공지사항 삭제 실패:', error);
      throw error;
    }
  },

  // 파일 다운로드
  downloadFile: async id => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/notices/${id}/download`, {
        responseType: 'blob',
      });
      return response;
    } catch (error) {
      console.error('파일 다운로드 실패:', error);
      throw error;
    }
  },

  // 센터 목록 조회 (임시 하드코딩)
  // getCenters: async () => {
  //   // TODO: 향후 실제 API로 변경
  //   return {
  //     success: true,
  //     data: [
  //       { id: 1, name: '바이탈핏 강남센터' },
  //       { id: 2, name: '바이탈핏 홍대센터' },
  //       { id: 3, name: '바이탈핏 신림센터' },
  //     ],
  //   };
  // },

  getCenters: async () => {
    try {
      const res = await axios.get('/api/centers');
      return {
        success: true,
        data: res.data.data.centers,
      };
    } catch (error) {
      console.error('센터 목록 조회 실패:', error);
      return {
        success: false,
        message: '센터 목록 조회 중 오류가 발생했습니다.',
      };
    }
  },

  // ===== 댓글 관련 API =====

  // 댓글 목록 조회
  getComments: async (noticeId, params = {}) => {
    try {
      const { page = 1, limit = 20 } = params;
      const response = await axios.get(`${API_BASE_URL}/api/notices/${noticeId}/comments`, {
        params: { page, limit },
      });
      return response.data;
    } catch (error) {
      console.error('댓글 목록 조회 실패:', error);
      throw error;
    }
  },

  // 댓글 작성
  createComment: async (noticeId, commentData) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/notices/${noticeId}/comments`,
        commentData
      );
      return response.data;
    } catch (error) {
      console.error('댓글 작성 실패:', error);
      throw error;
    }
  },

  // 댓글 수정
  updateComment: async (noticeId, commentId, commentData) => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/api/notices/${noticeId}/comments/${commentId}`,
        commentData
      );
      return response.data;
    } catch (error) {
      console.error('댓글 수정 실패:', error);
      throw error;
    }
  },

  // 댓글 삭제
  deleteComment: async (noticeId, commentId) => {
    try {
      const response = await axios.delete(
        `${API_BASE_URL}/api/notices/${noticeId}/comments/${commentId}`
      );
      return response.data;
    } catch (error) {
      console.error('댓글 삭제 실패:', error);
      throw error;
    }
  },
};

export default noticeService;
