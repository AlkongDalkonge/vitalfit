import React, { useState } from 'react';
import { centerAPI } from '../utils/api';

const CenterCreateModal = ({ isOpen, onClose, onCreate }) => {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showTimeDropdown, setShowTimeDropdown] = useState(false); // 운영시간 드롭다운 상태
  const [activeTimeTab, setActiveTimeTab] = useState('weekday'); // 운영시간 탭 상태

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

  // 운영시간 파싱 함수
  const parseOperatingHours = hoursString => {
    if (!hoursString) return { start: '06:00', end: '22:00' };
    const [start, end] = hoursString.split('-');
    return { start: start?.trim() || '06:00', end: end?.trim() || '22:00' };
  };

  // 운영시간 설정 함수
  const setOperatingHours = (dayType, startTime, endTime) => {
    const hoursValue = `${startTime}-${endTime}`;
    setFormData(prev => ({
      ...prev,
      [`${dayType}_hours`]: hoursValue,
    }));
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

      const response = await centerAPI.createCenter(apiData);

      if (response.success) {
        onCreate(response.data);
        resetForm();
        onClose();
      } else {
        setErrors({ submit: response.message || '등록에 실패했습니다.' });
      }
    } catch (error) {
      console.error('센터 생성 실패:', error);
      if (error.message) {
        setErrors({ submit: error.message });
      } else {
        setErrors({ submit: '등록 중 오류가 발생했습니다.' });
      }
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

  // 모달 닫기 핸들러
  const handleClose = () => {
    if (!loading) {
      resetForm();
      onClose();
    }
  };

  // 드롭다운 상태
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="w-[750px] h-[820px] bg-white rounded-[20px] relative overflow-hidden">
        {/* 로딩 오버레이 */}
        {loading && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
          </div>
        )}

        {/* 제목 */}
        <div
          data-layer="센터 등록"
          className="left-[50px] top-[40px] absolute justify-start text-black text-xl font-extrabold font-['Nunito'] leading-7"
        >
          센터 등록
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
          <div className="w-72 left-[50px] top-[190px] absolute inline-flex flex-col justify-start items-start gap-[5px]">
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

          {/* 상태 */}
          <div className="w-72 left-[370px] top-[190px] absolute inline-flex flex-col justify-start items-start gap-[5px]">
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

                {/* 커스텀 드롭다운 */}
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

                {/* 숨겨진 select (폼 제출용) */}
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

          {/* 운영시간 섹션 */}
          <div className="w-[620px] left-[50px] top-[280px] absolute inline-flex flex-col justify-start items-start gap-[5px]">
            <div className="w-[620px] flex flex-col justify-start items-start gap-2">
              <div className="justify-start text-neutral-900 text-sm font-normal font-['Nunito'] leading-normal">
                운영시간
              </div>
              <div className="w-[620px] flex items-end gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowTimeDropdown(!showTimeDropdown)}
                      disabled={loading}
                      className={`w-full h-12 rounded-[10px] outline outline-1 outline-offset-[-0.50px] outline-stone-300 px-3 text-sm font-['Nunito'] focus:outline-cyan-500 bg-white flex items-center justify-between text-neutral-900`}
                    >
                      <span>
                        {activeTimeTab === 'weekday'
                          ? '평일'
                          : activeTimeTab === 'saturday'
                            ? '토요일'
                            : activeTimeTab === 'sunday'
                              ? '일요일'
                              : activeTimeTab === 'holiday'
                                ? '공휴일'
                                : '평일'}
                      </span>
                      <svg
                        width="16"
                        height="8"
                        viewBox="0 0 16 8"
                        fill="none"
                        className={`transition-transform duration-200 ${showTimeDropdown ? 'rotate-180' : ''}`}
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

                    {showTimeDropdown && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-stone-300 rounded-[10px] shadow-lg z-10">
                        <div className="py-1">
                          <button
                            type="button"
                            onClick={() => {
                              setActiveTimeTab('weekday');
                              setShowTimeDropdown(false);
                            }}
                            className="w-full px-3 py-2 text-left text-sm font-['Nunito'] hover:bg-gray-50 transition-colors duration-200"
                          >
                            평일
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setActiveTimeTab('saturday');
                              setShowTimeDropdown(false);
                            }}
                            className="w-full px-3 py-2 text-left text-sm font-['Nunito'] hover:bg-gray-50 transition-colors duration-200"
                          >
                            토요일
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setActiveTimeTab('sunday');
                              setShowTimeDropdown(false);
                            }}
                            className="w-full px-3 py-2 text-left text-sm font-['Nunito'] hover:bg-gray-50 transition-colors duration-200"
                          >
                            일요일
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setActiveTimeTab('holiday');
                              setShowTimeDropdown(false);
                            }}
                            className="w-full px-3 py-2 text-left text-sm font-['Nunito'] hover:bg-gray-50 transition-colors duration-200"
                          >
                            공휴일
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex-1">
                  <input
                    type="time"
                    value={parseOperatingHours(formData[`${activeTimeTab}_hours`]).start}
                    onChange={e => {
                      const currentHours = parseOperatingHours(formData[`${activeTimeTab}_hours`]);
                      setOperatingHours(activeTimeTab, e.target.value, currentHours.end);
                    }}
                    className="w-full h-12 rounded-[10px] outline outline-1 outline-offset-[-0.50px] outline-stone-300 px-3 text-sm font-['Nunito'] focus:outline-cyan-500"
                    disabled={loading}
                  />
                </div>

                <div className="flex-1">
                  <input
                    type="time"
                    value={parseOperatingHours(formData[`${activeTimeTab}_hours`]).end}
                    onChange={e => {
                      const currentHours = parseOperatingHours(formData[`${activeTimeTab}_hours`]);
                      setOperatingHours(activeTimeTab, currentHours.start, e.target.value);
                    }}
                    className="w-full h-12 rounded-[10px] outline outline-1 outline-offset-[-0.50px] outline-stone-300 px-3 text-sm font-['Nunito'] focus:outline-cyan-500"
                    disabled={loading}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 주차 가능 여부 */}
          <div className="w-72 left-[50px] top-[370px] absolute inline-flex flex-col justify-start items-start gap-[5px]">
            <div className="w-72 flex flex-col justify-start items-start gap-2">
              <div className="justify-start text-neutral-900 text-sm font-normal font-['Nunito'] leading-normal">
                주차 정보
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
          <div className="w-72 left-[370px] top-[370px] absolute inline-flex flex-col justify-start items-start gap-[5px]">
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

          {/* 센터 설명 */}
          <div className="w-[620px] left-[50px] top-[460px] absolute inline-flex flex-col justify-start items-start gap-[5px]">
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
          <div className="w-[620px] left-[50px] top-[550px] absolute inline-flex flex-col justify-start items-start gap-[5px]">
            <div className="w-[620px] flex flex-col justify-start items-start gap-2">
              <div className="justify-start text-neutral-900 text-sm font-normal font-['Nunito'] leading-normal">
                주차 정보
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
          <div className="w-[620px] left-[50px] top-[640px] absolute inline-flex flex-col justify-start items-start gap-[5px]">
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

          {/* 에러 메시지 */}
          {errors.submit && (
            <div className="left-[50px] top-[720px] absolute text-red-500 text-sm">
              {errors.submit}
            </div>
          )}

          {/* 등록 버튼 */}
          <div className="flex justify-end absolute bottom-8 right-8">
            <button
              type="submit"
              disabled={loading}
              className="Button w-40 h-11 p-2.5 bg-gradient-to-br from-blue-400 to-blue-600 rounded-[10px] inline-flex justify-center items-center gap-2.5 hover:from-blue-500 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/15 before:via-transparent before:to-transparent before:pointer-events-none disabled:opacity-50"
            >
              <div
                data-layer="Primary Button"
                className="PrimaryButton justify-start text-white text-sm font-medium font-['Nunito'] leading-normal drop-shadow-xl"
              >
                {loading ? '등록 중...' : '등록'}
              </div>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CenterCreateModal;
