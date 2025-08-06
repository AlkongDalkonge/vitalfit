import { useState, useEffect } from 'react';
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

  // 데이터 가져오기
  const fetchMemberPTSessions = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log(`🔍 API 호출: ${memberId}/month/${currentYear}/${currentMonth}`);
      console.log(`📅 UI 표시: ${currentYear}년 ${currentMonth}월`);

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
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 세션 추가
  const handleCreateSession = newSession => {
    setPtSessions(prev => [newSession, ...prev]);
    setIsCreateModalOpen(false);
  };

  // 세션 수정
  const handleUpdateSession = updatedSession => {
    setPtSessions(prev =>
      prev.map(session => (session.id === updatedSession.id ? updatedSession : session))
    );
    setIsEditModalOpen(false);
    setEditingSession(null);
  };

  // 세션 삭제
  const handleDeleteSession = async sessionId => {
    try {
      const response = await ptSessionAPI.deleteSession(sessionId);
      if (response.success) {
        setPtSessions(prev => prev.filter(session => session.id !== sessionId));
      }
    } catch (error) {
      console.error('세션 삭제 실패:', error);
    }
  };

  // 편집 모달 열기
  const handleEditSession = session => {
    setEditingSession(session);
    setIsEditModalOpen(true);
  };

  // 편집 모달 닫기
  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditingSession(null);
  };

  // 년도/월 변경
  const handleYearMonthChange = (year, month) => {
    setCurrentYear(year);
    setCurrentMonth(month);
  };

  // 년도 옵션 생성
  const getYearOptions = () => {
    const currentDateYear = new Date().getFullYear();
    const years = [];
    for (let i = currentDateYear - 2; i <= currentDateYear + 2; i++) {
      years.push(i);
    }
    return years;
  };

  // 월 옵션 생성
  const getMonthOptions = () => {
    return Array.from({ length: 12 }, (_, i) => i + 1);
  };

  // 데이터 로드 useEffect
  useEffect(() => {
    if (memberId) {
      fetchMemberPTSessions();
    }
  }, [memberId, currentYear, currentMonth]);

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
