import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import PasswordResetModal from '../components/PasswordResetModal';
import DeactivationModal from '../components/DeactivationModal';
import { teamAPI, centerAPI, userAPI } from '../utils/api';
import axios from 'axios';

const AccountPage = () => {
  const { user, refreshUserInfo } = useAuth();
  const fileInputRef = useRef(null);

  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isDeactivationModalOpen, setIsDeactivationModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [teams, setTeams] = useState([]);
  const [centers, setCenters] = useState([]);
  const [positions, setPositions] = useState([]);
  const [teamsLoading, setTeamsLoading] = useState(true);
  const [centersLoading, setCentersLoading] = useState(true);
  const [positionsLoading, setPositionsLoading] = useState(true);
  const [previewImage, setPreviewImage] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    nickname: '',
    phone: '',
    gender: '',
    status: 'active',
    position_id: '',
    team_id: '',
    center_id: '',
    license: '',
    experience: '',
    education: '',
    instagram: '',
    join_date: '',
    leave_date: '',
    shiftData: {
      schedules: [
        {
          days: [],
          time: { start: '09:00', end: '17:00' },
        },
      ],
    },
  });

  // shift 데이터 파싱 함수
  const parseShiftData = shiftString => {
    console.log('=== parseShiftData 시작 ===');
    console.log('파싱할 shift 데이터:', shiftString);
    console.log('데이터 타입:', typeof shiftString);

    if (!shiftString || shiftString.trim() === '') {
      console.log('shift 데이터 없음, 기본값 반환');
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
      console.log('파싱된 shift 데이터:', parsed);
      console.log('파싱된 데이터 타입:', typeof parsed);
      console.log('parsed.schedules:', parsed.schedules);

      // 압축된 형식인지 확인
      if (parsed.s && Array.isArray(parsed.s)) {
        console.log('압축된 형식 감지, 복원 시도');
        return decompressShiftData(shiftString);
      }

      // 데이터 구조 검증 및 정규화
      if (parsed && typeof parsed === 'object') {
        // 기존 형식 호환성 유지 (단일 스케줄)
        if (parsed.days && Array.isArray(parsed.days) && parsed.time) {
          console.log('기존 형식 감지, 새로운 형식으로 변환');
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
          console.log('변환된 shift 데이터:', result);
          return result;
        }

        // 새로운 형식 (schedules 배열)
        if (parsed.schedules && Array.isArray(parsed.schedules)) {
          console.log('새로운 형식 감지, 데이터 검증');
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
            console.warn(`잘못된 스케줄 데이터 at index ${index}:`, schedule);
            return { days: [], time: { start: '09:00', end: '17:00' } };
          });

          const result = { schedules: validatedSchedules };
          console.log('검증된 shift 데이터:', result);
          return result;
        }
      }

      console.log('알 수 없는 형식, 기본값 반환');
      return {
        schedules: [
          {
            days: [],
            time: { start: '09:00', end: '17:00' },
          },
        ],
      };
    } catch (error) {
      console.error('Shift 데이터 파싱 실패:', error);
      console.error('원본 데이터:', shiftString);
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

  // shift 데이터 직렬화 함수
  const serializeShiftData = data => {
    return JSON.stringify(data);
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
    console.log('압축된 shift 데이터:', compressedJson);
    console.log('압축된 데이터 길이:', compressedJson.length);

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
    console.log('더 압축된 shift 데이터:', moreCompressedJson);
    console.log('더 압축된 데이터 길이:', moreCompressedJson.length);

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
      console.error('shift 데이터 복원 실패:', error);
      // 복원 실패 시 기본값 반환
      return {
        schedules: [{ days: [], time: { start: '09:00', end: '17:00' } }],
      };
    }
  };

  useEffect(() => {
    if (user) {
      console.log('=== 사용자 데이터 로드 시작 ===');
      console.log('받은 user 객체:', user);
      console.log('받은 user.shift:', user.shift);
      console.log('user.shift 타입:', typeof user.shift);
      console.log('user.shift 길이:', user.shift?.length);
      console.log('user.shift 내용:', user.shift);

      // shift 데이터 안전하게 파싱
      let parsedShiftData;

      if (user.shift && user.shift.trim() !== '') {
        try {
          console.log('=== parseShiftData 시작 ===');
          // 압축된 데이터인지 확인하고 복원
          if (
            user.shift.length <= 100 &&
            (user.shift.includes('"s":') || user.shift.includes('"d":'))
          ) {
            console.log('압축된 shift 데이터 감지, 복원 시도');
            parsedShiftData = decompressShiftData(user.shift);
          } else {
            parsedShiftData = parseShiftData(user.shift);
          }
          console.log('✅ 파싱 성공 - parsedShiftData:', parsedShiftData);

          // 파싱된 데이터 검증
          if (
            parsedShiftData &&
            parsedShiftData.schedules &&
            Array.isArray(parsedShiftData.schedules)
          ) {
            console.log('✅ 파싱된 데이터 구조 검증 통과');
            parsedShiftData.schedules.forEach((schedule, index) => {
              console.log(`📋 Schedule ${index}:`, schedule);
              console.log(`📋 Schedule ${index} days:`, schedule.days);
              console.log(`📋 Schedule ${index} days 타입:`, typeof schedule.days);
              console.log(`📋 Schedule ${index} days 길이:`, schedule.days?.length);
              console.log(`📋 Schedule ${index} days 내용:`, schedule.days);
            });
          } else {
            console.warn('⚠️ 파싱된 데이터 구조 검증 실패, 기본값 사용');
            throw new Error('Invalid data structure');
          }
        } catch (error) {
          console.error('❌ shift 데이터 파싱 실패:', error);
          console.error('원본 user.shift:', user.shift);
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
        console.log('ℹ️ shift 데이터 없음, 기본값 사용');
        parsedShiftData = {
          schedules: [
            {
              days: [],
              time: { start: '09:00', end: '17:00' },
            },
          ],
        };
      }

      console.log('최종 사용할 parsedShiftData:', parsedShiftData);

      setFormData(prev => {
        const newFormData = {
          ...prev,
          name: user.name || '',
          email: user.email || '',
          phone: user.phone || '',
          gender: user.gender || '',
          nickname: user.nickname || '',
          position_id: user.position_id || '',
          team_id: user.team_id || '',
          center_id: user.center_id || '',
          join_date: user.join_date || '',
          status: user.status || 'active',
          leave_date: user.leave_date || '',
          license: user.license || '',
          experience: user.experience || '',
          education: user.education || '',
          instagram: user.instagram || '',
          shiftData: parsedShiftData,
        };

        console.log('✅ setFormData 호출 - 새로운 formData:', newFormData);
        console.log('✅ 새로운 formData.shiftData:', newFormData.shiftData);
        return newFormData;
      });

      if (user.profile_image_url) {
        const imageUrl = user.profile_image_url.startsWith('http')
          ? user.profile_image_url
          : `http://localhost:3001${user.profile_image_url}`;
        setPreviewImage(imageUrl);
      } else {
        setPreviewImage('');
      }
      setLoading(false);
      console.log('=== 사용자 데이터 로드 완료 ===');
    }
  }, [user]);

  // shiftData 상태 모니터링 (디버깅용)
  useEffect(() => {
    console.log('=== 📊 shiftData 상태 변경 감지 ===');
    console.log('현재 formData.shiftData:', formData.shiftData);
    console.log('formData.shiftData 타입:', typeof formData.shiftData);
    console.log('formData.shiftData.schedules:', formData.shiftData?.schedules);
    console.log('formData.shiftData.schedules 타입:', typeof formData.shiftData?.schedules);
    console.log('formData.shiftData.schedules 길이:', formData.shiftData?.schedules?.length);

    if (formData.shiftData?.schedules && Array.isArray(formData.shiftData.schedules)) {
      console.log('✅ schedules 배열 검증 통과');
      formData.shiftData.schedules.forEach((schedule, index) => {
        console.log(`📋 Schedule ${index}:`, schedule);
        console.log(`📋 Schedule ${index} days:`, schedule.days);
        console.log(`📋 Schedule ${index} days 타입:`, typeof schedule.days);
        console.log(`📋 Schedule ${index} days 길이:`, schedule.days?.length);
        console.log(`📋 Schedule ${index} days 내용: [${schedule.days?.join(', ') || ''}]`);

        // days 배열의 각 요소 확인
        if (schedule.days && Array.isArray(schedule.days)) {
          schedule.days.forEach((day, dayIndex) => {
            console.log(`  📅 Day ${dayIndex}: ${day} (타입: ${typeof day})`);
          });
        } else {
          console.warn(`  ⚠️ Schedule ${index}의 days가 유효하지 않음:`, schedule.days);
        }
      });
    } else {
      console.warn('⚠️ schedules 배열이 유효하지 않음');
      console.warn('formData.shiftData:', formData.shiftData);
      console.warn('formData.shiftData.schedules:', formData.shiftData?.schedules);
    }
    console.log('=== 📊 shiftData 상태 변경 감지 완료 ===');
  }, [formData.shiftData]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setTeamsLoading(true);
        const teamsRes = await teamAPI.getAllTeams();
        setTeams(teamsRes.data?.teams || teamsRes.teams || []);

        setCentersLoading(true);
        const centersRes = await centerAPI.getAllCenters();
        setCenters(centersRes.data?.centers || centersRes.centers || []);

        setPositionsLoading(true);
        try {
          const positionsRes = await axios.get('http://localhost:3001/api/positions');
          setPositions(positionsRes.data.data || positionsRes.data || []);
        } catch (err) {
          console.error('직책 목록 불러오기 실패:', err);
          setPositions([]);
        }
      } catch (err) {
        console.error('데이터 불러오기 실패:', err);
      } finally {
        setTeamsLoading(false);
        setCentersLoading(false);
        setPositionsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleInputChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = () => setIsPasswordModalOpen(true);
  const handlePasswordModalClose = () => {
    setIsPasswordModalOpen(false);
  };

  const handlePhotoClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handlePhotoChange = async e => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['.jpg', '.jpeg', '.png'];
    const maxSize = 5 * 1024 * 1024;
    const fileExtension = `.${file.name.split('.').pop().toLowerCase()}`;

    if (!allowedTypes.includes(fileExtension)) {
      alert('허용되지 않는 파일 형식입니다. JPG, JPEG, PNG 파일만 업로드 가능합니다.');
      return;
    }

    if (file.size > maxSize) {
      alert('파일 크기가 너무 큽니다. 최대 5MB까지 업로드 가능합니다.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewImage(reader.result);
    };
    reader.readAsDataURL(file);

    const formDataObj = new FormData();
    formDataObj.append('profile_image_url', file);

    try {
      setUploadProgress(0);
      await userAPI.uploadProfileImage(user.id, formDataObj, progressEvent => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        setUploadProgress(percentCompleted);
      });
      if (refreshUserInfo && typeof refreshUserInfo === 'function') {
        refreshUserInfo();
      }
      alert('프로필 이미지가 업로드되었습니다.');
    } catch (error) {
      console.error('사진 업로드 실패:', error);
      alert(`이미지 업로드에 실패했습니다: ${error.response?.data?.message || error.message}`);
    } finally {
      setUploadProgress(0);
    }
  };

  // 요일 체크박스 변경 핸들러
  const handleDayChange = (scheduleIndex, day) => {
    console.log('=== 🎯 요일 변경 시작 ===');
    console.log('변경할 스케줄 인덱스:', scheduleIndex);
    console.log('변경할 요일:', day);
    console.log('현재 formData.shiftData:', formData.shiftData);
    console.log('현재 formData.shiftData.schedules:', formData.shiftData?.schedules);

    setFormData(prev => {
      console.log('🔄 setFormData 콜백 시작');
      console.log('이전 formData.shiftData:', prev.shiftData);
      console.log('이전 formData.shiftData.schedules:', prev.shiftData?.schedules);

      // 완전한 Deep Copy로 불변성 보장
      const newFormData = { ...prev };
      const newShiftData = { ...newFormData.shiftData };
      const newSchedules = [...newShiftData.schedules];
      const newSchedule = { ...newSchedules[scheduleIndex] };

      console.log('📋 변경 전 schedule:', newSchedule);
      console.log('📋 변경 전 schedule.days:', newSchedule.days);
      console.log('📋 변경 전 schedule.days 타입:', typeof newSchedule.days);
      console.log('📋 변경 전 schedule.days 길이:', newSchedule.days?.length);
      console.log('📋 변경 전 schedule.days 내용:', newSchedule.days);

      // days 배열이 없거나 undefined인 경우 빈 배열로 초기화
      if (!newSchedule.days || !Array.isArray(newSchedule.days)) {
        console.warn('⚠️ schedule.days가 유효하지 않음, 빈 배열로 초기화');
        newSchedule.days = [];
      }

      let newDays;
      if (newSchedule.days.includes(day)) {
        newDays = newSchedule.days.filter(d => d !== day);
        console.log('🗑️ 요일 제거:', day);
        console.log('🗑️ 제거 후 days:', newDays);
      } else {
        newDays = [...newSchedule.days, day];
        console.log('➕ 요일 추가:', day);
        console.log('➕ 추가 후 days:', newDays);
      }

      // 새로운 days 배열로 schedule 업데이트
      newSchedule.days = newDays;

      console.log('✅ 변경 후 schedule.days:', newSchedule.days);
      console.log('✅ 변경 후 schedule.days 타입:', typeof newSchedule.days);
      console.log('✅ 변경 후 schedule.days 길이:', newSchedule.days?.length);
      console.log('✅ 변경 후 schedule.days 내용:', newSchedule.days);

      // schedules 배열 업데이트
      newSchedules[scheduleIndex] = newSchedule;
      newShiftData.schedules = newSchedules;
      newFormData.shiftData = newShiftData;

      console.log('✅ 최종 변경된 schedule:', newSchedule);
      console.log('✅ 최종 전체 shiftData:', newShiftData);
      console.log('✅ 최종 newFormData.shiftData:', newFormData.shiftData);
      console.log('=== 🎯 요일 변경 완료 ===');

      return newFormData;
    });
  };

  // 시간 변경 핸들러
  const handleTimeChange = (scheduleIndex, timeType, value) => {
    console.log('시간 변경:', scheduleIndex, timeType, value);
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

      console.log('변경된 시간:', newTime);
      console.log('전체 shiftData:', newShiftData);
      return newFormData;
    });
  };

  // 근무 일정 추가
  const addSchedule = () => {
    console.log('근무 일정 추가');
    setFormData(prev => {
      const newFormData = { ...prev };
      const newShiftData = { ...newFormData.shiftData };
      const newSchedules = [...newShiftData.schedules];

      newSchedules.push({ days: [], time: { start: '09:00', end: '17:00' } });
      newShiftData.schedules = newSchedules;
      newFormData.shiftData = newShiftData;

      console.log('추가된 schedules:', newSchedules);
      return newFormData;
    });
  };

  // 근무 일정 삭제
  const removeSchedule = index => {
    console.log('근무 일정 삭제:', index);
    setFormData(prev => {
      if (prev.shiftData.schedules.length > 1) {
        const newFormData = { ...prev };
        const newShiftData = { ...newFormData.shiftData };
        const newSchedules = newShiftData.schedules.filter((_, i) => i !== index);

        newShiftData.schedules = newSchedules;
        newFormData.shiftData = newShiftData;

        console.log('삭제 후 schedules:', newSchedules);
        return newFormData;
      }
      return prev;
    });
  };

  const handleSave = async () => {
    try {
      console.log('=== 💾 저장 시작 ===');
      console.log('현재 formData:', formData);
      console.log('현재 formData.shiftData:', formData.shiftData);
      console.log('formData.shiftData 타입:', typeof formData.shiftData);
      console.log('formData.shiftData.schedules:', formData.shiftData?.schedules);
      console.log('formData.shiftData.schedules 타입:', typeof formData.shiftData?.schedules);
      console.log('formData.shiftData.schedules 길이:', formData.shiftData?.schedules?.length);

      // shiftData 구조 검증
      if (
        !formData.shiftData ||
        !formData.shiftData.schedules ||
        !Array.isArray(formData.shiftData.schedules)
      ) {
        console.error('❌ shiftData 구조가 유효하지 않음');
        throw new Error('Invalid shiftData structure');
      }

      // 각 schedule의 days 배열 검증
      formData.shiftData.schedules.forEach((schedule, index) => {
        if (!schedule.days || !Array.isArray(schedule.days)) {
          console.error(`❌ Schedule ${index}의 days가 유효하지 않음:`, schedule.days);
          throw new Error(`Invalid days array in schedule ${index}`);
        }
        console.log(`✅ Schedule ${index} 검증 통과 - days:`, schedule.days);
      });

      const cleanFormData = Object.fromEntries(
        Object.entries(formData).filter(([key, value]) => {
          // shiftData는 별도로 처리하므로 제외
          if (key === 'shiftData') return false;
          // gender는 빈 문자열도 허용
          if (key === 'gender') return true;
          return value !== '' && value !== null && value !== undefined;
        })
      );

      // gender 필드 확인
      console.log('🔍 gender 필드 확인:', {
        originalGender: formData.gender,
        cleanFormDataGender: cleanFormData.gender,
        cleanFormDataKeys: Object.keys(cleanFormData),
      });

      // shift 데이터를 압축하여 100자 이내로 맞추기
      console.log('🔄 shiftData 압축 시작...');
      console.log('압축할 shiftData:', formData.shiftData);
      const compressedShift = compressShiftData(formData.shiftData);
      cleanFormData.shift = compressedShift;

      console.log('=== 📤 전송 데이터 ===');
      console.log('cleanFormData:', cleanFormData);
      console.log('압축된 shift:', compressedShift);
      console.log('압축된 shift 길이:', compressedShift.length);
      console.log('압축된 shift 파싱 테스트:', JSON.parse(compressedShift));

      console.log('🚀 서버 요청 시작...');

      // userAPI.updateMyAccount 사용 (API 인터셉터 거침)
      const response = await userAPI.updateMyAccount(cleanFormData);

      console.log('=== ✅ 서버 응답 ===');
      console.log('응답 데이터:', response);

      // 저장 성공 후 formData를 즉시 업데이트
      if (response.user) {
        console.log('🔄 formData 즉시 업데이트 시작');
        setFormData(prev => {
          const updatedFormData = {
            ...prev,
            name: response.user.name || prev.name,
            email: response.user.email || prev.email,
            phone: response.user.phone || prev.phone,
            gender: response.user.gender || prev.gender,
            nickname: response.user.nickname || prev.nickname,
            position_id: response.user.position_id || prev.position_id,
            team_id: response.user.team_id || prev.team_id,
            center_id: response.user.center_id || prev.center_id,
            join_date: response.user.join_date || prev.join_date,
            status: response.user.status || prev.status,
            leave_date: response.user.leave_date || prev.leave_date,
            license: response.user.license || prev.license,
            experience: response.user.experience || prev.experience,
            education: response.user.education || prev.education,
            instagram: response.user.instagram || prev.instagram,
            shiftData: response.user.shift ? parseShiftData(response.user.shift) : prev.shiftData,
          };
          console.log('✅ formData 업데이트 완료:', updatedFormData);
          return updatedFormData;
        });
      }

      alert('정보가 업데이트되었습니다.');

      // 저장 후 최신 사용자 정보 재호출 (화면 갱신용)
      if (refreshUserInfo && typeof refreshUserInfo === 'function') {
        console.log('🔄 refreshUserInfo 호출 시작');
        try {
          await refreshUserInfo();
          console.log('✅ refreshUserInfo 호출 완료');
        } catch (error) {
          console.error('❌ refreshUserInfo 호출 실패:', error);
        }
      }

      console.log('=== 💾 저장 완료 ===');
    } catch (err) {
      console.error('=== ❌ 업데이트 실패 ===');
      console.error('에러 객체:', err);
      console.error('에러 메시지:', err.message);
      console.error('응답 데이터:', err.response?.data);
      console.error('응답 상태:', err.response?.status);
      console.error('요청 데이터:', err.config?.data);

      // 더 자세한 에러 메시지 표시
      let errorMessage = '업데이트에 실패했습니다.';
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }

      alert(`업데이트 실패: ${errorMessage}`);
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
    <div className="min-h-screen bg-white flex flex-col md:flex-row p-8 gap-8">
      {/* 왼쪽 패널 */}
      <section className="w-full md:w-80 flex flex-col items-center gap-6">
        <div
          className="relative w-44 h-44 rounded-full outline outline-1 outline-gray-200 overflow-hidden cursor-pointer"
          onClick={handlePhotoClick}
        >
          {previewImage ? (
            <img src={previewImage} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <div className="flex items-center justify-center w-full h-full bg-zinc-100 text-6xl font-bold text-gray-400">
              {formData.name ? formData.name.charAt(0).toUpperCase() : 'U'}
            </div>
          )}
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            onChange={handlePhotoChange}
            accept=".jpg,.jpeg,.png"
          />
          {uploadProgress > 0 && uploadProgress < 100 && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="text-white text-sm">{uploadProgress}%</div>
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={handlePhotoClick}
          className="text-cyan-600 hover:text-cyan-800 font-semibold"
        >
          Upload photo
        </button>

        <button
          type="button"
          onClick={handleSave}
          className="w-full mb-3 bg-blue-400 text-white py-3 rounded-lg font-semibold hover:bg-blue-500 transition"
        >
          저장
        </button>

        <button
          type="button"
          onClick={handlePasswordChange}
          className="w-full bg-gradient-to-br from-cyan-500 to-indigo-800 text-white py-3 rounded-lg font-semibold hover:opacity-90 transition"
        >
          비밀번호 변경
        </button>

        <button
          type="button"
          onClick={() => setIsDeactivationModalOpen(true)}
          className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition"
        >
          회원 탈퇴
        </button>
      </section>

      {/* 오른쪽 폼 */}
      <section className="flex-1 overflow-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* name */}
          <input
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="이름"
            className="p-3 border rounded"
          />

          {/* email - disabled */}
          <input
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="이메일"
            className="p-3 border rounded bg-gray-100 cursor-not-allowed"
            disabled
          />

          {/* nickname */}
          <input
            name="nickname"
            value={formData.nickname}
            onChange={handleInputChange}
            placeholder="닉네임"
            className="p-3 border rounded"
          />

          {/* phone */}
          <input
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            placeholder="전화번호"
            className="p-3 border rounded"
          />

          {/* shift - 근무 일정 섹션 */}
          <div className="col-span-2">
            <h3 className="text-lg font-semibold mb-4 text-gray-700">근무 일정</h3>
            <div className="space-y-4">
              {formData.shiftData.schedules.map((schedule, scheduleIndex) => (
                <div key={scheduleIndex} className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-600">근무 일정 {scheduleIndex + 1}</h4>
                    {formData.shiftData.schedules.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeSchedule(scheduleIndex)}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        삭제
                      </button>
                    )}
                  </div>

                  {/* 요일 선택 */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      근무 요일
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {['월', '화', '수', '목', '금', '토', '일'].map(day => {
                        const isChecked = schedule.days.includes(day);
                        console.log(
                          `🔍 [${scheduleIndex}] 요일 ${day} 체크박스 렌더링:`,
                          `isChecked: ${isChecked}`,
                          `schedule.days: [${schedule.days?.join(', ') || ''}]`,
                          `schedule.days 타입: ${typeof schedule.days}`,
                          `schedule.days 길이: ${schedule.days?.length || 0}`,
                          `schedule.days.includes(${day}): ${schedule.days?.includes(day) || false}`,
                          `전체 schedule:`,
                          schedule
                        );
                        return (
                          <label key={day} className="flex items-center">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handleDayChange(scheduleIndex, day)}
                              className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span
                              className={`text-sm ${isChecked ? 'text-blue-600 font-medium' : 'text-gray-700'}`}
                            >
                              {day}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* 시간 선택 */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        시작 시간
                      </label>
                      <input
                        type="time"
                        value={schedule.time.start}
                        onChange={e => handleTimeChange(scheduleIndex, 'start', e.target.value)}
                        className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        종료 시간
                      </label>
                      <input
                        type="time"
                        value={schedule.time.end}
                        onChange={e => handleTimeChange(scheduleIndex, 'end', e.target.value)}
                        className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>
              ))}

              {/* 근무 일정 추가 버튼 */}
              <button
                type="button"
                onClick={addSchedule}
                className="w-full py-2 px-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-colors"
              >
                + 근무 일정 추가
              </button>
            </div>
          </div>

          {/* gender */}
          <select
            name="gender"
            value={formData.gender}
            onChange={handleInputChange}
            className="p-3 border rounded"
          >
            <option value="">성별 미지정</option>
            <option value="male">남성</option>
            <option value="female">여성</option>
          </select>

          {/* status - readOnly */}
          <input
            name="status"
            value={formData.status}
            readOnly
            className="p-3 border rounded bg-gray-200 text-gray-700 cursor-not-allowed"
          />

          {/* position_id */}
          <select
            name="position_id"
            value={formData.position_id}
            onChange={handleInputChange}
            className="p-3 border rounded"
          >
            <option value="">직책 선택</option>
            {positionsLoading ? (
              <option value="" disabled>
                직책 목록 로딩 중...
              </option>
            ) : (
              positions.map(position => (
                <option key={position.id} value={position.id}>
                  {position.name}
                </option>
              ))
            )}
          </select>

          {/* team_id */}
          <select
            name="team_id"
            value={formData.team_id}
            onChange={handleInputChange}
            className="p-3 border rounded"
            disabled={teamsLoading}
          >
            <option value="">팀 없음</option>
            {teamsLoading ? (
              <option value="" disabled>
                팀 목록 로딩 중...
              </option>
            ) : (
              teams.map(team => (
                <option key={team.id} value={team.id}>
                  {team.name}
                </option>
              ))
            )}
          </select>

          {/* center_id */}
          <select
            name="center_id"
            value={formData.center_id}
            onChange={handleInputChange}
            className="p-3 border rounded"
          >
            <option value="">센터 선택</option>
            {centersLoading ? (
              <option value="" disabled>
                센터 목록 로딩 중...
              </option>
            ) : (
              centers.map(center => (
                <option key={center.id} value={center.id}>
                  {center.name}
                </option>
              ))
            )}
          </select>

          {/* license */}
          <input
            name="license"
            value={formData.license}
            onChange={handleInputChange}
            placeholder="자격증"
            className="p-3 border rounded"
          />

          {/* experience */}
          <textarea
            name="experience"
            value={formData.experience}
            onChange={handleInputChange}
            placeholder="경력"
            className="p-3 border rounded resize-none"
            rows="3"
          />

          {/* education */}
          <input
            name="education"
            value={formData.education}
            onChange={handleInputChange}
            placeholder="학력"
            className="p-3 border rounded"
          />

          {/* instagram */}
          <input
            name="instagram"
            value={formData.instagram}
            onChange={handleInputChange}
            placeholder="인스타그램"
            className="p-3 border rounded"
          />
        </div>
        <div className="grid grid-cols-2 gap-4 mt-6">
          <div className="relative">
            <input
              type="date"
              name="join_date"
              value={formData.join_date}
              onChange={handleInputChange}
              className="p-3 pt-7 border rounded w-full"
            />
            {!formData.join_date && (
              <span className="absolute left-3 top-1 text-gray-400 text-sm pointer-events-none select-none">
                고용 날짜 선택
              </span>
            )}
          </div>

          <div className="relative">
            <input
              type="date"
              name="leave_date"
              value={formData.leave_date}
              onChange={handleInputChange}
              className="p-3 pt-7 border rounded w-full"
            />
            {!formData.leave_date && (
              <span className="absolute left-3 top-1 text-gray-400 text-sm pointer-events-none select-none">
                퇴직 날짜 선택
              </span>
            )}
          </div>
        </div>
      </section>

      <PasswordResetModal isOpen={isPasswordModalOpen} onClose={handlePasswordModalClose} />
      <DeactivationModal
        isOpen={isDeactivationModalOpen}
        onClose={() => setIsDeactivationModalOpen(false)}
        onDeactivationSuccess={() => alert('계정이 삭제되었습니다.')}
      />
    </div>
  );
};

export default AccountPage;
