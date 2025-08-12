import React, { useState } from 'react';

const PTSessionCreateModal = ({ isOpen, onClose, memberId, member, onSessionCreated }) => {
  const [formData, setFormData] = useState({
    session_date: '',
    session_type: 'regular',
    start_time: '',
    end_time: '',
    notes: '',
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);

    try {
      // member 정보에서 필요한 데이터 추출
      const submitData = {
        member_id: parseInt(memberId),
        trainer_id: member?.trainer_id || 1, // 멤버의 담당 트레이너
        center_id: member?.center_id || 1, // 멤버의 소속 센터
        session_date: formData.session_date,
        start_time: formData.start_time ? formData.start_time.substring(0, 5) : '', // HH:MM:SS → HH:MM
        end_time: formData.end_time ? formData.end_time.substring(0, 5) : '', // HH:MM:SS → HH:MM
        session_type: formData.session_type,
        signature_data: 'temp_signature', // 임시 서명 데이터
        notes: formData.notes.trim() || undefined, // 빈 문자열은 undefined로 전송
      };

      // 필수 필드 검증
      if (!submitData.member_id || !submitData.trainer_id || !submitData.center_id) {
        throw new Error('필수 정보가 누락되었습니다.');
      }
      const response = await fetch('http://localhost:3000/api/pt-sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch (parseError) {
          throw new Error(`서버 오류 (${response.status}): ${response.statusText}`);
        }
        throw new Error(errorData.message || errorData.details || `서버 오류 (${response.status})`);
      }

      const result = await response.json();

      if (result.success) {
        // 성공 시 콜백 호출하여 목록 새로고침
        if (onSessionCreated) {
          onSessionCreated();
        }
        onClose();
        // 폼 초기화
        setFormData({
          session_date: '',
          session_type: 'regular',
          start_time: '',
          end_time: '',
          notes: '',
        });
      } else {
        throw new Error(result.message || 'PT 세션 등록에 실패했습니다.');
      }
    } catch (error) {
      alert(error.message || '알 수 없는 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="w-[554px] h-[500px] relative bg-white rounded-lg overflow-hidden">
        {/* 제목 */}
        <div className="absolute left-[38px] top-[35px] text-black text-xl font-extrabold font-['Nunito']">
          수업 등록
        </div>

        {/* 닫기 버튼 */}
        <button
          onClick={onClose}
          className="absolute right-[23px] top-[23px] w-6 h-6 flex items-center justify-center hover:bg-gray-100 rounded transition-colors duration-200"
        >
          <svg
            className="w-4 h-4 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <form onSubmit={handleSubmit}>
          {/* 일자 */}
          <div className="absolute left-[38px] top-[90px] w-[216px]">
            <label className="block text-neutral-900 text-sm font-normal font-['Nunito'] leading-normal mb-1.5">
              일자
            </label>
            <input
              type="date"
              name="session_date"
              value={formData.session_date}
              onChange={handleInputChange}
              required
              className="w-[216px] h-9 rounded-[8px] border border-stone-300 px-2 text-neutral-900 text-sm font-normal font-['Nunito'] placeholder:text-neutral-400"
            />
          </div>

          {/* 종류 */}
          <div className="absolute left-[278px] top-[90px] w-[216px]">
            <label className="block text-neutral-900 text-sm font-normal font-['Nunito'] leading-normal mb-1.5">
              종류
            </label>
            <select
              name="session_type"
              value={formData.session_type}
              onChange={handleInputChange}
              required
              className="w-[216px] h-9 rounded-[8px] border border-stone-300 px-2 text-neutral-900 text-sm font-normal font-['Nunito'] placeholder:text-neutral-400"
            >
              <option value="regular">일반</option>
              <option value="free">무료</option>
            </select>
          </div>

          {/* 시작시간 */}
          <div className="absolute left-[38px] top-[175px] w-[216px]">
            <label className="block text-neutral-900 text-sm font-normal font-['Nunito'] leading-normal mb-1.5">
              시작시간
            </label>
            <input
              type="time"
              name="start_time"
              value={formData.start_time}
              onChange={handleInputChange}
              required
              className="w-[216px] h-9 rounded-[8px] border border-stone-300 px-2 text-neutral-900 text-sm font-normal font-['Nunito'] placeholder:text-neutral-400 time-input-small"
            />
          </div>

          {/* 종료시간 */}
          <div className="absolute left-[278px] top-[175px] w-[216px]">
            <label className="block text-neutral-900 text-sm font-normal font-['Nunito'] leading-normal mb-1.5">
              종료시간
            </label>
            <input
              type="time"
              name="end_time"
              value={formData.end_time}
              onChange={handleInputChange}
              required
              className="w-[216px] h-9 rounded-[8px] border border-stone-300 px-2 text-neutral-900 text-sm font-normal font-['Nunito'] placeholder:text-neutral-400 time-input-small"
            />
          </div>

          {/* 수업 내용 */}
          <div className="absolute left-[38px] top-[260px] w-[456px]">
            <label className="block text-neutral-900 text-sm font-normal font-['Nunito'] leading-normal mb-1.5">
              수업
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              placeholder="수업 내용"
              rows={3}
              className="w-[456px] h-18 rounded-[8px] border border-stone-300 px-2 py-1.5 text-neutral-900 text-sm font-normal font-['Nunito'] placeholder:text-neutral-400 resize-none"
            />
          </div>

          {/* 저장 버튼 */}
          <button
            type="submit"
            disabled={loading}
            className="absolute left-[38px] top-[410px] w-52 h-11 p-2.5 bg-gradient-to-br from-blue-400 to-blue-600 rounded-[10px] inline-flex justify-center items-center gap-2.5 hover:from-blue-500 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/15 before:via-transparent before:to-transparent before:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="justify-start text-white text-sm font-normal font-['Nunito'] leading-normal">
              {loading ? '저장 중...' : '저장'}
            </div>
          </button>
        </form>
      </div>
    </div>
  );
};

export default PTSessionCreateModal;
