import React from 'react';

const UserPage = () => {
  const users = [
    { id: 1, name: '김철수', position: '매니저', center: '강남센터' },
    { id: 2, name: '이영희', position: '트레이너', center: '서초센터' },
    { id: 3, name: '박민수', position: '트레이너', center: '홍대센터' },
    { id: 4, name: '정수진', position: '매니저', center: '강남센터' },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">사용자 관리</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 mt-5">
        {users.map(user => (
          <div
            key={user.id}
            className="bg-white rounded-lg p-5 shadow-sm hover:-translate-y-0.5 hover:shadow-md transition-all duration-200"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center font-semibold text-gray-600">
                {user.name.charAt(0)}
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">{user.name}</h3>
                <p className="text-sm text-gray-600">{user.position}</p>
              </div>
            </div>
            <p className="text-sm text-gray-500">소속: {user.center}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserPage;
