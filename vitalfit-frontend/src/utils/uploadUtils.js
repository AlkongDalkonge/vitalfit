import axios from 'axios';

/**
 * 이미지 업로드 유틸리티
 */
export const uploadImage = async (file, type = 'profile', userId) => {
  try {
    const formData = new FormData();

    // 타입에 따라 다른 필드명 사용
    if (type === 'profile') {
      formData.append('profile_image_url', file);
    } else {
      formData.append('image', file);
    }

    // API 엔드포인트 설정
    let endpoint;
    if (type === 'profile') {
      endpoint = `http://localhost:3001/api/users/${userId}/profile-image`;
    } else {
      endpoint = `http://localhost:3001/api/users/${userId}/upload-image`;
    }

    const response = await axios.post(endpoint, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
      },
    });

    return {
      success: true,
      data: response.data,
      url: response.data.url || response.data.profile_image_url,
    };
  } catch (error) {
    console.error('이미지 업로드 실패:', error);
    return {
      success: false,
      error: error.response?.data?.message || error.message,
    };
  }
};

/**
 * 이미지 URL 생성 (기본 이미지 포함)
 */
export const getImageUrl = (imageUrl, type = 'profile') => {
  if (imageUrl && imageUrl.trim() !== '') {
    // 절대 URL인 경우 그대로 사용
    if (imageUrl.startsWith('http')) {
      return imageUrl;
    }
    // 상대 URL인 경우 서버 주소 추가
    return `http://localhost:3001${imageUrl}`;
  }

  // 기본 이미지 반환 (기존 이미지 사용)
  if (type === 'profile') {
    return '/img/1center0.jpg'; // 임시로 기존 이미지 사용
  } else {
    return '/img/2center0.jpg'; // 임시로 기존 이미지 사용
  }
};

/**
 * 파일 유효성 검사
 */
export const validateImageFile = file => {
  const allowedTypes = ['.jpg', '.jpeg', '.png'];
  const maxSize = 5 * 1024 * 1024; // 5MB

  const fileExtension = `.${file.name.split('.').pop().toLowerCase()}`;

  if (!allowedTypes.includes(fileExtension)) {
    return {
      valid: false,
      error: '허용되지 않는 파일 형식입니다. JPG, JPEG, PNG 파일만 업로드 가능합니다.',
    };
  }

  if (file.size > maxSize) {
    return {
      valid: false,
      error: '파일 크기가 너무 큽니다. 최대 5MB까지 업로드 가능합니다.',
    };
  }

  return { valid: true };
};
