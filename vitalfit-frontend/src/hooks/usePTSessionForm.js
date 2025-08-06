import { useState, useEffect } from 'react';
import { ptSessionAPI } from '../utils/api';

/**
 * PT 세션 폼 관련 상태와 로직을 관리하는 커스텀 훅
 * PTSessionCreateModal과 PTSessionEditModal에서 공통으로 사용
 */
export const usePTSessionForm = (initialData = null, isOpen = false, mode = 'create') => {
  // 폼 데이터 초기값
  const defaultFormData = {
    session_date: '',
    session_type: 'regular',
    start_time: '',
    end_time: '',
    notes: '',
  };

  // 상태
  const [formData, setFormData] = useState(defaultFormData);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // 폼 데이터 초기화
  useEffect(() => {
    if (isOpen) {
      if (initialData && mode === 'edit') {
        // 편집 모드 - 기존 데이터로 초기화
        setFormData({
          session_date: initialData.session_date || '',
          session_type: initialData.session_type || 'regular',
          start_time: initialData.start_time || '',
          end_time: initialData.end_time || '',
          notes: initialData.notes || '',
        });
      } else {
        // 생성 모드 - 기본값으로 초기화
        setFormData(defaultFormData);
      }
      setErrors({});
    }
  }, [initialData, isOpen, mode]);

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
    if (!formData.session_date) {
      newErrors.session_date = 'PT 일자는 필수입니다.';
    }

    if (!formData.start_time) {
      newErrors.start_time = '시작 시간은 필수입니다.';
    }

    if (!formData.end_time) {
      newErrors.end_time = '종료 시간은 필수입니다.';
    }

    // 시간 유효성 검증
    if (formData.start_time && formData.end_time) {
      if (formData.start_time >= formData.end_time) {
        newErrors.end_time = '종료 시간은 시작 시간보다 늦어야 합니다.';
      }
    }

    // 과거 날짜 검증 (생성 모드인 경우)
    if (mode === 'create' && formData.session_date) {
      const sessionDate = new Date(formData.session_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (sessionDate < today) {
        newErrors.session_date = '과거 날짜는 선택할 수 없습니다.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // PT 세션 생성
  const createPTSession = async (memberId, member) => {
    if (!validateForm()) {
      return { success: false, errors };
    }

    setLoading(true);

    try {
      // member 정보에서 필요한 데이터 추출
      const submitData = {
        member_id: parseInt(memberId),
        trainer_id: member?.trainer_id || 1,
        center_id: member?.center_id || 1,
        session_date: formData.session_date,
        start_time: formData.start_time ? formData.start_time.substring(0, 5) : '',
        end_time: formData.end_time ? formData.end_time.substring(0, 5) : '',
        session_type: formData.session_type,
        signature_data: 'temp_signature',
        notes: formData.notes.trim() || undefined,
      };

      // 필수 필드 검증
      if (!submitData.member_id || !submitData.trainer_id || !submitData.center_id) {
        throw new Error('필수 정보가 누락되었습니다.');
      }

      const response = await ptSessionAPI.createSession(submitData);

      if (response.success) {
        resetForm();
        return { success: true, data: response.data };
      } else {
        throw new Error(response.message || 'PT 세션 등록에 실패했습니다.');
      }
    } catch (error) {
      console.error('PT 세션 생성 실패:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // PT 세션 수정
  const updatePTSession = async sessionId => {
    if (!validateForm()) {
      return { success: false, errors };
    }

    setLoading(true);

    try {
      // 백엔드 스키마에 맞게 데이터 형식 조정
      const submitData = {
        session_date: formData.session_date,
        start_time: formData.start_time ? formData.start_time.substring(0, 5) : '',
        end_time: formData.end_time ? formData.end_time.substring(0, 5) : '',
        session_type: formData.session_type,
        notes: formData.notes.trim() || undefined,
      };

      const response = await ptSessionAPI.updateSession(sessionId, submitData);

      if (response.success) {
        return { success: true, data: response.data };
      } else {
        throw new Error(response.message || 'PT 세션 수정에 실패했습니다.');
      }
    } catch (error) {
      console.error('PT 세션 수정 실패:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // PT 세션 삭제
  const deletePTSession = async sessionId => {
    const confirmDelete = window.confirm(
      '정말로 이 PT 기록을 삭제하시겠습니까?\n삭제된 데이터는 복구할 수 없습니다.'
    );

    if (!confirmDelete) return { success: false, cancelled: true };

    setLoading(true);

    try {
      const response = await ptSessionAPI.deleteSession(sessionId);

      if (response.success) {
        return { success: true };
      } else {
        throw new Error(response.message || 'PT 세션 삭제에 실패했습니다.');
      }
    } catch (error) {
      console.error('PT 세션 삭제 실패:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // 폼 데이터 리셋
  const resetForm = () => {
    setFormData(defaultFormData);
    setErrors({});
  };

  return {
    // 상태
    formData,
    loading,
    errors,

    // 함수들
    handleInputChange,
    validateForm,
    createPTSession,
    updatePTSession,
    deletePTSession,
    resetForm,
    setLoading,
    setFormData,
    setErrors,
  };
};
