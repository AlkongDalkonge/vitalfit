import { useState, useEffect, useCallback, useMemo } from 'react';
import { userAPI, centerAPI, teamAPI } from '../utils/api';

/**
 * 사용자 관리 관련 상태와 로직을 관리하는 커스텀 훅
 */
export const useUser = () => {
  // 상태
  const [users, setUsers] = useState([]);
  const [centers, setCenters] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 필터 상태
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCenter, setSelectedCenter] = useState('Select option');
  const [selectedTeam, setSelectedTeam] = useState('Select option');

  // 드롭다운 상태
  const [showCenterDropdown, setShowCenterDropdown] = useState(false);
  const [showTeamDropdown, setShowTeamDropdown] = useState(false);

  // API 호출 함수들
  const fetchUsers = async (filters = {}) => {
    try {
      setLoading(true);
      const response = await userAPI.getAllUsers({ limit: 1000, ...filters });
      if (response.success) {
        setUsers(response.data.users);
      }
    } catch (error) {
      console.error('사용자 조회 실패:', error);
      setError('사용자 데이터를 불러오는데 실패했습니다.');
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

  const fetchTeams = async () => {
    try {
      const response = await teamAPI.getAllTeams();
      if (response.success) {
        setTeams(response.data.teams);
      }
    } catch (error) {
      console.error('팀 조회 실패:', error);
    }
  };

  // 초기 데이터 로드
  const loadInitialData = async () => {
    await Promise.all([fetchUsers(), fetchCenters(), fetchTeams()]);
  };

  // 필터링 함수 (즉시 적용)
  const handleFilter = (newCenter = null, newTeam = null) => {
    const filters = {};

    if (searchTerm) {
      filters.search = searchTerm;
    }

    // 새로운 값이 있으면 사용, 없으면 현재 상태 사용
    const centerToUse = newCenter || selectedCenter;
    const teamToUse = newTeam || selectedTeam;

    if (centerToUse && centerToUse !== 'Select option') {
      const center = centers.find(c => c.name === centerToUse);
      if (center) {
        filters.centerId = center.id;
      }
    }

    if (teamToUse && teamToUse !== 'Select option') {
      const team = teams.find(t => t.name === teamToUse);
      if (team) {
        filters.teamId = team.id;
      }
    }

    fetchUsers(filters);
  };

  // 센터 필터 변경
  const handleCenterChange = centerName => {
    setSelectedCenter(centerName);
    setShowCenterDropdown(false);
    handleFilter(centerName, selectedTeam);
  };

  // 팀 필터 변경
  const handleTeamChange = teamName => {
    setSelectedTeam(teamName);
    setShowTeamDropdown(false);
    handleFilter(selectedCenter, teamName);
  };

  // 검색어 변경
  const handleSearchChange = term => {
    setSearchTerm(term);
    // 디바운스 없이 즉시 필터링 (실제 프로젝트에서는 디바운스 권장)
    setTimeout(() => handleFilter(), 300);
  };

  // 초기 로드
  useEffect(() => {
    loadInitialData();
  }, []);

  return {
    // 상태
    users,
    centers,
    teams,
    loading,
    error,
    searchTerm,
    selectedCenter,
    selectedTeam,
    showCenterDropdown,
    showTeamDropdown,

    // 함수들
    fetchUsers,
    handleFilter,
    handleCenterChange,
    handleTeamChange,
    handleSearchChange,
    setShowCenterDropdown,
    setShowTeamDropdown,
    setSearchTerm,
  };
};

/**
 * PaymentPage용: 선택된 팀(teamId)에 따라 사용자 목록을 반환하는 훅
 * - teamId가 없으면 빈 배열([]) 반환
 * - PaymentPage에서 트레이너 필터링용으로 사용
 */
export const useUserByTeam = teamId => {
  const [allUsers, setAllUsers] = useState([]); // 전체 사용자 캐시
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 응답 정규화
  const normalize = useCallback(
    user => ({
      ...user,
      id: user.id,
      name: user.name ?? user.user_name ?? '',
      // 다양한 스키마 대응: team_id, teamId, team?.id
      teamId: Number(user.team_id ?? user.teamId ?? user.team?.id ?? 0),
    }),
    []
  );

  // 전체 사용자 1회 로드
  const loadAllUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await userAPI.getAllUsers({ limit: 1000 });
      const raw = res?.success ? res?.data?.users : null;
      const list = Array.isArray(raw) ? raw.map(normalize) : [];
      if (!Array.isArray(raw)) {
        throw new Error(res?.message || '사용자 목록 형식이 올바르지 않습니다.');
      }
      setAllUsers(list);
    } catch (e) {
      console.error('사용자 목록 불러오기 실패:', e);
      setAllUsers([]);
      setError(e?.message || '사용자 목록을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  }, [normalize]);

  useEffect(() => {
    loadAllUsers();
  }, [loadAllUsers]);

  // teamId 기준 필터링 (teamId 미선택이면 빈 배열 반환)
  const users = useMemo(() => {
    if (!teamId) return [];
    const tid = Number(teamId);
    return allUsers.filter(user => user.teamId === tid);
  }, [allUsers, teamId]);

  // 외부에서 강제 새로고침 가능
  const refresh = useCallback(() => loadAllUsers(), [loadAllUsers]);

  return { users, loading, error, refresh };
};
