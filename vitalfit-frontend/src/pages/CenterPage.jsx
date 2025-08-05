import React, { useState, useEffect } from 'react';
import { centerAPI } from '../utils/api';

const CenterPage = () => {
  const [expandedCenter, setExpandedCenter] = useState(null);
  const [centers, setCenters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 센터 데이터 가져오기
  useEffect(() => {
    const fetchCenters = async () => {
      try {
        setLoading(true);
        const response = await centerAPI.getAllCenters();
        setCenters(response.data.centers || []);
        setError(null);
      } catch (err) {
        console.error('센터 데이터 가져오기 실패:', err);
        setError('센터 데이터를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchCenters();
  }, []);

  const toggleCenter = centerId => {
    setExpandedCenter(expandedCenter === centerId ? null : centerId);
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
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">지점 관리</h1>
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
                  <span className="text-gray-600">{center.address?.split(' ').slice(0, 2).join(' ')}</span>
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
                <div className="border-t border-gray-200 p-6 bg-gray-50">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* 왼쪽: 센터 이미지 */}
                    <div className="space-y-4 px-4">
                      {center.images && center.images.length > 0 ? (
                        <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden">
                          <img 
                            src={center.images[0].image_url} 
                            alt={`${center.name} 이미지`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center mx-4">
                          <span className="text-gray-500">센터 이미지 없음</span>
                        </div>
                      )}
                    </div>

                    {/* 오른쪽: 센터 정보 */}
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">
                          {center.name}
                        </h3>
                        <p className="text-gray-600">{center.description || '설명이 없습니다.'}</p>
                      </div>

                      <div className="space-y-5">
                        <div className="flex items-start gap-3">
                          <svg
                            className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                          </svg>
                          <div>
                            <span className="font-medium text-gray-700">주소</span>
                            <div className="text-gray-600 mt-1">{center.address}</div>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <svg
                            className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                            />
                          </svg>
                          <div>
                            <span className="font-medium text-gray-700">전화</span>
                            <div className="text-gray-600 mt-1">{center.phone}</div>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <svg
                            className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          <div>
                            <span className="font-medium text-gray-700">운영시간</span>
                            <div className="text-gray-600 mt-1">
                              <div>평일 {center.weekday_hours || '정보 없음'}</div>
                              <div>토요일 {center.saturday_hours || '정보 없음'}</div>
                              <div>일요일 {center.sunday_hours || '정보 없음'}</div>
                              <div>공휴일 {center.holiday_hours || '정보 없음'}</div>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <svg
                            className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          <div>
                            <span className="font-medium text-gray-700">운영상태</span>
                            <div className="mt-1">
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  center.status === 'active'
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-red-100 text-red-700'
                                }`}
                              >
                                {center.status === 'active' ? '운영중' : '휴무중'}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <svg
                            className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                            />
                          </svg>
                          <div>
                            <span className="font-medium text-gray-700">요금</span>
                            <div className="text-gray-600 mt-1">요금 정보는 문의해주세요</div>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <svg
                            className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                            />
                          </svg>
                          <div>
                            <span className="font-medium text-gray-700">주차</span>
                            <div className="text-gray-600 mt-1">
                              {center.has_parking ? (
                                <>
                                  <div>주차 가능</div>
                                  {center.parking_fee && <div>주차요금: {center.parking_fee}</div>}
                                  {center.parking_info && <div>{center.parking_info}</div>}
                                </>
                              ) : (
                                '주차 불가'
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <svg
                            className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          <div>
                            <span className="font-medium text-gray-700">교통</span>
                            <div className="text-gray-600 mt-1">{center.directions || '오시는 길 정보가 없습니다.'}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        )}
      </div>
    </div>
  );
};

export default CenterPage;
