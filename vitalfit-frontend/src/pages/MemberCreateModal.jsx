import React, { useState } from 'react';
import { memberAPI } from '../utils/api';
import { useMemberForm } from '../utils/hooks';

const MemberCreateModal = ({ isOpen, onClose, onCreate }) => {
  // 커스텀 훅 사용 (생성 모드이므로 initialData는 null)
  const {
    formData,
    centers,
    trainers,
    loading,
    errors,
    handleInputChange,
    validateForm,
    resetForm,
    getFilteredTrainers,
    setLoading,
    setErrors,
  } = useMemberForm(null, isOpen);

  // 폼 제출 핸들러
  const handleSubmit = async e => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // API 전송용 데이터 준비 (숫자 타입 변환)
      const apiData = {
        name: formData.name,
        phone: formData.phone,
        center_id: parseInt(formData.center_id),
        trainer_id: parseInt(formData.trainer_id),
        join_date: formData.join_date,
        total_sessions: formData.total_sessions ? parseInt(formData.total_sessions) : 0,
        used_sessions: formData.used_sessions ? parseInt(formData.used_sessions) : 0,
        free_sessions: formData.free_sessions ? parseInt(formData.free_sessions) : 0,
        status: formData.status,
      };

      // 빈 문자열이 아닌 경우에만 추가
      if (formData.expire_date && formData.expire_date.trim() !== '') {
        apiData.expire_date = formData.expire_date;
      }
      if (formData.memo && formData.memo.trim() !== '') {
        apiData.memo = formData.memo;
      }

      const response = await memberAPI.createMember(apiData);

      if (response.success) {
        onCreate(response.data);
        resetForm();
        onClose();
      } else {
        setErrors({ submit: response.message || '등록에 실패했습니다.' });
      }
    } catch (error) {
      console.error('멤버 생성 실패:', error);
      console.error('오류 상세:', error.message);
      if (error.message) {
        setErrors({ submit: error.message });
      } else {
        setErrors({ submit: '등록 중 오류가 발생했습니다.' });
      }
    } finally {
      setLoading(false);
    }
  };

  // 모달 닫기 핸들러
  const handleClose = () => {
    if (!loading) {
      resetForm();
      onClose();
    }
  };

  // 필터링된 트레이너 목록 가져오기
  const filteredTrainers = getFilteredTrainers();

  // 드롭다운 상태
  const [showCenterDropdown, setShowCenterDropdown] = useState(false);
  const [showTrainerDropdown, setShowTrainerDropdown] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="w-[750px] h-[580px] bg-white rounded-[20px] relative overflow-hidden">
        {/* 로딩 오버레이 */}
        {loading && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
          </div>
        )}

        {/* 제목 */}
        <div
          data-layer="고객 등록"
          className="left-[50px] top-[40px] absolute justify-start text-black text-xl font-extrabold font-['Nunito'] leading-7"
        >
          고객 등록
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

        <form onSubmit={handleSubmit}>
          {/* 성함 */}
          <div className="w-72 left-[50px] top-[93px] absolute inline-flex flex-col justify-start items-start gap-[5px]">
            <div className="w-72 flex flex-col justify-start items-start gap-2">
              <div className="justify-start text-neutral-900 text-sm font-normal font-['Nunito'] leading-normal">
                성함 <span className="text-red-500">*</span>
              </div>
              <div className="relative w-72 h-12">
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-72 h-12 rounded-[10px] outline outline-1 outline-offset-[-0.50px] outline-stone-300 px-3 text-sm font-['Nunito'] focus:outline-cyan-500 placeholder:text-neutral-400"
                  placeholder="이름을 입력하세요"
                  disabled={loading}
                  required
                />
              </div>
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>
          </div>

          {/* 연락처 */}
          <div className="w-72 left-[370px] top-[93px] absolute inline-flex flex-col justify-start items-start gap-[5px]">
            <div className="w-72 flex flex-col justify-start items-start gap-2">
              <div className="justify-start text-neutral-900 text-sm font-normal font-['Nunito'] leading-normal">
                연락처 <span className="text-red-500">*</span>
              </div>
              <div className="relative w-72 h-12">
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-72 h-12 rounded-[10px] outline outline-1 outline-offset-[-0.50px] outline-stone-300 px-3 text-sm font-['Nunito'] focus:outline-cyan-500 placeholder:text-neutral-400"
                  placeholder="연락처를 입력하세요"
                  disabled={loading}
                  required
                />
              </div>
              {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
            </div>
          </div>

          {/* 소속 센터 */}
          <div className="w-72 left-[50px] top-[199px] absolute inline-flex flex-col justify-start items-start gap-[5px]">
            <div className="w-72 flex flex-col justify-start items-start gap-2">
              <div className="justify-start text-neutral-900 text-sm font-normal font-['Nunito'] leading-normal">
                소속 센터 <span className="text-red-500">*</span>
              </div>
              <div className="relative w-72">
                <button
                  type="button"
                  onClick={() => setShowCenterDropdown(!showCenterDropdown)}
                  disabled={loading}
                  className={`w-72 h-12 rounded-[10px] outline outline-1 outline-offset-[-0.50px] outline-stone-300 px-3 text-sm font-['Nunito'] focus:outline-cyan-500 bg-white flex items-center justify-between ${
                    !formData.center_id ? 'text-neutral-400' : 'text-neutral-900'
                  }`}
                >
                  <span>
                    {formData.center_id
                      ? centers.find(c => c.id === formData.center_id)?.name
                      : '센터를 선택하세요'}
                  </span>
                  <svg
                    width="16"
                    height="8"
                    viewBox="0 0 16 8"
                    fill="none"
                    className={`transition-transform duration-200 ${showCenterDropdown ? 'rotate-180' : ''}`}
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
                {showCenterDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-stone-300 rounded-[10px] shadow-lg z-10">
                    <div className="py-1">
                      {centers.map(center => (
                        <button
                          key={center.id}
                          type="button"
                          onClick={() => {
                            handleInputChange({ target: { name: 'center_id', value: center.id } });
                            setShowCenterDropdown(false);
                          }}
                          className="w-full px-3 py-2 text-left text-sm font-['Nunito'] hover:bg-gray-50 transition-colors duration-200"
                        >
                          {center.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* 숨겨진 select (폼 제출용) */}
                <select
                  name="center_id"
                  value={formData.center_id}
                  onChange={handleInputChange}
                  required
                  className="hidden"
                  disabled={loading}
                >
                  <option value="">센터를 선택하세요</option>
                  {centers.map(center => (
                    <option key={center.id} value={center.id}>
                      {center.name}
                    </option>
                  ))}
                </select>
              </div>
              {errors.center_id && <p className="text-red-500 text-xs mt-1">{errors.center_id}</p>}
            </div>
          </div>

          {/* 담당 트레이너 */}
          <div className="w-72 left-[370px] top-[199px] absolute inline-flex flex-col justify-start items-start gap-[5px]">
            <div className="w-72 flex flex-col justify-start items-start gap-2">
              <div className="justify-start text-neutral-900 text-sm font-normal font-['Nunito'] leading-normal">
                담당 트레이너 <span className="text-red-500">*</span>
              </div>
              <div className="relative w-72">
                <button
                  type="button"
                  onClick={() => setShowTrainerDropdown(!showTrainerDropdown)}
                  disabled={loading || !formData.center_id}
                  className={`w-72 h-12 rounded-[10px] outline outline-1 outline-offset-[-0.50px] outline-stone-300 px-3 text-sm font-['Nunito'] focus:outline-cyan-500 bg-white flex items-center justify-between ${
                    !formData.trainer_id ? 'text-neutral-400' : 'text-neutral-900'
                  }`}
                >
                  <span>
                    {formData.trainer_id
                      ? filteredTrainers.find(t => t.id === formData.trainer_id)?.name +
                        (filteredTrainers.find(t => t.id === formData.trainer_id)?.nickname
                          ? ` (${filteredTrainers.find(t => t.id === formData.trainer_id)?.nickname})`
                          : '')
                      : formData.center_id
                        ? '트레이너를 선택하세요'
                        : '먼저 센터를 선택하세요'}
                  </span>
                  <svg
                    width="16"
                    height="8"
                    viewBox="0 0 16 8"
                    fill="none"
                    className={`transition-transform duration-200 ${showTrainerDropdown ? 'rotate-180' : ''}`}
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
                {showTrainerDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-stone-300 rounded-[10px] shadow-lg z-10">
                    <div className="py-1">
                      {filteredTrainers.map(trainer => (
                        <button
                          key={trainer.id}
                          type="button"
                          onClick={() => {
                            handleInputChange({
                              target: { name: 'trainer_id', value: trainer.id },
                            });
                            setShowTrainerDropdown(false);
                          }}
                          className="w-full px-3 py-2 text-left text-sm font-['Nunito'] hover:bg-gray-50 transition-colors duration-200"
                        >
                          {trainer.name} {trainer.nickname ? `(${trainer.nickname})` : ''}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* 숨겨진 select (폼 제출용) */}
                <select
                  name="trainer_id"
                  value={formData.trainer_id}
                  onChange={handleInputChange}
                  required
                  className="hidden"
                  disabled={loading || !formData.center_id}
                >
                  <option value="">
                    {formData.center_id ? '트레이너를 선택하세요' : '먼저 센터를 선택하세요'}
                  </option>
                  {filteredTrainers.map(trainer => (
                    <option key={trainer.id} value={trainer.id}>
                      {trainer.name} {trainer.nickname ? `(${trainer.nickname})` : ''}
                    </option>
                  ))}
                </select>
              </div>
              {errors.trainer_id && (
                <p className="text-red-500 text-xs mt-1">{errors.trainer_id}</p>
              )}
            </div>
          </div>

          {/* 가입일 */}
          <div className="w-72 left-[50px] top-[305px] absolute inline-flex flex-col justify-start items-start gap-[5px]">
            <div className="w-72 flex flex-col justify-start items-start gap-2">
              <div className="justify-start text-neutral-900 text-sm font-normal font-['Nunito'] leading-normal">
                가입일 <span className="text-red-500">*</span>
              </div>
              <div className="relative w-72 h-12">
                <input
                  type="date"
                  name="join_date"
                  value={formData.join_date}
                  onChange={handleInputChange}
                  className="w-72 h-12 rounded-[10px] outline outline-1 outline-offset-[-0.50px] outline-stone-300 px-3 text-sm font-['Nunito'] focus:outline-cyan-500"
                  disabled={loading}
                />
              </div>
              {errors.join_date && <p className="text-red-500 text-xs mt-1">{errors.join_date}</p>}
            </div>
          </div>

          {/* 만료일 */}
          <div className="w-72 left-[370px] top-[305px] absolute inline-flex flex-col justify-start items-start gap-[5px]">
            <div className="w-72 flex flex-col justify-start items-start gap-2">
              <div className="justify-start text-neutral-900 text-sm font-normal font-['Nunito'] leading-normal">
                만료일
              </div>
              <div className="relative w-72 h-12">
                <input
                  type="date"
                  name="expire_date"
                  value={formData.expire_date}
                  onChange={handleInputChange}
                  className="w-72 h-12 rounded-[10px] outline outline-1 outline-offset-[-0.50px] outline-stone-300 px-3 text-sm font-['Nunito'] focus:outline-cyan-500"
                  disabled={loading}
                />
              </div>
              {errors.expire_date && (
                <p className="text-red-500 text-xs mt-1">{errors.expire_date}</p>
              )}
            </div>
          </div>

          {/* 메모 */}
          <div className="w-[620px] left-[50px] top-[411px] absolute inline-flex flex-col justify-start items-start gap-[5px]">
            <div className="w-[620px] flex flex-col justify-start items-start gap-2 mb-16">
              <div className="justify-start text-neutral-900 text-sm font-normal font-['Nunito'] leading-normal">
                메모
              </div>
              <div className="relative w-[620px] h-12">
                <textarea
                  name="memo"
                  value={formData.memo}
                  onChange={handleInputChange}
                  className="w-[620px] h-12 rounded-[10px] outline outline-1 outline-offset-[-0.50px] outline-stone-300 px-3 py-3 text-sm font-['Nunito'] focus:outline-cyan-500 placeholder:text-neutral-400 resize-none"
                  placeholder="메모를 입력하세요"
                  disabled={loading}
                />
              </div>
              {errors.memo && <p className="text-red-500 text-xs mt-1">{errors.memo}</p>}
            </div>
          </div>

          {/* 에러 메시지 */}
          {errors.submit && (
            <div className="left-[50px] top-[500px] absolute text-red-500 text-sm">
              {errors.submit}
            </div>
          )}

          {/* 등록 버튼 */}
          <div className="flex justify-end absolute bottom-6 right-6">
            <button
              type="submit"
              disabled={loading}
              className="px-12 py-3 bg-gradient-to-br from-blue-400 to-blue-600 text-white text-sm rounded-lg hover:from-blue-500 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50"
            >
              {loading ? '등록 중...' : '등록'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MemberCreateModal;
