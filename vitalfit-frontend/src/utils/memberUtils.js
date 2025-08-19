/**
 * 멤버 관련 유틸리티 함수들
 */

// 상태 텍스트 변환
export const getStatusText = status => {
  switch (status) {
    case 'active':
      return '활성';
    case 'inactive':
      return '비활성';
    case 'expired':
      return '만료';
    case 'withdrawn':
      return '탈퇴';
    default:
      return '알 수 없음';
  }
};

// 상태 옵션들
export const statusOptions = [
  { value: 'active', label: '활성' },
  { value: 'inactive', label: '비활성' },
  { value: 'expired', label: '만료' },
  { value: 'withdrawn', label: '탈퇴' },
];

// 날짜 포맷팅 함수 (필요시 추가)
export const formatDate = dateString => {
  if (!dateString) return '-';

  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  } catch (error) {
    console.error('날짜 포맷팅 오류:', error);
    return '-';
  }
};

// 전화번호 포맷팅 함수
export const formatPhoneNumber = phoneNumber => {
  if (!phoneNumber) return '-';

  // 숫자만 추출
  const numbers = phoneNumber.replace(/\D/g, '');

  // 한국 전화번호 형식으로 변환
  if (numbers.length === 11) {
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7)}`;
  } else if (numbers.length === 10) {
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 6)}-${numbers.slice(6)}`;
  }

  return phoneNumber;
};

// 멤버 검색/필터링 함수
export const filterMembersByText = (members, searchText) => {
  if (!searchText) return members;

  const lowercaseSearch = searchText.toLowerCase();

  return members.filter(
    member =>
      member.name?.toLowerCase().includes(lowercaseSearch) ||
      member.email?.toLowerCase().includes(lowercaseSearch) ||
      member.phone?.includes(searchText) ||
      member.center?.name?.toLowerCase().includes(lowercaseSearch) ||
      member.trainer?.name?.toLowerCase().includes(lowercaseSearch)
  );
};

// 멤버 상태별 카운트
export const getMemberStatusCounts = members => {
  return members.reduce((acc, member) => {
    const status = member.status || 'unknown';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});
};

// 멤버 데이터 검증
export const validateMemberData = memberData => {
  const errors = {};

  if (!memberData.name?.trim()) {
    errors.name = '이름은 필수입니다.';
  }

  if (!memberData.email?.trim()) {
    errors.email = '이메일은 필수입니다.';
  } else if (!/\S+@\S+\.\S+/.test(memberData.email)) {
    errors.email = '올바른 이메일 형식이 아닙니다.';
  }

  if (!memberData.phone?.trim()) {
    errors.phone = '전화번호는 필수입니다.';
  } else if (!/^[\d\-() +]+$/.test(memberData.phone)) {
    errors.phone = '올바른 전화번호 형식이 아닙니다.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};
