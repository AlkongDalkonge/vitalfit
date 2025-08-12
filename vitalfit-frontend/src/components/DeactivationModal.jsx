import React, { useState } from 'react';

const DeactivationModal = ({ isOpen, onClose, onDeactivationSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [confirmText, setConfirmText] = useState('');

  const handleDeactivation = async () => {
    if (confirmText !== 'DELETE') {
      alert('정확히 "DELETE"를 입력해주세요.');
      return;
    }

    setIsLoading(true);
    try {
      // 회원 탈퇴 API 호출
      const response = await fetch('http://localhost:3001/api/users/me', {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        onDeactivationSuccess();
        onClose();
      } else {
        const errorData = await response.json();
        alert(`회원 탈퇴 실패: ${errorData.message || '알 수 없는 오류가 발생했습니다.'}`);
      }
    } catch (error) {
      console.error('회원 탈퇴 오류:', error);
      alert('회원 탈퇴 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h2 className="text-xl font-bold text-red-600 mb-4">회원 탈퇴</h2>

        <div className="mb-6">
          <p className="text-gray-700 mb-4">
            정말로 회원 탈퇴를 하시겠습니까? 이 작업은 되돌릴 수 없습니다.
          </p>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-red-800 text-sm font-medium mb-2">⚠️ 주의사항</p>
            <ul className="text-red-700 text-sm space-y-1">
              <li>• 모든 데이터가 영구적으로 삭제됩니다</li>
              <li>• 프로필 이미지, 계정 정보 등이 사라집니다</li>
              <li>• 로그인이 불가능해집니다</li>
            </ul>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              확인을 위해 "DELETE"를 입력하세요
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={e => setConfirmText(e.target.value)}
              placeholder="DELETE"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            취소
          </button>
          <button
            onClick={handleDeactivation}
            disabled={isLoading || confirmText !== 'DELETE'}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? '처리 중...' : '회원 탈퇴'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeactivationModal;
