import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';
import { getReAuthToken } from '../utils/reAuthUtils';

const PasswordChangeForm = ({ onReAuthRequired }) => {
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // 비밀번호 표시/숨김 상태
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // 비밀번호 강도 및 일치 여부 상태
  const [passwordStrength, setPasswordStrength] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
  });
  const [passwordMatch, setPasswordMatch] = useState(null);

  // 비밀번호 강도 검증 함수
  const validatePasswordStrength = password => {
    const strength = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password),
    };
    setPasswordStrength(strength);
    return strength;
  };

  // 비밀번호 일치 여부 확인
  const checkPasswordMatch = (newPassword, confirmPassword) => {
    if (newPassword && confirmPassword) {
      const isMatch = newPassword === confirmPassword;
      setPasswordMatch(isMatch);
    } else {
      setPasswordMatch(null);
    }
  };

  const handleInputChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(''); // 입력 시 에러 메시지 제거

    // 새 비밀번호 변경 시 강도 검증
    if (name === 'newPassword') {
      validatePasswordStrength(value);
      // 확인 비밀번호가 이미 입력되어 있으면 일치 여부 확인
      if (formData.confirmPassword) {
        checkPasswordMatch(value, formData.confirmPassword);
      }
    }

    // 확인 비밀번호 변경 시 일치 여부 확인
    if (name === 'confirmPassword') {
      if (formData.newPassword) {
        checkPasswordMatch(formData.newPassword, value);
      }
    }
  };

  // 실제 비밀번호 변경 로직을 별도 함수로 분리
  const performPasswordChange = async e => {
    e.preventDefault();

    // 유효성 검사
    if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
      setError('모든 필드를 입력해주세요.');
      return;
    }

    // 비밀번호 강도 검증
    const strength = validatePasswordStrength(formData.newPassword);
    const isStrongPassword = Object.values(strength).every(Boolean);

    if (!isStrongPassword) {
      setError('비밀번호는 8자 이상, 대문자, 소문자, 숫자, 특수문자를 모두 포함해야 합니다.');
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError('새 비밀번호와 확인 비밀번호가 일치하지 않습니다.');
      return;
    }

    if (formData.currentPassword === formData.newPassword) {
      setError('새 비밀번호는 현재 비밀번호와 달라야 합니다.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // 토큰 확인 - 액세스 토큰과 재인증 토큰 모두 확인
      const accessToken = localStorage.getItem('accessToken');
      const userId = user?.id || user?.uid;
      const reAuthToken = getReAuthToken(userId, '/account');

      if (!accessToken && !reAuthToken) {
        setError('인증이 필요합니다. 다시 로그인해주세요.');
        return;
      }

      // 사용할 토큰 결정 (재인증 토큰이 있으면 우선 사용)
      const tokenToUse = reAuthToken || accessToken;

      const response = await fetch('http://localhost:3001/api/users/change-password', {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${tokenToUse}`,
          'Content-Type': 'application/json',
          // 재인증 토큰이 있으면 x-reauth-token 헤더 추가
          ...(reAuthToken && { 'x-reauth-token': reAuthToken }),
        },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        }),
      });

      if (response.ok) {
        toast.success('비밀번호가 성공적으로 변경되었습니다.');
        setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });

        // 비밀번호 변경 성공 후 재인증 상태 초기화 (보안상 필요)
        // 이 부분은 백엔드에서 토큰을 무효화하는 경우를 대비한 처리
      } else {
        const errorData = await response.json();
        console.error('API 오류:', errorData);

        // 401 에러인 경우 더 명확한 메시지 표시
        if (response.status === 401) {
          setError('인증이 만료되었습니다. 다시 로그인해주세요.');
        } else {
          setError(errorData.message || '비밀번호 변경에 실패했습니다.');
        }
      }
    } catch (error) {
      console.error('비밀번호 변경 중 오류 발생:', error);
      setError('네트워크 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();

    // 저장할 때마다 재인증 요구
    if (onReAuthRequired) {
      onReAuthRequired(async () => {
        try {
          await performPasswordChange(e);
        } catch (error) {
          console.error('재인증 후 비밀번호 변경 실패:', error);
        }
      });
      return;
    }

    // 재인증이 필요하지 않은 경우 바로 실행
    await performPasswordChange(e);
  };

  // 사용자 정보가 없으면 로딩 표시
  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">사용자 정보를 불러오는 중...</h2>
          <p className="text-gray-600">잠시만 기다려주세요.</p>
        </div>
      </div>
    );
  }

  // 비밀번호 변경 폼 표시
  return (
    <div className="w-full bg-white flex items-center justify-center">
      <div className="max-w-2xl w-full">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-800">암호설정</h1>
          <p className="text-lg text-gray-600">안전한 비밀번호로 변경하세요</p>
        </div>

        <div className="bg-white rounded-lg p-8">
          <form onSubmit={handleSubmit}>
            {/* 현재 비밀번호 입력 */}
            <div>
              <label className="block text-base font-medium text-gray-700 mb-2">
                현재 비밀번호
              </label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                  placeholder="현재 비밀번호를 입력하세요"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-lg"
                >
                  {showCurrentPassword ? '★' : '☆'}
                </button>
              </div>
            </div>

            {/* 새 비밀번호 입력 */}
            <div className="mt-10">
              <label className="block text-base font-medium text-gray-700 mb-2">새 비밀번호</label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                  placeholder="새 비밀번호를 입력하세요"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-lg"
                >
                  {showNewPassword ? '★' : '☆'}
                </button>
              </div>
            </div>

            {/* 비밀번호 강도 표시 */}
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-3 h-3 rounded-full ${passwordStrength.length ? 'bg-green-500' : 'bg-gray-300'}`}
                  ></div>
                  <span
                    className={`text-sm ${passwordStrength.length ? 'text-green-600' : 'text-gray-500'}`}
                  >
                    최소 8자 이상
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-3 h-3 rounded-full ${passwordStrength.uppercase ? 'bg-green-500' : 'bg-gray-300'}`}
                  ></div>
                  <span
                    className={`text-sm ${passwordStrength.uppercase ? 'text-green-600' : 'text-gray-500'}`}
                  >
                    대문자 포함
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-3 h-3 rounded-full ${passwordStrength.lowercase ? 'bg-green-500' : 'bg-gray-300'}`}
                  ></div>
                  <span
                    className={`text-sm ${passwordStrength.lowercase ? 'text-green-600' : 'text-gray-500'}`}
                  >
                    소문자 포함
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-3 h-3 rounded-full ${passwordStrength.number ? 'bg-green-500' : 'bg-gray-300'}`}
                  ></div>
                  <span
                    className={`text-sm ${passwordStrength.number ? 'text-green-600' : 'text-gray-500'}`}
                  >
                    숫자 포함
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-3 h-3 rounded-full ${passwordStrength.special ? 'bg-green-500' : 'bg-gray-300'}`}
                  ></div>
                  <span
                    className={`text-sm ${passwordStrength.special ? 'text-green-600' : 'text-gray-500'}`}
                  >
                    특수문자 포함
                  </span>
                </div>
              </div>
            </div>

            {/* 확인 비밀번호 입력 */}
            <div className="mt-10">
              <label className="block text-base font-medium text-gray-700 mb-2">
                확인 비밀번호
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base ${
                    passwordMatch === true
                      ? 'border-green-500 bg-green-50'
                      : passwordMatch === false
                        ? 'border-red-500 bg-red-50'
                        : 'border-gray-300'
                  }`}
                  placeholder="새 비밀번호를 다시 입력하세요"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-lg"
                >
                  {showConfirmPassword ? '★' : '☆'}
                </button>
              </div>
            </div>

            {/* 비밀번호 일치 여부 표시 */}
            {formData.confirmPassword && (
              <div className="mt-4 flex items-center space-x-3">
                <div
                  className={`w-3 h-3 rounded-full ${
                    passwordMatch ? 'bg-green-500' : 'bg-red-500'
                  }`}
                ></div>
                <span className={`text-sm ${passwordMatch ? 'text-green-600' : 'text-red-600'}`}>
                  {passwordMatch ? '비밀번호가 일치합니다' : '비밀번호가 일치하지 않습니다'}
                </span>
              </div>
            )}

            {/* 에러 메시지 */}
            {error && (
              <div className="mt-6 text-red-600 text-base bg-red-50 p-4 rounded-md">{error}</div>
            )}

            {/* 제출 버튼 */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-8 bg-gradient-to-r from-cyan-500 to-indigo-600 text-white py-3 px-6 rounded-[10px] hover:from-cyan-600 hover:to-indigo-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg text-lg font-medium"
            >
              {isLoading ? '변경 중...' : '설정'}
            </button>
          </form>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-left">
            <p className="text-base text-blue-800">
              <strong>보안 안내:</strong> 개인정보보호법 제24조의2(개인정보의 안전성 확보조치)에
              따라 비밀번호는 <br />
              8자 이상, 대문자, 소문자, 숫자, 특수문자를 모두 포함하여 설정해주시기 바랍니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PasswordChangeForm;
