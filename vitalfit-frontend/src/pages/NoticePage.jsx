import React from 'react';

const NoticePage = () => {
  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">공지사항</h1>
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <p className="text-gray-600 mb-4">공지사항 페이지입니다.</p>
        <div className="bg-gray-50 rounded-lg p-5 mt-4">
          <h2 className="text-lg font-semibold text-gray-700 mb-3">공지사항 목록</h2>
          <p className="text-gray-600">여기에 공지사항이 표시됩니다.</p>
        </div>
      </div>
    </div>
  );
};

export default NoticePage;
