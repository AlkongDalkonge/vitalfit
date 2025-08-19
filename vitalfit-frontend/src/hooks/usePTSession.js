import { useState, useEffect, useCallback, useMemo } from 'react';
import { ptSessionAPI } from '../utils/api';

/**
 * PT 세션 관련 상태와 로직을 관리하는 커스텀 훅
 */
export const usePTSession = memberId => {
  // 상태
  const [member, setMember] = useState(null);
  const [ptSessions, setPtSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 모달 상태
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingSession, setEditingSession] = useState(null);

  // 날짜 관련 상태
  const currentDate = new Date();
  const [currentYear, setCurrentYear] = useState(currentDate.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(currentDate.getMonth() + 1);

  // 데이터 가져오기 - useCallback으로 메모이제이션
  const fetchMemberPTSessions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await ptSessionAPI.getSessionsByMember(memberId, {
        year: currentYear,
        month: currentMonth,
      });

      if (response.success) {
        setMember(response.data.member);
        setPtSessions(response.data.pt_sessions);
      } else {
        setError(response.message);
      }
    } catch (err) {
      console.error('❌ PT 세션 조회 오류:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [memberId, currentYear, currentMonth]);

  // 세션 추가 - useCallback으로 메모이제이션
  const handleCreateSession = useCallback(newSession => {
    // 데이터 새로고침
    fetchMemberPTSessions();
    setIsCreateModalOpen(false);
  }, [fetchMemberPTSessions]);

  // 세션 수정 - useCallback으로 메모이제이션
  const handleUpdateSession = useCallback(updatedSession => {
    // 데이터 새로고침
    fetchMemberPTSessions();
    setIsEditModalOpen(false);
    setEditingSession(null);
  }, [fetchMemberPTSessions]);

  // 세션 삭제 - useCallback으로 메모이제이션
  const handleDeleteSession = useCallback(async sessionId => {
    try {
      const response = await ptSessionAPI.deleteSession(sessionId);
      if (response.success) {
        setPtSessions(prev => prev.filter(session => session.id !== sessionId));
      }
    } catch (error) {
      console.error('세션 삭제 실패:', error);
    }
  }, []);

  // 편집 모달 열기 - useCallback으로 메모이제이션
  const handleEditSession = useCallback(session => {
    setEditingSession(session);
    setIsEditModalOpen(true);
  }, []);

  // 편집 모달 닫기 - useCallback으로 메모이제이션
  const handleCloseEditModal = useCallback(() => {
    setIsEditModalOpen(false);
    setEditingSession(null);
  }, []);

  // 년도/월 변경 - useCallback으로 메모이제이션
  const handleYearMonthChange = useCallback((year, month) => {
    setCurrentYear(year);
    setCurrentMonth(month);
  }, []);

  // 년도 옵션 생성 - useMemo로 메모이제이션
  const getYearOptions = useMemo(() => {
    const currentDateYear = new Date().getFullYear();
    const years = [];
    for (let i = currentDateYear - 2; i <= currentDateYear + 2; i++) {
      years.push(i);
    }
    return years;
  }, []);

  // 월 옵션 생성 - useMemo로 메모이제이션
  const getMonthOptions = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => i + 1);
  }, []);

  // 데이터 로드 useEffect - 의존성 배열 수정
  useEffect(() => {
    if (memberId && memberId !== 'undefined') {
      fetchMemberPTSessions();
    }
  }, [memberId, currentYear, currentMonth, fetchMemberPTSessions]);

  return {
    // 상태
    member,
    ptSessions,
    loading,
    error,
    isCreateModalOpen,
    isEditModalOpen,
    editingSession,
    currentYear,
    currentMonth,

    // 함수들
    fetchMemberPTSessions,
    handleCreateSession,
    handleUpdateSession,
    handleDeleteSession,
    handleEditSession,
    handleCloseEditModal,
    handleYearMonthChange,
    getYearOptions,
    getMonthOptions,
    setIsCreateModalOpen,
    setCurrentYear,
    setCurrentMonth,
  };
};
