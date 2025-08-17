import React from 'react';
import { formatPhoneNumber } from '../utils/userUtils';

const UserDetailModal = ({ user, isOpen, onClose }) => {
  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* 헤더 */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">직원 상세 정보</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 내용 */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 기본 정보 */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 pb-2">
                기본 정보
              </h3>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">이름</label>
                  <p className="text-gray-800 font-medium">{user.name || '-'}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">이메일</label>
                  <p className="text-gray-800">{user.email || '-'}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">연락처</label>
                  <p className="text-gray-800">{formatPhoneNumber(user.phone) || '-'}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">생년월일</label>
                  <p className="text-gray-800">
                    {user.birthDate ? new Date(user.birthDate).toLocaleDateString('ko-KR') : '-'}
                  </p>
                </div>
              </div>
            </div>

            {/* 직무 정보 */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 pb-2">
                직무 정보
              </h3>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">직책</label>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    user.position?.name?.toLowerCase().includes('관리자') || user.position?.name?.toLowerCase().includes('admin')
                      ? 'text-purple-600 bg-purple-50'
                      : user.position?.name?.toLowerCase().includes('매니저') || user.position?.name?.toLowerCase().includes('manager')
                      ? 'text-blue-600 bg-blue-50'
                      : user.position?.name?.toLowerCase().includes('트레이너') || user.position?.name?.toLowerCase().includes('trainer')
                      ? 'text-cyan-600 bg-cyan-50'
                      : user.position?.name?.toLowerCase().includes('직원') || user.position?.name?.toLowerCase().includes('staff')
                      ? 'text-green-600 bg-green-50'
                      : 'text-gray-600 bg-gray-50'
                  }`}>
                    {user.position?.name || '-'}
                  </span>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">소속 센터</label>
                  <p className="text-gray-800">{user.center?.name || '-'}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">소속 팀</label>
                  <p className="text-gray-800">{user.team?.name || '-'}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">상태</label>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    user.status === 'ACTIVE' ? 'text-green-600 bg-green-50' :
                    user.status === 'INACTIVE' ? 'text-red-600 bg-red-50' :
                    user.status === 'PENDING' ? 'text-yellow-600 bg-yellow-50' :
                    'text-gray-600 bg-gray-50'
                  }`}>
                    {user.status === 'ACTIVE' ? '활성' :
                     user.status === 'INACTIVE' ? '비활성' :
                     user.status === 'PENDING' ? '대기중' : '-'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 추가 정보 */}
          <div className="mt-6 space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 pb-2">
              추가 정보
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">가입일</label>
                <p className="text-gray-800">
                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString('ko-KR') : '-'}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">마지막 로그인</label>
                <p className="text-gray-800">
                  {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString('ko-KR') : '-'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 푸터 */}
        <div className="flex justify-end p-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors duration-200"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserDetailModal; 