import React, { useState } from 'react';

const CenterPage = () => {
  const [expandedCenter, setExpandedCenter] = useState(null);

  const centers = [
    {
      id: 1,
      name: '강남센터',
      location: '서울시 강남구',
      details: {
        fullName: '강남점',
        address: '서울특별시 강남구 강남대로 396',
        phone: '02-222-2222',
        description: 'vital-fit의 1호점 강남점입니다.',
        weekdayHours: '10:00~22:00',
        saturdayHours: '10:00~18:00',
        sundayHours: '10:00~18:00',
        holidays: '공휴일 휴무',
        isOpen: true,
        priceInfo: '시간 당 천원',
        parking: '장애인주차장, 여성전용주차장 운영 총 20대',
        access: '강남역 11번 출구 도보 3분',
        image: '/placeholder-center-image.jpg',
      },
    },
    {
      id: 2,
      name: '서초센터',
      location: '서울시 서초구',
      details: {
        fullName: '서초점',
        address: '서울특별시 서초구 서초대로 200',
        phone: '02-333-3333',
        description: 'vital-fit의 2호점 서초점입니다.',
        weekdayHours: '10:00~22:00',
        saturdayHours: '10:00~18:00',
        sundayHours: '10:00~18:00',
        holidays: '공휴일 휴무',
        isOpen: true,
        priceInfo: '시간 당 천원',
        parking: '일반주차장 운영 총 15대',
        access: '서초역 2번 출구 도보 5분',
        image: '/placeholder-center-image.jpg',
      },
    },
    {
      id: 3,
      name: '홍대센터',
      location: '서울시 마포구',
      details: {
        fullName: '홍대점',
        address: '서울특별시 마포구 홍익로 100',
        phone: '02-444-4444',
        description: 'vital-fit의 3호점 홍대점입니다.',
        weekdayHours: '10:00~22:00',
        saturdayHours: '10:00~18:00',
        sundayHours: '10:00~18:00',
        holidays: '공휴일 휴무',
        isOpen: true,
        priceInfo: '시간 당 천원',
        parking: '지하주차장 운영 총 25대',
        access: '홍대입구역 9번 출구 도보 2분',
        image: '/placeholder-center-image.jpg',
      },
    },
  ];

  const toggleCenter = centerId => {
    setExpandedCenter(expandedCenter === centerId ? null : centerId);
  };

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">지점 관리</h1>
      <div className="bg-white rounded-xl p-6 shadow-sm">
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
                  <span className="text-gray-600">{center.location}</span>
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
                      <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center mx-4">
                        <span className="text-gray-500">센터 이미지</span>
                      </div>
                    </div>

                    {/* 오른쪽: 센터 정보 */}
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">
                          {center.details.fullName}
                        </h3>
                        <p className="text-gray-600">{center.details.description}</p>
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
                            <div className="text-gray-600 mt-1">{center.details.address}</div>
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
                            <div className="text-gray-600 mt-1">{center.details.phone}</div>
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
                              <div>평일 {center.details.weekdayHours}</div>
                              <div>토요일 {center.details.saturdayHours}</div>
                              <div>일요일 {center.details.sundayHours}</div>
                              <div>{center.details.holidays}</div>
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
                                  center.details.isOpen
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-red-100 text-red-700'
                                }`}
                              >
                                {center.details.isOpen ? '운영중' : '휴무중'}
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
                            <div className="text-gray-600 mt-1">{center.details.priceInfo}</div>
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
                            <div className="text-gray-600 mt-1">{center.details.parking}</div>
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
                            <div className="text-gray-600 mt-1">{center.details.access}</div>
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
      </div>
    </div>
  );
};

export default CenterPage;
