import React, { useState } from 'react';
import { usePTSessionForm } from '../utils/hooks';
import { getSessionTypeText } from '../utils/ptSessionUtils';

const PTSessionEditModal = ({ isOpen, onClose, session, onUpdate }) => {
  // 커스텀 훅 사용 (편집 모드)
  const { formData, loading, errors, handleInputChange, updatePTSession, deletePTSession } =
    usePTSessionForm(session, isOpen, 'edit');

  // 드롭다운 상태
  const [showSessionTypeDropdown, setShowSessionTypeDropdown] = useState(false);

  // 폼 제출 핸들러
  const handleSubmit = async e => {
    e.preventDefault();

    const result = await updatePTSession(session?.id);

    if (result.success) {
      onUpdate(result.data);
      onClose();
    } else if (result.error) {
      alert(result.error);
    }
  };

  // 삭제 핸들러
  const handleDelete = async () => {
    const result = await deletePTSession(session?.id);

    if (result.success) {
      onUpdate(); // 목록 새로고침을 위한 콜백
      onClose();
    } else if (result.error) {
      alert(result.error);
    }
    // result.cancelled인 경우는 아무것도 하지 않음
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="w-[554px] h-[600px] relative bg-white rounded-lg overflow-hidden">
        {/* 로딩 오버레이 */}
        {loading && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
          </div>
        )}

        {/* 제목 */}
        <div className="absolute left-[38px] top-[35px] text-black text-xl font-extrabold font-['Nunito']">
          PT 수정
        </div>

        {/* 닫기 버튼 */}
        <button
          onClick={onClose}
          disabled={loading}
          className="absolute right-[23px] top-[23px] w-6 h-6 flex items-center justify-center hover:bg-gray-100 rounded transition-colors duration-200"
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
          {/* PT 일자 */}
          <div className="absolute left-[38px] top-[85px] w-[478px] flex flex-col gap-2">
            <label className="text-neutral-900 text-sm font-normal font-['Nunito']">
              PT 일자 <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="session_date"
              value={formData.session_date}
              onChange={handleInputChange}
              className="w-full h-12 rounded-[10px] border border-stone-300 px-3 text-sm font-['Nunito'] focus:border-cyan-500 focus:outline-none"
              disabled={loading}
              required
            />
            {errors.session_date && <p className="text-red-500 text-xs">{errors.session_date}</p>}
          </div>

          {/* 세션 유형 */}
          <div className="absolute left-[38px] top-[175px] w-[478px] flex flex-col gap-2">
            <label className="text-neutral-900 text-sm font-normal font-['Nunito']">
              세션 유형
            </label>
            <div className="relative w-full">
              <button
                type="button"
                onClick={() => setShowSessionTypeDropdown(!showSessionTypeDropdown)}
                disabled={loading}
                className="w-full h-12 rounded-[10px] outline outline-1 outline-offset-[-0.50px] outline-stone-300 px-3 text-sm font-['Nunito'] focus:outline-cyan-500 bg-white text-neutral-900 flex items-center justify-between"
              >
                <span>{getSessionTypeText(formData.session_type)}</span>
                <svg
                  width="16"
                  height="8"
                  viewBox="0 0 16 8"
                  fill="none"
                  className={`transition-transform duration-200 ${showSessionTypeDropdown ? 'rotate-180' : ''}`}
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
              {showSessionTypeDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-stone-300 rounded-[10px] shadow-lg z-10">
                  <div className="py-1">
                    <button
                      type="button"
                      onClick={() => {
                        handleInputChange({ target: { name: 'session_type', value: 'regular' } });
                        setShowSessionTypeDropdown(false);
                      }}
                      className="w-full px-3 py-2 text-left text-sm font-['Nunito'] hover:bg-gray-50 transition-colors duration-200"
                    >
                      {getSessionTypeText('regular')}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        handleInputChange({ target: { name: 'session_type', value: 'free' } });
                        setShowSessionTypeDropdown(false);
                      }}
                      className="w-full px-3 py-2 text-left text-sm font-['Nunito'] hover:bg-gray-50 transition-colors duration-200"
                    >
                      {getSessionTypeText('free')}
                    </button>
                  </div>
                </div>
              )}

              {/* 숨겨진 select (폼 제출용) */}
              <select
                name="session_type"
                value={formData.session_type}
                onChange={handleInputChange}
                className="hidden"
                disabled={loading}
              >
                <option value="regular">{getSessionTypeText('regular')}</option>
                <option value="free">{getSessionTypeText('free')}</option>
              </select>
            </div>
          </div>

          {/* 시작 시간 */}
          <div className="absolute left-[38px] top-[265px] w-[230px] flex flex-col gap-2">
            <label className="text-neutral-900 text-sm font-normal font-['Nunito']">
              시작 시간 <span className="text-red-500">*</span>
            </label>
            <input
              type="time"
              name="start_time"
              value={formData.start_time}
              onChange={handleInputChange}
              className="w-full h-12 rounded-[10px] border border-stone-300 px-3 text-sm font-['Nunito'] focus:border-cyan-500 focus:outline-none"
              disabled={loading}
              required
            />
            {errors.start_time && <p className="text-red-500 text-xs">{errors.start_time}</p>}
          </div>

          {/* 종료 시간 */}
          <div className="absolute right-[38px] top-[265px] w-[230px] flex flex-col gap-2">
            <label className="text-neutral-900 text-sm font-normal font-['Nunito']">
              종료 시간 <span className="text-red-500">*</span>
            </label>
            <input
              type="time"
              name="end_time"
              value={formData.end_time}
              onChange={handleInputChange}
              className="w-full h-12 rounded-[10px] border border-stone-300 px-3 text-sm font-['Nunito'] focus:border-cyan-500 focus:outline-none"
              disabled={loading}
              required
            />
            {errors.end_time && <p className="text-red-500 text-xs">{errors.end_time}</p>}
          </div>

          {/* 내용/메모 */}
          <div className="absolute left-[38px] top-[355px] w-[478px] flex flex-col gap-2">
            <label className="text-neutral-900 text-sm font-normal font-['Nunito']">
              내용/메모
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows={4}
              className="w-full rounded-[10px] border border-stone-300 px-3 py-3 text-sm font-['Nunito'] focus:border-cyan-500 focus:outline-none resize-none"
              placeholder="PT 세션 내용이나 특이사항을 입력하세요"
              disabled={loading}
            />
            {errors.notes && <p className="text-red-500 text-xs">{errors.notes}</p>}
          </div>

          {/* 에러 메시지 */}
          {errors.submit && (
            <div className="absolute left-[38px] top-[485px] text-red-500 text-sm">
              {errors.submit}
            </div>
          )}

          {/* 버튼들 */}
          <div className="absolute bottom-[30px] left-[38px] right-[38px] flex justify-between">
            {/* 삭제 버튼 */}
            <button
              type="button"
              onClick={handleDelete}
              disabled={loading}
              className="px-4 py-2 text-red-600 border border-red-500 rounded-lg hover:bg-red-50 transition-colors duration-200 disabled:opacity-50 text-xs drop-shadow-sm"
            >
              삭제
            </button>

            {/* 수정 버튼 */}
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

export default PTSessionEditModal;
