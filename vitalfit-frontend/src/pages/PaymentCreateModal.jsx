import React, { useState, useEffect } from 'react';
import { paymentAPI, memberAPI, centerAPI, userAPI } from '../utils/api';

const PaymentCreateModal = ({ isOpen, onClose, onCreate, memberId }) => {
  // 폼 데이터 상태
  const [formData, setFormData] = useState({
    member_id: memberId || '',
    trainer_id: '',
    center_id: '',
    payment_amount: '',
    pt_type: 'personal',
    session_count: '',
    free_session_count: '',
    payment_date: new Date().toISOString().split('T')[0],
    payment_method: '',
    notes: '',
  });

  // 드롭다운 데이터 상태
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // 드롭다운 상태
  const [showPaymentMethodDropdown, setShowPaymentMethodDropdown] = useState(false);

  // 결제 방법 옵션
  const paymentMethods = [
    { value: 'cash', label: '현금' },
    { value: 'card', label: '카드' },
    { value: 'transfer', label: '계좌이체' },
    { value: 'mobile', label: '모바일결제' },
  ];

  // PT 타입 옵션
  const ptTypes = [
    { value: 'personal', label: '개인PT' },
    { value: 'group', label: '그룹PT' },
    { value: 'duo', label: '듀오PT' },
  ];

  // 데이터 로드
  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const loadData = async () => {
    try {
      setLoading(true);
      const memberData = await memberAPI.getMember(memberId);

      if (memberData.success) {
        setMember(memberData.data.member);
        // 멤버의 센터와 트레이너 정보를 폼에 자동 설정
        setFormData(prev => ({
          ...prev,
          member_id: memberId,
          trainer_id: memberData.data.member.trainer_id || '',
          center_id: memberData.data.member.center_id || '',
        }));
      }
    } catch (error) {
      console.error('멤버 데이터 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };



  // 입력값 변경 핸들러
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

  // 폼 검증
  const validateForm = () => {
    const newErrors = {};

    if (!formData.payment_amount) {
      newErrors.payment_amount = '결제 금액을 입력해주세요';
    } else if (parseInt(formData.payment_amount) <= 0) {
      newErrors.payment_amount = '결제 금액은 0보다 커야 합니다';
    }

    if (!formData.session_count) {
      newErrors.session_count = '세션 수를 입력해주세요';
    } else if (parseInt(formData.session_count) <= 0) {
      newErrors.session_count = '세션 수는 0보다 커야 합니다';
    }

    if (!formData.payment_date) {
      newErrors.payment_date = '결제 날짜를 선택해주세요';
    }

    if (!formData.payment_method) {
      newErrors.payment_method = '결제 방법을 선택해주세요';
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
      const apiData = {
        member_id: parseInt(formData.member_id),
        trainer_id: parseInt(formData.trainer_id),
        center_id: parseInt(formData.center_id),
        payment_amount: parseInt(formData.payment_amount),
        pt_type: formData.pt_type || 'personal',
        session_count: parseInt(formData.session_count),
        free_session_count: parseInt(formData.free_session_count) || 0,
        payment_date: formData.payment_date,
        payment_method: formData.payment_method,
        notes: formData.notes || null,
      };

      const response = await paymentAPI.createPayment(apiData);

      if (response.success) {
        onCreate(response.data);
        resetForm();
        onClose();
      } else {
        setErrors({ submit: response.message || '등록에 실패했습니다.' });
      }
    } catch (error) {
      console.error('결제 생성 실패:', error);
      setErrors({ submit: '등록 중 오류가 발생했습니다.' });
    } finally {
      setLoading(false);
    }
  };

  // 폼 리셋
  const resetForm = () => {
    setFormData({
      member_id: memberId || '',
      trainer_id: '',
      center_id: '',
      payment_amount: '',
      pt_type: 'personal',
      session_count: '',
      free_session_count: '',
      payment_date: new Date().toISOString().split('T')[0],
      payment_method: '',
      notes: '',
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="w-[750px] h-[520px] bg-white rounded-[20px] relative overflow-hidden">
        {/* 로딩 오버레이 */}
        {loading && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
          </div>
        )}

        {/* 제목 */}
        <div className="left-[50px] top-[40px] absolute justify-start text-black text-xl font-extrabold font-['Nunito'] leading-7">
          결제 등록
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





          {/* 결제 날짜 */}
          <div className="w-72 left-[50px] top-[93px] absolute inline-flex flex-col justify-start items-start gap-[5px]">
            <div className="w-72 flex flex-col justify-start items-start gap-2">
              <div className="justify-start text-neutral-900 text-sm font-normal font-['Nunito'] leading-normal">
                결제 날짜 <span className="text-red-500">*</span>
              </div>
              <div className="relative w-72 h-12">
                <input
                  type="date"
                  name="payment_date"
                  value={formData.payment_date}
                  onChange={handleInputChange}
                  className="w-72 h-12 rounded-[10px] outline outline-1 outline-offset-[-0.50px] outline-stone-300 px-3 text-sm font-['Nunito'] focus:outline-cyan-500"
                  disabled={loading}
                  required
                />
              </div>
              {errors.payment_date && <p className="text-red-500 text-xs mt-1">{errors.payment_date}</p>}
            </div>
          </div>

          {/* 결제 방법 */}
          <div className="w-72 left-[370px] top-[93px] absolute inline-flex flex-col justify-start items-start gap-[5px]">
            <div className="w-72 flex flex-col justify-start items-start gap-2">
              <div className="justify-start text-neutral-900 text-sm font-normal font-['Nunito'] leading-normal">
                결제 방법 <span className="text-red-500">*</span>
              </div>
              <div className="relative w-72">
                <button
                  type="button"
                  onClick={() => setShowPaymentMethodDropdown(!showPaymentMethodDropdown)}
                  disabled={loading}
                  className={`w-72 h-12 rounded-[10px] outline outline-1 outline-offset-[-0.50px] outline-stone-300 px-3 text-sm font-['Nunito'] focus:outline-cyan-500 bg-white flex items-center justify-between ${
                    !formData.payment_method ? 'text-neutral-400' : 'text-neutral-900'
                  }`}
                >
                  <span>
                    {formData.payment_method
                      ? paymentMethods.find(p => p.value === formData.payment_method)?.label || '결제 방법을 선택하세요'
                      : '결제 방법을 선택하세요'}
                  </span>
                  <svg
                    width="16"
                    height="8"
                    viewBox="0 0 16 8"
                    fill="none"
                    className={`transition-transform duration-200 ${showPaymentMethodDropdown ? 'rotate-180' : ''}`}
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

                {showPaymentMethodDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-stone-300 rounded-[10px] shadow-lg z-10">
                    <div className="py-1">
                      {paymentMethods.map(method => (
                        <button
                          key={method.value}
                          type="button"
                          onClick={() => {
                            handleInputChange({
                              target: { name: 'payment_method', value: method.value },
                            });
                            setShowPaymentMethodDropdown(false);
                          }}
                          className="w-full px-3 py-2 text-left text-sm font-['Nunito'] hover:bg-gray-50 transition-colors duration-200"
                        >
                          {method.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <select
                  name="payment_method"
                  value={formData.payment_method}
                  onChange={handleInputChange}
                  required
                  className="hidden"
                  disabled={loading}
                >
                  <option value="">결제 방법을 선택하세요</option>
                  {paymentMethods.map(method => (
                    <option key={method.value} value={method.value}>
                      {method.label}
                    </option>
                  ))}
                </select>
              </div>
              {errors.payment_method && <p className="text-red-500 text-xs mt-1">{errors.payment_method}</p>}
            </div>
          </div>

          {/* PT세션 수 */}
          <div className="w-72 left-[50px] top-[199px] absolute inline-flex flex-col justify-start items-start gap-[5px]">
            <div className="w-72 flex flex-col justify-start items-start gap-2">
              <div className="justify-start text-neutral-900 text-sm font-normal font-['Nunito'] leading-normal">
                PT세션 수 <span className="text-red-500">*</span>
              </div>
              <div className="relative w-72 h-12">
                <input
                  type="number"
                  name="session_count"
                  value={formData.session_count}
                  onChange={handleInputChange}
                  className="w-72 h-12 rounded-[10px] outline outline-1 outline-offset-[-0.50px] outline-stone-300 px-3 text-sm font-['Nunito'] focus:outline-cyan-500 placeholder:text-neutral-400"
                  placeholder="PT세션 수를 입력하세요"
                  disabled={loading}
                  min="1"
                  required
                />
              </div>
              {errors.session_count && <p className="text-red-500 text-xs mt-1">{errors.session_count}</p>}
            </div>
          </div>

          {/* 보너스세션 수 */}
          <div className="w-72 left-[370px] top-[199px] absolute inline-flex flex-col justify-start items-start gap-[5px]">
            <div className="w-72 flex flex-col justify-start items-start gap-2">
              <div className="justify-start text-neutral-900 text-sm font-normal font-['Nunito'] leading-normal">
                보너스세션 수
              </div>
              <div className="relative w-72 h-12">
                <input
                  type="number"
                  name="free_session_count"
                  value={formData.free_session_count}
                  onChange={handleInputChange}
                  className="w-72 h-12 rounded-[10px] outline outline-1 outline-offset-[-0.50px] outline-stone-300 px-3 text-sm font-['Nunito'] focus:outline-cyan-500 placeholder:text-neutral-400"
                  placeholder="보너스세션 수를 입력하세요"
                  disabled={loading}
                  min="0"
                />
              </div>
              {errors.free_session_count && <p className="text-red-500 text-xs mt-1">{errors.free_session_count}</p>}
            </div>
          </div>

          {/* 결제 금액 */}
          <div className="w-72 left-[50px] top-[305px] absolute inline-flex flex-col justify-start items-start gap-[5px]">
            <div className="w-72 flex flex-col justify-start items-start gap-2">
              <div className="justify-start text-neutral-900 text-sm font-normal font-['Nunito'] leading-normal">
                결제 금액 <span className="text-red-500">*</span>
              </div>
              <div className="relative w-72 h-12">
                <input
                  type="number"
                  name="payment_amount"
                  value={formData.payment_amount}
                  onChange={handleInputChange}
                  className="w-72 h-12 rounded-[10px] outline outline-1 outline-offset-[-0.50px] outline-stone-300 px-3 text-sm font-['Nunito'] focus:outline-cyan-500 placeholder:text-neutral-400"
                  placeholder="결제 금액을 입력하세요"
                  disabled={loading}
                  min="1"
                  required
                />
              </div>
              {errors.payment_amount && <p className="text-red-500 text-xs mt-1">{errors.payment_amount}</p>}
            </div>
          </div>

          {/* 메모 */}
          <div className="w-72 left-[370px] top-[305px] absolute inline-flex flex-col justify-start items-start gap-[5px]">
            <div className="w-72 flex flex-col justify-start items-start gap-2 mb-16">
              <div className="justify-start text-neutral-900 text-sm font-normal font-['Nunito'] leading-normal">
                메모
              </div>
              <div className="relative w-72 h-12">
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  className="w-72 h-12 rounded-[10px] outline outline-1 outline-offset-[-0.50px] outline-stone-300 px-3 py-3 text-sm font-['Nunito'] focus:outline-cyan-500 placeholder:text-neutral-400 resize-none"
                  placeholder="메모를 입력하세요"
                  disabled={loading}
                />
              </div>
              {errors.notes && <p className="text-red-500 text-xs mt-1">{errors.notes}</p>}
            </div>
          </div>

          {/* 에러 메시지 */}
          {errors.submit && (
            <div className="left-[50px] top-[494px] absolute text-red-500 text-sm">
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

export default PaymentCreateModal; 