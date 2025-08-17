import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';
import { userAPI } from '../utils/api';
import { useNavigate } from 'react-router-dom';

const MyWorkPage = ({ onReAuthRequired }) => {
  const { user, refreshUserInfo } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  // 자동 리다이렉트 관련 상태
  const inactivityTimeoutRef = useRef(null);

  const [formData, setFormData] = useState({
    shiftData: {
      schedules: [
        {
          days: [],
          time: { start: '09:00', end: '17:00' },
        },
      ],
    },
  });

  // 쉬는 날 신청 폼 상태
  const [leaveRequestForm, setLeaveRequestForm] = useState({
    leaveType: 'vacation', // vacation, halfday, sick, personal, other
    startDate: '',
    endDate: '',
    startTime: '',
    endTime: '',
    reason: '',
  });

  // 쉬는 날 신청 내역 상태 (백엔드에서 초기화)
  const [leaveRequests, setLeaveRequests] = useState([]);

  // 휴가 유형 옵션
  const leaveTypes = [
    { value: 'vacation', label: '연차', color: 'bg-blue-100 text-blue-800' },
    { value: 'halfday', label: '반차', color: 'bg-purple-100 text-purple-800' },
    { value: 'sick', label: '병가', color: 'bg-red-100 text-red-800' },
    { value: 'personal', label: '휴가', color: 'bg-green-100 text-green-800' },
    { value: 'other', label: '근무신청', color: 'bg-gray-100 text-gray-800' },
  ];

  // 휴가 신청 상태 변화 감지 및 로컬 스토리지 동기화
  useEffect(() => {
    console.log('🔄 휴가 신청 상태 변화:', {
      totalRequests: leaveRequests.length,
      requests: leaveRequests.map(req => ({
        id: req.id,
        status: req.status,
        submittedAt: req.submittedAt,
        reason: req.reason,
      })),
    });
  }, [leaveRequests]);

  // 백엔드에서 휴가 신청 목록 가져오기
  const fetchLeaveRequests = async () => {
    try {
      const response = await fetch(
        `http://localhost:3001/api/users/leave/list?userId=${user?.id || user?.uid}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        }
      );

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setLeaveRequests(result.data || []);
          console.log('✅ 휴가 신청 목록 가져오기 성공:', result.data);
        }
      }
    } catch (error) {
      console.error('❌ 휴가 신청 목록 가져오기 실패:', error);
    }
  };

  // 초기 상태 로깅 및 휴가 신청 목록 가져오기
  useEffect(() => {
    console.log('🚀 MyWorkPage 초기 상태:', {
      leaveRequestsLength: leaveRequests.length,
      leaveRequests: leaveRequests,
      user: user?.name,
    });

    if (user?.id || user?.uid) {
      fetchLeaveRequests();
    }
  }, [user]);

  // shift 데이터 파싱 함수
  const parseShiftData = shiftString => {
    if (!shiftString || shiftString.trim() === '') {
      return {
        schedules: [
          {
            days: [],
            time: { start: '09:00', end: '17:00' },
          },
        ],
      };
    }

    try {
      const parsed = JSON.parse(shiftString);

      // 압축된 형식인지 확인
      if (parsed.s && Array.isArray(parsed.s)) {
        return decompressShiftData(shiftString);
      }

      // 데이터 구조 검증 및 정규화
      if (parsed && typeof parsed === 'object') {
        // 기존 형식 호환성 유지 (단일 스케줄)
        if (parsed.days && Array.isArray(parsed.days) && parsed.time) {
          const result = {
            schedules: [
              {
                days: parsed.days,
                time: parsed.time.includes('-')
                  ? { start: parsed.time.split('-')[0], end: parsed.time.split('-')[1] }
                  : { start: parsed.time.start || '09:00', end: parsed.time.end || '17:00' },
              },
            ],
          };
          return result;
        }

        // 새로운 형식 (schedules 배열)
        if (parsed.schedules && Array.isArray(parsed.schedules)) {
          const validatedSchedules = parsed.schedules.map((schedule, index) => {
            if (schedule && typeof schedule === 'object') {
              return {
                days: Array.isArray(schedule.days) ? schedule.days : [],
                time: {
                  start: schedule.time?.start || '09:00',
                  end: schedule.time?.end || '17:00',
                },
              };
            }
            return { days: [], time: { start: '09:00', end: '17:00' } };
          });

          const result = { schedules: validatedSchedules };
          return result;
        }
      }

      return {
        schedules: [
          {
            days: [],
            time: { start: '09:00', end: '17:00' },
          },
        ],
      };
    } catch (error) {
      return {
        schedules: [
          {
            days: [],
            time: { start: '09:00', end: '17:00' },
          },
        ],
      };
    }
  };

  // shift 데이터를 압축하여 100자 이내로 맞추는 함수
  const compressShiftData = shiftData => {
    // 기본 구조만 유지하고 불필요한 공백 제거
    const compressed = {
      s: shiftData.schedules.map(schedule => ({
        d: schedule.days,
        t: { s: schedule.time.start, e: schedule.time.end },
      })),
    };

    const compressedJson = JSON.stringify(compressed);

    // 100자 이내로 맞추기
    if (compressedJson.length <= 100) {
      return compressedJson;
    }

    // 더 압축: 요일을 숫자로 변환
    const dayMap = { 월: 1, 화: 2, 수: 3, 목: 4, 금: 5, 토: 6, 일: 7 };
    const moreCompressed = {
      s: shiftData.schedules.map(schedule => ({
        d: schedule.days.map(day => dayMap[day] || day),
        t: { s: schedule.time.start, e: schedule.time.end },
      })),
    };

    const moreCompressedJson = JSON.stringify(moreCompressed);

    return moreCompressedJson;
  };

  // 압축된 shift 데이터를 원래 형태로 복원하는 함수
  const decompressShiftData = compressedString => {
    try {
      const compressed = JSON.parse(compressedString);

      // 숫자로 된 요일을 다시 한글로 변환
      const dayMap = { 1: '월', 2: '화', 3: '수', 4: '목', 5: '금', 6: '토', 7: '일' };

      const restored = {
        schedules: compressed.s.map(schedule => ({
          days: schedule.d.map(day => dayMap[day] || day),
          time: { start: schedule.t.s, end: schedule.t.e },
        })),
      };

      return restored;
    } catch (error) {
      // 복원 실패 시 기본값 반환
      return {
        schedules: [{ days: [], time: { start: '09:00', end: '17:00' } }],
      };
    }
  };

  // 쉬는 날 신청 폼 변경 핸들러
  const handleLeaveFormChange = (field, value) => {
    setLeaveRequestForm(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  // 실제 휴가 신청 로직을 별도 함수로 분리
  const performLeaveRequest = async e => {
    e.preventDefault();

    if (!leaveRequestForm.startDate || !leaveRequestForm.reason.trim()) {
      toast.error('필수 항목을 모두 입력해주세요.');
      return;
    }

    if (!leaveRequestForm.startTime || !leaveRequestForm.endTime) {
      toast.error('시작 시간과 종료 시간을 모두 입력해주세요.');
      return;
    }

    if (leaveRequestForm.startDate && leaveRequestForm.endDate) {
      const startDate = new Date(leaveRequestForm.startDate);
      const endDate = new Date(leaveRequestForm.endDate);

      if (startDate > endDate) {
        toast.error('시작일은 종료일보다 이전이어야 합니다.');
        return;
      }
    }

    // 시간 검증 (토스트 없이)
    if (leaveRequestForm.startTime >= leaveRequestForm.endTime) {
      return;
    }

    try {
      // 새로운 휴가 신청 생성
      const newRequest = {
        id: Date.now(),
        ...leaveRequestForm,
        status: 'pending',
        submittedAt: new Date().toISOString(),
        user: {
          name: user?.name || '사용자',
          position: user?.position?.name || '직원',
          email: user?.email || 'unknown@email.com',
        },
      };

      // 오른쪽 승인내역에 추가 (상태 업데이트 강화)
      const updatedRequests = [newRequest, ...leaveRequests];
      setLeaveRequests(updatedRequests);

      console.log('🔄 휴가 신청 상태 업데이트:', {
        newRequest,
        prevLength: leaveRequests.length,
        newLength: updatedRequests.length,
        updatedRequests,
      });

      // 백엔드에 휴가 신청 제출
      const backendRequestId = await submitLeaveRequestToBackend(newRequest);

      // 백엔드에서 받은 requestId로 업데이트
      newRequest.id = backendRequestId;

      // 폼 초기화
      setLeaveRequestForm({
        leaveType: 'vacation',
        startDate: '',
        endDate: '',
        startTime: '',
        endTime: '',
        reason: '',
      });

      // 상태 업데이트 확인
      console.log('✅ 휴가 신청 완료:', {
        newRequestId: newRequest.id,
        totalRequests: updatedRequests.length,
        status: 'pending',
      });

      // 상태 업데이트 후 실제 상태 확인
      console.log('🔍 신청 완료 후 실제 상태:', {
        leaveRequestsLength: updatedRequests.length,
        newRequestExists: updatedRequests.some(req => req.id === newRequest.id),
      });

      // 강제 업데이트로 상태 동기화
      forceUpdateLeaveRequests();

      toast.success('휴가 신청이 완료되었습니다. 관리자에게 승인 요청이 전송되었습니다.');
    } catch (error) {
      console.error('휴가 신청 실패:', error);
      toast.error('휴가 신청에 실패했습니다.');
    }
  };

  // 쉬는 날 신청 제출
  const handleLeaveRequestSubmit = async e => {
    e.preventDefault();

    // 신청할 때마다 재인증 요구
    if (onReAuthRequired) {
      onReAuthRequired(async () => {
        try {
          await performLeaveRequest(e);
        } catch (error) {
          console.error('재인증 후 휴가 신청 실패:', error);
        }
      });
      return;
    }

    // 재인증이 필요하지 않은 경우 바로 실행
    await performLeaveRequest(e);
  };

  // 상태 강제 업데이트를 위한 함수
  const forceUpdateLeaveRequests = () => {
    setLeaveRequests(prev => [...prev]);
  };

  // 메일에서 승인 시 UI 상태 업데이트
  const updateLeaveRequestStatus = (requestId, newStatus) => {
    setLeaveRequests(prev =>
      prev.map(req => (req.id === requestId ? { ...req, status: newStatus } : req))
    );

    console.log(`✅ 휴가 신청 ${requestId} 상태 업데이트: ${newStatus}`);
  };

  // 백엔드 휴가 신청 API 호출
  const submitLeaveRequestToBackend = async request => {
    try {
      const response = await fetch('http://localhost:3001/api/users/leave/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({
          leaveType: request.leaveType,
          startDate: request.startDate,
          endDate: request.endDate,
          startTime: request.startTime,
          endTime: request.endTime,
          reason: request.reason,
          userId: user?.id || user?.uid,
          userName: user?.name || '사용자',
          userEmail: user?.email || 'unknown@email.com',
        }),
      });

      if (!response.ok) {
        throw new Error('백엔드 휴가 신청에 실패했습니다.');
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.message || '백엔드 휴가 신청에 실패했습니다.');
      }

      console.log('백엔드 휴가 신청 성공:', result);
      return result.requestId; // 백엔드에서 생성된 requestId 반환
    } catch (error) {
      console.error('백엔드 휴가 신청 실패:', error);
      throw error;
    }
  };

  // 휴가 승인/거절 처리 (관리자용)
  const handleLeaveRequestAction = async (requestId, action) => {
    try {
      const updatedRequests = leaveRequests.map(req => {
        if (req.id === requestId) {
          return {
            ...req,
            status: action, // 'approved' 또는 'rejected'
            processedAt: new Date().toISOString(),
            processedBy: '관리자',
          };
        }
        return req;
      });

      setLeaveRequests(updatedRequests);

      toast.success(`휴가 신청이 ${action === 'approved' ? '승인' : '거절'}되었습니다.`);
    } catch (error) {
      console.error('휴가 신청 처리 실패:', error);
      toast.error('처리에 실패했습니다.');
    }
  };

  // 휴가 신청 삭제
  const handleDeleteLeaveRequest = requestId => {
    setLeaveRequests(prev => prev.filter(req => req.id !== requestId));
    toast.success('휴가 신청이 삭제되었습니다.');
  };

  // 휴가 신청 전송 (관리자용)
  const handleSendLeaveRequest = async request => {
    try {
      // 백엔드에 휴가 신청 제출
      const backendRequestId = await submitLeaveRequestToBackend(request);

      // 백엔드에서 받은 requestId로 업데이트
      const updatedRequests = leaveRequests.map(req => {
        if (req.id === request.id) {
          return {
            ...req,
            id: backendRequestId,
            status: 'pending',
            submittedAt: new Date().toISOString(),
          };
        }
        return req;
      });
      setLeaveRequests(updatedRequests);

      toast.success('휴가 신청이 전송되었습니다.');
    } catch (error) {
      console.error('휴가 신청 전송 실패:', error);
      toast.error('휴가 신청 전송에 실패했습니다.');
    }
  };

  // 상태별 색상 및 텍스트
  const getStatusInfo = status => {
    switch (status) {
      case 'pending':
        return { color: 'bg-yellow-100 text-yellow-800', text: '대기' };
      case 'approved':
        return { color: 'bg-green-100 text-green-800', text: '승인' };
      case 'rejected':
        return { color: 'bg-red-100 text-red-800', text: '반려' };
      case 'draft':
        return { color: 'bg-gray-100 text-gray-800', text: '초안' };
      default:
        return { color: 'bg-gray-100 text-gray-800', text: '확인' };
    }
  };

  // 휴가 유형별 색상
  const getLeaveTypeColor = type => {
    const leaveType = leaveTypes.find(lt => lt.value === type);
    return leaveType ? leaveType.color : 'bg-gray-100 text-gray-800';
  };

  // 사용자 정보 로드
  useEffect(() => {
    if (user) {
      console.log('🔍 MyWorkPage - 사용자 정보 로드 시작');

      // shift 데이터 안전하게 파싱
      let parsedShiftData;

      if (user.shift && user.shift.trim() !== '') {
        try {
          // 압축된 데이터인지 확인하고 복원
          if (
            user.shift.length <= 100 &&
            (user.shift.includes('"s":') || user.shift.includes('"d":'))
          ) {
            parsedShiftData = decompressShiftData(user.shift);
          } else {
            parsedShiftData = parseShiftData(user.shift);
          }

          // 데이터 구조가 유효함 - 추가 검증이 필요한 경우 여기에 로직 추가
          console.log('✅ shift 데이터 구조 검증 통과');
        } catch (error) {
          console.error('❌ shift 데이터 파싱 실패:', error);
          parsedShiftData = {
            schedules: [
              {
                days: [],
                time: { start: '09:00', end: '17:00' },
              },
            ],
          };
        }
      } else {
        parsedShiftData = {
          schedules: [
            {
              days: [],
              time: { start: '09:00', end: '17:00' },
            },
          ],
        };
      }

      setFormData(prev => ({
        ...prev,
        shiftData: parsedShiftData,
      }));

      setLoading(false);
    }
  }, [user]);

  // 자동 리다이렉트 로직
  useEffect(() => {
    if (!user) return;

    // 사용자 활동 감지 함수들
    const resetInactivityTimer = () => {
      // 기존 타이머가 있다면 제거
      if (inactivityTimeoutRef.current) {
        clearTimeout(inactivityTimeoutRef.current);
      }

      // 5분 후 자동으로 대시보드로 이동하는 타이머 설정
      inactivityTimeoutRef.current = setTimeout(
        () => {
          console.log('⏰ 5분 경과, 자동으로 대시보드로 이동');
          toast.info('보안을 위해 대시보드로 이동합니다.');
          navigate('/dashboard');
        },
        5 * 60 * 1000
      ); // 5분
    };

    // 페이지 로드 시 타이머 시작
    resetInactivityTimer();

    // 사용자 활동 이벤트 리스너들
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];

    const handleUserActivity = () => {
      resetInactivityTimer();
    };

    // 이벤트 리스너 등록
    events.forEach(event => {
      document.addEventListener(event, handleUserActivity, true);
    });

    // 컴포넌트 언마운트 시 정리
    return () => {
      if (inactivityTimeoutRef.current) {
        clearTimeout(inactivityTimeoutRef.current);
      }
      events.forEach(event => {
        document.removeEventListener(event, handleUserActivity, true);
      });
    };
  }, [user, navigate]);

  // 요일 체크박스 변경 핸들러
  const handleDayChange = (scheduleIndex, day) => {
    setFormData(prev => {
      // 완전한 Deep Copy로 불변성 보장
      const newFormData = { ...prev };
      const newShiftData = { ...newFormData.shiftData };
      const newSchedules = [...newShiftData.schedules];
      const newSchedule = { ...newSchedules[scheduleIndex] };

      // days 배열이 없거나 undefined인 경우 빈 배열로 초기화
      if (!newSchedule.days || !Array.isArray(newSchedule.days)) {
        newSchedule.days = [];
      }

      let newDays;
      if (newSchedule.days.includes(day)) {
        newDays = newSchedule.days.filter(d => d !== day);
      } else {
        newDays = [...newSchedule.days, day];
      }

      // 새로운 days 배열로 schedule 업데이트
      newSchedule.days = newDays;

      // schedules 배열 업데이트
      newSchedules[scheduleIndex] = newSchedule;
      newShiftData.schedules = newSchedules;
      newFormData.shiftData = newShiftData;

      return newFormData;
    });
  };

  // 시간 변경 핸들러
  const handleTimeChange = (scheduleIndex, timeType, value) => {
    setFormData(prev => {
      // 완전한 Deep Copy로 불변성 보장
      const newFormData = { ...prev };
      const newShiftData = { ...newFormData.shiftData };
      const newSchedules = [...newShiftData.schedules];
      const newSchedule = { ...newSchedules[scheduleIndex] };
      const newTime = { ...newSchedule.time };

      newTime[timeType] = value;
      newSchedule.time = newTime;
      newSchedules[scheduleIndex] = newSchedule;
      newShiftData.schedules = newSchedules;
      newFormData.shiftData = newShiftData;

      return newFormData;
    });
  };

  // 근무 일정 추가
  const addSchedule = () => {
    setFormData(prev => {
      const newFormData = { ...prev };
      const newShiftData = { ...newFormData.shiftData };
      const newSchedules = [...newShiftData.schedules];

      newSchedules.push({ days: [], time: { start: '09:00', end: '17:00' } });
      newShiftData.schedules = newSchedules;
      newFormData.shiftData = newShiftData;

      return newFormData;
    });
  };

  // 근무 일정 삭제
  const removeSchedule = index => {
    setFormData(prev => {
      if (prev.shiftData.schedules.length > 1) {
        const newFormData = { ...prev };
        const newShiftData = { ...newFormData.shiftData };
        const newSchedules = newShiftData.schedules.filter((_, i) => i !== index);

        newShiftData.schedules = newSchedules;
        newFormData.shiftData = newShiftData;

        return newFormData;
      }
      return prev;
    });
  };

  const handleSave = async () => {
    try {
      // shiftData 구조 검증
      if (
        !formData.shiftData ||
        !formData.shiftData.schedules ||
        !Array.isArray(formData.shiftData.schedules)
      ) {
        throw new Error('Invalid shiftData structure');
      }

      // 각 schedule의 days 배열 검증
      formData.shiftData.schedules.forEach((schedule, index) => {
        if (!schedule.days || !Array.isArray(schedule.days)) {
          throw new Error(`Invalid days array in schedule ${index}`);
        }
      });

      // shift 데이터를 압축하여 100자 이내로 맞추기
      const compressedShift = compressShiftData(formData.shiftData);
      const cleanFormData = { shift: compressedShift };

      // userAPI.updateMyAccount 사용
      const response = await userAPI.updateMyAccount(cleanFormData);

      // 저장 성공 후 formData를 즉시 업데이트
      if (response.user) {
        setFormData(prev => ({
          ...prev,
          shiftData: response.user.shift ? parseShiftData(response.user.shift) : prev.shiftData,
        }));
      }

      toast.success('근무 일정이 업데이트되었습니다.');

      // 저장 후 최신 사용자 정보 재호출 (화면 갱신용)
      if (refreshUserInfo && typeof refreshUserInfo === 'function') {
        try {
          await refreshUserInfo();
        } catch (error) {
          console.error('refreshUserInfo 호출 실패:', error);
        }
      }
    } catch (err) {
      console.error('업데이트 실패:', err.message);

      // 더 자세한 에러 메시지 표시
      let errorMessage = '업데이트에 실패했습니다.';
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }

      toast.error(`업데이트 실패: ${errorMessage}`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        사용자 정보를 불러오는 중...
      </div>
    );
  }

  return (
    <div className="w-full bg-white">
      <div className="w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">나의 업무</h1>
          <p className="text-gray-600">근무 일정 및 휴가를 신청할 수 있습니다</p>
        </div>

        {/* 시간을 정해서 휴가를 신청하는 폼과 승인내역을 좌우로 배치 */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 왼쪽 2/3: 시간을 정해서 휴가를 신청하는 폼 */}
          <div className="lg:col-span-2 bg-white rounded-lg p-4 border border-gray-200">
            <form onSubmit={handleLeaveRequestSubmit} className="space-y-4">
              {/* 휴가 유형 선택 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  신청 유형 <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-wrap gap-3">
                  {leaveTypes.map(type => (
                    <label key={type.value} className="flex items-center">
                      <input
                        type="radio"
                        name="leaveType"
                        value={type.value}
                        checked={leaveRequestForm.leaveType === type.value}
                        onChange={e => handleLeaveFormChange('leaveType', e.target.value)}
                        className="mr-2 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-gray-700">{type.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* 날짜 선택 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    시작일 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={leaveRequestForm.startDate}
                    onChange={e => handleLeaveFormChange('startDate', e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full p-3 pt-7 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
                    required
                  />
                  <span className="absolute left-3 top-8 text-gray-400 text-sm pointer-events-none select-none">
                    시작일
                  </span>
                </div>
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-1">종료일</label>
                  <input
                    type="date"
                    value={leaveRequestForm.endDate}
                    onChange={e => handleLeaveFormChange('endDate', e.target.value)}
                    min={leaveRequestForm.startDate || new Date().toISOString().split('T')[0]}
                    className="w-full p-3 pt-7 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
                  />
                  <span className="absolute left-3 top-8 text-gray-400 text-sm pointer-events-none select-none">
                    종료일
                  </span>
                </div>
              </div>

              {/* 시간 선택 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    시작 시간 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    value={leaveRequestForm.startTime || ''}
                    onChange={e => handleLeaveFormChange('startTime', e.target.value)}
                    className="w-full p-3 pt-7 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
                    required
                  />
                  <span className="absolute left-3 top-8 text-gray-400 text-sm pointer-events-none select-none">
                    시작 시간
                  </span>
                </div>
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    종료 시간 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    value={leaveRequestForm.endTime || ''}
                    onChange={e => handleLeaveFormChange('endTime', e.target.value)}
                    className="w-full p-3 pt-7 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
                    required
                  />
                  <span className="absolute left-3 top-8 text-gray-400 text-sm pointer-events-none select-none">
                    종료 시간
                  </span>
                </div>
              </div>

              {/* 사유 입력 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  사유 <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={leaveRequestForm.reason}
                  onChange={e => handleLeaveFormChange('reason', e.target.value)}
                  rows="2"
                  placeholder="휴가 신청 사유를 입력해주세요"
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none text-sm"
                  required
                />
              </div>

              {/* 신청 버튼 */}
              <div className="text-center">
                <button
                  type="submit"
                  className="w-96 mt-1 bg-gradient-to-r from-cyan-500 to-indigo-600 text-white py-2 px-4 rounded-[10px] hover:from-cyan-600 hover:to-indigo-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                >
                  신청
                </button>
              </div>
            </form>
          </div>

          {/* 오른쪽 1/3: 승인 내역 */}
          <div className="lg:col-span-1 bg-white rounded-lg p-4 border border-gray-200">
            <h2 className="text-base font-semibold text-gray-800 mb-3">
              승인 내역 ({leaveRequests.length}건)
            </h2>

            {leaveRequests.length > 0 ? (
              <div className="space-y-2">
                {leaveRequests.map(request => {
                  const statusInfo = getStatusInfo(request.status);
                  const leaveTypeInfo = leaveTypes.find(lt => lt.value === request.leaveType);

                  return (
                    <div key={request.id} className="border rounded-lg p-2 bg-gray-50">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1">
                          <span
                            className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${leaveTypeInfo?.color || 'bg-gray-100 text-gray-800'}`}
                          >
                            {leaveTypeInfo?.label || '기타'}
                          </span>
                          <span
                            className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}
                          >
                            {statusInfo.text}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          {request.status === 'draft' && (
                            <button
                              onClick={() => handleSendLeaveRequest(request)}
                              className="text-blue-600 hover:text-blue-800 text-xs font-medium hover:bg-blue-50 px-2 py-1 rounded-md transition-colors border border-blue-300"
                            >
                              전송
                            </button>
                          )}

                          <button
                            onClick={() => handleDeleteLeaveRequest(request.id)}
                            className="text-red-500 hover:text-red-700 text-xs font-medium hover:bg-red-50 px-1 py-0.5 rounded-md transition-colors"
                          >
                            삭제
                          </button>
                        </div>
                      </div>

                      <div className="space-y-1 text-xs">
                        <div>
                          <span className="font-medium text-gray-700">기간:</span>
                          <span className="ml-1 text-gray-600">
                            {request.startDate}
                            {request.endDate && ` ~ ${request.endDate}`}
                          </span>
                        </div>
                        {request.startTime && request.endTime && (
                          <div>
                            <span className="font-medium text-gray-700">시간:</span>
                            <span className="ml-1 text-gray-600">
                              {request.startTime} ~ {request.endTime}
                            </span>
                          </div>
                        )}
                        <div>
                          <span className="font-medium text-gray-700">신청일:</span>
                          <span className="ml-1 text-gray-600">
                            {new Date(request.submittedAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">사유:</span>
                          <span className="ml-1 text-gray-600 truncate block">
                            {request.reason}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500">
                <svg
                  className="w-6 h-6 text-gray-300 mx-auto mb-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <p className="text-xs">아직 신청한 휴가가 없습니다</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyWorkPage;
