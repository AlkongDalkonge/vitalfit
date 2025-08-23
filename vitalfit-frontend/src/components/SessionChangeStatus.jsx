import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { isAdmin, isCenterManager, isManager } from '../utils/auth';

const SessionChangeStatus = () => {
  const { user } = useAuth();
  const [changeRequests, setChangeRequests] = useState([]);

  // 관리자 권한 확인
  const canApproveRequests = isAdmin(user) || isCenterManager(user) || isManager(user);

  // localStorage에서 수업신청 데이터 가져오기
  useEffect(() => {
    const loadChangeRequests = () => {
      try {
        const storedRequests = localStorage.getItem('sessionChangeRequests');
        if (storedRequests) {
          const requests = JSON.parse(storedRequests);
          setChangeRequests(requests);
        }
      } catch (error) {
        console.error('수업신청 데이터 로드 실패:', error);
      }
    };

    // 초기 로드
    loadChangeRequests();

    // localStorage 변경 감지
    const handleStorageChange = e => {
      if (e.key === 'sessionChangeRequests') {
        loadChangeRequests();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // 커스텀 이벤트 리스너 (같은 탭에서의 변경 감지)
    const handleCustomStorageChange = () => {
      loadChangeRequests();
    };

    window.addEventListener('sessionChangeRequestsUpdated', handleCustomStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('sessionChangeRequestsUpdated', handleCustomStorageChange);
    };
  }, []);

  // 승인/거절 처리
  const handleStatusChange = (requestId, newStatus) => {
    try {
      const updatedRequests = changeRequests.map(request =>
        request.id === requestId
          ? {
              ...request,
              status: newStatus,
              processedAt: new Date().toISOString(),
              processedBy: user.name,
            }
          : request
      );

      // localStorage 업데이트
      localStorage.setItem('sessionChangeRequests', JSON.stringify(updatedRequests));

      // 상태 업데이트
      setChangeRequests(updatedRequests);

      // 커스텀 이벤트 발생 (다른 컴포넌트에 알림)
      window.dispatchEvent(new CustomEvent('sessionChangeRequestsUpdated'));

      console.log(`수업신청 ${newStatus === 'approved' ? '승인' : '거절'} 완료`);
    } catch (error) {
      console.error('상태 변경 실패:', error);
    }
  };

  // 수정 처리
  const handleEdit = requestId => {
    try {
      const request = changeRequests.find(req => req.id === requestId);
      if (request) {
        // 수정 모드로 변경
        const updatedRequests = changeRequests.map(req =>
          req.id === requestId ? { ...req, isEditing: true } : req
        );
        setChangeRequests(updatedRequests);
        localStorage.setItem('sessionChangeRequests', JSON.stringify(updatedRequests));
      }
    } catch (error) {
      console.error('수정 모드 전환 실패:', error);
    }
  };

  // 수정 저장
  const handleSaveEdit = (requestId, updatedData) => {
    try {
      const updatedRequests = changeRequests.map(request =>
        request.id === requestId
          ? {
              ...request,
              ...updatedData,
              isEditing: false,
              updatedAt: new Date().toISOString(),
              updatedBy: user.name,
            }
          : request
      );

      localStorage.setItem('sessionChangeRequests', JSON.stringify(updatedRequests));
      setChangeRequests(updatedRequests);
      window.dispatchEvent(new CustomEvent('sessionChangeRequestsUpdated'));

      console.log('수정 완료');
    } catch (error) {
      console.error('수정 저장 실패:', error);
    }
  };

  // 수정 취소
  const handleCancelEdit = requestId => {
    try {
      const updatedRequests = changeRequests.map(request =>
        request.id === requestId ? { ...request, isEditing: false } : request
      );
      setChangeRequests(updatedRequests);
      localStorage.setItem('sessionChangeRequests', JSON.stringify(updatedRequests));
    } catch (error) {
      console.error('수정 취소 실패:', error);
    }
  };

  // 삭제 처리
  const handleDelete = requestId => {
    if (window.confirm('정말로 이 수업신청을 삭제하시겠습니까?')) {
      try {
        const updatedRequests = changeRequests.filter(request => request.id !== requestId);
        localStorage.setItem('sessionChangeRequests', JSON.stringify(updatedRequests));
        setChangeRequests(updatedRequests);
        window.dispatchEvent(new CustomEvent('sessionChangeRequestsUpdated'));

        console.log('삭제 완료');
      } catch (error) {
        console.error('삭제 실패:', error);
      }
    }
  };

  const getStatusColor = status => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = status => {
    switch (status) {
      case 'pending':
        return '대기중';
      case 'approved':
        return '승인됨';
      case 'rejected':
        return '거절됨';
      default:
        return '알 수 없음';
    }
  };

  const getActionTypeText = actionType => {
    switch (actionType) {
      case 'create':
        return '추가';
      case 'modify':
        return '변경';
      default:
        return '알 수 없음';
    }
  };

  const getSessionTypeText = sessionType => {
    switch (sessionType) {
      case 'regular':
        return '일반';
      case 'free':
        return '무료';
      default:
        return '알 수 없음';
    }
  };

  const formatDate = dateString => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      });
    } catch (error) {
      return dateString;
    }
  };

  const formatTime = timeString => {
    if (!timeString) return '-';
    return timeString;
  };

  const formatDateTime = (dateString, timeString) => {
    if (!dateString || !timeString) return '-';
    try {
      const date = new Date(`${dateString}T${timeString}`);
      return date.toLocaleString('ko-KR', {
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
    } catch (error) {
      return `${formatDate(dateString)} ${formatTime(timeString)}`;
    }
  };

  // 새로 생성된 신청인지 확인 (24시간 이내)
  const isNewRequest = submittedAt => {
    if (!submittedAt) return false;
    const submitted = new Date(submittedAt);
    const now = new Date();
    const diffHours = (now - submitted) / (1000 * 60 * 60);
    return diffHours < 24;
  };

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">수업신청 현황</h3>
      {changeRequests.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">수업신청 내역이 없습니다</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-48 overflow-y-auto">
          {changeRequests.map((request, index) => (
            <div
              key={index}
              className={`p-3 rounded-lg border transition-all ${
                isNewRequest(request.submittedAt)
                  ? 'bg-blue-50 border-blue-200 shadow-sm'
                  : 'bg-gray-50 border-gray-200'
              }`}
            >
              {request.isEditing ? (
                <EditForm request={request} onSave={handleSaveEdit} onCancel={handleCancelEdit} />
              ) : (
                <>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-700">신청사항</span>
                      {isNewRequest(request.submittedAt) && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium">
                          NEW
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          request.status
                        )}`}
                      >
                        {getStatusText(request.status)}
                      </span>
                      {/* 승인/미승인 버튼 - 관리자만 표시 */}
                      {canApproveRequests && request.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleStatusChange(request.id, 'approved')}
                            className="px-2 py-1 text-xs bg-white text-green-600 border border-green-600 rounded hover:bg-green-50 transition-colors"
                          >
                            승인
                          </button>
                          <button
                            onClick={() => handleStatusChange(request.id, 'rejected')}
                            className="px-2 py-1 text-xs bg-white text-red-600 border border-red-600 rounded hover:bg-red-50 transition-colors"
                          >
                            미승인
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="text-xs text-gray-600 space-y-1">
                    {/* 변경 요청인 경우 원래 날짜와 변경할 날짜를 명확히 구분 */}
                    {request.actionType === 'modify' && request.originalDate ? (
                      <>
                        <div className="p-2 bg-red-50 border border-red-200 rounded mb-2">
                          <div className="text-red-700 font-medium mb-1">
                            변경 전 (원래 날짜/시간)
                          </div>
                          <div className="flex items-center gap-4 text-red-600">
                            <span>날짜: {formatDate(request.originalDate)}</span>
                            <span>
                              시간: {request.originalStartTime || request.startTime} -{' '}
                              {request.originalEndTime || request.endTime}
                            </span>
                          </div>
                        </div>
                        <div className="p-2 bg-green-50 border border-green-200 rounded mb-2">
                          <div className="text-green-700 font-medium mb-1">
                            변경 후 (새로운 날짜/시간)
                          </div>
                          {/* 수정된 순서대로 세션 정보 표시 */}
                          <div className="space-y-2">
                            <div className="grid grid-cols-2 gap-2">
                              <div className="flex items-center gap-4 p-2 bg-green-100 border border-green-300 rounded">
                                <span className="text-green-700 font-medium">수정날짜</span>
                                <span className="text-green-600">
                                  {formatDate(request.startDate)}
                                </span>
                              </div>
                              <div className="flex items-center gap-4 p-2 bg-green-100 border border-green-300 rounded">
                                <span className="text-green-700 font-medium">신청날짜</span>
                                <span className="text-green-600">
                                  {formatDate(request.endDate)}
                                </span>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div className="flex items-center gap-4 p-2 bg-green-100 border border-green-300 rounded">
                                <span className="text-green-700 font-medium">시간</span>
                                <span className="text-green-600">
                                  {request.startTime} - {request.endTime}
                                </span>
                              </div>
                              <div className="flex items-center gap-4 p-2 bg-green-100 border border-green-300 rounded">
                                <span className="text-green-700 font-medium">PT종류</span>
                                <span className="text-green-600">
                                  {getActionTypeText(request.actionType)}
                                </span>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div className="flex items-center gap-4 p-2 bg-green-100 border border-green-300 rounded">
                                <span className="text-green-700 font-medium">유형</span>
                                <span className="text-green-600">
                                  {getSessionTypeText(request.sessionType)}
                                </span>
                              </div>
                              <div className="flex items-center gap-4 p-2 bg-green-100 border border-green-300 rounded">
                                <span className="text-green-700 font-medium">신청사항</span>
                                <span className="text-green-600">
                                  {request.memberName || '회원명 없음'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        {/* 수정된 순서대로 세션 정보 표시 */}
                        <div className="space-y-2">
                          <div className="grid grid-cols-2 gap-2">
                            <div className="flex items-center gap-4 p-2 bg-blue-50 border border-blue-200 rounded">
                              <span className="text-blue-700 font-medium">신청날짜</span>
                              <span>{formatDate(request.startDate)}</span>
                            </div>
                            <div className="flex items-center gap-4 p-2 bg-blue-50 border border-blue-200 rounded">
                              <span className="text-blue-700 font-medium">수업날짜</span>
                              <span>{formatDate(request.endDate)}</span>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="flex items-center gap-4 p-2 bg-blue-50 border border-blue-200 rounded">
                              <span className="text-blue-700 font-medium">시간</span>
                              <span>
                                {request.startTime} - {request.endTime}
                              </span>
                            </div>
                            <div className="flex items-center gap-4 p-2 bg-blue-50 border border-blue-200 rounded">
                              <span className="text-blue-700 font-medium">신청유형</span>
                              <span>{getActionTypeText(request.actionType)}</span>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="flex items-center gap-4 p-2 bg-blue-50 border border-blue-200 rounded">
                              <span className="text-blue-700 font-medium">PT종류</span>
                              <span>{getSessionTypeText(request.sessionType)}</span>
                            </div>
                            <div className="flex items-center gap-4 p-2 bg-blue-50 border border-blue-200 rounded">
                              <span className="text-blue-700 font-medium">회원명</span>
                              <span>{request.memberName || '회원명 없음'}</span>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                    {request.notes && (
                      <div className="text-gray-500 bg-gray-100 p-2 rounded">
                        메모: {request.notes}
                      </div>
                    )}
                    <div className="text-gray-500 text-xs">
                      신청자: {request.submittedBy} | 신청일: {formatDate(request.submittedAt)}
                    </div>
                    {request.processedBy && (
                      <div className="text-gray-500 text-xs">
                        처리자: {request.processedBy} | 처리일: {formatDate(request.processedAt)}
                      </div>
                    )}
                  </div>

                  {/* 수정/삭제 버튼 */}
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => handleEdit(request.id)}
                      className="flex-1 px-2 py-1 text-xs bg-white text-blue-600 border border-blue-600 rounded hover:bg-blue-50 transition-colors"
                    >
                      수정
                    </button>
                    <button
                      onClick={() => handleDelete(request.id)}
                      className="flex-1 px-2 py-1 text-xs bg-white text-red-600 border border-red-600 rounded hover:bg-red-50 transition-colors"
                    >
                      삭제
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// 수정 폼 컴포넌트
const EditForm = ({ request, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    memberName: request.memberName || '',
    startDate: request.startDate || request.sessionDate || '',
    endDate: request.endDate || request.sessionDate || '',
    startTime: request.startTime || '',
    endTime: request.endTime || '',
    sessionType: request.sessionType || '',
    actionType: request.actionType || '',
    originalDate: request.originalDate || '',
    originalStartTime: request.originalStartTime || '',
    originalEndTime: request.originalEndTime || '',
    notes: request.notes || '',
  });

  const handleInputChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = e => {
    e.preventDefault();

    // 저장 시 순서대로 정리된 데이터 생성
    const orderedData = {
      startDate: formData.startDate, // 수정날짜
      endDate: formData.endDate, // 신청날짜
      actionType: formData.actionType, // PT종류
      sessionType: formData.sessionType, // 유형
      memberName: formData.memberName, // 회원명
      startTime: formData.startTime, // 시작 시간
      endTime: formData.endTime, // 종료 시간
      notes: formData.notes, // 메모
      // 변경 요청인 경우 원래 데이터도 포함
      ...(formData.actionType === 'modify' && {
        originalDate: formData.originalDate,
        originalStartTime: formData.originalStartTime,
        originalEndTime: formData.originalEndTime,
      }),
    };

    onSave(request.id, orderedData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {/* 변경 요청인 경우 원래 날짜/시간 입력 필드 */}
      {formData.actionType === 'modify' && (
        <>
          <div className="p-2 bg-red-50 border border-red-200 rounded">
            <div className="text-xs font-medium text-red-700 mb-2">변경 전 (원래 날짜/시간)</div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-xs font-medium text-red-600 mb-1">원래 날짜</label>
                <input
                  type="date"
                  name="originalDate"
                  value={formData.originalDate}
                  onChange={handleInputChange}
                  className="w-full px-2 py-1 text-xs border border-red-300 rounded focus:outline-none focus:ring-1 focus:ring-red-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-red-600 mb-1">시작 시간</label>
                <input
                  type="time"
                  name="originalStartTime"
                  value={formData.originalStartTime}
                  onChange={handleInputChange}
                  className="w-full px-2 py-1 text-xs border border-red-300 rounded focus:outline-none focus:ring-1 focus:ring-red-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-red-600 mb-1">종료 시간</label>
                <input
                  type="time"
                  name="originalEndTime"
                  value={formData.originalEndTime}
                  onChange={handleInputChange}
                  className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </>
      )}

      {/* 변경할 날짜/시간 입력 필드 */}
      <div className="p-2 bg-green-50 border border-green-200 rounded">
        <div className="text-xs font-medium text-green-700 mb-2">
          {formData.actionType === 'modify' ? '변경 후 (새로운 날짜/시간)' : ''}
        </div>
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-green-600 mb-1">수정날짜</label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleInputChange}
                className="w-full px-2 py-1 text-xs border border-green-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-green-600 mb-1">신청날짜</label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleInputChange}
                className="w-full px-2 py-1 text-xs border border-green-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-green-600 mb-1">시작 시간</label>
              <input
                type="time"
                name="startTime"
                value={formData.startTime}
                onChange={handleInputChange}
                className="w-full px-2 py-1 text-xs border border-green-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-green-600 mb-1">종료 시간</label>
              <input
                type="time"
                name="endTime"
                value={formData.endTime}
                onChange={handleInputChange}
                className="w-full px-2 py-1 text-xs border border-green-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* PT종류와 유형을 2행으로 배치 */}
      <div className="space-y-2">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">PT종류</label>
          <select
            name="actionType"
            value={formData.actionType}
            onChange={handleInputChange}
            className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">선택</option>
            <option value="create">추가</option>
            <option value="modify">변경</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">유형</label>
          <select
            name="sessionType"
            value={formData.sessionType}
            onChange={handleInputChange}
            className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">선택</option>
            <option value="regular">일반</option>
            <option value="free">무료</option>
          </select>
        </div>
      </div>

      {/* 회원명 필드 */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">회원명</label>
        <input
          type="text"
          name="memberName"
          value={formData.memberName}
          onChange={handleInputChange}
          placeholder="회원 이름을 입력하세요"
          className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          className="flex-1 px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
        >
          저장
        </button>
        <button
          type="button"
          onClick={() => onCancel(request.id)}
          className="flex-1 px-2 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
        >
          취소
        </button>
      </div>
    </form>
  );
};

export default SessionChangeStatus;
