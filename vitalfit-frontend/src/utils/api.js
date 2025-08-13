import axios from 'axios';
import AuthService from './auth';

const API_BASE_URL = 'http://localhost:3001/api';

// axios 인스턴스 생성
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// 요청 인터셉터 - 토큰 자동 추가
api.interceptors.request.use(
  config => {
    const token = AuthService.getAccessToken();
    console.log('API 요청 인터셉터:', {
      url: config.url,
      method: config.method,
      hasToken: !!token,
      token: token ? token.substring(0, 20) + '...' : null,
    });
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터 - 토큰 만료 시 자동 갱신
api.interceptors.response.use(
  response => {
    return response;
  },
  async error => {
    const originalRequest = error.config;

    // 401 에러이고 아직 재시도하지 않은 경우
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Refresh Token으로 새로운 Access Token 발급
        await AuthService.refreshAccessToken();

        // 새로운 토큰으로 원래 요청 재시도
        const newToken = AuthService.getAccessToken();
        originalRequest.headers.Authorization = `Bearer ${newToken}`;

        return api(originalRequest);
      } catch (refreshError) {
        // Refresh Token도 만료된 경우 로그아웃 처리
        console.error('토큰 갱신 실패:', refreshError);
        AuthService.removeAccessToken();
        AuthService.removeRefreshToken();
        localStorage.removeItem('rememberMe');

        // 로그인 페이지로 리다이렉트
        if (window.location.pathname !== '/login') {
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
  deleteCenterImage: async (centerId, imageId) => {
    return await apiDelete(`/centers/${centerId}/images/${imageId}`);
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
};

// Payment API
export const paymentAPI = {
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

export default api;
