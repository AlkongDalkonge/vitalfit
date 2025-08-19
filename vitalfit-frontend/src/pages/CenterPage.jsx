import React, { useState, useEffect } from 'react';
import { centerAPI, memberAPI } from '../utils/api';
import ImageUploader from '../components/ImageUploader';
import CenterCreateModal from './CenterCreateModal';
import CenterEditModal from './CenterEditModal';
import { useUser } from '../utils/hooks';

// API 기본 URL 환경 변수
const API_BASE_URL = 'http://localhost:3001';

const CenterPage = () => {
  const [expandedCenter, setExpandedCenter] = useState(null);
  const [centers, setCenters] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 이미지 관리 상태 (센터 ID별로 관리)
  const [imageManagementOpen, setImageManagementOpen] = useState(null);
  const [centerImages, setCenterImages] = useState({});
  const [imageLoading, setImageLoading] = useState({});
  const [imageUploading, setImageUploading] = useState({});

  // 슬라이드 상태 (센터 ID별로 관리)
  const [currentSlideIndex, setCurrentSlideIndex] = useState({});

  // 센터 등록 모달 상태
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // 센터 수정 모달 상태
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedCenterForEdit, setSelectedCenterForEdit] = useState(null);

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

  // 이미지 관리 토글
  const toggleImageManagement = async centerId => {
    if (imageManagementOpen === centerId) {
      setImageManagementOpen(null);
    } else {
      setImageManagementOpen(centerId);
      // 이미지 관리가 열릴 때 해당 센터의 이미지 로드
      if (!centerImages[centerId]) {
        await loadCenterImages(centerId);
      }
    }
  };

  // 센터 이미지 로드
  const loadCenterImages = async centerId => {
    setImageLoading(prev => ({ ...prev, [centerId]: true }));
    try {
      const result = await centerAPI.getCenterById(centerId);
      if (result.success && result.data.images) {
        const images = result.data.images;

        // 메인 이미지가 여러 개인 경우 첫 번째만 메인으로 설정
        let mainImageFound = false;
        const processedImages = images.map(img => {
          let isMain = img.is_main;
          if (isMain && mainImageFound) {
            isMain = false; // 이미 메인 이미지가 있으면 이 이미지는 메인이 아님
          } else if (isMain) {
            mainImageFound = true;
          }

          return {
            id: img.id,
            url: img.image_url,
            image_url: img.image_url,
            isMain: isMain,
            name: img.image_name || 'center-image',
          };
        });

        setCenterImages(prev => ({
          ...prev,
          [centerId]: processedImages,
        }));
      } else {
        setCenterImages(prev => ({ ...prev, [centerId]: [] }));
      }
    } catch (error) {
      console.error('센터 이미지 로드 실패:', error);
      alert('이미지를 불러오는데 실패했습니다.');
    } finally {
      setImageLoading(prev => ({ ...prev, [centerId]: false }));
    }
  };

  // 새 이미지 업로드
  const handleImageUpload = async (centerId, newImages) => {
    setImageUploading(prev => ({ ...prev, [centerId]: true }));

    try {
      const currentImages = centerImages[centerId] || [];
      const currentImageCount = currentImages.length;
      const uploadPromises = newImages.map(async (imageData, index) => {
        const formData = new FormData();
        formData.append('image', imageData.file);
        formData.append('center_id', centerId);
        const isMain = currentImageCount === 0 && index === 0;
        formData.append('is_main', isMain ? 'true' : 'false');

        const result = await centerAPI.uploadImage(formData);

        return {
          id: result.data.id,
          url: result.data.image_url,
          image_url: result.data.image_url,
          isMain: result.data.is_main,
          name: imageData.name,
        };
      });

      const uploadedImages = await Promise.all(uploadPromises);
      setCenterImages(prev => ({
        ...prev,
        [centerId]: [...(prev[centerId] || []), ...uploadedImages],
      }));

      // 센터 데이터 새로고침
      handleImagesUpdated();
    } catch (error) {
      console.error('이미지 업로드 실패:', error);
      alert(error.message || '이미지 업로드에 실패했습니다.');
    } finally {
      setImageUploading(prev => ({ ...prev, [centerId]: false }));
    }
  };

  // 이미지 삭제
  const handleRemoveImage = async (centerId, imageId) => {
    const confirmDelete = window.confirm('이 이미지를 삭제하시겠습니까?');
    if (!confirmDelete) return;

    try {
      await centerAPI.deleteImage(imageId);

      setCenterImages(prev => ({
        ...prev,
        [centerId]: prev[centerId].filter(img => img.id !== imageId),
      }));

      // 센터 데이터 새로고침
      handleImagesUpdated();
    } catch (error) {
      console.error('이미지 삭제 실패:', error);
      alert('이미지 삭제에 실패했습니다.');
    }
  };

  // 메인 이미지 설정
  const handleSetMainImage = async (centerId, imageId) => {
    try {
      await centerAPI.setMainImage(imageId);
      // 이미지 목록 업데이트 - 선택된 이미지만 메인으로, 나머지는 모두 false로
      setCenterImages(prev => ({
        ...prev,
        [centerId]: prev[centerId].map(img => ({
          ...img,
          isMain: img.id === imageId,
        })),
      }));

      // 센터 데이터 새로고침
      handleImagesUpdated();
    } catch (error) {
      console.error('메인 이미지 설정 실패:', error);
      alert('메인 이미지 설정에 실패했습니다.');
    }
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

  // 센터 등록 후 데이터 새로고침
  const handleCenterCreated = newCenter => {
    setCenters(prevCenters => [...prevCenters, newCenter]);
  };

  // 센터 수정 모달 열기
  const handleEditCenter = center => {
    setSelectedCenterForEdit(center);
    setEditModalOpen(true);
  };

  // 센터 수정 후 데이터 새로고침
  const handleCenterUpdated = updatedCenter => {
    if (updatedCenter === null) {
      // 센터가 삭제된 경우
      setCenters(prevCenters =>
        prevCenters.filter(center => center.id !== selectedCenterForEdit?.id)
      );
      setSelectedCenterForEdit(null);
    } else {
      // 센터가 수정된 경우
      setCenters(prevCenters =>
        prevCenters.map(center => (center.id === updatedCenter.id ? updatedCenter : center))
      );
    }
  };

  // 슬라이드 네비게이션 함수들
  const nextSlide = (centerId, totalImages) => {
    setCurrentSlideIndex(prev => ({
      ...prev,
      [centerId]: ((prev[centerId] || 0) + 1) % totalImages,
    }));
  };

  const prevSlide = (centerId, totalImages) => {
    setCurrentSlideIndex(prev => ({
      ...prev,
      [centerId]: (prev[centerId] || 0) === 0 ? totalImages - 1 : (prev[centerId] || 0) - 1,
    }));
  };

  const goToSlide = (centerId, index) => {
    setCurrentSlideIndex(prev => ({
      ...prev,
      [centerId]: index,
    }));
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
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">지점 관리</h1>
      </div>

      {/* 센터별 현황 */}
      <div className="bg-white rounded-xl p-6 mb-8 mt-12 border border-gray-100">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-800 m-0">센터별 현황</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {centers.map((center, index) => {
            const centerUsers = allUsers?.filter(user => user.center?.id === center.id) || [];
            const activeUsers = centerUsers.filter(user => user.status === 'active') || [];
            const centerMembers = members.filter(member => member.center_id === center.id) || [];
            const activeMembers = members.filter(
              member => member.center_id === center.id && member.status === 'active'
            );

            // 카드별 배경색 설정
            let cardBgClass =
              'p-6 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 hover:shadow-lg transition-all duration-300';
            if (index === 1) {
              // 두 번째 카드 (index 1)
              cardBgClass =
                'p-6 rounded-xl bg-[#f0f9ff] border border-blue-200 hover:shadow-lg transition-all duration-300';
            } else if (index === 2) {
              // 세 번째 카드 (index 2)
              cardBgClass =
                'p-6 rounded-xl bg-[#e8f8fa] border border-blue-200 hover:shadow-lg transition-all duration-300';
            }

            return (
              <div key={center.id} className={cardBgClass}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <h3 className="font-bold text-gray-800 text-lg">{center.name}</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-blue-100">
                    <span className="text-gray-600 font-medium">직원</span>
                    <span className="font-bold text-black">
                      {activeUsers.length}/{centerUsers.length}명
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-green-100">
                    <span className="text-gray-600 font-medium">회원</span>
                    <span className="font-bold text-black">
                      {activeMembers.length}/{centerMembers.length}명
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
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
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        center.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : center.status === 'inactive'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {center.status === 'active'
                        ? '운영중'
                        : center.status === 'inactive'
                          ? '일시중단'
                          : '폐점'}
                    </span>
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
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-3">센터 이미지</h4>

                        {/* 메인 이미지 (큰 크기) */}
                        {center.images &&
                        center.images.length > 0 &&
                        (() => {
                          const mainImages = center.images.filter(img => img.is_main);
                          const mainImage = mainImages.length > 0 ? mainImages[0] : null;
                          return mainImage;
                        })() ? (
                          <div className="mb-4">
                            <div className="relative">
                              <img
                                src={`${API_BASE_URL}${(() => {
                                  const mainImages = center.images.filter(img => img.is_main);
                                  return mainImages[0].image_url;
                                })()}`}
                                alt={`${center.name} 메인 이미지`}
                                className="w-full h-64 md:h-80 object-cover rounded-lg shadow-md"
                                onError={e => {
                                  e.target.src = '/img/2center4.jpg';
                                }}
                              />
                            </div>
                          </div>
                        ) : center.images && center.images.length > 0 ? (
                          <div className="mb-4">
                            <div className="relative">
                              <img
                                src={`${API_BASE_URL}${center.images[0].image_url}`}
                                alt={`${center.name} 첫 번째 이미지`}
                                className="w-full h-64 md:h-80 object-cover rounded-lg shadow-md"
                                onError={e => {
                                  e.target.src = '/img/2center4.jpg';
                                }}
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="mb-4">
                            <div className="relative">
                              <img
                                src="/img/2center4.jpg"
                                alt={`${center.name} 기본 이미지`}
                                className="w-full h-64 md:h-80 object-cover rounded-lg shadow-md"
                              />
                            </div>
                          </div>
                        )}

                        {/* 나머지 이미지들 (4개 이상일 때 슬라이드, 4개 미만일 때 그리드) */}
                        {center.images && center.images.length > 1 && (
                          <div>
                            {(() => {
                              const remainingImages = center.images.filter((img, index) => {
                                // 메인 이미지가 있으면 첫 번째 메인 이미지 제외, 없으면 첫 번째 이미지 제외
                                const mainImages = center.images.filter(img => img.is_main);
                                const mainImage = mainImages.length > 0 ? mainImages[0] : null;
                                return mainImage ? img.id !== mainImage.id : index !== 0;
                              });

                              // 4개 이상이면 슬라이드, 4개 미만이면 그리드
                              if (remainingImages.length >= 4) {
                                const imagesPerSlide = 4;
                                const totalSlides = Math.ceil(
                                  remainingImages.length / imagesPerSlide
                                );
                                const currentSlide = currentSlideIndex[center.id] || 0;
                                const startIndex = currentSlide * imagesPerSlide;
                                const endIndex = Math.min(
                                  startIndex + imagesPerSlide,
                                  remainingImages.length
                                );
                                const currentImages = remainingImages.slice(startIndex, endIndex);

                                return (
                                  <div className="relative">
                                    {/* 슬라이드 컨테이너 */}
                                    <div className="relative overflow-hidden rounded-lg">
                                      <div className="grid grid-cols-4 gap-3">
                                        {currentImages.map((image, index) => (
                                          <div
                                            key={image.id || startIndex + index}
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
                                              alt={`${center.name} 이미지 ${startIndex + index + 1}`}
                                              className="w-full h-full object-cover hover:scale-110 transition-transform duration-200"
                                              onError={e => {
                                                e.target.src = '/img/2center4.jpg';
                                              }}
                                            />
                                          </div>
                                        ))}
                                      </div>
                                    </div>

                                    {/* 슬라이드 네비게이션 버튼 */}
                                    {totalSlides > 1 && (
                                      <>
                                        {/* 이전 버튼 */}
                                        <button
                                          onClick={() => prevSlide(center.id, totalSlides)}
                                          className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all duration-200 z-10"
                                        >
                                          <svg
                                            className="w-4 h-4"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                          >
                                            <path
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                              strokeWidth={2}
                                              d="M15 19l-7-7 7-7"
                                            />
                                          </svg>
                                        </button>

                                        {/* 다음 버튼 */}
                                        <button
                                          onClick={() => nextSlide(center.id, totalSlides)}
                                          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all duration-200 z-10"
                                        >
                                          <svg
                                            className="w-4 h-4"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                          >
                                            <path
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                              strokeWidth={2}
                                              d="M9 5l7 7-7 7"
                                            />
                                          </svg>
                                        </button>
                                      </>
                                    )}

                                    {/* 슬라이드 인디케이터 */}
                                    {totalSlides > 1 && (
                                      <div className="flex justify-center mt-3 space-x-2">
                                        {Array.from({ length: totalSlides }).map((_, index) => (
                                          <button
                                            key={index}
                                            onClick={() => goToSlide(center.id, index)}
                                            className={`w-2 h-2 rounded-full transition-all duration-200 ${
                                              (currentSlideIndex[center.id] || 0) === index
                                                ? 'bg-blue-600'
                                                : 'bg-gray-300 hover:bg-gray-400'
                                            }`}
                                          />
                                        ))}
                                      </div>
                                    )}

                                    {/* 슬라이드 정보 표시 */}
                                    {totalSlides > 1 && (
                                      <div className="text-center mt-2 text-sm text-gray-500">
                                        {currentSlide + 1} / {totalSlides}
                                      </div>
                                    )}
                                  </div>
                                );
                              } else {
                                // 4개 미만일 때는 기존 그리드 형태
                                return (
                                  <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                                    {remainingImages.map((image, index) => (
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
                                            e.target.src = '/img/2center4.jpg';
                                          }}
                                        />
                                      </div>
                                    ))}
                                  </div>
                                );
                              }
                            })()}
                          </div>
                        )}
                      </div>

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
                          onClick={() => handleEditCenter(center)}
                          className="px-4 py-2 text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors duration-200"
                        >
                          수정
                        </button>
                        <button
                          onClick={() => toggleImageManagement(center.id)}
                          className="px-4 py-2 text-purple-600 border border-purple-300 rounded-lg hover:bg-purple-50 transition-colors duration-200"
                        >
                          이미지
                        </button>
                      </div>
                    </div>

                    {/* 이미지 관리 섹션 */}
                    {imageManagementOpen === center.id && (
                      <div className="mt-6 pt-6 border-t border-gray-200">
                        <div className="flex justify-between items-center mb-4">
                          <h4 className="font-semibold text-gray-800">이미지 관리</h4>
                          <button
                            onClick={() => toggleImageManagement(center.id)}
                            className="text-gray-500 hover:text-gray-700"
                          >
                            <svg
                              className="w-5 h-5"
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
                        </div>
                        {imageLoading[center.id] ? (
                          <div className="text-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                            <p className="mt-2 text-gray-600">이미지를 불러오는 중...</p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {/* 통합된 이미지 관리 */}
                            <div>
                              {/* 새 이미지 업로드 */}
                              <div className="mb-4">
                                <ImageUploader
                                  onImageUpload={newImages =>
                                    handleImageUpload(center.id, newImages)
                                  }
                                  currentImages={[]}
                                  maxImages={10}
                                  isMainImageRequired={false}
                                  disabled={imageUploading[center.id] || false}
                                />
                              </div>

                              {/* 기존 이미지 목록 */}
                              {centerImages[center.id] && centerImages[center.id].length > 0 && (
                                <div className="mt-6">
                                  <h6 className="text-sm font-medium text-gray-600 mb-3">
                                    등록된 이미지 ({centerImages[center.id].length}개)
                                  </h6>
                                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                    {centerImages[center.id].map((image, index) => (
                                      <div key={image.id} className="relative group">
                                        <div className="aspect-square bg-gray-200 rounded-lg overflow-hidden">
                                          <img
                                            src={`${API_BASE_URL}${image.image_url}`}
                                            alt={`${center.name} 이미지 ${index + 1}`}
                                            className="w-full h-full object-cover"
                                            onError={e => {
                                              e.target.src = '/img/2center4.jpg';
                                            }}
                                          />
                                        </div>

                                        {/* 이미지 오버레이 (호버 시 표시) */}
                                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center">
                                          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-2">
                                            {!image.isMain && (
                                              <button
                                                onClick={() =>
                                                  handleSetMainImage(center.id, image.id)
                                                }
                                                className="px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                                              >
                                                메인
                                              </button>
                                            )}
                                            <button
                                              onClick={() => handleRemoveImage(center.id, image.id)}
                                              className="px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
                                            >
                                              삭제
                                            </button>
                                          </div>
                                        </div>

                                        {/* 메인 이미지 표시 */}
                                        {image.isMain && (
                                          <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                                            메인
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {(!centerImages[center.id] ||
                                centerImages[center.id].length === 0) && (
                                <div className="text-center py-8 text-gray-500">
                                  등록된 이미지가 없습니다.
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 센터 등록 버튼 */}
      <div className="flex justify-start mt-6">
        <button
          onClick={() => setCreateModalOpen(true)}
          className="px-6 py-3 bg-gradient-to-br from-blue-400 to-blue-600 text-white text-sm rounded-lg hover:from-blue-500 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          센터 등록
        </button>
      </div>

      {/* 센터 등록 모달 */}
      <CenterCreateModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onCreate={handleCenterCreated}
      />

      {/* 센터 수정 모달 */}
      <CenterEditModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onUpdate={handleCenterUpdated}
        center={selectedCenterForEdit}
      />
    </div>
  );
};

export default CenterPage;
