import React, { useState, useEffect, useRef, useCallback, memo, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import AuthService from '../utils/auth';
import { userAPI } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import PasswordResetModal from '../components/PasswordResetModal';
import DeactivationModal from '../components/DeactivationModal';
import ImageExpandModal from '../components/ImageExpandModal';
import WebcamCapture from '../components/WebcamCapture';
import { teamAPI, centerAPI } from '../utils/api';

const AccountPage = () => {
  const { user, refreshUserInfo, forceLogout } = useAuth();
  const navigate = useNavigate();
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

  // 이미지 확대 모달 상태
  const [imageModal, setImageModal] = useState({
    isOpen: false,
    imageUrl: '',
    imageName: '',
    title: '',
  });

  // 웹캠 모달 상태
  const [showWebcam, setShowWebcam] = useState(false);

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
    // 자격증, 경력, 학력, 인스타그램 관련 이미지와 내용을 위한 상태 추가
    licenseData: {
      images: [],
      content: '',
    },
    experienceData: {
      images: [],
      content: '',
    },
    educationData: {
      images: [],
      content: '',
    },
    instagramData: {
      images: [],
      content: '',
    },
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

  // 자격증, 경력, 학력, 인스타그램 데이터 파싱 함수
  const parseAdditionalData = (dataString, fieldName) => {
    if (!dataString || dataString.trim() === '') {
      return { images: [], content: '' };
    }

    try {
      const parsed = JSON.parse(dataString);
      if (parsed && typeof parsed === 'object') {
        return {
          images: Array.isArray(parsed.images) ? parsed.images : [],
          content: parsed.content || '',
        };
      }
    } catch (error) {
      console.error(`${fieldName} 데이터 파싱 실패:`, error);
    }

    return { images: [], content: '' };
  };

  // 분할된 데이터를 복원하는 함수
  const parseAdditionalDataFromParts = (user, fieldName) => {
    try {
      // 메인 필드에서 데이터 확인
      if (user[fieldName]) {
        try {
          return parseAdditionalData(user[fieldName], fieldName);
        } catch (error) {
          // 메인 필드 파싱 실패, 분할 데이터 확인
        }
      }

      // 분할된 데이터 조각들을 찾아서 합치기
      const parts = [];
      let partIndex = 0;

      while (user[`${fieldName}_part_${partIndex}`]) {
        parts.push(user[`${fieldName}_part_${partIndex}`]);
        partIndex++;
      }

      if (parts.length > 0) {
        // 모든 조각을 합쳐서 완전한 JSON 문자열 생성
        const completeData = parts.join('');
        return parseAdditionalData(completeData, fieldName);
      }

      // 분할 데이터도 없으면 빈 객체 반환
      return { images: [], content: '' };
    } catch (error) {
      console.error(`${fieldName} 분할 데이터 복원 실패:`, error);
      return { images: [], content: '' };
    }
  };

  // 자격증, 경력, 학력, 인스타그램 데이터 직렬화 함수
  const serializeAdditionalData = data => {
    return JSON.stringify(data);
  };

  // 긴 데이터를 여러 조각으로 분할하는 함수
  const splitLongData = (data, chunkSize) => {
    const chunks = [];
    for (let i = 0; i < data.length; i += chunkSize) {
      chunks.push(data.slice(i, i + chunkSize));
    }
    return chunks;
  };

  useEffect(() => {
    if (user) {
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

          // 파싱된 데이터 검증
          if (
            parsedShiftData &&
            parsedShiftData.schedules &&
            Array.isArray(parsedShiftData.schedules)
          ) {
            // 데이터가 유효함 - 추가 검증 로직이 필요하면 여기에 작성
          } else {
            throw new Error('Invalid data structure');
          }
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
          join_date: user.join_date || undefined,
          status: user.status || 'active',
          leave_date: user.leave_date || undefined,
          license: user.license || '',
          experience: user.experience || '',
          education: user.education || '',
          instagram: user.instagram || '',
          // 추가 데이터 파싱
          licenseData: parseAdditionalData(user.license, 'license'),
          experienceData: parseAdditionalData(user.experience, 'experience'),
          educationData: parseAdditionalData(user.education, 'education'),
          instagramData: parseAdditionalData(user.instagram, 'instagram'),
          shiftData: parsedShiftData,
        };

        return newFormData;
      });

      if (user.profile_image_url) {
        const imageUrl = user.profile_image_url.startsWith('http')
          ? user.profile_image_url
          : `http://localhost:3001${user.profile_image_url}`;
        setPreviewImage(imageUrl);
      } else {
        // 기본 프로필 이미지 설정
        setPreviewImage('/profileDefault.png');
      }
      setLoading(false);
    }
  }, [user]);

  // shiftData 상태 모니터링 (디버깅용) - 무한 루프 방지를 위해 제거
  // useEffect(() => {
  //   console.log('=== 📊 shiftData 상태 변경 감지 ===');
  //   console.log('현재 formData.shiftData:', formData.shiftData);
  //   console.log('formData.shiftData 타입:', typeof formData.shiftData);
  //   console.log('formData.shiftData.schedules:', formData.shiftData?.schedules);
  //   console.log('formData.shiftData.schedules 타입:', typeof formData.shiftData?.schedules);
  //   console.log('formData.shiftData.schedules 길이:', formData.shiftData?.schedules?.length);

  //   if (formData.shiftData?.schedules && Array.isArray(formData.shiftData.schedules)) {
  //     console.log('✅ schedules 배열 검증 통과');
  //     formData.shiftData.schedules.forEach((schedule, index) => {
  //       console.log(`📋 Schedule ${index}:`, schedule);
  //       console.log(`📋 Schedule ${index} days:`, schedule.days);
  //       console.log(`📋 Schedule ${index} days 타입:`, typeof schedule.days);
  //       console.log(`📋 Schedule ${index} days 길이:`, schedule.days?.length);
  //       console.log(`📋 Schedule ${index} days 내용: [${schedule.days?.join(', ') || ''}]`);

  //       // days 배열의 각 요소 확인
  //       if (schedule.days && Array.isArray(schedule.days)) {
  //         schedule.days.forEach((day, dayIndex) => {
  //           console.log(`  📅 Day ${dayIndex}: ${day} (타입: ${typeof day})`);
  //         });
  //       } else {
  //         console.warn(`  ⚠️ Schedule ${index}의 days가 유효하지 않음:`, schedule.days);
  //       }
  //     });
  //   } else {
  //     console.warn('⚠️ schedules 배열이 유효하지 않음');
  //     console.warn('formData.shiftData:', formData.shiftData);
  //     console.warn('formData.shiftData.schedules:', formData.shiftData?.schedules);
  //   }
  //   console.log('=== 📊 shiftData 상태 변경 감지 완료 ===');
  // }, [formData.shiftData]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setTeamsLoading(true);
        const teamsRes = await teamAPI.getAllTeams();
        const teamsData = teamsRes.data?.teams || teamsRes.teams || [];

        // 팀 중복 체크 및 제거
        const teamNames = teamsData.map(t => t.name);
        const uniqueTeamNames = [...new Set(teamNames)];

        if (teamNames.length !== uniqueTeamNames.length) {
          // 중복 제거: name 기준으로 고유한 팀만 필터링
          const uniqueTeams = [];
          const seenTeamNames = new Set();

          teamsData.forEach(team => {
            if (!seenTeamNames.has(team.name)) {
              seenTeamNames.add(team.name);
              uniqueTeams.push(team);
            }
          });

          setTeams(uniqueTeams);
        } else {
          setTeams(teamsData);
        }

        setCentersLoading(true);
        // 회원가입용 센터 API 사용 (중복 없는 깔끔한 데이터)
        const centersRes = await axios.get('http://localhost:3001/api/users/centers');

        const centersData = centersRes.data?.data || [];

        // 중복 체크 (회원가입용 API는 이미 중복이 제거되어 있음)
        const centerNames = centersData.map(c => c.name);
        const uniqueNames = [...new Set(centerNames)];

        if (centerNames.length !== uniqueNames.length) {
          // 중복 제거: name 기준으로 고유한 센터만 필터링
          const uniqueCenters = [];
          const seenNames = new Set();

          centersData.forEach(center => {
            if (!seenNames.has(center.name)) {
              seenNames.add(center.name);
              uniqueCenters.push(center);
            }
          });

          setCenters(uniqueCenters);
        } else {
          setCenters(centersData);
        }

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

    // 날짜 필드에서 빈 값일 때 undefined 사용
    if ((name === 'join_date' || name === 'leave_date') && value === '') {
      setFormData(prev => ({ ...prev, [name]: undefined }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
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
      toast.error('허용되지 않는 파일 형식입니다. JPG, JPEG, PNG 파일만 업로드 가능합니다.');
      return;
    }

    if (file.size > maxSize) {
      toast.error('파일 크기가 너무 큽니다. 최대 5MB까지 업로드 가능합니다.');
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
      toast.success('프로필 이미지가 업로드되었습니다.');
    } catch (error) {
      console.error('사진 업로드 실패:', error);
      toast.error(
        `이미지 업로드에 실패했습니다: ${error.response?.data?.message || error.message}`
      );
    } finally {
      setUploadProgress(0);
    }
  };

  // 웹캠으로 촬영한 이미지 처리
  const handleWebcamCapture = async file => {
    // 파일 검증
    const allowedTypes = ['.jpg', '.jpeg', '.png'];
    const maxSize = 5 * 1024 * 1024;
    const fileExtension = `.${file.name.split('.').pop().toLowerCase()}`;

    if (!allowedTypes.includes(fileExtension)) {
      toast.error('허용되지 않는 파일 형식입니다. JPG, JPEG, PNG 파일만 업로드 가능합니다.');
      return;
    }

    if (file.size > maxSize) {
      toast.error('파일 크기가 너무 큽니다. 최대 5MB까지 업로드 가능합니다.');
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
      toast.success('웹캠으로 촬영한 프로필 이미지가 업로드되었습니다.');
    } catch (error) {
      console.error('웹캠 이미지 업로드 실패:', error);
      toast.error(
        `이미지 업로드에 실패했습니다: ${error.response?.data?.message || error.message}`
      );
    } finally {
      setUploadProgress(0);
    }
  };

  // 프로필 이미지 삭제
  const handlePhotoDelete = async () => {
    try {
      await userAPI.deleteProfileImage();
      setPreviewImage('/profileDefault.png');
      toast.success('프로필 이미지가 삭제되었습니다.');
      if (refreshUserInfo && typeof refreshUserInfo === 'function') {
        refreshUserInfo();
      }
    } catch (error) {
      console.error('프로필 이미지 삭제 실패:', error);
      toast.error(
        `프로필 이미지 삭제에 실패했습니다: ${error.response?.data?.message || error.message}`
      );
    }
  };

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

  // 자격증, 경력, 학력, 인스타그램 이미지 업로드 핸들러
  const handleAdditionalImageUpload = async (fieldName, file) => {
    const allowedTypes = ['.jpg', '.jpeg', '.png'];
    const maxSize = 10 * 1024 * 1024; // 10MB
    const fileExtension = `.${file.name.split('.').pop().toLowerCase()}`;

    if (!allowedTypes.includes(fileExtension)) {
      toast.error('허용되지 않는 파일 형식입니다. JPG, JPEG, PNG 파일만 업로드 가능합니다.');
      return;
    }

    if (file.size > maxSize) {
      toast.error('파일 크기가 너무 큽니다. 최대 10MB까지 업로드 가능합니다.');
      return;
    }

    try {
      // FormData 생성
      const formData = new FormData();
      formData.append('image', file);
      formData.append('field', fieldName);

      // 서버에 업로드
      const response = await fetch('/api/users/upload-additional-image', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${AuthService.getAccessToken()}`,
        },
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        // 업로드 성공 시 상태 업데이트
        setFormData(prev => ({
          ...prev,
          [`${fieldName}Data`]: {
            ...prev[`${fieldName}Data`],
            images: [
              ...prev[`${fieldName}Data`].images,
              {
                name: file.name,
                url: result.imageUrl, // 서버에서 받은 URL
                size: file.size,
                type: file.type,
              },
            ],
          },
        }));
        toast.success('이미지가 추가되었습니다.');
      } else {
        toast.error(result.message || '이미지 업로드에 실패했습니다.');
      }
    } catch (error) {
      console.error('이미지 업로드 실패:', error);
      toast.error('이미지 추가에 실패했습니다.');
    }
  };

  // 자격증, 경력, 학력, 인스타그램 이미지 삭제 핸들러
  const handleAdditionalImageDelete = (fieldName, imageIndex) => {
    setFormData(prev => ({
      ...prev,
      [`${fieldName}Data`]: {
        ...prev[`${fieldName}Data`],
        images: prev[`${fieldName}Data`].images.filter((_, index) => index !== imageIndex),
      },
    }));
  };

  // 자격증, 경력, 학력, 인스타그램 내용 변경 핸들러
  const handleAdditionalContentChange = (fieldName, content) => {
    setFormData(prev => ({
      ...prev,
      [`${fieldName}Data`]: {
        ...prev[`${fieldName}Data`],
        content,
      },
    }));
  };

  // 이미지 확대 모달 열기
  const openImageModal = (imageUrl, imageName, title) => {
    setImageModal({
      isOpen: true,
      imageUrl,
      imageName,
      title,
    });
  };

  // 이미지 확대 모달 닫기
  const closeImageModal = () => {
    setImageModal({
      isOpen: false,
      imageUrl: '',
      imageName: '',
      title: '',
    });
  };

  // 인스타그램 링크 열기
  const openInstagramLink = url => {
    if (!url) {
      toast.error('인스타그램 URL이 입력되지 않았습니다.');
      return;
    }

    // URL 형식 검증 및 수정
    let instagramUrl = url.trim();
    if (!instagramUrl.startsWith('http://') && !instagramUrl.startsWith('https://')) {
      instagramUrl = 'https://' + instagramUrl;
    }

    // 인스타그램 도메인 확인
    if (!instagramUrl.includes('instagram.com')) {
      toast.error('올바른 인스타그램 URL을 입력해주세요.');
      return;
    }

    // 새 탭에서 링크 열기
    window.open(instagramUrl, '_blank', 'noopener,noreferrer');
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

      const cleanFormData = Object.fromEntries(
        Object.entries(formData).filter(([key, value]) => {
          // shiftData와 추가 데이터는 별도로 처리하므로 제외
          if (key === 'shiftData' || key.endsWith('Data')) return false;
          // gender는 빈 문자열도 허용
          if (key === 'gender') return true;
          // 날짜 필드는 빈 문자열도 허용 (삭제 가능)
          if (key === 'join_date' || key === 'leave_date') return true;
          return value !== '' && value !== null && value !== undefined;
        })
      );

      // 날짜 필드 처리: 빈 문자열이면 null로 변환
      if (cleanFormData.join_date === '') {
        cleanFormData.join_date = null;
      }
      if (cleanFormData.leave_date === '') {
        cleanFormData.leave_date = null;
      }

      // shift 데이터를 압축하여 100자 이내로 맞추기
      const compressedShift = compressShiftData(formData.shiftData);
      cleanFormData.shift = compressedShift;

      // 추가 데이터를 JSON 형태로 변환하여 저장 (URL 기반)
      const licenseData = serializeAdditionalData(formData.licenseData);
      const experienceData = serializeAdditionalData(formData.experienceData);
      const educationData = serializeAdditionalData(formData.educationData);
      const instagramData = serializeAdditionalData(formData.instagramData);

      cleanFormData.license = licenseData;
      cleanFormData.experience = experienceData;
      cleanFormData.education = educationData;
      cleanFormData.instagram = instagramData;

      // userAPI.updateMyAccount 사용 (API 인터셉터 거침)
      const response = await userAPI.updateMyAccount(cleanFormData);

      // 저장 성공 후 formData를 즉시 업데이트
      if (response.user) {
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
            // 추가 데이터 업데이트 - 분할된 데이터를 올바르게 복원
            licenseData: response.user.license
              ? parseAdditionalDataFromParts(response.user, 'license')
              : prev.licenseData,
            experienceData: response.user.experience
              ? parseAdditionalDataFromParts(response.user, 'experience')
              : prev.experienceData,
            educationData: response.user.education
              ? parseAdditionalDataFromParts(response.user, 'education')
              : prev.educationData,
            instagramData: response.user.instagram
              ? parseAdditionalDataFromParts(response.user, 'instagram')
              : prev.instagramData,
            shiftData: response.user.shift ? parseShiftData(response.user.shift) : prev.shiftData,
          };
          return updatedFormData;
        });

        // 프로필 이미지도 업데이트
        if (response.user.profile_image_url) {
          const imageUrl = response.user.profile_image_url.startsWith('http')
            ? response.user.profile_image_url
            : `http://localhost:3001${response.user.profile_image_url}`;
          setPreviewImage(imageUrl);
        } else {
          setPreviewImage('/profileDefault.png');
        }
      }

      toast.success('정보가 업데이트되었습니다.');

      // 저장 후 최신 사용자 정보 재호출 (화면 갱신용)
      if (refreshUserInfo && typeof refreshUserInfo === 'function') {
        try {
          await refreshUserInfo();
        } catch (error) {
          console.error('❌ refreshUserInfo 호출 실패:', error);
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

  // 자격증, 경력, 학력, 인스타그램 섹션 컴포넌트
  const AdditionalInfoSection = memo(
    ({
      title,
      fieldName,
      data,
      onImageUpload,
      onImageDelete,
      onContentChange,
      onImageExpand,
      onInstagramLink,
    }) => {
      const fileInputRef = useRef(null);
      const [localLines, setLocalLines] = useState(['']);
      const [isInitialized, setIsInitialized] = useState(false);
      const debounceTimeoutRef = useRef(null);
      const inputRefs = useRef([]);
      const lastContentRef = useRef('');
      const localLinesRef = useRef(['']);

      // data.content를 메모이제이션하여 불필요한 리렌더링 방지
      const memoizedContent = useMemo(() => data.content, [data.content]);

      // 초기 로딩 시에만 localLines 동기화 (사용자 입력 중단 방지)
      useEffect(() => {
        if (!isInitialized && memoizedContent && memoizedContent !== lastContentRef.current) {
          const lines = memoizedContent.split('\n');
          setLocalLines(lines);
          localLinesRef.current = lines;
          lastContentRef.current = memoizedContent;
          setIsInitialized(true);
        } else if (!isInitialized && !memoizedContent) {
          setLocalLines(['']);
          localLinesRef.current = [''];
          lastContentRef.current = '';
          setIsInitialized(true);
        }
      }, [memoizedContent, isInitialized]);

      // 컴포넌트 언마운트 시 타이머 정리
      useEffect(() => {
        return () => {
          if (debounceTimeoutRef.current) {
            clearTimeout(debounceTimeoutRef.current);
          }
        };
      }, []);

      const handleImageClick = useCallback(() => {
        if (fileInputRef.current) {
          fileInputRef.current.click();
        }
      }, []);

      const handleFileChange = useCallback(
        e => {
          const file = e.target.files?.[0];
          if (file) {
            onImageUpload(fieldName, file);
          }
        },
        [fieldName, onImageUpload]
      );

      const addContentLine = useCallback(() => {
        const newLines = [...localLinesRef.current, ''];
        setLocalLines(newLines);
        localLinesRef.current = newLines;

        // 다음 렌더링 후 새로 추가된 input에 포커스
        setTimeout(() => {
          if (inputRefs.current[newLines.length - 1]) {
            inputRefs.current[newLines.length - 1].focus();
          }
        }, 0);

        // 디바운싱 적용하여 부모 컴포넌트 상태 업데이트
        if (debounceTimeoutRef.current) {
          clearTimeout(debounceTimeoutRef.current);
        }
        debounceTimeoutRef.current = setTimeout(() => {
          onContentChange(fieldName, newLines.join('\n'));
        }, 300);
      }, [fieldName, onContentChange]);

      const removeContentLine = useCallback(
        index => {
          if (localLinesRef.current.length > 1) {
            const newLines = localLinesRef.current.filter((_, i) => i !== index);
            setLocalLines(newLines);
            localLinesRef.current = newLines;

            // 삭제 후 이전 input에 포커스 (가능한 경우)
            setTimeout(() => {
              const focusIndex = Math.min(index, newLines.length - 1);
              if (inputRefs.current[focusIndex]) {
                inputRefs.current[focusIndex].focus();
              }
            }, 0);

            // 디바운싱 적용하여 부모 컴포넌트 상태 업데이트
            if (debounceTimeoutRef.current) {
              clearTimeout(debounceTimeoutRef.current);
            }
            debounceTimeoutRef.current = setTimeout(() => {
              onContentChange(fieldName, newLines.join('\n'));
            }, 300);
          }
        },
        [fieldName, onContentChange]
      );

      const updateContentLine = useCallback(
        (index, value) => {
          const newLines = [...localLinesRef.current];
          newLines[index] = value;
          setLocalLines(newLines);
          localLinesRef.current = newLines;

          // 디바운싱 적용하여 부모 컴포넌트 상태 업데이트
          if (debounceTimeoutRef.current) {
            clearTimeout(debounceTimeoutRef.current);
          }
          debounceTimeoutRef.current = setTimeout(() => {
            onContentChange(fieldName, newLines.join('\n'));
          }, 300);
        },
        [fieldName, onContentChange]
      );

      // input refs 배열 초기화
      useEffect(() => {
        inputRefs.current = inputRefs.current.slice(0, localLines.length);
      }, [localLines.length]);

      return (
        <div className="col-span-2">
          <div className="border rounded-lg p-6 bg-gray-50">
            <h4 className="font-medium text-gray-600 mb-4">{title}</h4>
            <div className="flex gap-6">
              {/* 왼쪽: 이미지 업로드 공간 (가로 반으로 줄임, 세로를 더 길게) */}
              <div className="w-1/4">
                <div className="space-y-3">
                  <div
                    className="w-full h-28 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-gray-400 transition-colors"
                    onClick={handleImageClick}
                  >
                    <div className="text-center">
                      <img src="/logo.png" alt="VitalFit Logo" className="w-8 h-8 mx-auto mb-1" />
                      <div className="text-xs text-gray-500 text-center leading-tight">
                        나의 성장 기록,
                        <br />
                        이곳에 끌어다 놓아주세요.
                      </div>
                    </div>
                  </div>

                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={handleFileChange}
                    accept=".jpg,.jpeg,.png"
                  />

                  {/* 업로드된 이미지들 */}
                  {data.images.length > 0 && (
                    <div className="space-y-3">
                      {data.images.map((image, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={image.url || image}
                            alt={`${title} 이미지 ${index + 1}`}
                            className="w-full h-16 object-cover rounded border cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() =>
                              onImageExpand(
                                image.url || image,
                                image.name || `${title} 이미지 ${index + 1}`,
                                title
                              )
                            }
                            title="클릭하여 확대보기"
                          />
                          <button
                            type="button"
                            onClick={() => onImageDelete(fieldName, index)}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* 오른쪽: 내용 입력 공간 (가로로 넓히고 한 줄씩 추가 가능) */}
              <div className="w-3/4">
                <div className="space-y-2">
                  {localLines.map((line, index) => (
                    <div key={index} className="flex gap-2 items-center">
                      <input
                        ref={el => (inputRefs.current[index] = el)}
                        type="text"
                        value={line}
                        onChange={e => updateContentLine(index, e.target.value)}
                        placeholder={`${title} 내용 ${index + 1}...`}
                        className="flex-1 p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        onFocus={e => e.target.select()}
                      />
                      {localLines.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeContentLine(index)}
                          className="w-6 h-6 bg-red-500 text-white rounded text-xs hover:bg-red-600 transition-colors"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}

                  {/* 새 줄 추가 버튼 */}
                  <button
                    type="button"
                    onClick={addContentLine}
                    className="w-full p-2 border-2 border-dashed border-gray-300 rounded text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-colors"
                  >
                    + 새 줄 추가
                  </button>

                  {/* 인스타그램 링크 버튼 (인스타그램 섹션에만 표시) */}
                  {fieldName === 'instagram' &&
                    localLines.length > 0 &&
                    localLines[0].trim() !== '' && (
                      <button
                        type="button"
                        onClick={() => onInstagramLink(localLines[0])}
                        className="w-full p-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200 font-medium flex items-center justify-center gap-2"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                        </svg>
                        인스타그램 링크 열기
                      </button>
                    )}
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }
  );

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
              😊
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
        <div className="flex space-x-2">
          <button
            type="button"
            onClick={handlePhotoClick}
            className="text-cyan-600 hover:text-cyan-800 font-semibold"
          >
            Upload photo
          </button>
          <button
            type="button"
            onClick={() => setShowWebcam(true)}
            className="text-purple-600 hover:text-purple-800 font-semibold"
          >
            📸 웹캠
          </button>
        </div>

        {previewImage && previewImage !== '/profileDefault.png' && (
          <button
            type="button"
            onClick={handlePhotoDelete}
            className="text-red-600 hover:text-red-800 font-semibold"
          >
            Delete photo
          </button>
        )}

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
            <div className="space-y-4">
              {formData.shiftData.schedules.map((schedule, scheduleIndex) => (
                <div key={scheduleIndex} className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-600">근무일정</h4>
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

          {/* 자격증 섹션 */}
          <AdditionalInfoSection
            title="자격증"
            fieldName="license"
            data={formData.licenseData}
            onImageUpload={handleAdditionalImageUpload}
            onImageDelete={handleAdditionalImageDelete}
            onContentChange={handleAdditionalContentChange}
            onImageExpand={openImageModal}
            onInstagramLink={openInstagramLink}
          />

          {/* 경력 섹션 */}
          <AdditionalInfoSection
            title="경력"
            fieldName="experience"
            data={formData.experienceData}
            onImageUpload={handleAdditionalImageUpload}
            onImageDelete={handleAdditionalImageDelete}
            onContentChange={handleAdditionalContentChange}
            onImageExpand={openImageModal}
            onInstagramLink={openInstagramLink}
          />

          {/* 학력 섹션 */}
          <AdditionalInfoSection
            title="학력"
            fieldName="education"
            data={formData.educationData}
            onImageUpload={handleAdditionalImageUpload}
            onImageDelete={handleAdditionalImageDelete}
            onContentChange={handleAdditionalContentChange}
            onImageExpand={openImageModal}
            onInstagramLink={openInstagramLink}
          />

          {/* 인스타그램 섹션 */}
          <AdditionalInfoSection
            title="인스타그램"
            fieldName="instagram"
            data={formData.instagramData}
            onImageUpload={handleAdditionalImageUpload}
            onImageDelete={handleAdditionalImageDelete}
            onContentChange={handleAdditionalContentChange}
            onImageExpand={openImageModal}
            onInstagramLink={openInstagramLink}
          />

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
            <span className="absolute left-3 top-1 text-gray-400 text-sm pointer-events-none select-none">
              고용 날짜 선택
            </span>
          </div>

          <div className="relative">
            <input
              type="date"
              name="leave_date"
              value={formData.leave_date}
              onChange={handleInputChange}
              className="p-3 pt-7 border rounded w-full"
            />
            <span className="absolute left-3 top-1 text-gray-400 text-sm pointer-events-none select-none">
              퇴직 날짜 선택
            </span>
          </div>
        </div>
      </section>

      <PasswordResetModal isOpen={isPasswordModalOpen} onClose={handlePasswordModalClose} />
      <DeactivationModal
        isOpen={isDeactivationModalOpen}
        onClose={() => setIsDeactivationModalOpen(false)}
        onDeactivationSuccess={async () => {
          toast.success('회원 탈퇴가 완료되었습니다.');

          // AuthContext 상태 완전 초기화
          forceLogout();

          // 로그인 페이지로 이동
          navigate('/login');
        }}
      />

      {/* 이미지 확대 모달 */}
      <ImageExpandModal
        isOpen={imageModal.isOpen}
        onClose={closeImageModal}
        imageUrl={imageModal.imageUrl}
        imageName={imageModal.imageName}
        title={imageModal.title}
      />

      {/* 웹캠 모달 */}
      {showWebcam && (
        <WebcamCapture onCapture={handleWebcamCapture} onClose={() => setShowWebcam(false)} />
      )}
    </div>
  );
};

export default AccountPage;
