import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ptSessionAPI } from '../utils/api';
import { toast } from 'react-toastify';
import api from '../utils/api';

const PTSessionModal = ({ isOpen, onClose, session = null, mode = 'modify', onSuccess }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    startDate: session?.session_date || new Date().toISOString().split('T')[0],
    endDate: session?.session_date || new Date().toISOString().split('T')[0],
    startTime: session?.start_time?.substring(0, 5) || '09:00',
    endTime: session?.end_time?.substring(0, 5) || '10:00',
    memberName: session?.member?.name || '',
    memberId: session?.member_id || null,
    sessionType: session?.session_type || 'regular',
    notes: session?.notes || '',
  });
  const [loading, setLoading] = useState(false);
  const [members, setMembers] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(false);

  const fetchMembers = useCallback(async () => {
    try {
      setLoadingMembers(true);
      // 백엔드에서 centerId 쿼리 파라미터를 기대함
      const response = await api.get(`/members?centerId=${user.center_id}`);
      console.log('회원 목록 응답:', response);

      // 응답 구조 확인 및 안전한 배열 설정
      let membersData = [];
      if (
        response.data &&
        response.data.success &&
        response.data.data &&
        Array.isArray(response.data.data.members)
      ) {
        membersData = response.data.data.members;
      } else if (response.data && response.data.success && Array.isArray(response.data.data)) {
        membersData = response.data.data;
      } else if (Array.isArray(response.data)) {
        membersData = response.data;
      } else if (response.data && Array.isArray(response.data.members)) {
        membersData = response.data.members;
      }

      console.log('설정할 회원 데이터:', membersData);
      setMembers(membersData);
    } catch (error) {
      console.error('회원 목록 조회 실패:', error);
      toast.error('회원 목록을 가져오는데 실패했습니다.');
      setMembers([]); // 에러 시 빈 배열로 설정
    } finally {
      setLoadingMembers(false);
    }
  }, [user?.center_id]);

  // 회원 목록 가져오기
  useEffect(() => {
    if (isOpen && user?.center_id) {
      fetchMembers();
    }
  }, [isOpen, user?.center_id, fetchMembers]);

  // 회원 선택 시 처리
  const handleMemberSelect = memberId => {
    if (!Array.isArray(members) || !memberId) return;

    const selectedMember = members.find(member => member.id === parseInt(memberId));
    if (selectedMember) {
      setFormData(prev => ({
        ...prev,
        memberId: selectedMember.id,
        memberName: selectedMember.name,
      }));
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);

    try {
      // 필수 필드 검증
      if (!formData.memberId) {
        toast.error('회원을 선택해주세요. (회원 ID가 필요합니다)');
        setLoading(false);
        return;
      }

      if (!user?.id) {
        toast.error('사용자 정보를 찾을 수 없습니다.');
        setLoading(false);
        return;
      }

      if (!user?.center_id) {
        toast.error('센터 정보를 찾을 수 없습니다.');
        setLoading(false);
        return;
      }

      const sessionData = {
        member_id: parseInt(formData.memberId),
        trainer_id: parseInt(user.id),
        center_id: parseInt(user.center_id),
        session_date: formData.startDate,
        start_time: formData.startTime,
        end_time: formData.endTime,
        session_type: formData.sessionType,
        notes: formData.notes,
      };

      console.log('PT 세션 생성 데이터:', sessionData);

      const response = await ptSessionAPI.createPTSession(sessionData);

      if (response.success) {
        console.log('PT 세션 생성 성공:', response.data);

        const sessionRequest = {
          id: response.data.id || `temp_${Date.now()}`,
          memberName: formData.memberName || '회원명 없음',
          startDate: formData.startDate, // 수정날짜
          endDate: formData.endDate, // 신청날짜
          startTime: formData.startTime,
          endTime: formData.endTime,
          sessionType: formData.sessionType,
          actionType: 'create',
          notes: formData.notes || '',
          status: 'pending',
          submittedAt: new Date().toISOString(),
          submittedBy: user?.name || 'Unknown',
          member_id: formData.memberId,
          trainer_id: user.id,
          center_id: user.center_id,
          session_id: response.data.id,
        };

        try {
          const existingRequests = JSON.parse(
            localStorage.getItem('sessionChangeRequests') || '[]'
          );

          existingRequests.push(sessionRequest);
          localStorage.setItem('sessionChangeRequests', JSON.stringify(existingRequests));

          window.dispatchEvent(new CustomEvent('sessionChangeRequestsUpdated'));

          console.log('SessionChangeStatus에 반영 완료:', sessionRequest);
        } catch (storageError) {
          console.error('로컬 스토리지 저장 실패:', storageError);
        }

        toast.success('PT 세션이 성공적으로 생성되었습니다.');

        if (onSuccess) {
          onSuccess();
        }

        onClose();
      } else {
        console.error('PT 세션 생성 실패:', response.message);
        toast.error(`PT 세션 생성에 실패했습니다: ${response.message}`);
      }
    } catch (error) {
      console.error('PT 세션 처리 중 예외 발생:', error);

      if (error.response) {
        console.error('API 응답 오류:', {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data,
        });

        if (error.response.data) {
          console.error('백엔드 오류 상세:', error.response.data);
          if (error.response.data.details) {
            console.error('검증 오류 상세:', error.response.data.details);
          }
        }

        toast.error(`PT 세션 생성 실패: ${error.response.data?.message || error.message}`);
      } else {
        toast.error('PT 세션 처리 중 오류가 발생했습니다.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-[600px] max-w-[90vw] max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-gray-800">PT 세션 신청</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 날짜 선택 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">날짜 선택</label>
            <div className="flex items-center justify-center space-x-4">
              <div className="flex-1">
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="flex items-center justify-center">
                <span className="text-2xl text-blue-600 font-bold">→</span>
              </div>

              <div className="flex-1">
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mt-3">
              <p className="text-sm text-blue-800 text-center">
                PT를 추가하실 경우는 같은 날짜를 선택해주세요
              </p>
            </div>
          </div>

          {/* 시간 선택 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">시간 선택</label>
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <label className="block text-xs text-gray-600 mb-2">시작 시간</label>
                <input
                  type="time"
                  value={formData.startTime}
                  onChange={e => setFormData({ ...formData, startTime: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="flex-1">
                <label className="block text-xs text-gray-600 mb-2">종료 시간</label>
                <input
                  type="time"
                  value={formData.endTime}
                  onChange={e => setFormData({ ...formData, endTime: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>
          </div>

          {/* 회원 선택 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">회원 선택</label>
            <select
              value={formData.memberId || ''}
              onChange={e => handleMemberSelect(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              disabled={loadingMembers}
            >
              <option value="">회원을 선택해주세요</option>
              {Array.isArray(members) && members.length > 0 ? (
                members.map(member => (
                  <option key={member.id} value={member.id}>
                    {member.name} ({member.phone || '전화번호 없음'})
                  </option>
                ))
              ) : (
                <option value="" disabled>
                  {loadingMembers ? '로딩 중...' : '회원이 없습니다'}
                </option>
              )}
            </select>
            {loadingMembers && (
              <p className="text-sm text-gray-500 mt-1">회원 목록을 불러오는 중...</p>
            )}
          </div>

          {/* PT 종류 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">PT 종류</label>
            <select
              value={formData.sessionType}
              onChange={e => setFormData({ ...formData, sessionType: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="regular">일반</option>
              <option value="free">무료</option>
            </select>
          </div>

          {/* 제출 버튼 */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 px-4 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium ${
              loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {loading ? '처리 중...' : '신청하기'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PTSessionModal;
