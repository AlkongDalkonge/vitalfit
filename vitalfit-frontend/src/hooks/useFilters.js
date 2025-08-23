import { useState } from 'react';
import { centerAPI, userAPI } from '../utils/api';

/**
 * 필터 관련 상태와 로직을 관리하는 커스텀 훅
 */
export const useFilters = () => {
  // 필터 상태
  const [centerFilter, setCenterFilter] = useState('Select option');
  const [trainerFilter, setTrainerFilter] = useState('Select option');

  // 드롭다운 상태
  const [showCenterDropdown, setShowCenterDropdown] = useState(false);
  const [showTrainerDropdown, setShowTrainerDropdown] = useState(false);

  // 데이터 상태
  const [centers, setCenters] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [filteredTrainers, setFilteredTrainers] = useState([]);

  // API 호출 함수들
  const fetchCenters = async () => {
    try {
      const response = await centerAPI.getAllCenters();
      if (response.success) {
        setCenters(response.data.centers);
      }
    } catch (error) {
      console.error('지점 조회 실패:', error);
    }
  };

  const fetchTrainers = async () => {
    try {
      // 모든 사용자를 가져와서 트레이너 역할을 가진 사용자만 필터링
      const response = await userAPI.getAllUsers({ limit: 1000 });
      if (response.success) {
        console.log('전체 사용자 데이터:', response.data.users);
        
        // 각 사용자의 position 정보를 확인
        response.data.users.forEach(user => {
          console.log(`사용자: ${user.name}, position:`, user.position);
          if (user.position) {
            console.log(`  - position.id: ${user.position.id}`);
            console.log(`  - position.name: ${user.position.name}`);
            console.log(`  - position.level: ${user.position.level}`);
          }
        });
        
        // 첫 번째 사용자의 전체 position 객체를 확인
        if (response.data.users.length > 0) {
          console.log('첫 번째 사용자 전체 position 객체:', JSON.stringify(response.data.users[0].position, null, 2));
        }
        
        // 포지션 id가 1~7인 사용자만 트레이너로 필터링
        const allTrainers = response.data.users.filter(user => {
          // position이 있고 id가 1~7인 사용자 (트레이너 역할)
          const isTrainer = user.position && user.position.id >= 1 && user.position.id <= 7;
          if (isTrainer) {
            console.log('트레이너로 분류:', user.name, user.position.name, 'ID:', user.position.id);
          }
          return isTrainer;
        });
        
        console.log('필터링된 트레이너들:', allTrainers);
        
        // 트레이너들을 이름 순으로 정렬
        const sortedTrainers = allTrainers.sort((a, b) => a.name.localeCompare(b.name, 'ko'));
        
        setTrainers(sortedTrainers);
        setFilteredTrainers(sortedTrainers);
      }
    } catch (error) {
      console.error('트레이너 조회 실패:', error);
    }
  };

  // 필터링 함수들
  const buildFilters = () => {
    const filters = {};

    if (centerFilter !== 'Select option') {
      // 지점 이름으로 ID 찾기
      const center = centers.find(c => c.name === centerFilter);
      if (center) {
        filters.centerId = center.id;
      }
    }

    if (trainerFilter !== 'Select option') {
      // 트레이너 이름으로 ID 찾기
      const trainer = trainers.find(t => t.name === trainerFilter);
      if (trainer) {
        filters.trainerId = trainer.id;
      }
    }

    return filters;
  };

  // 즉시 필터링을 위한 필터 생성
  const buildImmediateFilters = (centerId, trainerName) => {
    const filters = {};

    if (centerId) {
      filters.centerId = centerId;
    }

    if (trainerName && trainerName !== 'Select option') {
      // 트레이너 이름으로 ID 찾기
      const trainer = trainers.find(t => t.name === trainerName);
      if (trainer) {
        filters.trainerId = trainer.id;
      }
    }

    return filters;
  };

  // 지점 필터 변경 핸들러
  const handleCenterFilterChange = async (value, onFilterChange) => {
    setCenterFilter(value);
    setShowCenterDropdown(false);

    if (value === 'Select option') {
      setFilteredTrainers(trainers);
      setTrainerFilter('Select option');
      // 즉시 필터링 적용
      if (onFilterChange) {
        await onFilterChange(null, 'Select option');
      }
    } else {
      // 해당 지점의 트레이너만 필터링
      const center = centers.find(c => c.name === value);
      if (center) {
        const centerTrainers = trainers.filter(trainer => trainer.center_id === center.id);
        setFilteredTrainers(centerTrainers);

        // 즉시 필터링 적용
        if (onFilterChange) {
          await onFilterChange(center.id, 'Select option');
        }
      } else {
        setFilteredTrainers([]);
      }
      setTrainerFilter('Select option');
    }
  };

  // 트레이너 필터 변경 핸들러
  const handleTrainerFilterChange = async (value, onFilterChange) => {
    setTrainerFilter(value);
    setShowTrainerDropdown(false);

    // 즉시 필터링 적용
    if (onFilterChange) {
      const center = centers.find(c => c.name === centerFilter);
      const centerId = center ? center.id : null;
      await onFilterChange(centerId, value);
    }
  };

  // 초기 데이터 로드
  const loadInitialData = async () => {
    await Promise.all([fetchCenters(), fetchTrainers()]);
  };

  return {
    // 상태
    centerFilter,
    trainerFilter,
    showCenterDropdown,
    showTrainerDropdown,
    centers,
    trainers,
    filteredTrainers,

    // 함수들
    buildFilters,
    buildImmediateFilters,
    handleCenterFilterChange,
    handleTrainerFilterChange,
    loadInitialData,
    setShowCenterDropdown,
    setShowTrainerDropdown,
    setCenterFilter,
    setTrainerFilter,
    setFilteredTrainers,
  };
};
