import React, { useState, useEffect } from "react";

const PTSessionEditModal = ({
  isOpen,
  onClose,
  sessionData,
  onSessionUpdated,
  onSessionDeleted,
}) => {
  const [formData, setFormData] = useState({
    session_date: "",
    session_type: "regular",
    start_time: "",
    end_time: "",
    notes: "",
  });
  const [loading, setLoading] = useState(false);

  // 세션 데이터가 변경될 때 폼 데이터 초기화
  useEffect(() => {
    if (sessionData) {
      setFormData({
        session_date: sessionData.session_date || "",
        session_type: sessionData.session_type || "regular",
        start_time: sessionData.start_time || "",
        end_time: sessionData.end_time || "",
        notes: sessionData.notes || "",
      });
    }
  }, [sessionData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 백엔드 스키마에 맞게 데이터 형식 조정
      const submitData = {
        session_date: formData.session_date,
        start_time: formData.start_time
          ? formData.start_time.substring(0, 5)
          : "", // HH:MM:SS → HH:MM
        end_time: formData.end_time ? formData.end_time.substring(0, 5) : "", // HH:MM:SS → HH:MM
        session_type: formData.session_type,
        notes: formData.notes.trim() || undefined, // 빈 문자열은 undefined로 전송
        // signature_data와 signature_time은 선택사항이므로 기존 값 유지
      };

      const response = await fetch(
        `http://localhost:3000/api/pt-sessions/${sessionData.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(submitData),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || result.details || "PT 세션 수정에 실패했습니다."
        );
      }
      if (result.success) {
        // 성공 시 콜백 호출하여 목록 새로고침
        if (onSessionUpdated) {
          onSessionUpdated();
        }
        onClose();
      } else {
        throw new Error(result.message || "PT 세션 수정에 실패했습니다.");
      }
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!sessionData?.id) return;

    const confirmDelete = window.confirm(
      "정말로 이 PT 기록을 삭제하시겠습니까?\n삭제된 데이터는 복구할 수 없습니다."
    );

    if (!confirmDelete) return;

    setLoading(true);

    try {
      const response = await fetch(
        `http://localhost:3000/api/pt-sessions/${sessionData.id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const result = await response.json();

      if (result.success) {
        alert("PT 기록이 성공적으로 삭제되었습니다.");
        onClose();
        if (onSessionDeleted) {
          onSessionDeleted();
        }
      } else {
        throw new Error(result.message || "PT 기록 삭제에 실패했습니다.");
      }
    } catch (error) {
      alert(error.message);
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
          PT 수정
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

          {/* 버튼 컨테이너 */}
          <div className="absolute left-[38px] top-[410px] w-[456px] flex justify-between items-center">
            {/* 수정 버튼 */}
            <button
              type="submit"
              disabled={loading}
              className="w-52 h-11 p-2.5 bg-gradient-to-br from-blue-400 to-blue-600 rounded-[10px] inline-flex justify-center items-center gap-2.5 hover:from-blue-500 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/15 before:via-transparent before:to-transparent before:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="justify-start text-white text-sm font-normal font-['Nunito'] leading-normal">
                {loading ? "수정 중..." : "수정"}
              </div>
            </button>

            {/* 삭제 버튼 */}
            <button
              type="button"
              onClick={handleDelete}
              disabled={loading}
              className="w-11 h-11 p-2.5 bg-gradient-to-br from-gray-400/80 to-gray-600/80 rounded-[10px] inline-flex justify-center items-center hover:from-gray-500/90 hover:to-gray-700/90 transition-all duration-200 shadow-lg hover:shadow-xl relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/15 before:via-transparent before:to-transparent before:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PTSessionEditModal;
