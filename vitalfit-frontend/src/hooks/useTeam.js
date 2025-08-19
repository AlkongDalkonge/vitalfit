import { useState, useEffect, useMemo, useCallback } from 'react';
import { teamAPI } from '../utils/api';
import { centerAPI } from '../utils/api';

/**
 * 팀 관리 관련 상태와 로직을 관리하는 커스텀 훅
 * @param {number|null} centerId - 필터링할 센터 ID (null이면 전체)
 */
export const useTeam = (centerId = null) => {
  // 상태
  const [allTeams, setAllTeams] = useState([]);
  const [centers, setCenters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 팀 데이터 가져오기
  const fetchTeams = async () => {
    try {
      setLoading(true);
      const response = await teamAPI.getAllTeams();
      const rawTeams = response.data.teams || [];
      const normalizedTeams = rawTeams.map(normalize);
      setAllTeams(normalizedTeams);
      setError(null);
    } catch (err) {
      console.error('팀 데이터 가져오기 실패:', err);
      setError('팀 데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 센터 데이터 가져오기
  const fetchCenters = async () => {
    try {
      const response = await centerAPI.getAllCenters();
      setCenters(response.data.centers || []);
    } catch (err) {
      console.error('센터 데이터 가져오기 실패:', err);
    }
  };

  // 센터 이름으로 센터 ID 찾기
  const findCenterIdByName = useCallback(
    centerName => {
      const center = centers.find(c => c.name.includes(centerName));
      return center ? center.id : null;
    },
    [centers]
  );

  // 응답 정규화
  const normalize = useCallback(
    t => {
      // center_id가 0이거나 없는 경우 팀 이름으로 추정
      let centerId = Number(t.center_id ?? t.centerId ?? t.center?.id ?? 0);

      // 팀 이름에서 센터 이름 추출하여 매핑
      if (centerId === 0 || !centerId) {
        if (t.name.includes('강남')) {
          centerId = findCenterIdByName('강남') || 1;
        } else if (t.name.includes('신림')) {
          centerId = findCenterIdByName('신림') || 3;
        } else if (t.name.includes('홍대')) {
          centerId = findCenterIdByName('홍대') || 2;
        }
      }

      return {
        ...t,
        id: t.id,
        name: t.name ?? t.team_name ?? '',
        center_id: centerId,
      };
    },
    [findCenterIdByName]
  );

  // 전체 팀 1회 로드
  useEffect(() => {
    fetchTeams();
    fetchCenters();
  }, []);

  // centerId 기준 필터링 (centerId 미선택이면 빈 배열 반환)
  const teams = useMemo(() => {
    if (!centerId) return [];
    const cid = Number(centerId);
    const filtered = allTeams.filter(t => t.center_id === cid);
    return filtered;
  }, [allTeams, centerId]);

  return {
    teams,
    loading,
    error,
    refetch: fetchTeams,
  };
};

/**
 * 팀별 매출 통계를 관리하는 커스텀 훅
 * @param {number|null} teamId - 팀 ID
 * @param {number} year - 년도
 * @param {number} month - 월
 */
export const useTeamRevenueStats = (teamId, year, month) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log('useTeamRevenueStats 훅 실행:', { teamId, year, month });

    if (!teamId || !year || !month) {
      console.log('useTeamRevenueStats - 조건 불충족, 초기화');
      setStats(null);
      setError(null);
      return;
    }

    const fetchTeamRevenueStats = async () => {
      console.log('팀별 매출 통계 API 호출 시작:', { teamId, year, month });
      setLoading(true);
      setError(null);

      try {
        const response = await teamAPI.getTeamRevenueStats(teamId, year, month);
        console.log('팀별 매출 통계 API 응답:', response);

        if (response.success) {
          setStats(response.data);
          console.log('팀별 매출 통계 데이터 설정 완료');
        } else {
          setError(response.message || '팀 매출 통계를 가져오는데 실패했습니다.');
          console.log('팀별 매출 통계 API 실패:', response.message);
        }
      } catch (err) {
        console.error('팀별 매출 통계 API 호출 오류:', err);
        setError(err.response?.data?.message || '서버 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchTeamRevenueStats();
  }, [teamId, year, month]);

  const refresh = () => {
    if (teamId && year && month) {
      setStats(null);
      setError(null);
      // useEffect가 다시 실행되도록 강제로 상태를 변경
      setLoading(true);
    }
  };

  return {
    stats,
    loading,
    error,
    refresh,
  };
};
