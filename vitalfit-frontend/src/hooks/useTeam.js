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

      if (centerId === 0) {
        // 팀 이름에서 센터 이름 추출하여 매핑
        if (t.name.includes('강남')) {
          centerId = findCenterIdByName('강남') || 1;
        } else if (t.name.includes('신림')) {
          centerId = findCenterIdByName('신림') || 2;
        } else if (t.name.includes('홍대')) {
          centerId = findCenterIdByName('홍대') || 3;
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
    console.log('🔍 useTeam 필터링:', { centerId, allTeams });
    if (!centerId) return [];
    const cid = Number(centerId);
    const filtered = allTeams.filter(t => t.center_id === cid);
    console.log('✅ 필터링 결과:', filtered);
    return filtered;
  }, [allTeams, centerId]);

  return {
    teams,
    loading,
    error,
    refetch: fetchTeams,
  };
};
