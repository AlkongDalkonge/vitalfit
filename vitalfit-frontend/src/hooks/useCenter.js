import { useState, useEffect } from 'react';
import { centerAPI } from '../utils/api';

/**
 * 센터 관리 관련 상태와 로직을 관리하는 커스텀 훅
 */
export const useCenter = () => {
  // 상태
  const [centers, setCenters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedCenter, setExpandedCenter] = useState(null);

  // 센터 데이터 가져오기
  const fetchCenters = async () => {
    try {
      setLoading(true);
      const response = await centerAPI.getAllCenters();
      setCenters(response.data.centers || []);
      setError(null);
    } catch (err) {
      console.error('센터 데이터 가져오기 실패:', err);
      setError('센터 데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 센터 펼침/접기 토글
  const toggleCenter = centerId => {
    setExpandedCenter(expandedCenter === centerId ? null : centerId);
  };

  // 센터 생성
  const createCenter = async centerData => {
    try {
      const response = await centerAPI.createCenter(centerData);
      if (response.success) {
        await fetchCenters(); // 목록 새로고침
        return response.data;
      }
      throw new Error(response.message || '센터 생성에 실패했습니다.');
    } catch (error) {
      console.error('센터 생성 실패:', error);
      throw error;
    }
  };

  // 센터 수정
  const updateCenter = async (centerId, centerData) => {
    try {
      const response = await centerAPI.updateCenter(centerId, centerData);
      if (response.success) {
        await fetchCenters(); // 목록 새로고침
        return response.data;
      }
      throw new Error(response.message || '센터 수정에 실패했습니다.');
    } catch (error) {
      console.error('센터 수정 실패:', error);
      throw error;
    }
  };

  // 센터 삭제
  const deleteCenter = async centerId => {
    try {
      const response = await centerAPI.deleteCenter(centerId);
      if (response.success) {
        await fetchCenters(); // 목록 새로고침
        return true;
      }
      throw new Error(response.message || '센터 삭제에 실패했습니다.');
    } catch (error) {
      console.error('센터 삭제 실패:', error);
      throw error;
    }
  };

  // 페이지 새로고침
  const refreshData = () => {
    fetchCenters();
  };

  // 초기 데이터 로드
  useEffect(() => {
    fetchCenters();
  }, []);

  return {
    // 상태
    centers,
    loading,
    error,
    expandedCenter,

    // 함수들
    fetchCenters,
    toggleCenter,
    createCenter,
    updateCenter,
    deleteCenter,
    refreshData,
    setExpandedCenter,
  };
};
