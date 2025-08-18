import React, { useState, useEffect } from 'react';
import { centerAPI } from '../utils/api';

const CenterEditModal = ({ isOpen, onClose, onUpdate, center }) => {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);

  // 폼 데이터 상태
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    description: '',
    weekday_hours: '',
    saturday_hours: '',
    sunday_hours: '',
    holiday_hours: '',
    has_parking: false,
    parking_fee: '',
    parking_info: '',
    directions: '',
    status: 'active',
  });

  // 센터 데이터가 변경될 때 폼 초기화
  useEffect(() => {
    if (center) {
      setFormData({
        name: center.name || '',
        address: center.address || '',
        phone: center.phone || '',
        description: center.description || '',
        weekday_hours: center.weekday_hours || '',
        saturday_hours: center.saturday_hours || '',
        sunday_hours: center.sunday_hours || '',
        holiday_hours: center.holiday_hours || '',
        has_parking: center.has_parking || false,
        parking_fee: center.parking_fee || '',
        parking_info: center.parking_info || '',
        directions: center.directions || '',
        status: center.status || 'active',
      });
    }
  }, [center]);

  // 입력 변경 핸들러
  const handleInputChange = e => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    // 에러 메시지 초기화
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  // 폼 유효성 검사
  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = '센터명을 입력해주세요.';
    }

    if (!formData.address.trim()) {
      newErrors.address = '주소를 입력해주세요.';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = '전화번호를 입력해주세요.';
    } else if (!/^[0-9-+\s()]+$/.test(formData.phone.trim())) {
      newErrors.phone = '올바른 전화번호 형식이 아닙니다.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 폼 제출 핸들러
  const handleSubmit = async e => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // API 전송용 데이터 준비
      const apiData = {
        name: formData.name.trim(),
        address: formData.address.trim(),
        phone: formData.phone.trim(),
        description: formData.description.trim() || null,
        weekday_hours: formData.weekday_hours.trim() || null,
        saturday_hours: formData.saturday_hours.trim() || null,
        sunday_hours: formData.sunday_hours.trim() || null,
        holiday_hours: formData.holiday_hours.trim() || null,
        has_parking: formData.has_parking,
        parking_fee: formData.parking_fee.trim() || null,
        parking_info: formData.parking_info.trim() || null,
        directions: formData.directions.trim() || null,
        status: formData.status,
      };

      const response = await centerAPI.updateCenter(center.id, apiData);

      if (response.success) {
        onUpdate(response.data);
        onClose();
      } else {
        setErrors({ submit: response.message || '수정에 실패했습니다.' });
      }
    } catch (error) {
      console.error('센터 수정 오류:', error);
      setErrors({
        submit: error.response?.data?.message || '센터 수정 중 오류가 발생했습니다.',
      });
    } finally {
      setLoading(false);
    }
  };

  // 폼 초기화
  const resetForm = () => {
    setFormData({
      name: '',
      address: '',
      phone: '',
      description: '',
      weekday_hours: '',
      saturday_hours: '',
      sunday_hours: '',
      holiday_hours: '',
      has_parking: false,
      parking_fee: '',
      parking_info: '',
      directions: '',
      status: 'active',
    });
    setErrors({});
  };

  // 모달 닫기
  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="w-[750px] h-[1000px] bg-white rounded-[20px] relative overflow-hidden">
        {/* 로딩 오버레이 */}
        {loading && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
          </div>
        )}

        {/* 제목 */}
        <div
          data-layer="센터 수정"
          className="left-[50px] top-[40px] absolute justify-start text-black text-xl font-extrabold font-['Nunito'] leading-7"
        >
          센터 수정
        </div>

        {/* 닫기 버튼 */}
        <button
          onClick={handleClose}
          disabled={loading}
          className="absolute right-[24px] top-[34px] w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors duration-200"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-neutral-600">
            <path
              d="M12 4L4 12M4 4L12 12"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        <form onSubmit={handleSubmit} className="h-full overflow-y-auto">
          {/* 센터명 */}
          <div className="w-72 left-[50px] top-[93px] absolute inline-flex flex-col justify-start items-start gap-[5px]">
            <div className="w-72 flex flex-col justify-start items-start gap-2">
              <div className="justify-start text-neutral-900 text-sm font-normal font-['Nunito'] leading-normal">
                센터명 <span className="text-red-500">*</span>
              </div>
              <div className="relative w-72 h-12">
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-72 h-12 rounded-[10px] outline outline-1 outline-offset-[-0.50px] outline-stone-300 px-3 text-sm font-['Nunito'] focus:outline-cyan-500 placeholder:text-neutral-400"
                  placeholder="센터명을 입력하세요"
                  disabled={loading}
                  required
                />
              </div>
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>
          </div>

          {/* 주소 */}
          <div className="w-72 left-[370px] top-[93px] absolute inline-flex flex-col justify-start items-start gap-[5px]">
            <div className="w-72 flex flex-col justify-start items-start gap-2">
              <div className="justify-start text-neutral-900 text-sm font-normal font-['Nunito'] leading-normal">
                주소 <span className="text-red-500">*</span>
              </div>
              <div className="relative w-72 h-12">
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="w-72 h-12 rounded-[10px] outline outline-1 outline-offset-[-0.50px] outline-stone-300 px-3 text-sm font-['Nunito'] focus:outline-cyan-500 placeholder:text-neutral-400"
                  placeholder="주소를 입력하세요"
                  disabled={loading}
                  required
                />
              </div>
              {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
            </div>
          </div>

          {/* 전화번호 */}
          <div className="w-72 left-[50px] top-[199px] absolute inline-flex flex-col justify-start items-start gap-[5px]">
            <div className="w-72 flex flex-col justify-start items-start gap-2">
              <div className="justify-start text-neutral-900 text-sm font-normal font-['Nunito'] leading-normal">
                전화번호 <span className="text-red-500">*</span>
              </div>
              <div className="relative w-72 h-12">
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-72 h-12 rounded-[10px] outline outline-1 outline-offset-[-0.50px] outline-stone-300 px-3 text-sm font-['Nunito'] focus:outline-cyan-500 placeholder:text-neutral-400"
                  placeholder="전화번호를 입력하세요"
                  disabled={loading}
                  required
                />
              </div>
              {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
            </div>
          </div>

          {/* 주차 가능 여부 */}
          <div className="w-72 left-[50px] top-[517px] absolute inline-flex flex-col justify-start items-start gap-[5px]">
            <div className="w-72 flex flex-col justify-start items-start gap-2">
              <div className="justify-start text-neutral-900 text-sm font-normal font-['Nunito'] leading-normal">
                주차 가능 여부
              </div>
              <div className="relative w-72 h-12 flex items-center">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="has_parking"
                    checked={formData.has_parking}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-cyan-500 bg-gray-100 border-gray-300 rounded focus:ring-cyan-500 focus:ring-2"
                    disabled={loading}
                  />
                  <span className="ml-2 text-sm text-gray-700">주차 가능</span>
                </label>
              </div>
            </div>
          </div>

          {/* 주차 요금 */}
          <div className="w-72 left-[370px] top-[517px] absolute inline-flex flex-col justify-start items-start gap-[5px]">
            <div className="w-72 flex flex-col justify-start items-start gap-2">
              <div className="justify-start text-neutral-900 text-sm font-normal font-['Nunito'] leading-normal">
                주차 요금
              </div>
              <div className="relative w-72 h-12">
                <input
                  type="text"
                  name="parking_fee"
                  value={formData.parking_fee}
                  onChange={handleInputChange}
                  className="w-72 h-12 rounded-[10px] outline outline-1 outline-offset-[-0.50px] outline-stone-300 px-3 text-sm font-['Nunito'] focus:outline-cyan-500 placeholder:text-neutral-400"
                  placeholder="예: 무료, 30분당 500원"
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          {/* 평일 시작 시간 */}
          <div className="w-36 left-[50px] top-[305px] absolute inline-flex flex-col justify-start items-start gap-[5px]">
            <div className="w-36 flex flex-col justify-start items-start gap-2">
              <div className="justify-start text-neutral-900 text-sm font-normal font-['Nunito'] leading-normal">
                평일 운영시간
              </div>
              <div className="relative w-36 h-12">
                <input
                  type="time"
                  name="weekday_start"
                  value={formData.weekday_start || '06:00'}
                  onChange={e => {
                    const startTime = e.target.value;
                    const endTime = formData.weekday_end || '24:00';
                    handleInputChange({
                      target: { name: 'weekday_hours', value: `${startTime}-${endTime}` },
                    });
                    handleInputChange({ target: { name: 'weekday_start', value: startTime } });
                  }}
                  className="w-36 h-12 rounded-[10px] outline outline-1 outline-offset-[-0.50px] outline-stone-300 px-3 text-sm font-['Nunito'] focus:outline-cyan-500"
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          {/* 평일 종료 시간 */}
          <div className="w-36 left-[200px] top-[305px] absolute inline-flex flex-col justify-start items-start gap-[5px]">
            <div className="w-36 flex flex-col justify-start items-start gap-2">
              <div className="justify-start text-neutral-900 text-sm font-normal font-['Nunito'] leading-normal"></div>
              <div className="relative w-36 h-12 mt-6">
                <input
                  type="time"
                  name="weekday_end"
                  value={formData.weekday_end || '24:00'}
                  onChange={e => {
                    const endTime = e.target.value;
                    const startTime = formData.weekday_start || '06:00';
                    handleInputChange({
                      target: { name: 'weekday_hours', value: `${startTime}-${endTime}` },
                    });
                    handleInputChange({ target: { name: 'weekday_end', value: endTime } });
                  }}
                  className="w-36 h-12 rounded-[10px] outline outline-1 outline-offset-[-0.50px] outline-stone-300 px-3 text-sm font-['Nunito'] focus:outline-cyan-500"
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          {/* 토요일 시작 시간 */}
          <div className="w-36 left-[370px] top-[305px] absolute inline-flex flex-col justify-start items-start gap-[5px]">
            <div className="w-36 flex flex-col justify-start items-start gap-2">
              <div className="justify-start text-neutral-900 text-sm font-normal font-['Nunito'] leading-normal">
                토요일 운영시간
              </div>
              <div className="relative w-36 h-12">
                <input
                  type="time"
                  name="saturday_start"
                  value={formData.saturday_start || '06:00'}
                  onChange={e => {
                    const startTime = e.target.value;
                    const endTime = formData.saturday_end || '22:00';
                    handleInputChange({
                      target: { name: 'saturday_hours', value: `${startTime}-${endTime}` },
                    });
                    handleInputChange({ target: { name: 'saturday_start', value: startTime } });
                  }}
                  className="w-36 h-12 rounded-[10px] outline outline-1 outline-offset-[-0.50px] outline-stone-300 px-3 text-sm font-['Nunito'] focus:outline-cyan-500"
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          {/* 토요일 종료 시간 */}
          <div className="w-36 left-[520px] top-[305px] absolute inline-flex flex-col justify-start items-start gap-[5px]">
            <div className="w-36 flex flex-col justify-start items-start gap-2">
              <div className="justify-start text-neutral-900 text-sm font-normal font-['Nunito'] leading-normal"></div>
              <div className="relative w-36 h-12 mt-6">
                <input
                  type="time"
                  name="saturday_end"
                  value={formData.saturday_end || '22:00'}
                  onChange={e => {
                    const endTime = e.target.value;
                    const startTime = formData.saturday_start || '06:00';
                    handleInputChange({
                      target: { name: 'saturday_hours', value: `${startTime}-${endTime}` },
                    });
                    handleInputChange({ target: { name: 'saturday_end', value: endTime } });
                  }}
                  className="w-36 h-12 rounded-[10px] outline outline-1 outline-offset-[-0.50px] outline-stone-300 px-3 text-sm font-['Nunito'] focus:outline-cyan-500"
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          {/* 일요일 시작 시간 */}
          <div className="w-36 left-[50px] top-[411px] absolute inline-flex flex-col justify-start items-start gap-[5px]">
            <div className="w-36 flex flex-col justify-start items-start gap-2">
              <div className="justify-start text-neutral-900 text-sm font-normal font-['Nunito'] leading-normal">
                일요일 운영시간
              </div>
              <div className="relative w-36 h-12">
                <input
                  type="time"
                  name="sunday_start"
                  value={formData.sunday_start || '08:00'}
                  onChange={e => {
                    const startTime = e.target.value;
                    const endTime = formData.sunday_end || '20:00';
                    handleInputChange({
                      target: { name: 'sunday_hours', value: `${startTime}-${endTime}` },
                    });
                    handleInputChange({ target: { name: 'sunday_start', value: startTime } });
                  }}
                  className="w-36 h-12 rounded-[10px] outline outline-1 outline-offset-[-0.50px] outline-stone-300 px-3 text-sm font-['Nunito'] focus:outline-cyan-500"
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          {/* 일요일 종료 시간 */}
          <div className="w-36 left-[200px] top-[411px] absolute inline-flex flex-col justify-start items-start gap-[5px]">
            <div className="w-36 flex flex-col justify-start items-start gap-2">
              <div className="justify-start text-neutral-900 text-sm font-normal font-['Nunito'] leading-normal"></div>
              <div className="relative w-36 h-12 mt-6">
                <input
                  type="time"
                  name="sunday_end"
                  value={formData.sunday_end || '20:00'}
                  onChange={e => {
                    const endTime = e.target.value;
                    const startTime = formData.sunday_start || '08:00';
                    handleInputChange({
                      target: { name: 'sunday_hours', value: `${startTime}-${endTime}` },
                    });
                    handleInputChange({ target: { name: 'sunday_end', value: endTime } });
                  }}
                  className="w-36 h-12 rounded-[10px] outline outline-1 outline-offset-[-0.50px] outline-stone-300 px-3 text-sm font-['Nunito'] focus:outline-cyan-500"
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          {/* 공휴일 시작 시간 */}
          <div className="w-36 left-[370px] top-[411px] absolute inline-flex flex-col justify-start items-start gap-[5px]">
            <div className="w-36 flex flex-col justify-start items-start gap-2">
              <div className="justify-start text-neutral-900 text-sm font-normal font-['Nunito'] leading-normal">
                공휴일 운영시간
              </div>
              <div className="relative w-36 h-12">
                <input
                  type="time"
                  name="holiday_start"
                  value={formData.holiday_start || '08:00'}
                  onChange={e => {
                    const startTime = e.target.value;
                    const endTime = formData.holiday_end || '18:00';
                    handleInputChange({
                      target: { name: 'holiday_hours', value: `${startTime}-${endTime}` },
                    });
                    handleInputChange({ target: { name: 'holiday_start', value: startTime } });
                  }}
                  className="w-36 h-12 rounded-[10px] outline outline-1 outline-offset-[-0.50px] outline-stone-300 px-3 text-sm font-['Nunito'] leading-normal focus:outline-cyan-500"
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          {/* 공휴일 종료 시간 */}
          <div className="w-36 left-[520px] top-[411px] absolute inline-flex flex-col justify-start items-start gap-[5px]">
            <div className="w-36 flex flex-col justify-start items-start gap-2">
              <div className="justify-start text-neutral-900 text-sm font-normal font-['Nunito'] leading-normal"></div>
              <div className="relative w-36 h-12 mt-6">
                <input
                  type="time"
                  name="holiday_end"
                  value={formData.holiday_end || '18:00'}
                  onChange={e => {
                    const endTime = e.target.value;
                    const startTime = formData.holiday_start || '08:00';
                    handleInputChange({
                      target: { name: 'holiday_hours', value: `${startTime}-${endTime}` },
                    });
                    handleInputChange({ target: { name: 'holiday_end', value: endTime } });
                  }}
                  className="w-36 h-12 rounded-[10px] outline outline-1 outline-offset-[-0.50px] outline-stone-300 px-3 text-sm font-['Nunito'] focus:outline-cyan-500"
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          {/* 센터 설명 */}
          <div className="w-[620px] left-[50px] top-[620px] absolute inline-flex flex-col justify-start items-start gap-[5px]">
            <div className="w-[620px] flex flex-col justify-start items-start gap-2">
              <div className="justify-start text-neutral-900 text-sm font-normal font-['Nunito'] leading-normal">
                센터 설명
              </div>
              <div className="relative w-[620px] h-12">
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-[620px] h-12 rounded-[10px] outline outline-1 outline-offset-[-0.50px] outline-stone-300 px-3 py-3 text-sm font-['Nunito'] focus:outline-cyan-500 placeholder:text-neutral-400 resize-none"
                  placeholder="센터에 대한 설명을 입력하세요"
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          {/* 주차 정보 */}
          <div className="w-[620px] left-[50px] top-[720px] absolute inline-flex flex-col justify-start items-start gap-[5px]">
            <div className="w-[620px] flex flex-col justify-start items-start gap-2">
              <div className="justify-start text-neutral-900 text-sm font-normal font-['Nunito'] leading-normal">
                주차 안내
              </div>
              <div className="relative w-[620px] h-12">
                <textarea
                  name="parking_info"
                  value={formData.parking_info}
                  onChange={handleInputChange}
                  className="w-[620px] h-12 rounded-[10px] outline outline-1 outline-offset-[-0.50px] outline-stone-300 px-3 py-3 text-sm font-['Nunito'] focus:outline-cyan-500 placeholder:text-neutral-400 resize-none"
                  placeholder="주차 관련 상세 정보를 입력하세요"
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          {/* 오시는 길 */}
          <div className="w-[620px] left-[50px] top-[820px] absolute inline-flex flex-col justify-start items-start gap-[5px]">
            <div className="w-[620px] flex flex-col justify-start items-start gap-2">
              <div className="justify-start text-neutral-900 text-sm font-normal font-['Nunito'] leading-normal">
                오시는 길
              </div>
              <div className="relative w-[620px] h-12">
                <input
                  type="text"
                  name="directions"
                  value={formData.directions}
                  onChange={handleInputChange}
                  className="w-[620px] h-12 rounded-[10px] outline outline-1 outline-offset-[-0.50px] outline-stone-300 px-3 text-sm font-['Nunito'] focus:outline-cyan-500 placeholder:text-neutral-400"
                  placeholder="예: 지하철 2호선 강남역 3번 출구에서 도보 5분"
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          {/* 상태 */}
          <div className="w-72 left-[370px] top-[199px] absolute inline-flex flex-col justify-start items-start gap-[5px]">
            <div className="w-72 flex flex-col justify-start items-start gap-2">
              <div className="justify-start text-neutral-900 text-sm font-normal font-['Nunito'] leading-normal">
                상태
              </div>
              <div className="relative w-72">
                <button
                  type="button"
                  onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                  disabled={loading}
                  className={`w-72 h-12 rounded-[10px] outline outline-1 outline-offset-[-0.50px] outline-stone-300 px-3 text-sm font-['Nunito'] focus:outline-cyan-500 bg-white flex items-center justify-between text-neutral-900`}
                >
                  <span>
                    {formData.status === 'active'
                      ? '활성'
                      : formData.status === 'inactive'
                        ? '비활성'
                        : formData.status === 'closed'
                          ? '폐점'
                          : '활성'}
                  </span>
                  <svg
                    width="16"
                    height="8"
                    viewBox="0 0 16 8"
                    fill="none"
                    className={`transition-transform duration-200 ${showStatusDropdown ? 'rotate-180' : ''}`}
                  >
                    <path
                      d="M1 1L8 7L15 1"
                      stroke="#1F2937"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>

                {showStatusDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-stone-300 rounded-[10px] shadow-lg z-10">
                    <div className="py-1">
                      <button
                        type="button"
                        onClick={() => {
                          handleInputChange({ target: { name: 'status', value: 'active' } });
                          setShowStatusDropdown(false);
                        }}
                        className="w-full px-3 py-2 text-left text-sm font-['Nunito'] hover:bg-gray-50 transition-colors duration-200"
                      >
                        활성
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          handleInputChange({ target: { name: 'status', value: 'inactive' } });
                          setShowStatusDropdown(false);
                        }}
                        className="w-full px-3 py-2 text-left text-sm font-['Nunito'] hover:bg-gray-50 transition-colors duration-200"
                      >
                        비활성
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          handleInputChange({ target: { name: 'status', value: 'closed' } });
                          setShowStatusDropdown(false);
                        }}
                        className="w-full px-3 py-2 text-left text-sm font-['Nunito'] hover:bg-gray-50 transition-colors duration-200"
                      >
                        폐점
                      </button>
                    </div>
                  </div>
                )}

                {/* Hidden select for form submission */}
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="hidden"
                  disabled={loading}
                >
                  <option value="active">활성</option>
                  <option value="inactive">비활성</option>
                  <option value="closed">폐점</option>
                </select>
              </div>
            </div>
          </div>

          {/* 에러 메시지 */}
          {errors.submit && (
            <div className="left-[50px] top-[960px] absolute text-red-500 text-sm">
              {errors.submit}
            </div>
          )}

          {/* 수정 버튼 */}
          <div className="flex justify-end absolute bottom-8 right-6">
            <button
              type="submit"
              disabled={loading}
              className="px-12 py-3 bg-gradient-to-br from-blue-400 to-blue-600 text-white text-sm rounded-lg hover:from-blue-500 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50"
            >
              {loading ? '수정 중...' : '수정'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CenterEditModal;
