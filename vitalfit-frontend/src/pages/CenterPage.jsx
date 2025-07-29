import React from "react";

const CenterPage = () => {
  const centers = [
    { name: "강남센터", location: "서울시 강남구" },
    { name: "서초센터", location: "서울시 서초구" },
    { name: "홍대센터", location: "서울시 마포구" },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">센터 관리</h1>
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">센터 목록</h2>
        <div className="space-y-3">
          {centers.map((center, index) => (
            <div
              key={index}
              className="flex justify-between items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200"
            >
              <span className="font-medium text-gray-800">{center.name}</span>
              <span className="text-gray-600">{center.location}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CenterPage;
