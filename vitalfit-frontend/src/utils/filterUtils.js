/**
 * 필터링 관련 유틸리티 함수들
 */

// 센터와 트레이너 정보로 필터 객체 생성
export const createFiltersFromCenterAndTrainer = (centers, trainers, centerName, trainerName) => {
  const filters = {};

  if (centerName && centerName !== 'Select option') {
    const center = centers.find(c => c.name === centerName);
    if (center) {
      filters.centerId = center.id;
    }
  }

  if (trainerName && trainerName !== 'Select option') {
    const trainer = trainers.find(t => t.name === trainerName);
    if (trainer) {
      filters.trainerId = trainer.id;
    }
  }

  return filters;
};

// 센터 선택에 따른 트레이너 필터링
export const filterTrainersByCenter = (trainers, centerName, centers) => {
  if (!centerName || centerName === 'Select option') {
    return trainers;
  }

  const center = centers.find(c => c.name === centerName);
  if (!center) {
    return [];
  }

  return trainers.filter(trainer => trainer.center_id === center.id);
};

// 드롭다운 옵션 생성
export const createDropdownOptions = (items, nameField = 'name', valueField = 'id') => {
  const defaultOption = { value: 'Select option', label: 'Select option' };

  const options = items.map(item => ({
    value: item[nameField],
    label: item[nameField],
    id: item[valueField],
  }));

  return [defaultOption, ...options];
};

// 필터 상태 초기화
export const resetFilters = () => ({
  centerFilter: 'Select option',
  trainerFilter: 'Select option',
});

// 활성 필터 개수 계산
export const getActiveFilterCount = (centerFilter, trainerFilter) => {
  let count = 0;

  if (centerFilter && centerFilter !== 'Select option') {
    count++;
  }

  if (trainerFilter && trainerFilter !== 'Select option') {
    count++;
  }

  return count;
};

// 필터 상태를 URL 쿼리 스트링으로 변환
export const filtersToQueryString = (centerFilter, trainerFilter) => {
  const params = new URLSearchParams();

  if (centerFilter && centerFilter !== 'Select option') {
    params.set('center', centerFilter);
  }

  if (trainerFilter && trainerFilter !== 'Select option') {
    params.set('trainer', trainerFilter);
  }

  return params.toString();
};

// URL 쿼리 스트링에서 필터 상태 복원
export const queryStringToFilters = queryString => {
  const params = new URLSearchParams(queryString);

  return {
    centerFilter: params.get('center') || 'Select option',
    trainerFilter: params.get('trainer') || 'Select option',
  };
};
