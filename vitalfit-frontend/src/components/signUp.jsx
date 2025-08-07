import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function SignUp() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    phone: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // 비밀번호 확인
    if (formData.password !== formData.confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      setLoading(false);
      return;
    }

    try {
      // TODO: 실제 회원가입 API 호출
      console.log('회원가입 요청:', formData);

      // 임시로 성공 처리
      alert('회원가입이 완료되었습니다!');
      navigate('/login');
    } catch (err) {
      setError('회원가입 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex">
      {/* 왼쪽 이미지 섹션 */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-cyan-500 to-indigo-800 relative">
        <div className="absolute inset-0 bg-black bg-opacity-20"></div>
        <div className="relative z-10 flex flex-col justify-center items-center text-white p-12">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">VitalFit</h1>
            <p className="text-xl opacity-90">건강한 라이프스타일을 위한 최고의 선택</p>
          </div>

          <div className="w-64 h-64 bg-white bg-opacity-10 rounded-full flex items-center justify-center mb-8">
            <img src="/logo.png" alt="VitalFit Logo" className="w-32 h-32 object-contain" />
          </div>

          <div className="text-center">
            <p className="text-lg opacity-90">함께 건강한 미래를 만들어가세요</p>
          </div>
        </div>
      </div>

      {/* 오른쪽 회원가입 폼 섹션 */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* 헤더 */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">회원가입</h2>
            <p className="text-gray-600">새로운 계정을 만들어보세요</p>
          </div>

          {/* 회원가입 폼 */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">이름</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your name"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">이메일 주소</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter email address"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">전화번호</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter phone number"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">비밀번호</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter password"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">비밀번호 확인</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm password"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-colors"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-cyan-500 to-indigo-600 text-white py-3 px-4 rounded-lg hover:from-cyan-600 hover:to-indigo-700 focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '회원가입 중...' : '회원가입'}
            </button>

            <div className="text-center">
              <span className="text-sm text-gray-600">이미 계정이 있으신가요? </span>
              <button
                type="button"
                onClick={handleSignIn}
                className="text-sm text-cyan-600 hover:text-cyan-500 transition-colors"
              >
                로그인
              </button>
            </div>
          </form>

          {/* 에러 메시지 */}
          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
