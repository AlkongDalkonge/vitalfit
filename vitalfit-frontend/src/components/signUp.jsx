import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

export default function SignUp() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    phone: '',
    position_id: '',
    center_id: '',
    terms_accepted: false,
    privacy_accepted: false,
  });
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [positions, setPositions] = useState([]);
  const [centers, setCenters] = useState([]);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [modalContent, setModalContent] = useState('');
  const [modalTitle, setModalTitle] = useState('');
  const fileInputRef = useRef(null);

  // 드롭다운 상태 추가
  const [showPositionDropdown, setShowPositionDropdown] = useState(false);
  const [showCenterDropdown, setShowCenterDropdown] = useState(false);

  const navigate = useNavigate();

  // 드롭다운 토글 함수들
  const togglePositionDropdown = () => {
    console.log('직책 드롭다운 토글:', !showPositionDropdown);
    setShowPositionDropdown(!showPositionDropdown);
    setShowCenterDropdown(false); // 다른 드롭다운 닫기
  };

  const toggleCenterDropdown = () => {
    console.log('센터 드롭다운 토글:', !showCenterDropdown);
    setShowCenterDropdown(!showCenterDropdown);
    setShowPositionDropdown(false); // 다른 드롭다운 닫기
  };

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = event => {
      if (!event.target.closest('.dropdown-container')) {
        setShowPositionDropdown(false);
        setShowCenterDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // 컴포넌트 마운트 시 position과 center 데이터 로드
  useEffect(() => {
    loadPositions();
    loadCenters();
  }, []);

  const loadPositions = async () => {
    try {
      console.log('포지션 데이터 로드 시작...');
      const response = await fetch('/api/users/positions');
      console.log('포지션 응답 상태:', response.status);
      if (response.ok) {
        const data = await response.json();
        console.log('포지션 데이터:', data);
        setPositions(data.data);
      } else {
        console.error('포지션 응답 오류:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('포지션 데이터 로드 실패:', error);
    }
  };

  const loadCenters = async () => {
    try {
      console.log('센터 데이터 로드 시작...');
      const response = await fetch('/api/users/centers');
      console.log('센터 응답 상태:', response.status);
      if (response.ok) {
        const data = await response.json();
        console.log('센터 데이터:', data);
        setCenters(data.data);
      } else {
        console.error('센터 응답 오류:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('센터 데이터 로드 실패:', error);
    }
  };

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleImageChange = e => {
    const file = e.target.files[0];
    if (file) {
      // 파일 크기 검증 (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('이미지 파일 크기는 5MB 이하여야 합니다.');
        return;
      }

      // 파일 타입 검증
      if (!file.type.startsWith('image/')) {
        setError('이미지 파일만 업로드 가능합니다.');
        return;
      }

      setProfileImage(file);
      setError('');

      // 이미지 미리보기 생성
      const reader = new FileReader();
      reader.onload = e => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageRemove = () => {
    setProfileImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const openTermsModal = async () => {
    try {
      const response = await fetch('/api/users/terms');
      const content = await response.text();
      setModalTitle('이용약관');
      setModalContent(content);
      setShowTermsModal(true);
    } catch (error) {
      console.error('약관 로드 실패:', error);
      setError('약관을 불러오는데 실패했습니다.');
    }
  };

  const openPrivacyModal = async () => {
    try {
      const response = await fetch('/api/users/privacy');
      const content = await response.text();
      setModalTitle('개인정보처리방침');
      setModalContent(content);
      setShowPrivacyModal(true);
    } catch (error) {
      console.error('개인정보처리방침 로드 실패:', error);
      setError('개인정보처리방침을 불러오는데 실패했습니다.');
    }
  };

  const closeModal = () => {
    setShowTermsModal(false);
    setShowPrivacyModal(false);
    setModalContent('');
    setModalTitle('');
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // 필수 필드 검증
    if (
      !formData.name ||
      !formData.email ||
      !formData.password ||
      !formData.confirmPassword ||
      !formData.phone
    ) {
      setError('모든 필수 항목을 입력해주세요.');
      setLoading(false);
      return;
    }

    // position과 center 선택 검증
    if (!formData.position_id || !formData.center_id) {
      setError('직책과 센터를 선택해주세요.');
      setLoading(false);
      return;
    }

    // 비밀번호 확인
    if (formData.password !== formData.confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      setLoading(false);
      return;
    }

    // 약관 동의 확인
    if (!formData.terms_accepted || !formData.privacy_accepted) {
      setError('이용약관과 개인정보처리방침에 동의해주세요.');
      setLoading(false);
      return;
    }

    try {
      const formDataToSend = new FormData();

      // 기본 정보 추가
      formDataToSend.append('email', formData.email);
      formDataToSend.append('password', formData.password);
      formDataToSend.append('confirmPassword', formData.confirmPassword);
      formDataToSend.append('name', formData.name);
      formDataToSend.append('phone', formData.phone);
      formDataToSend.append('position_id', formData.position_id);
      formDataToSend.append('center_id', formData.center_id);
      formDataToSend.append('terms_accepted', formData.terms_accepted);
      formDataToSend.append('privacy_accepted', formData.privacy_accepted);

      // 프로필 이미지가 있으면 추가
      if (profileImage) {
        formDataToSend.append('profile_image_url', profileImage);
      }

      console.log('전송할 데이터:', {
        email: formData.email,
        name: formData.name,
        phone: formData.phone,
        position_id: formData.position_id,
        center_id: formData.center_id,
        hasImage: !!profileImage,
      });

      const response = await fetch('/api/users/signup', {
        method: 'POST',
        body: formDataToSend,
      });

      console.log('응답 상태:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('응답 에러 텍스트:', errorText);
        try {
          const errorData = JSON.parse(errorText);
          setError(errorData.message || '회원가입 중 오류가 발생했습니다.');
        } catch (e) {
          setError(`서버 오류: ${response.status} ${response.statusText}`);
        }
        return;
      }

      const data = await response.json();
      console.log('응답 데이터:', data);

      if (response.ok) {
        toast.success('회원가입이 완료되었습니다! 로그인 페이지로 이동합니다.');
        navigate('/login');
      } else {
        setError(data.message || '회원가입 중 오류가 발생했습니다.');
      }
    } catch (err) {
      console.error('회원가입 오류:', err);
      setError('회원가입 중 오류가 발생했습니다. 네트워크 연결을 확인해주세요.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = () => {
    navigate('/login');
  };
  return (
    <div className="min-h-screen flex bg-gradient-to-br from-cyan-500 to-indigo-800">
      {/* 왼쪽 박스 섹션 */}
      <div className="flex w-1/2 justify-end items-center">
        <div className="w-[550px] h-[706px] bg-white/20 backdrop-blur-sm rounded-l-3xl shadow-2xl border border-white/30 overflow-hidden">
          <img src="/img/main.jpg" alt="Main Image" className="w-full h-full object-cover" />
        </div>
      </div>

      {/* 오른쪽 회원가입 폼 섹션 */}
      <div className="flex w-1/2 justify-start items-center">
        <div className="w-[550px] h-[706px] bg-white rounded-r-3xl p-8 shadow-2xl border border-white/30 overflow-y-auto relative z-10">
          <div className="max-w-xs mx-auto py-6">
            {/* 헤더 */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">회원가입</h2>
              <p className="text-sm text-gray-600">새로운 계정을 만들어보세요</p>
            </div>

            {/* 회원가입 폼 */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 프로필 이미지 업로드 */}
              <div className="text-center">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  프로필 이미지 <span className="text-gray-500 text-xs">(선택사항)</span>
                </label>
                <div className="flex flex-col items-center space-y-4">
                  {/* 이미지 미리보기 */}
                  {imagePreview ? (
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="프로필 미리보기"
                        className="w-20 h-20 rounded-full object-cover border-2 border-gray-300"
                      />
                      <button
                        type="button"
                        onClick={handleImageRemove}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                      >
                        ×
                      </button>
                    </div>
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center">
                      <svg
                        className="w-6 h-6 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                    </div>
                  )}

                  {/* 파일 업로드 버튼 */}
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors text-xs"
                    >
                      {imagePreview ? '변경' : '선택'}
                    </button>
                    {imagePreview && (
                      <button
                        type="button"
                        onClick={handleImageRemove}
                        className="px-3 py-1 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-xs"
                      >
                        삭제
                      </button>
                    )}
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />

                  <p className="text-xs text-gray-500">JPG, PNG, GIF (최대 5MB)</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  이름 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="이름을 입력하세요"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  이메일 주소 <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="이메일을 입력하세요"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  전화번호 <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="010-1234-5678"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  비밀번호 <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="비밀번호를 입력하세요 (최소 8자)"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-colors"
                  required
                  minLength={8}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  비밀번호 확인 <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="비밀번호를 다시 입력하세요"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-colors"
                  required
                />
              </div>

              {/* 직책 선택 */}
              <div className="relative dropdown-container">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  직책 <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={togglePositionDropdown}
                  disabled={loading}
                  className={`w-full h-12 rounded-[10px] outline outline-1 outline-offset-[-0.50px] outline-stone-300 px-3 text-sm font-['Nunito'] focus:outline-cyan-500 bg-white flex items-center justify-between ${
                    !formData.position_id ? 'text-neutral-400' : 'text-neutral-900'
                  }`}
                >
                  <span>
                    {formData.position_id
                      ? positions.find(p => p.id === parseInt(formData.position_id))?.name
                      : '직책을 선택하세요'}
                  </span>
                  <svg
                    width="16"
                    height="8"
                    viewBox="0 0 16 8"
                    fill="none"
                    className={`transition-transform duration-200 ${showPositionDropdown ? 'rotate-180' : ''}`}
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
                {showPositionDropdown && (
                  <div className="absolute bottom-full left-0 right-0 mb-1 bg-white border border-stone-300 rounded-[10px] shadow-lg z-[9999]">
                    <div className="py-1">
                      {positions.map(position => (
                        <button
                          key={position.id}
                          type="button"
                          onClick={() => {
                            handleChange({ target: { name: 'position_id', value: position.id } });
                            togglePositionDropdown();
                          }}
                          className="w-full px-3 py-2 text-left text-sm font-['Nunito'] hover:bg-gray-50 transition-colors duration-200"
                        >
                          {position.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* 숨겨진 select (폼 제출용) */}
                <select
                  name="position_id"
                  value={formData.position_id}
                  onChange={handleChange}
                  required
                  className="hidden"
                  disabled={loading}
                >
                  <option value="">직책을 선택하세요</option>
                  {positions.map(position => (
                    <option key={position.id} value={position.id}>
                      {position.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* 센터 선택 */}
              <div className="relative dropdown-container">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  센터 <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={toggleCenterDropdown}
                  disabled={loading}
                  className={`w-full h-12 rounded-[10px] outline outline-1 outline-offset-[-0.50px] outline-stone-300 px-3 text-sm font-['Nunito'] focus:outline-cyan-500 bg-white flex items-center justify-between ${
                    !formData.center_id ? 'text-neutral-400' : 'text-neutral-900'
                  }`}
                >
                  <span>
                    {formData.center_id
                      ? centers.find(c => c.id === parseInt(formData.center_id))?.name
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
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-stone-300 rounded-[10px] shadow-lg z-[9999]">
                    <div className="py-1">
                      {centers.map(center => (
                        <button
                          key={center.id}
                          type="button"
                          onClick={() => {
                            handleChange({ target: { name: 'center_id', value: center.id } });
                            toggleCenterDropdown();
                          }}
                          className="w-full px-3 py-2 text-left text-sm font-['Nunito'] hover:bg-gray-50 transition-colors duration-200"
                        >
                          {center.name} - {center.address}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* 숨겨진 select (폼 제출용) */}
                <select
                  name="center_id"
                  value={formData.center_id}
                  onChange={handleChange}
                  required
                  className="hidden"
                  disabled={loading}
                >
                  <option value="">센터를 선택하세요</option>
                  {centers.map(center => (
                    <option key={center.id} value={center.id}>
                      {center.name} - {center.address}
                    </option>
                  ))}
                </select>
              </div>

              {/* 약관 동의 */}
              <div className="space-y-3">
                <div className="flex items-start">
                  <input
                    type="checkbox"
                    name="terms_accepted"
                    checked={formData.terms_accepted}
                    onChange={handleChange}
                    className="mt-1 h-4 w-4 text-cyan-600 focus:ring-cyan-500 border-gray-300 rounded"
                    required
                  />
                  <label className="ml-2 text-sm text-gray-700">
                    <button
                      type="button"
                      onClick={openTermsModal}
                      className="text-cyan-600 hover:text-cyan-500 underline"
                    >
                      이용약관
                    </button>
                    에 동의합니다 <span className="text-red-500">*</span>
                  </label>
                </div>

                <div className="flex items-start">
                  <input
                    type="checkbox"
                    name="privacy_accepted"
                    checked={formData.privacy_accepted}
                    onChange={handleChange}
                    className="mt-1 h-4 w-4 text-cyan-600 focus:ring-cyan-500 border-gray-300 rounded"
                    required
                  />
                  <label className="ml-2 text-sm text-gray-700">
                    <button
                      type="button"
                      onClick={openPrivacyModal}
                      className="text-cyan-600 hover:text-cyan-500 underline"
                    >
                      개인정보처리방침
                    </button>
                    에 동의합니다 <span className="text-red-500">*</span>
                  </label>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="Button w-full h-11 p-2.5 bg-gradient-to-r from-cyan-500 to-indigo-600 rounded-[10px] inline-flex justify-center items-center gap-2.5 hover:from-cyan-600 hover:to-indigo-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                <div className="PrimaryButton justify-start text-white text-sm font-normal font-['Nunito'] leading-normal">
                  {loading ? '회원가입 중...' : '회원가입'}
                </div>
              </button>

              <div className="text-center pt-2">
                <p className="text-sm text-gray-600 mb-4">이미 계정이 있으신가요?</p>
                <button
                  type="button"
                  onClick={handleSignIn}
                  className="Button w-24 h-11 p-2.5 rounded-[10px] bg-gradient-to-r from-cyan-500 to-indigo-600 p-[1px] inline-flex justify-center items-center gap-2.5 shadow-md"
                >
                  <div className="w-full h-full bg-white rounded-[9px] flex items-center justify-center">
                    <div className="PrimaryButton justify-start bg-gradient-to-r from-cyan-500 to-indigo-600 bg-clip-text text-transparent text-sm font-normal font-['Nunito'] leading-normal">
                      Sign In
                    </div>
                  </div>
                </button>
              </div>
            </form>

            {/* 에러 메시지 */}
            {error && (
              <div className="mt-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-xs">
                {error}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 약관 모달 */}
      {(showTermsModal || showPrivacyModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-semibold">{modalTitle}</h3>
              <button onClick={closeModal} className="text-gray-500 hover:text-gray-700 text-2xl">
                ×
              </button>
            </div>
            <div className="p-4 overflow-y-auto max-h-[60vh]">
              <div dangerouslySetInnerHTML={{ __html: modalContent }} />
            </div>
            <div className="p-4 border-t">
              <button
                onClick={closeModal}
                className="w-full bg-cyan-500 text-white py-2 px-4 rounded-lg hover:bg-cyan-600 transition-colors"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
