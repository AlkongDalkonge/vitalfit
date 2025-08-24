import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { settlementAPI } from '../utils/api';
import { toast } from 'react-toastify';

const SettlementNotificationModal = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {

    if (isOpen && user?.id) {
      // console.log('🔍 알림 로드 시작');
      loadNotifications();
    } else {
              // console.log('🔍 알림 로드 조건 불만족:', { isOpen, hasUserId: !!user?.id });
    }
  }, [isOpen, user?.id]);

  const loadNotifications = async () => {
    try {
      // console.log('🔍 loadNotifications 시작 - user.id:', user.id);
      setLoading(true);
      const response = await settlementAPI.getNotifications(user.id);
              // console.log('🔍 loadNotifications API 응답:', response);
      
      if (response.success) {
        const notifications = response.data.notifications || [];
                  // console.log('🔍 설정할 알림 데이터:', notifications);
        setNotifications(notifications);
      } else {
        console.error('🔍 API 응답 실패:', response);
        toast.error('알림을 불러오는데 실패했습니다.');
      }
    } catch (error) {
      console.error('🔍 알림 로드 오류:', error);
      toast.error('알림을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationClick = async notification => {
    try {
      // 정산 페이지로 이동
      navigate('/settlement', {
        state: {
          selectedTrainer: notification.settlements?.[0]?.user_id,
          selectedMonth: notification.settlements?.[0] 
            ? `${notification.settlements[0].settlement_year}-${String(notification.settlements[0].settlement_month).padStart(2, '0')}`
            : null,
        },
      });

      onClose();
    } catch (error) {
      console.error('알림 처리 오류:', error);
      toast.error('알림 처리 중 오류가 발생했습니다.');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      // 모든 알림을 읽음 처리 (현재는 단순히 모달만 닫기)
      setNotifications([]);
      onClose();
      toast.success('모든 알림이 읽음 처리되었습니다.');
    } catch (error) {
      console.error('모든 알림 읽음 처리 오류:', error);
      toast.error('알림 처리 중 오류가 발생했습니다.');
    }
  };

  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[80vh] overflow-hidden">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">정산 알림</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">알림을 불러오는 중...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">새로운 알림이 없습니다.</p>
          </div>
        ) : (
          <>
            <div className="max-h-96 overflow-y-auto">
              {notifications.map((notification, index) => (
                <div
                  key={index}
                  onClick={() => handleNotificationClick(notification)}
                  className="border-b border-gray-200 p-3 hover:bg-gray-50 cursor-pointer"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm text-gray-900 mb-1">{notification.title}</p>
                      <p className="text-xs text-gray-500">{notification.message}</p>
                      {notification.settlements && notification.settlements.length > 0 && (
                        <p className="text-xs text-gray-400 mt-1">
                          {notification.settlements[0].settlement_year}년 {notification.settlements[0].settlement_month}월 정산
                        </p>
                      )}
                    </div>
                    {notification.type === 'rejected' && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        반려
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {notifications.length > 1 && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <button
                  onClick={handleMarkAllAsRead}
                  className="w-full text-sm text-gray-600 hover:text-gray-800 py-2"
                >
                  모든 알림 읽음 처리
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SettlementNotificationModal; 