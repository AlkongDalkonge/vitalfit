import { useState, useEffect } from 'react';
import { centerAPI, userAPI } from '../utils/api';

/**
 * 멤버 폼 관련 상태와 로직을 관리하는 커스텀 훅
 * MemberEditModal과 MemberCreateModal에서 공통으로 사용
 */
export const useMemberForm = (initialData = null, isOpen = false) => {
  // 폼 데이터 초기값
  const defaultFormData = {
    name: '',
    phone: '',
    center_id: '',
    trainer_id: '',
    join_date: new Date().toISOString().split('T')[0], // 오늘 날짜를 기본값으로 설정
    expire_date: '',
    total_sessions: '',
    used_sessions: '',
    free_sessions: '',
    memo: '',
    status: 'active',
  };

  // 상태
  const [formData, setFormData] = useState(defaultFormData);
  const [centers, setCenters] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // 폼 데이터 초기화 (편집 모드일 때는 initialData 사용)
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        // 편집 모드 - 기존 데이터로 초기화
        setFormData({
          name: initialData.name || '',
          phone: initialData.phone || '',
          center_id: initialData.center_id || '',
          trainer_id: initialData.trainer_id || '',
          join_date: initialData.join_date
            ? new Date(initialData.join_date).toISOString().split('T')[0]
            : '',
          expire_date: initialData.expire_date
            ? new Date(initialData.expire_date).toISOString().split('T')[0]
            : '',
          total_sessions: initialData.total_sessions || '',
          used_sessions: initialData.used_sessions || '',
          free_sessions: initialData.free_sessions || '',
          memo: initialData.memo || '',
          status: initialData.status || 'active',
        });
      } else {
        // 생성 모드 - 기본값으로 초기화
        setFormData(defaultFormData);
      }
      setErrors({});
    }
  }, [initialData, isOpen]);

  // 센터와 트레이너 데이터 가져오기
  useEffect(() => {
    if (isOpen) {
      fetchCentersAndTrainers();
    }
  }, [isOpen]);

  // API 호출 함수
  const fetchCentersAndTrainers = async () => {
    try {
      const [centersData, trainersData] = await Promise.all([
        centerAPI.getAllCenters(),
        userAPI.getAllUsers({ role: 'trainer' }),
      ]);

      if (centersData.success) setCenters(centersData.data.centers);
      if (trainersData.success) setTrainers(trainersData.data.users);
    } catch (error) {
      console.error('데이터 로드 실패:', error);
    }
  };

  // 입력값 변경 핸들러
  const handleInputChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    // 에러 메시지 초기화
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  // 폼 검증
  const validateForm = () => {
    const newErrors = {};

    // 필수 필드 검증
    if (!formData.name.trim()) {
      newErrors.name = '이름은 필수입니다';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = '연락처는 필수입니다';
    } else {
      // 전화번호 형식 검증
      const phoneRegex = /^[0-9-+\s()]+$/;
      if (!phoneRegex.test(formData.phone)) {
        newErrors.phone = '올바른 전화번호 형식을 입력해주세요';
      }
    }

    if (!formData.center_id) {
      newErrors.center_id = '센터를 선택해주세요';
    }

    if (!formData.trainer_id) {
      newErrors.trainer_id = '트레이너를 선택해주세요';
    }

    // 가입일 검증 (수정 시에는 선택사항이지만, 있으면 유효성 검사)
    if (formData.join_date && formData.join_date.trim() !== '') {
      const joinDate = new Date(formData.join_date);
      if (isNaN(joinDate.getTime())) {
        newErrors.join_date = '올바른 날짜 형식을 입력해주세요';
      }
    }

    // 날짜 검증 (만료일이 있을 때만)
    if (formData.join_date && formData.expire_date && formData.expire_date.trim() !== '') {
      const joinDate = new Date(formData.join_date);
      const expireDate = new Date(formData.expire_date);

      if (expireDate <= joinDate) {
        newErrors.expire_date = '만료일은 가입일보다 늦어야 합니다';
      }
    }

    // 세션 수 검증
    if (formData.total_sessions && formData.used_sessions) {
      const total = parseInt(formData.total_sessions);
      const used = parseInt(formData.used_sessions);

      if (used > total) {
        newErrors.used_sessions = '사용 세션은 총 세션 수보다 클 수 없습니다';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 폼 데이터 리셋
  const resetForm = () => {
    setFormData(defaultFormData);
    setErrors({});
  };

  // 센터별 트레이너 필터링
  const getFilteredTrainers = () => {
    if (!formData.center_id) {
      return trainers;
    }
    return trainers.filter(trainer => trainer.center_id === parseInt(formData.center_id));
  };

  return {
    // 상태
    formData,
    centers,
    trainers,
    loading,
    errors,

    // 함수들
    handleInputChange,
    validateForm,
    resetForm,
    getFilteredTrainers,
    setLoading,
    setFormData,
    setErrors,
  };
};
