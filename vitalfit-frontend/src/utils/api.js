import AuthService from './auth';

const API_BASE_URL = 'http://localhost:3001/api';

const apiCall = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  // 인증 토큰 가져오기 (AuthService 사용)
  const token = AuthService.getAccessToken();
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  console.log('API 호출 URL:', url);
  console.log('API 호출 옵션:', config);

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    console.log('API 응답:', data);

    if (!response.ok) {
      console.error('API 오류 응답:', data);
      throw new Error(data.message || 'API 호출 실패');
    }

    return data;
  } catch (error) {
    console.error('API 호출 오류:', error);
    throw error;
  }
};

export const apiGet = endpoint => apiCall(endpoint);
export const apiPost = (endpoint, data) =>
  apiCall(endpoint, { method: 'POST', body: JSON.stringify(data) });
export const apiPut = (endpoint, data) =>
  apiCall(endpoint, { method: 'PUT', body: JSON.stringify(data) });
export const apiDelete = endpoint => apiCall(endpoint, { method: 'DELETE' });

// Center API
export const centerAPI = {
  getAllCenters: () => apiGet('/centers'),
  getCenterById: id => apiGet(`/centers/${id}`),
  updateCenter: (id, data) => apiPut(`/centers/${id}`, data),
  deleteCenter: id => apiDelete(`/centers/${id}`),
  searchCenters: (query, status = 'active') =>
    apiGet(`/centers/search?q=${encodeURIComponent(query)}&status=${status}`),

  // 센터 이미지 관련 API
  uploadImage: async formData => {
    const url = `${API_BASE_URL}/centers/images`;
    const response = await fetch(url, {
      method: 'POST',
      body: formData, // FormData는 Content-Type 헤더를 자동으로 설정
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || '이미지 업로드 실패');
    }

    return data;
  },

  deleteImage: imageId => apiDelete(`/centers/images/${imageId}`),
  setMainImage: imageId => apiCall(`/centers/images/${imageId}/main`, { method: 'PUT' }),
};

// Member API (개선된 필터링 기능)
export const memberAPI = {
  getAllMembers: (params = {}) => {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value);
      }
    });
    const queryString = queryParams.toString();
    return apiGet(`/members${queryString ? `?${queryString}` : ''}`);
  },
  createMember: data => apiPost('/members', data),
  updateMember: (id, data) => apiPut(`/members/${id}`, data),
};

// PT Session API (개선된 기능)
export const ptSessionAPI = {
  // 월별 PT 세션 조회 (새로 추가)
  getSessionsByMonth: (year, month) => apiGet(`/pt-sessions/month/${year}/${month}`),
  // 멤버별 PT 세션 조회
  getSessionsByMember: (memberId, params = {}) => {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value);
      }
    });
    const queryString = queryParams.toString();
    return apiGet(`/pt-sessions/member/${memberId}${queryString ? `?${queryString}` : ''}`);
  },
  // PT 세션 생성
  createSession: data => apiPost('/pt-sessions', data),
  // PT 세션 수정
  updateSession: (id, data) => apiPut(`/pt-sessions/${id}`, data),
  // PT 세션 삭제 (새로 추가)
  deleteSession: id => apiDelete(`/pt-sessions/${id}`),
};

// User API
export const userAPI = {
  getAllUsers: (params = {}) => {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value);
      }
    });
    const queryString = queryParams.toString();
    return apiGet(`/users${queryString ? `?${queryString}` : ''}`);
  },
};

// Team API
export const teamAPI = {
  getAllTeams: () => apiGet('/teams'),
};
