import React, { useState, useEffect } from 'react';
import { centerAPI, memberAPI } from '../utils/api';
import CenterImageModal from '../components/CenterImageModal';
import { useUser } from '../utils/hooks';

// API 기본 URL 환경 변수
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

const CenterPage = () => {
  const [expandedCenter, setExpandedCenter] = useState(null);
  const [centers, setCenters] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 이미지 모달 상태
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [selectedCenter, setSelectedCenter] = useState(null);

  // 유저 데이터 가져오기
  const { users: allUsers } = useUser();

  // 센터와 회원 데이터 가져오기
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [centersResponse, membersResponse] = await Promise.all([
          centerAPI.getAllCenters(),
          memberAPI.getAllMembers(),
        ]);
        setCenters(centersResponse.data.centers || []);
        setMembers(membersResponse.data.members || []);
        setError(null);
      } catch (err) {
        console.error('데이터 가져오기 실패:', err);
        setError('데이터를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const toggleCenter = centerId => {
    setExpandedCenter(expandedCenter === centerId ? null : centerId);
  };

  // 이미지 관리 모달 열기
  const handleImageManagement = center => {
    setSelectedCenter(center);
    setImageModalOpen(true);
  };

  // 이미지 관리 모달 닫기
  const handleImageModalClose = () => {
    setImageModalOpen(false);
    setSelectedCenter(null);
  };

  // 이미지 업데이트 후 센터 데이터 새로고침
  const handleImagesUpdated = () => {
    // 센터 데이터 다시 가져오기
    const fetchCenters = async () => {
      try {
        const response = await centerAPI.getAllCenters();
        setCenters(response.data.centers || []);
      } catch (err) {
        console.error('센터 데이터 새로고침 실패:', err);
      }
    };
    fetchCenters();
  };

  // 센터 상태 변경
  const handleStatusChange = async (centerId, newStatus) => {
    try {
      await centerAPI.updateCenter(centerId, { status: newStatus });

      // 로컬 상태 업데이트
      setCenters(prevCenters =>
        prevCenters.map(center =>
          center.id === centerId ? { ...center, status: newStatus } : center
        )
      );
    } catch (err) {
      console.error('센터 상태 변경 실패:', err);
      alert('상태 변경에 실패했습니다.');
    }
  };

  // 로딩 상태
  if (loading) {
    return (
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">지점 관리</h1>
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">센터 정보를 불러오는 중...</span>
          </div>
        </div>
      </div>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">지점 관리</h1>
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="text-red-500 text-lg mb-2">⚠️</div>
              <p className="text-gray-600">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                다시 시도
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">지점 관리</h1>

      {/* 센터별 통계 */}
      <div className="mb-6 pl-[30px] flex justify-center">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 w-full max-w-7xl">
          <div className="flex justify-between">
            {/* 직원 현황 */}
            <div className="flex-1 pr-12">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                직원 현황
              </h3>
              <div className="space-y-2">
                {centers.map(center => {
                  const centerUsers = allUsers?.filter(user => user.center?.id === center.id) || [];
                  return (
                    <div key={`users-${center.id}`} className="flex items-center py-1">
                      <span className="text-sm text-gray-600 flex-1 pl-2">{center.name}</span>
                      <span className="text-sm font-bold text-gray-800 ml-2">
                        {centerUsers.length}명
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 세로 보더 */}
            <div className="w-px bg-gray-300 mx-8 h-32"></div>

            {/* 고객 현황 */}
            <div className="flex-1 pl-12 pr-8">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                고객 현황
              </h3>
              <div className="space-y-2">
                {centers.map(center => {
                  const centerMembers = members.filter(
                    member => member.center_id === center.id && member.status === 'active'
                  );
                  return (
                    <div key={`members-${center.id}`} className="flex items-center py-1">
                      <span className="text-sm text-gray-600 flex-1 pl-2">{center.name}</span>
                      <span className="text-sm font-bold text-gray-800 ml-2">
                        {centerMembers.length}명
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm">
        {centers.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">등록된 센터가 없습니다.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {centers.map(center => (
              <div key={center.id} className="border border-gray-200 rounded-md overflow-hidden">
                {/* 센터 헤더 (클릭 가능) */}
                <div
                  onClick={() => toggleCenter(center.id)}
                  className="flex justify-between items-center p-4 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200 cursor-pointer"
                >
                  <span className="font-medium text-gray-800">{center.name}</span>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        const nextStatus =
                          center.status === 'active'
                            ? 'inactive'
                            : center.status === 'inactive'
                              ? 'closed'
                              : 'active';
                        handleStatusChange(center.id, nextStatus);
                      }}
                      className={`px-2 py-1 rounded-full text-xs font-medium cursor-pointer hover:opacity-80 transition-opacity ${
                        center.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : center.status === 'inactive'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                      }`}
                      title="클릭하여 상태 변경"
                    >
                      {center.status === 'active'
                        ? '운영중'
                        : center.status === 'inactive'
                          ? '일시중단'
                          : '폐점'}
                    </button>
                    <svg
                      className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
                        expandedCenter === center.id ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>

                {/* 센터 상세 정보 (확장 시 표시) */}
                {expandedCenter === center.id && (
                  <div className="px-6 py-6 border-t border-gray-200">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 px-6">
                      {/* 좌측: 센터 이미지 */}
                      {center.images && center.images.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-gray-800 mb-3">센터 이미지</h4>

                          {/* 메인 이미지 (큰 크기) */}
                          {center.images.find(img => img.is_main) && (
                            <div className="mb-4">
                              <div className="relative">
                                <img
                                  src={`${API_BASE_URL}${center.images.find(img => img.is_main).image_url}`}
                                  alt={`${center.name} 메인 이미지`}
                                  className="w-full h-64 md:h-80 object-cover rounded-lg shadow-md"
                                  onError={e => {
                                    e.target.src = '/logo.png';
                                  }}
                                />
                              </div>
                            </div>
                          )}

                          {/* 나머지 이미지들 (작은 크기, 클릭 시 확대) */}
                          {center.images.filter(img => !img.is_main).length > 0 && (
                            <div>
                              <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                                {center.images
                                  .filter(img => !img.is_main)
                                  .map((image, index) => (
                                    <div
                                      key={image.id || index}
                                      className="aspect-square bg-gray-200 rounded-lg overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-200"
                                      onClick={() => {
                                        // 이미지 클릭 시 새 창에서 크게 보기
                                        const imgUrl = `${API_BASE_URL}${image.image_url}`;
                                        window.open(
                                          imgUrl,
                                          '_blank',
                                          'width=800,height=600,scrollbars=yes,resizable=yes'
                                        );
                                      }}
                                    >
                                      <img
                                        src={`${API_BASE_URL}${image.image_url}`}
                                        alt={`${center.name} 이미지 ${index + 1}`}
                                        className="w-full h-full object-cover hover:scale-110 transition-transform duration-200"
                                        onError={e => {
                                          e.target.src = '/logo.png';
                                        }}
                                      />
                                    </div>
                                  ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* 우측: 센터 정보 */}
                      <div className="space-y-6">
                        {/* 기본 정보 */}
                        <div className="space-y-2">
                          <h4 className="font-semibold text-gray-800 mb-2">기본 정보</h4>
                          {center.description && (
                            <div className="mb-6">
                              <p className="text-sm text-gray-800">{center.description}</p>
                            </div>
                          )}
                          <div>
                            <p className="text-sm text-gray-800">{center.address || '-'}</p>
                          </div>
                          {center.directions && (
                            <div>
                              <p className="text-sm text-gray-800">{center.directions}</p>
                            </div>
                          )}
                          <div>
                            <p className="text-sm text-gray-800">{center.phone || '-'}</p>
                          </div>
                        </div>

                        {/* 운영 정보 */}
                        <div className="space-y-2">
                          <h4 className="font-semibold text-gray-800 mb-2">운영 정보</h4>
                          <div>
                            <p className="text-sm text-gray-800">
                              {center.weekday_hours && center.holiday_hours
                                ? `평일: ${center.weekday_hours} | 공휴일: ${center.holiday_hours}`
                                : center.weekday_hours
                                  ? `평일: ${center.weekday_hours}`
                                  : center.holiday_hours
                                    ? `공휴일: ${center.holiday_hours}`
                                    : '-'}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-800">
                              {center.saturday_hours && center.sunday_hours
                                ? `토요일: ${center.saturday_hours} | 일요일: ${center.sunday_hours}`
                                : center.saturday_hours
                                  ? `토요일: ${center.saturday_hours}`
                                  : center.sunday_hours
                                    ? `일요일: ${center.sunday_hours}`
                                    : '-'}
                            </p>
                          </div>
                        </div>

                        {/* 부대시설 및 기타 정보 */}
                        <div className="space-y-2">
                          <h4 className="font-semibold text-gray-800 mb-2">부대시설</h4>
                          <div>
                            <span className="text-xs text-gray-500">주차 가능</span>
                            <p className="text-sm text-gray-800">
                              {center.has_parking ? '가능' : '불가능'}
                            </p>
                          </div>
                          {center.has_parking && center.parking_fee && (
                            <div>
                              <span className="text-xs text-gray-500">주차 요금</span>
                              <p className="text-sm text-gray-800">{center.parking_fee}</p>
                            </div>
                          )}
                          {center.has_parking && center.parking_info && (
                            <div>
                              <span className="text-xs text-gray-500">주차 안내</span>
                              <p className="text-sm text-gray-800">{center.parking_info}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* 액션 버튼들 */}
                    <div className="flex justify-end items-center mt-6 pt-4 border-t border-gray-200">
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleImageManagement(center)}
                          className="px-4 py-2 text-purple-600 border border-purple-300 rounded-lg hover:bg-purple-50 transition-colors duration-200"
                        >
                          이미지
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 이미지 관리 모달 */}
      <CenterImageModal
        isOpen={imageModalOpen}
        onClose={handleImageModalClose}
        center={selectedCenter}
        onImagesUpdated={handleImagesUpdated}
      />
    </div>
  );
};

export default CenterPage;
