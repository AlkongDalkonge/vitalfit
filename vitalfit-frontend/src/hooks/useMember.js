import { useState, useEffect, useCallback, useMemo } from 'react';
import { memberAPI, centerAPI, userAPI } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';

/**
 * 멤버 관리 관련 상태와 로직을 관리하는 커스텀 훅
 */
export const useMember = () => {
  // 상태
  const [members, setMembers] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [centers, setCenters] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 인증 컨텍스트 사용
  const { user: currentUser } = useAuth();

  // 필터 상태
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCenter, setSelectedCenter] = useState('Select option');
  const [selectedTrainer, setSelectedTrainer] = useState('Select option');
  const [selectedStatus, setSelectedStatus] = useState('Select option');

  // 드롭다운 상태
  const [showCenterDropdown, setShowCenterDropdown] = useState(false);
  const [showTrainerDropdown, setShowTrainerDropdown] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);

  // 모달 상태
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // API 호출 함수들
  const fetchMembers = async (filters = {}) => {
    try {
      setLoading(true);
      const response = await memberAPI.getAllMembers({ limit: 1000, ...filters });
      if (response.success) {
        const memberList = response.data.members;
        setMembers(memberList);
        setFilteredMembers(memberList);
      }
    } catch (error) {
      console.error('멤버 조회 실패:', error);
      setError('멤버 데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const fetchCenters = async () => {
    try {
      const response = await centerAPI.getAllCenters();
      if (response.success) {
        setCenters(response.data.centers);
      }
    } catch (error) {
      console.error('센터 조회 실패:', error);
    }
  };

  const fetchTrainers = async () => {
    try {
      // 현재 사용자 권한에 따라 트레이너 목록 필터링
      let filters = {};

      if (currentUser?.position?.level >= 1 && currentUser?.position?.level <= 6) {
        // 본인만
        filters.trainerId = currentUser.id;
      } else if (currentUser?.position?.level >= 7 && currentUser?.position?.level <= 10) {
        // 팀 트레이너들 (필터링은 백엔드에서 처리)
        filters.role = 'trainer';
      } else if (currentUser?.position?.level === 11) {
        // 센터 트레이너들 (필터링은 백엔드에서 처리)
        filters.role = 'trainer';
      } else {
        // 모든 트레이너
        filters.role = 'trainer';
      }

      const response = await userAPI.getAllUsers(filters);
      if (response.success) {
        setTrainers(response.data.users);
      }
    } catch (error) {
      console.error('트레이너 조회 실패:', error);
    }
  };

  // 초기 데이터 로드
  const loadInitialData = async () => {
    await Promise.all([fetchMembers(), fetchCenters(), fetchTrainers()]);
  };

  // 필터링 함수 (즉시 적용)
  const handleFilter = (newCenter = null, newTrainer = null, newStatus = null) => {
    const filters = {};

    if (searchTerm) {
      filters.search = searchTerm;
    }

    // 새로운 값이 있으면 사용, 없으면 현재 상태 사용
    const centerToUse = newCenter || selectedCenter;
    const trainerToUse = newTrainer || selectedTrainer;
    const statusToUse = newStatus || selectedStatus;

    if (centerToUse && centerToUse !== 'Select option') {
      const center = centers.find(c => c.name === centerToUse);
      if (center) {
        filters.centerId = center.id;
      }
    }

    if (trainerToUse && trainerToUse !== 'Select option') {
      const trainer = trainers.find(t => t.name === trainerToUse);
      if (trainer) {
        filters.trainerId = trainer.id;
      }
    }

    if (statusToUse && statusToUse !== 'Select option') {
      filters.status = statusToUse;
    }

    fetchMembers(filters);
  };

  // 센터 필터 변경
  const handleCenterChange = useCallback(centerName => {
    setSelectedCenter(centerName);
    setShowCenterDropdown(false);
    handleFilter(centerName, null, null);
  }, []);

  // 트레이너 필터 변경
  const handleTrainerChange = useCallback(trainerName => {
    setSelectedTrainer(trainerName);
    setShowTrainerDropdown(false);
    handleFilter(null, trainerName, null);
  }, []);

  // 상태 필터 변경
  const handleStatusChange = useCallback(status => {
    setSelectedStatus(status);
    setShowStatusDropdown(false);
    handleFilter(null, null, status);
  }, []);

  // 검색어 변경
  const handleSearchChange = useCallback(value => {
    setSearchTerm(value);
    handleFilter();
  }, []);

  // 드롭다운 토글 함수들
  const toggleCenterDropdown = useCallback(() => {
    setShowCenterDropdown(!showCenterDropdown);
    setShowTrainerDropdown(false);
    setShowStatusDropdown(false);
  }, [showCenterDropdown]);

  const toggleTrainerDropdown = useCallback(() => {
    setShowTrainerDropdown(!showTrainerDropdown);
    setShowCenterDropdown(false);
    setShowStatusDropdown(false);
  }, [showTrainerDropdown]);

  const toggleStatusDropdown = useCallback(() => {
    setShowStatusDropdown(!showStatusDropdown);
    setShowCenterDropdown(false);
    setShowTrainerDropdown(false);
  }, [showStatusDropdown]);

  // 필터 초기화
  const resetFilters = useCallback(() => {
    setSearchTerm('');
    setSelectedCenter('Select option');
    setSelectedTrainer('Select option');
    setSelectedStatus('Select option');
    fetchMembers();
  }, []);

  // 모달 관련 핸들러들
  const handleEditMember = useCallback(member => {
    setEditingMember(member);
    setIsEditModalOpen(true);
  }, []);

  const handleCloseEditModal = useCallback(() => {
    setIsEditModalOpen(false);
    setEditingMember(null);
  }, []);

  const handleUpdateMember = useCallback(
    updatedMember => {
      // 로컬 상태 업데이트
      setMembers(prevMembers =>
        prevMembers.map(member => (member.id === updatedMember.id ? updatedMember : member))
      );
      setFilteredMembers(prevMembers =>
        prevMembers.map(member => (member.id === updatedMember.id ? updatedMember : member))
      );

      // 모달 닫기
      handleCloseEditModal();
    },
    [handleCloseEditModal]
  );

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

  // 초기 데이터 로드
  useEffect(() => {
    loadInitialData();
  }, []);

  // 현재 사용자가 변경될 때 트레이너 목록 다시 로드
  useEffect(() => {
    if (currentUser) {
      fetchTrainers();
    }
  }, [currentUser]);

  return {
    // 상태
    members,
    filteredMembers,
    centers,
    trainers,
    loading,
    setLoading,
    error,

    // 필터 상태
    searchTerm,
    selectedCenter,
    selectedTrainer,
    selectedStatus,
    showCenterDropdown,
    showTrainerDropdown,
    showStatusDropdown,

    // 핸들러 함수들
    handleCenterChange,
    handleTrainerChange,
    handleStatusChange,
    handleSearchChange,
    toggleCenterDropdown,
    toggleTrainerDropdown,
    toggleStatusDropdown,
    resetFilters,

    // API 함수들
    fetchMembers,
    fetchCenters,
    fetchTrainers,

    // 추가 함수들 (MemberPage에서 사용)
    setMembers,
    setFilteredMembers,
    updateFilteredMembers: setFilteredMembers,

    // 모달 관련 상태와 함수들
    isEditModalOpen,
    editingMember,
    isCreateModalOpen,
    handleEditMember,
    handleCloseEditModal,
    handleUpdateMember,
    handleCreateMember,
    handleCloseCreateModal,
    setIsCreateModalOpen,
  };
};
