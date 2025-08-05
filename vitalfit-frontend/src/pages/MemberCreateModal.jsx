import React, { useState, useEffect } from 'react';

const MemberCreateModal = ({ isOpen, onClose, onCreate }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    center_id: '',
    trainer_id: '',
    join_date: '',
    expire_date: '',
    total_sessions: '',
    used_sessions: '',
    free_sessions: '',
    memo: '',
    status: 'active',
  });
  const [centers, setCenters] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // 폼 초기화 (모달이 열릴 때마다)
  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: '',
        phone: '',
        center_id: '',
        trainer_id: '',
        join_date: '',
        expire_date: '',
        total_sessions: '',
        used_sessions: '',
        free_sessions: '',
        memo: '',
        status: 'active',
      });
      setErrors({});
    }
  }, [isOpen]);

  // 센터와 트레이너 데이터 가져오기
  useEffect(() => {
    if (isOpen) {
      fetchCentersAndTrainers();
    }
  }, [isOpen]);

  const fetchCentersAndTrainers = async () => {
    try {
      const [centersResponse, trainersResponse] = await Promise.all([
        fetch('http://localhost:3000/api/centers'),
        fetch('http://localhost:3000/api/users?role=trainer'),
      ]);

      const centersData = await centersResponse.json();
      const trainersData = await trainersResponse.json();

      if (centersData.success) setCenters(centersData.data.centers);
      if (trainersData.success) setTrainers(trainersData.data.users);
    } catch (error) {
      console.error('데이터 로드 실패:', error);
    }
  };

  const handleInputChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    // 에러 메시지 초기화
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = '이름은 필수입니다';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = '연락처는 필수입니다';
    }
    if (!formData.center_id) {
      newErrors.center_id = '센터를 선택해주세요';
    }
    if (!formData.trainer_id) {
      newErrors.trainer_id = '트레이너를 선택해주세요';
    }
    if (!formData.join_date) {
      newErrors.join_date = '가입일은 필수입니다';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async e => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:3000/api/member', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        // 성공 시 부모 컴포넌트에 생성 알림
        onCreate(data.data);
        onClose();
        // 성공 메시지 (선택사항)
        alert('새 고객이 성공적으로 등록되었습니다.');
      } else {
        // 에러 메시지 표시
        alert(data.message || '등록에 실패했습니다.');
      }
    } catch (error) {
      console.error('고객 등록 오류:', error);
      alert('등록 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setFormData({
        name: '',
        phone: '',
        center_id: '',
        trainer_id: '',
        join_date: '',
        expire_date: '',
        total_sessions: '',
        used_sessions: '',
        free_sessions: '',
        memo: '',
        status: 'active',
      });
      setErrors({});
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div
        data-layer="고객등록/수정"
        className="w-[738px] h-[771px] relative bg-white overflow-hidden rounded-[10px]"
      >
        {/* 제목 */}
        <div
          data-layer="고객 등록"
          className="left-[50px] top-[34px] absolute justify-start text-black text-xl font-extrabold font-['Nunito']"
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
          <div
            data-layer="Input Field"
            className="w-72 left-[50px] top-[93px] absolute inline-flex flex-col justify-start items-start gap-[5px]"
          >
            <div className="w-72 flex flex-col justify-start items-start gap-2">
              <div
                data-layer="성함"
                className="justify-start text-neutral-900 text-sm font-normal font-['Nunito'] leading-normal"
              >
                성함
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
                />
              </div>
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>
          </div>

          {/* 연락처 */}
          <div
            data-layer="Input Field"
            className="w-72 left-[370px] top-[93px] absolute inline-flex flex-col justify-start items-start gap-[5px]"
          >
            <div className="w-72 flex flex-col justify-start items-start gap-2">
              <div
                data-layer="연락처"
                className="justify-start text-neutral-900 text-sm font-normal font-['Nunito'] leading-normal"
              >
                연락처
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
                />
              </div>
              {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
            </div>
          </div>

          {/* 담당 트레이너 */}
          <div
            data-layer="Input Field"
            className="w-72 left-[50px] top-[199px] absolute inline-flex flex-col justify-start items-start gap-[5px]"
          >
            <div className="w-72 flex flex-col justify-start items-start gap-2">
              <div
                data-layer="담당 트레이너"
                className="justify-start text-neutral-900 text-sm font-normal font-['Nunito'] leading-normal"
              >
                담당 트레이너
              </div>
              <div className="relative w-72 h-12">
                <select
                  name="trainer_id"
                  value={formData.trainer_id}
                  onChange={handleInputChange}
                  required
                  className={`w-72 h-12 rounded-[10px] outline outline-1 outline-offset-[-0.50px] outline-stone-300 px-3 text-sm font-['Nunito'] focus:outline-cyan-500 appearance-none bg-white ${
                    !formData.trainer_id ? 'text-neutral-400' : 'text-neutral-900'
                  }`}
                  disabled={loading}
                >
                  <option value="" className="text-neutral-400">
                    Select option
                  </option>
                  {trainers.map(trainer => (
                    <option key={trainer.id} value={trainer.id}>
                      {trainer.name}
                    </option>
                  ))}
                </select>
                <div className="ArrowDown w-6 h-6 absolute right-3 top-3 pointer-events-none">
                  <div className="Shape w-4 h-2 left-[4px] top-[9px] absolute">
                    <svg width="16" height="8" viewBox="0 0 16 8" fill="none">
                      <path
                        d="M1 1L8 7L15 1"
                        stroke="#1F2937"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </div>
              </div>
              {errors.trainer_id && (
                <p className="text-red-500 text-xs mt-1">{errors.trainer_id}</p>
              )}
            </div>
          </div>

          {/* 소속 센터 */}
          <div
            data-layer="Input Field"
            className="w-72 left-[370px] top-[199px] absolute inline-flex flex-col justify-start items-start gap-[5px]"
          >
            <div className="w-72 flex flex-col justify-start items-start gap-2">
              <div
                data-layer="소속 센터"
                className="justify-start text-neutral-900 text-sm font-normal font-['Nunito'] leading-normal"
              >
                소속 센터
              </div>
              <div className="relative w-72 h-12">
                <select
                  name="center_id"
                  value={formData.center_id}
                  onChange={handleInputChange}
                  required
                  className={`w-72 h-12 rounded-[10px] outline outline-1 outline-offset-[-0.50px] outline-stone-300 px-3 text-sm font-['Nunito'] focus:outline-cyan-500 appearance-none bg-white ${
                    !formData.center_id ? 'text-neutral-400' : 'text-neutral-900'
                  }`}
                  disabled={loading}
                >
                  <option value="" className="text-neutral-400">
                    Select option
                  </option>
                  {centers.map(center => (
                    <option key={center.id} value={center.id}>
                      {center.name}
                    </option>
                  ))}
                </select>
                <div className="ArrowDown w-6 h-6 absolute right-3 top-3 pointer-events-none">
                  <div className="Shape w-4 h-2 left-[4px] top-[9px] absolute">
                    <svg width="16" height="8" viewBox="0 0 16 8" fill="none">
                      <path
                        d="M1 1L8 7L15 1"
                        stroke="#1F2937"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </div>
              </div>
              {errors.center_id && <p className="text-red-500 text-xs mt-1">{errors.center_id}</p>}
            </div>
          </div>

          {/* 등록일 */}
          <div
            data-layer="Input Field"
            className="w-72 left-[50px] top-[305px] absolute inline-flex flex-col justify-start items-start gap-[5px]"
          >
            <div className="w-72 flex flex-col justify-start items-start gap-2">
              <div
                data-layer="등록일"
                className="justify-start text-neutral-900 text-sm font-normal font-['Nunito'] leading-normal"
              >
                등록일
              </div>
              <div className="relative w-72 h-12">
                <input
                  type="date"
                  name="join_date"
                  value={formData.join_date}
                  onChange={handleInputChange}
                  className="w-72 h-12 rounded-[10px] outline outline-1 outline-offset-[-0.50px] outline-stone-300 px-3 text-sm font-['Nunito'] focus:outline-cyan-500 placeholder:text-neutral-400"
                  disabled={loading}
                />
              </div>
              {errors.join_date && <p className="text-red-500 text-xs mt-1">{errors.join_date}</p>}
            </div>
          </div>

          {/* 만료일 */}
          <div
            data-layer="Input Field"
            className="w-72 left-[370px] top-[305px] absolute inline-flex flex-col justify-start items-start gap-[5px]"
          >
            <div className="w-72 flex flex-col justify-start items-start gap-2">
              <div
                data-layer="만료일"
                className="justify-start text-neutral-900 text-sm font-normal font-['Nunito'] leading-normal"
              >
                만료일
              </div>
              <div className="relative w-72 h-12">
                <input
                  type="date"
                  name="expire_date"
                  value={formData.expire_date}
                  onChange={handleInputChange}
                  className="w-72 h-12 rounded-[10px] outline outline-1 outline-offset-[-0.50px] outline-stone-300 px-3 text-sm font-['Nunito'] focus:outline-cyan-500 placeholder:text-neutral-400"
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          {/* 잔여 PT */}
          <div
            data-layer="Input Field"
            className="w-72 left-[50px] top-[412px] absolute inline-flex flex-col justify-start items-start gap-[5px]"
          >
            <div className="w-72 flex flex-col justify-start items-start gap-2">
              <div
                data-layer="잔여 PT"
                className="Pt justify-start text-neutral-900 text-sm font-normal font-['Nunito'] leading-normal"
              >
                잔여 PT
              </div>
              <div className="relative w-72 h-12">
                <input
                  type="number"
                  name="total_sessions"
                  value={formData.total_sessions}
                  onChange={handleInputChange}
                  className="w-72 h-12 rounded-[10px] outline outline-1 outline-offset-[-0.50px] outline-stone-300 px-3 text-sm font-['Nunito'] focus:outline-cyan-500 placeholder:text-neutral-400"
                  placeholder="잔여 PT 수를 입력하세요"
                  min="0"
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          {/* 잔여 무료PT */}
          <div
            data-layer="Input Field"
            className="w-72 left-[370px] top-[412px] absolute inline-flex flex-col justify-start items-start gap-[5px]"
          >
            <div className="w-72 flex flex-col justify-start items-start gap-2">
              <div
                data-layer="잔여 무료PT"
                className="Pt justify-start text-neutral-900 text-sm font-normal font-['Nunito'] leading-normal"
              >
                잔여 무료PT
              </div>
              <div className="relative w-72 h-12">
                <input
                  type="number"
                  name="free_sessions"
                  value={formData.free_sessions}
                  onChange={handleInputChange}
                  className="w-72 h-12 rounded-[10px] outline outline-1 outline-offset-[-0.50px] outline-stone-300 px-3 text-sm font-['Nunito'] focus:outline-cyan-500 placeholder:text-neutral-400"
                  placeholder="잔여 무료PT 수를 입력하세요"
                  min="0"
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          {/* 메모 */}
          <div
            data-layer="Input Field"
            className="w-72 left-[50px] top-[522px] absolute inline-flex flex-col justify-start items-start gap-[5px]"
          >
            <div className="w-72 flex flex-col justify-start items-start gap-2">
              <div
                data-layer="메모"
                className="justify-start text-neutral-900 text-sm font-normal font-['Nunito'] leading-normal"
              >
                메모
              </div>
              <div className="relative">
                <textarea
                  name="memo"
                  value={formData.memo}
                  onChange={handleInputChange}
                  className="w-[608px] h-24 rounded-[10px] outline outline-1 outline-offset-[-0.50px] outline-stone-300 px-3 py-3 text-sm font-['Nunito'] focus:outline-cyan-500 resize-none placeholder:text-neutral-400"
                  placeholder="특이사항"
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          {/* 등록 버튼 */}
          <div
            data-layer="Frame 102"
            className="Frame102 left-[50px] top-[690px] absolute inline-flex justify-start items-start gap-5"
          >
            <button
              type="submit"
              disabled={loading}
              className="Button w-52 h-11 p-2.5 bg-gradient-to-br from-blue-400 to-blue-600 rounded-[10px] flex justify-center items-center gap-2.5 hover:from-blue-500 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/15 before:via-transparent before:to-transparent before:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div
                data-layer="Primary Button"
                className="PrimaryButton justify-start text-white text-sm font-normal font-['Nunito'] leading-normal"
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

export default MemberCreateModal;
