import { useState, useEffect, useCallback, useMemo } from 'react';
import { memberAPI, centerAPI, userAPI } from '../utils/api';

/**
 * 멤버 관련 상태와 로직을 관리하는 커스텀 훅
 */
export const useMember = () => {
  // 멤버 관련 상태
  const [members, setMembers] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  // 검색 상태
  const [searchTerm, setSearchTerm] = useState('');

  // 모달 상태
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // 드롭다운 상태
  const [statusDropdowns, setStatusDropdowns] = useState({});

  // API 호출 함수들 - useCallback으로 메모이제이션
  const fetchMembers = useCallback(async (filters = {}) => {
    try {
      const response = await memberAPI.getAllMembers({ limit: 1000, ...filters });
      if (response.success) {
        setMembers(response.data.members);
        setFilteredMembers(response.data.members);
      }
    } catch (error) {
      console.error('멤버 조회 실패:', error);
    }
  }, []);

  // 멤버 관련 핸들러들 - useCallback으로 메모이제이션
  const handleEditMember = useCallback(member => {
    setEditingMember(member);
    setIsEditModalOpen(true);
  }, []);

  const handleCloseEditModal = useCallback(() => {
    setIsEditModalOpen(false);
    setEditingMember(null);
  }, []);

  const handleUpdateMember = useCallback(updatedMember => {
    // 로컬 상태 업데이트 - 함수형 업데이트로 최적화
    setMembers(prevMembers =>
      prevMembers.map(member => (member.id === updatedMember.id ? updatedMember : member))
    );
    setFilteredMembers(prevMembers =>
      prevMembers.map(member => (member.id === updatedMember.id ? updatedMember : member))
    );

    // 모달 닫기
    handleCloseEditModal();
  }, [handleCloseEditModal]);

  const handleCreateMember = useCallback(newMember => {
    // 로컬 상태에 새 멤버 추가
    setMembers(prevMembers => [newMember, ...prevMembers]);
    setFilteredMembers(prevMembers => [newMember, ...prevMembers]);

    // 모달 닫기
    setIsCreateModalOpen(false);
  }, []);

  const handleCloseCreateModal = useCallback(() => {
    setIsCreateModalOpen(false);
  }, []);

  // 상태 변경 처리 - useCallback으로 메모이제이션
  const handleStatusChange = useCallback(async (memberId, newStatus) => {
    try {
      const response = await memberAPI.updateMember(memberId, { status: newStatus });

      if (response.success) {
        // 로컬 상태 업데이트 - 함수형 업데이트로 최적화
        setMembers(prevMembers =>
          prevMembers.map(member =>
            member.id === memberId ? { ...member, status: newStatus } : member
          )
        );
        setFilteredMembers(prevMembers =>
          prevMembers.map(member =>
            member.id === memberId ? { ...member, status: newStatus } : member
          )
        );
      } else {
        console.error('상태 변경 실패:', response.message);
      }
    } catch (error) {
      console.error('상태 변경 오류:', error);
    }

    // 드롭다운 닫기
    setStatusDropdowns(prev => ({ ...prev, [memberId]: false }));
  }, []);

  // 상태 드롭다운 토글 - useCallback으로 메모이제이션
  const toggleStatusDropdown = useCallback(memberId => {
    setStatusDropdowns(prev => ({
      ...prev,
      [memberId]: !prev[memberId],
    }));
  }, []);

  // 검색 핸들러 - useCallback으로 메모이제이션
  const handleSearchChange = useCallback(term => {
    setSearchTerm(term);
  }, []);

  // 검색 결과를 useMemo로 메모이제이션
  const searchFilteredMembers = useMemo(() => {
    if (!searchTerm.trim()) return members;
    return members.filter(member =>
      member.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [members, searchTerm]);

  // searchFilteredMembers가 변경될 때만 filteredMembers 업데이트
  useEffect(() => {
    setFilteredMembers(searchFilteredMembers);
  }, [searchFilteredMembers]);

  // 필터링된 멤버 업데이트 함수 - useCallback으로 메모이제이션
  const updateFilteredMembers = useCallback(newFilteredMembers => {
    setFilteredMembers(newFilteredMembers);
  }, []);

  // 드롭다운 외부 클릭 처리 - useCallback으로 메모이제이션
  const handleClickOutside = useCallback(event => {
    // 드롭다운 내부 클릭이 아닌 경우에만 닫기
    if (
      !event.target.closest('[data-dropdown="status"]') &&
      !event.target.closest('.status-dropdown-option')
    ) {
      setStatusDropdowns({});
    }
  }, []);

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [handleClickOutside]);

  return {
    // 상태
    members,
    filteredMembers,
    loading,
    setLoading,
    searchTerm,
    isEditModalOpen,
    editingMember,
    isCreateModalOpen,
    statusDropdowns,

    // 함수들
    fetchMembers,
    handleEditMember,
    handleCloseEditModal,
    handleUpdateMember,
    handleCreateMember,
    handleCloseCreateModal,
    handleStatusChange,
    toggleStatusDropdown,
    handleSearchChange,
    updateFilteredMembers,
    setIsCreateModalOpen,

    // 직접 상태 업데이트를 위한 setter들
    setMembers,
    setFilteredMembers,
  };
};
