/**
 * 사용자 관련 유틸리티 함수들
 */

// 사용자 상태 텍스트 변환
export const getUserStatusText = status => {
  switch (status) {
    case 'active':
      return '활성';
    case 'inactive':
      return '비활성';
    case 'pending':
      return '대기';
    case 'suspended':
      return '정지';
    default:
      return '알 수 없음';
  }
};

// 사용자 역할 텍스트 변환
export const getUserRoleText = role => {
  switch (role) {
    case 'admin':
      return '관리자';
    case 'manager':
      return '매니저';
    case 'trainer':
      return '트레이너';
    case 'staff':
      return '직원';
    case 'member':
      return '회원';
    default:
      return '알 수 없음';
  }
};

// 사용자 상태별 색상 클래스 반환
export const getUserStatusColor = status => {
  switch (status) {
    case 'active':
      return 'text-green-600 bg-green-50';
    case 'inactive':
      return 'text-gray-600 bg-gray-50';
    case 'pending':
      return 'text-yellow-600 bg-yellow-50';
    case 'suspended':
      return 'text-red-600 bg-red-50';
    default:
      return 'text-gray-600 bg-gray-50';
  }
};

// 사용자 역할별 색상 클래스 반환
export const getUserRoleColor = role => {
  switch (role) {
    case 'admin':
      return 'text-purple-600 bg-purple-50';
    case 'manager':
      return 'text-blue-600 bg-blue-50';
    case 'trainer':
      return 'text-cyan-600 bg-cyan-50';
    case 'staff':
      return 'text-green-600 bg-green-50';
    case 'member':
      return 'text-gray-600 bg-gray-50';
    default:
      return 'text-gray-600 bg-gray-50';
  }
};

// 사용자 데이터 검증
export const validateUserData = userData => {
  const errors = {};

  if (!userData.name?.trim()) {
    errors.name = '이름은 필수입니다.';
  }

  if (!userData.email?.trim()) {
    errors.email = '이메일은 필수입니다.';
  } else if (!/\S+@\S+\.\S+/.test(userData.email)) {
    errors.email = '올바른 이메일 형식이 아닙니다.';
  }

  if (!userData.phone?.trim()) {
    errors.phone = '전화번호는 필수입니다.';
  } else if (!/^[\d\-() +]+$/.test(userData.phone)) {
    errors.phone = '올바른 전화번호 형식이 아닙니다.';
  }

  if (!userData.role) {
    errors.role = '역할을 선택해주세요.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

// 전화번호 포맷팅 함수 추가
export const formatPhoneNumber = phoneNumber => {
  if (!phoneNumber) return '-';

  // 숫자만 추출
  const numbers = phoneNumber.replace(/\D/g, '');

  // 휴대폰 번호 (010-xxxx-xxxx)
  if (numbers.length === 11 && numbers.startsWith('010')) {
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7)}`;
  }

  // 일반 전화번호 (02-xxxx-xxxx 또는 031-xxx-xxxx 등)
  if (numbers.length === 10 && numbers.startsWith('02')) {
    return `${numbers.slice(0, 2)}-${numbers.slice(2, 6)}-${numbers.slice(6)}`;
  } else if (numbers.length === 10) {
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 6)}-${numbers.slice(6)}`;
  } else if (numbers.length === 11) {
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7)}`;
  }

  return phoneNumber;
};

// 사용자 검색/필터링 함수
export const filterUsersByText = (users, searchText) => {
  if (!searchText) return users;

  const lowercaseSearch = searchText.toLowerCase();

  return users.filter(
    user =>
      user.name?.toLowerCase().includes(lowercaseSearch) ||
      user.email?.toLowerCase().includes(lowercaseSearch) ||
      user.phone?.includes(searchText) ||
      user.center?.name?.toLowerCase().includes(lowercaseSearch) ||
      user.team?.name?.toLowerCase().includes(lowercaseSearch)
  );
};

// 사용자 역할별 카운트
export const getUserRoleCounts = users => {
  return users.reduce((acc, user) => {
    const role = user.role || 'unknown';
    acc[role] = (acc[role] || 0) + 1;
    return acc;
  }, {});
};

// 사용자 상태별 카운트
export const getUserStatusCounts = users => {
  return users.reduce((acc, user) => {
    const status = user.status || 'unknown';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});
};

// 사용자 목록을 이름순으로 정렬
export const sortUsersByName = (users, ascending = true) => {
  return [...users].sort((a, b) => {
    const nameA = (a.name || '').toLowerCase();
    const nameB = (b.name || '').toLowerCase();

    if (ascending) {
      return nameA.localeCompare(nameB);
    } else {
      return nameB.localeCompare(nameA);
    }
  });
};

// 사용자 목록을 역할순으로 정렬
export const sortUsersByRole = (users, ascending = true) => {
  const roleOrder = ['admin', 'manager', 'trainer', 'staff', 'member'];

  return [...users].sort((a, b) => {
    const roleAIndex = roleOrder.indexOf(a.role || '');
    const roleBIndex = roleOrder.indexOf(b.role || '');

    if (ascending) {
      return roleAIndex - roleBIndex;
    } else {
      return roleBIndex - roleAIndex;
    }
  });
};
