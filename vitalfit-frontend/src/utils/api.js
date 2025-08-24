import axios from 'axios';
import AuthService from './auth';

// 환경에 따른 API URL 자동 설정
const getApiBaseUrl = () => {
  // 환경변수로 직접 지정된 경우 우선 사용
  if (process.env.REACT_APP_API_URL) {
    return `${process.env.REACT_APP_API_URL}/api`;
  }

  // 환경에 따른 자동 설정
  const environment = process.env.REACT_APP_ENVIRONMENT || 'development';

  switch (environment) {
    case 'production':
      return 'https://vitalfit-backend.azurewebsites.net/api'; // Azure 운영 서버
    case 'development':
    default:
      return 'http://localhost:3001/api'; // 로컬 개발 서버
  }
};

const API_BASE_URL = getApiBaseUrl();

// axios 인스턴스 생성
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: Number(process.env.REACT_APP_API_TIMEOUT) || 10000,
});

// 요청 인터셉터 - 토큰 자동 추가 및 재인증 토큰 포함
api.interceptors.request.use(
  config => {
    const token = AuthService.getAccessToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;

      // 민감 작업에 대한 재인증 토큰이 필요한 경우 자동으로 포함
      const sensitiveEndpoints = [
        '/users/change-password',
        '/users/me', // 계정 정보 변경
        '/users/deactivate-account',
      ];

      const isSensitiveEndpoint = sensitiveEndpoints.some(endpoint =>
        config.url?.includes(endpoint)
      );

      if (isSensitiveEndpoint) {
        // 현재 사용자 ID를 가져와서 재인증 토큰 확인
        try {
          const user = JSON.parse(localStorage.getItem('user') || '{}');
          if (user.id) {
            const { getReAuthToken } = require('./reAuthUtils');
            const reAuthToken = getReAuthToken(user.id);
            if (reAuthToken) {
              config.headers['x-reauth-token'] = reAuthToken;
            }
          }
        } catch (error) {
          // 에러 처리
        }
      }
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터 - 토큰 만료 시 자동 갱신 (refresh token 없이 처리)
api.interceptors.response.use(
  response => {
    return response;
  },
  async error => {
    const originalRequest = error.config;

    // 401 에러이고 아직 재시도하지 않은 경우
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // 토큰 갱신 요청, 로그인 요청, /users/me 요청이 401인 경우는 무한 루프 방지
      if (originalRequest.url === '/users/refresh' || originalRequest.url === '/users/me' || originalRequest.url === '/users/signin') {
        AuthService.removeAccessToken();
        AuthService.removeRefreshToken();
        localStorage.removeItem('rememberMe');

        // 로그인 페이지로 리다이렉트
        if (window.location.pathname !== '/login' && window.location.pathname !== '/') {
          window.location.href = '/login';
        }

        return Promise.reject(error);
      }

      try {
        // 무음 갱신 시도
        const newAccessToken = await AuthService.silentRefresh();

        if (newAccessToken) {
          // 새로운 토큰으로 원래 요청 재시도
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        } else {
          throw new Error('토큰 갱신 실패');
        }
      } catch (refreshError) {
        console.error('토큰 갱신 실패:', refreshError);

        // 토큰 갱신 실패 시 로그아웃 처리
        AuthService.removeAccessToken();
        AuthService.removeRefreshToken();
        localStorage.removeItem('rememberMe');

        // 로그인 페이지로 리다이렉트
        if (window.location.pathname !== '/login' && window.location.pathname !== '/') {
          window.location.href = '/login';
        }

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// 기본 HTTP 메서드 함수들
export const apiGet = async (url, config = {}) => {
  const response = await api.get(url, config);
  return response.data;
};

export const apiPost = async (url, data = {}, config = {}) => {
  const response = await api.post(url, data, config);
  return response.data;
};

export const apiPut = async (url, data = {}, config = {}) => {
  const response = await api.put(url, data, config);
  return response.data;
};

export const apiDelete = async (url, config = {}) => {
  const response = await api.delete(url, config);
  return response.data;
};

// 센터 API
export const centerAPI = {
  getAllCenters: async (params = {}) => {
    return await apiGet('/centers', { params });
  },
  getCenter: async id => {
    return await apiGet(`/centers/${id}`);
  },
  getCenterById: async id => {
    return await apiGet(`/centers/${id}`);
  },
  createCenter: async data => {
    return await apiPost('/centers', data);
  },
  updateCenter: async (id, data) => {
    return await apiPut(`/centers/${id}`, data);
  },
  deleteCenter: async id => {
    return await apiDelete(`/centers/${id}`);
  },
  uploadCenterImage: async (id, formData) => {
    return await apiPost(`/centers/${id}/images`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  uploadImage: async formData => {
    return await apiPost('/centers/images', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  deleteCenterImage: async (centerId, imageId) => {
    return await apiDelete(`/centers/${centerId}/images/${imageId}`);
  },
  deleteImage: async imageId => {
    return await apiDelete(`/centers/images/${imageId}`);
  },
  setMainImage: async imageId => {
    return await apiPut(`/centers/images/${imageId}/main`);
  },
};

// 사용자 API
export const userAPI = {
  getAllUsers: async (params = {}) => {
    return await apiGet('/users', { params });
  },
  getUser: async id => {
    return await apiGet(`/users/${id}`);
  },
  createUser: async data => {
    return await apiPost('/users', data);
  },
  updateUser: async (id, data) => {
    return await apiPut(`/users/${id}`, data);
  },
  deleteUser: async id => {
    return await apiDelete(`/users/${id}`);
  },
  signUp: async data => {
    return await apiPost('/auth/signup', data);
  },
  getPositions: async () => {
    return await apiGet('/users/positions');
  },
  // 내 계정 정보 업데이트
  updateMyAccount: async data => {
    return await apiPut('/users/me', data);
  },
  // 계좌 정보 업데이트
  updateAccountInfo: async data => {
    return await apiPut('/users/account', data);
  },
  // 자격증, 경력, 학력, 인스타그램 정보 업데이트
  updateAdditionalInfo: async data => {
    return await apiPut('/users/additional-info', data);
  },
  // 개별 정보 업데이트
  updateLicense: async data => {
    return await apiPut('/users/license', data);
  },
  updateExperience: async data => {
    return await apiPut('/users/experience', data);
  },
  updateEducation: async data => {
    return await apiPut('/users/education', data);
  },
  updateInstagram: async data => {
    return await apiPut('/users/instagram', data);
  },
  // 프로필 이미지 업로드
  uploadProfileImage: async (userId, formData, onProgress) => {
    return await api.post('/users/profile-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: onProgress,
    });
  },
  // 프로필 이미지 삭제
  deleteProfileImage: async () => {
    return await apiDelete('/users/profile-image');
  },
  // 추가 이미지 업로드 (자격증, 경력, 학력, 인스타그램)
  uploadAdditionalImage: async formData => {
    return await api.post('/users/upload-additional-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  // 계좌 이미지 업로드
  uploadAccountImage: async formData => {
    return await api.post('/users/upload-account-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

// 멤버 API
export const memberAPI = {
  getAllMembers: async (params = {}) => {
    return await apiGet('/members', { params });
  },
  getMember: async id => {
    return await apiGet(`/members/${id}`);
  },
  createMember: async data => {
    return await apiPost('/members', data);
  },
  updateMember: async (id, data) => {
    return await apiPut(`/members/${id}`, data);
  },
  deleteMember: async id => {
    return await apiDelete(`/members/${id}`);
  },
};

// PT 세션 API
export const ptSessionAPI = {
  getAllPTSessions: async (params = {}) => {
    return await apiGet('/pt-sessions', { params });
  },
  getPTSession: async id => {
    return await apiGet(`/pt-sessions/${id}`);
  },
  createPTSession: async data => {
    return await apiPost('/pt-sessions', data);
  },
  updatePTSession: async (id, data) => {
    return await apiPut(`/pt-sessions/${id}`, data);
  },
  deletePTSession: async id => {
    return await apiDelete(`/pt-sessions/${id}`);
  },
  getSessionsByMember: async (memberId, params = {}) => {
    const result = await apiGet(`/pt-sessions/member/${memberId}`, { params });
    return result;
  },
  getSessionsByUser: async (userId, params = {}) => {
    const queryParams = new URLSearchParams();

    // 파라미터들을 쿼리 스트링으로 변환
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null) {
        queryParams.append(key, params[key]);
      }
    });

    const queryString = queryParams.toString();
    const url = `/pt-sessions/user/${userId}${queryString ? `?${queryString}` : ''}`;

    return await apiGet(url);
  },
  getPTSessionsByMonth: async (year, month, params = {}) => {
    const queryParams = new URLSearchParams();

    // 센터 ID가 있는 경우 쿼리 파라미터에 추가
    if (params.center_id) {
      queryParams.append('center_id', params.center_id);
    }

    const queryString = queryParams.toString();
    const url = `/pt-sessions/month/${year}/${month}${queryString ? `?${queryString}` : ''}`;

    return await apiGet(url);
  },
  createSession: async data => {
    return await apiPost('/pt-sessions', data);
  },
  updateSession: async (id, data) => {
    return await apiPut(`/pt-sessions/${id}`, data);
  },
  deleteSession: async id => {
    return await apiDelete(`/pt-sessions/${id}`);
  },
};

// 팀 API
export const teamAPI = {
  getAllTeams: async (params = {}) => {
    return await apiGet('/teams', { params });
  },
  getTeam: async id => {
    return await apiGet(`/teams/${id}`);
  },
  createTeam: async data => {
    return await apiPost('/teams', data);
  },
  updateTeam: async (id, data) => {
    return await apiPut(`/teams/${id}`, data);
  },
  deleteTeam: async id => {
    return await apiDelete(`/teams/${id}`);
  },
  getTeamRevenueStats: async (teamId, year, month) => {
    return await apiGet(`/teams/${teamId}/revenue-stats/${year}/${month}`);
  },
};

// Payment API
export const paymentAPI = {
  getAllPayments: async (params = {}) => {
    // 멤버별 결제 조회는 새로운 엔드포인트 사용
    if (params.member_id) {
      return await apiGet(`/members/${params.member_id}/payments`);
    }
    return await apiGet('/payments', { params });
  },
  getPayment: async id => {
    return await apiGet(`/payments/${id}`);
  },
  createPayment: async data => {
    return await apiPost('/payments', data);
  },
  updatePayment: async (id, data) => {
    return await apiPut(`/payments/${id}`, data);
  },
  deletePayment: async id => {
    return await apiDelete(`/payments/${id}`);
  },
  getPaymentsByTrainerAndMonth: async (trainerId, year, month) => {
    return await apiGet('/pt-sessions/payments', {
      params: { trainer_id: trainerId, year, month },
    });
  },
  getTrainerSalary: async trainerId => {
    return await apiGet('/pt-sessions/trainer-salary', {
      params: { trainer_id: trainerId },
    });
  },
};

// Bonus API
export const bonusAPI = {
  calculateBonus: async (trainerId, year, month) => {
    return await apiGet(`/bonus/calculate/${trainerId}/${year}/${month}`);
  },
};

// Commission Rate API
export const commissionRateAPI = {
  getCommissionRateByRevenue: async (totalRevenue, positionId, centerId = null) => {
    const params = new URLSearchParams({
      totalRevenue: totalRevenue.toString(),
      positionId: positionId.toString(),
    });

    if (centerId) {
      params.append('centerId', centerId.toString());
    }

    return await apiGet(`/commission-rates/by-revenue?${params}`);
  },
};

// Carryover API
export const carryoverAPI = {
  getCarryover: async (trainerId, year, month) => {
    return await apiGet('/payments/carryover', {
      params: {
        trainer_id: trainerId,
        year: year,
        month: month,
      },
    });
  },
};

// PT Session Stats API
export const ptSessionStatsAPI = {
  getTrainerStats: async (trainerId, year, month) => {
    return await apiGet(`/pt-sessions/trainer-stats/${trainerId}/${year}/${month}`);
  },
};

// Settlement API
export const settlementAPI = {
  getSettlements: async (params = {}) => {
    return await apiGet('/settlements', { params });
  },
  getSettlement: async id => {
    return await apiGet(`/settlements/${id}`);
  },
  checkDraftSettlements: async userId => {
    return await apiGet('/settlements/check-draft', { params: { user_id: userId } });
  },
  checkAcknowledgedSettlements: async userId => {
    return await apiGet('/settlements/check-acknowledged', { params: { user_id: userId } });
  },
  checkCenterApprovedSettlements: async userId => {
    return await apiGet('/settlements/check-center-approved', { params: { user_id: userId } });
  },
  getNotifications: async userId => {
    return await apiGet('/settlements/notifications', { params: { user_id: userId } });
  },
  acknowledge: async (id, userId) => {
    return await apiPost(`/settlements/${id}/acknowledge`, null, { params: { user_id: userId } });
  },
  approve: async (id, userId, centerId) => {
    return await apiPost(`/settlements/${id}/approve`, null, {
      params: { user_id: userId, center_id: centerId },
    });
  },
  hqApprove: async (id, userId) => {
    return await apiPost(`/settlements/${id}/hq-approve`, null, {
      params: { user_id: userId },
    });
  },
  hqReject: async (id, rejectReason, userId) => {
    return await apiPost(
      `/settlements/${id}/hq-reject`,
      { reject_reason: rejectReason },
      {
        params: { user_id: userId },
      }
    );
  },
  pay: async (id, data = {}) => {
    return await apiPost(`/settlements/${id}/pay`, data);
  },
};

// Notification API
export const notificationAPI = {
  getSettlementNotifications: async () => {
    return await apiGet('/notifications/settlement');
  },
  markAsRead: async notificationId => {
    return await apiPut(`/notifications/${notificationId}/read`);
  },
  markAllAsRead: async () => {
    return await apiPut('/notifications/read-all');
  },
};

export default api;
