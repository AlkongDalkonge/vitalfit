/**
 * 센터 관련 유틸리티 함수들
 */

// 센터 상태 텍스트 변환
export const getCenterStatusText = status => {
  switch (status) {
    case 'active':
      return '운영중';
    case 'inactive':
      return '휴업중';
    case 'maintenance':
      return '점검중';
    case 'closed':
      return '폐점';
    default:
      return '알 수 없음';
  }
};

// 센터 상태별 색상 클래스 반환
export const getCenterStatusColor = status => {
  switch (status) {
    case 'active':
      return 'text-green-600 bg-green-50';
    case 'inactive':
      return 'text-yellow-600 bg-yellow-50';
    case 'maintenance':
      return 'text-blue-600 bg-blue-50';
    case 'closed':
      return 'text-red-600 bg-red-50';
    default:
      return 'text-gray-600 bg-gray-50';
  }
};

// 주소를 간단하게 포맷 (첫 2개 단어만)
export const formatShortAddress = address => {
  if (!address) return '-';
  return address.split(' ').slice(0, 2).join(' ');
};

// 전체 주소 포맷
export const formatFullAddress = (address, detailAddress) => {
  if (!address) return '-';

  let fullAddress = address;
  if (detailAddress) {
    fullAddress += ` ${detailAddress}`;
  }

  return fullAddress;
};

// 전화번호 포맷
export const formatCenterPhone = phoneNumber => {
  if (!phoneNumber) return '-';

  // 숫자만 추출
  const numbers = phoneNumber.replace(/\D/g, '');

  // 지역번호가 있는 경우 (02-xxxx-xxxx 또는 031-xxx-xxxx 등)
  if (numbers.length === 10 && numbers.startsWith('02')) {
    return `${numbers.slice(0, 2)}-${numbers.slice(2, 6)}-${numbers.slice(6)}`;
  } else if (numbers.length === 10) {
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 6)}-${numbers.slice(6)}`;
  } else if (numbers.length === 11) {
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7)}`;
  }

  return phoneNumber;
};

// 센터 데이터 검증
export const validateCenterData = centerData => {
  const errors = {};

  if (!centerData.name?.trim()) {
    errors.name = '센터 이름은 필수입니다.';
  }

  if (!centerData.address?.trim()) {
    errors.address = '주소는 필수입니다.';
  }

  if (!centerData.phone?.trim()) {
    errors.phone = '연락처는 필수입니다.';
  } else if (!/^[\d\-() +]+$/.test(centerData.phone)) {
    errors.phone = '올바른 전화번호 형식이 아닙니다.';
  }

  if (centerData.email && !/\S+@\S+\.\S+/.test(centerData.email)) {
    errors.email = '올바른 이메일 형식이 아닙니다.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

// 센터 운영 시간 포맷
export const formatOperatingHours = (openTime, closeTime) => {
  if (!openTime || !closeTime) return '-';

  try {
    const formatTime = timeString => {
      const [hours, minutes] = timeString.split(':');
      const hour = parseInt(hours);
      const period = hour >= 12 ? '오후' : '오전';
      const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
      return `${period} ${displayHour}:${minutes}`;
    };

    return `${formatTime(openTime)} - ${formatTime(closeTime)}`;
  } catch (error) {
    return `${openTime} - ${closeTime}`;
  }
};

// 센터 면적 포맷 (평수)
export const formatCenterArea = area => {
  if (!area) return '-';

  // 숫자인 경우 평수 단위 추가
  if (typeof area === 'number') {
    return `${area.toLocaleString()}평`;
  }

  // 이미 단위가 포함된 경우 그대로 반환
  if (typeof area === 'string' && (area.includes('평') || area.includes('㎡'))) {
    return area;
  }

  return `${area}평`;
};

// 센터 용량 포맷 (수용인원)
export const formatCenterCapacity = capacity => {
  if (!capacity) return '-';

  if (typeof capacity === 'number') {
    return `${capacity.toLocaleString()}명`;
  }

  return capacity.includes('명') ? capacity : `${capacity}명`;
};

// 센터 검색/필터링 함수
export const filterCentersByText = (centers, searchText) => {
  if (!searchText) return centers;

  const lowercaseSearch = searchText.toLowerCase();

  return centers.filter(
    center =>
      center.name?.toLowerCase().includes(lowercaseSearch) ||
      center.address?.toLowerCase().includes(lowercaseSearch) ||
      center.phone?.includes(searchText) ||
      center.manager?.name?.toLowerCase().includes(lowercaseSearch)
  );
};

// 센터 목록을 이름순으로 정렬
export const sortCentersByName = (centers, ascending = true) => {
  return [...centers].sort((a, b) => {
    const nameA = (a.name || '').toLowerCase();
    const nameB = (b.name || '').toLowerCase();

    if (ascending) {
      return nameA.localeCompare(nameB);
    } else {
      return nameB.localeCompare(nameA);
    }
  });
};

// 센터별 통계 계산
export const calculateCenterStats = centers => {
  return {
    total: centers.length,
    active: centers.filter(c => c.status === 'active').length,
    inactive: centers.filter(c => c.status === 'inactive').length,
    maintenance: centers.filter(c => c.status === 'maintenance').length,
    closed: centers.filter(c => c.status === 'closed').length,
  };
};
