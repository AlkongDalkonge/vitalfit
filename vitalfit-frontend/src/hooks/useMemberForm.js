import { useState, useEffect, useCallback, useMemo } from 'react';
import { centerAPI, userAPI } from '../utils/api';

/**
 * 멤버 폼 관련 상태와 로직을 관리하는 커스텀 훅
 * MemberEditModal과 MemberCreateModal에서 공통으로 사용
 */
export const useMemberForm = (initialData = null, isOpen = false) => {
  // 폼 데이터 초기값 - useMemo로 메모이제이션
  const defaultFormData = useMemo(
    () => ({
      name: '',
      phone: '',
      center_id: '',
      trainer_id: '',
      join_date: new Date().toISOString().split('T')[0], // 오늘 날짜를 기본값으로 설정
      expire_date: '',
      memo: '',
      status: 'active',
    }),
    []
  );

  // 상태
  const [formData, setFormData] = useState(defaultFormData);
  const [centers, setCenters] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // API 호출 함수 - useCallback으로 메모이제이션
  const fetchCentersAndTrainers = useCallback(async () => {
    try {
      const [centersData, trainersData] = await Promise.all([
        centerAPI.getAllCenters(),
        userAPI.getAllUsers(), // role 파라미터 제거
      ]);

      console.log('센터 데이터:', centersData);
      console.log('트레이너 데이터:', trainersData);
      console.log('전체 사용자 수:', trainersData.data?.users?.length || 0);

      if (centersData.success) setCenters(centersData.data.centers);
      if (trainersData.success) {
        // 모든 사용자 데이터 확인
        console.log('첫 번째 사용자 예시:', trainersData.data.users[0]);
        console.log(
          '포지션 정보가 있는 사용자들:',
          trainersData.data.users.filter(u => u.position)
        );

        // 포지션 ID 3, 4, 5, 7에 해당하는 트레이너만 필터링 (담당 멤버 가능)
        const filteredTrainers = trainersData.data.users.filter(trainer => {
          console.log(
            `사용자 ${trainer.name}: position_id=`,
            trainer.position_id,
            'position=',
            trainer.position
          );
          return trainer.position_id && [3, 4, 5, 7].includes(trainer.position_id);
        });
        console.log('필터링된 트레이너:', filteredTrainers);
        setTrainers(filteredTrainers);
      }
    } catch (error) {
      console.error('데이터 로드 실패:', error);
    }
  }, []);

  // 폼 데이터 초기화 (편집 모드일 때는 initialData 사용) - useCallback으로 메모이제이션
  const initializeFormData = useCallback(() => {
    if (initialData) {
      // 편집 모드 - 기존 데이터로 초기화
      setFormData({
        name: initialData.name || '',
        phone: initialData.phone || '',
        center_id: initialData.center_id || '',
        trainer_id: initialData.trainer_id || initialData.trainer?.id || '',
        join_date: initialData.join_date
          ? new Date(initialData.join_date).toISOString().split('T')[0]
          : '',
        expire_date: initialData.expire_date
          ? new Date(initialData.expire_date).toISOString().split('T')[0]
          : '',
        memo: initialData.memo || '',
        status: initialData.status || 'active',
      });
    } else {
      // 생성 모드 - 기본값으로 초기화
      setFormData(defaultFormData);
    }
    setErrors({});
  }, [initialData, defaultFormData]);

  // 폼 데이터 초기화 useEffect
  useEffect(() => {
    if (isOpen) {
      initializeFormData();
    }
  }, [isOpen, initializeFormData]);

  // 센터와 트레이너 데이터 가져오기 useEffect
  useEffect(() => {
    if (isOpen) {
      fetchCentersAndTrainers();
    }
  }, [isOpen, fetchCentersAndTrainers]);

  // 입력값 변경 핸들러 - useCallback으로 메모이제이션
  const handleInputChange = useCallback(
    e => {
      const { name, value } = e.target;
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));

      // 센터가 변경되면 트레이너 초기화
      if (name === 'center_id') {
        setFormData(prev => ({
          ...prev,
          [name]: value,
          trainer_id: '', // 트레이너 초기화
        }));
      }

      // 에러 메시지 초기화
      if (errors[name]) {
        setErrors(prev => ({
          ...prev,
          [name]: '',
        }));
      }
    },
    [errors]
  );

  // 폼 검증 - useCallback으로 메모이제이션
  const validateForm = useCallback(() => {
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
    } else {
      // 센터가 선택된 경우, 해당 센터의 트레이너인지 확인
      if (formData.center_id) {
        const selectedTrainer = trainers.find(t => t.id === parseInt(formData.trainer_id));
        if (selectedTrainer && selectedTrainer.center_id !== parseInt(formData.center_id)) {
          newErrors.trainer_id = '선택한 센터의 트레이너를 선택해주세요';
        }
      }
    }

    if (!formData.status) {
      newErrors.status = '상태를 선택해주세요';
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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  // 폼 데이터 리셋 - useCallback으로 메모이제이션
  const resetForm = useCallback(() => {
    setFormData(defaultFormData);
    setErrors({});
  }, [defaultFormData]);

  // 센터별 트레이너 필터링 - useMemo로 메모이제이션
  const getFilteredTrainers = useMemo(() => {
    console.log('getFilteredTrainers 호출됨, trainers:', trainers);
    console.log('formData.center_id:', formData.center_id);

    // 센터가 선택되지 않았으면 빈 배열 반환 (트레이너 선택 불가)
    if (!formData.center_id) {
      console.log('센터가 선택되지 않음 - 빈 배열 반환');
      return [];
    }

    // 선택된 센터에 속한 트레이너들만 필터링
    const filteredTrainers = trainers.filter(
      trainer => trainer.center_id === parseInt(formData.center_id)
    );

    console.log('필터링된 트레이너:', filteredTrainers);
    return filteredTrainers;
  }, [trainers, formData.center_id]);

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
