import React, { useState, useRef } from 'react';
import { toast } from 'react-toastify';

const AccountImageUploader = ({
  imageUrl,
  onImageChange,
  onImageClick,
  className = '',
  height = 'h-16', // 기본 높이를 h-16으로 설정
}) => {
  const fileInputRef = useRef(null);

  const handleFileChange = e => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['.jpg', '.jpeg', '.png'];
    const maxSize = 5 * 1024 * 1024; // 5MB
    const fileExtension = `.${file.name.split('.').pop().toLowerCase()}`;

    if (!allowedTypes.includes(fileExtension)) {
      toast.error('허용되지 않는 파일 형식입니다. JPG, JPEG, PNG 파일만 업로드 가능합니다.');
      return;
    }

    if (file.size > maxSize) {
      toast.error('파일 크기가 너무 큽니다. 최대 5MB까지 업로드 가능합니다.');
      return;
    }

    onImageChange(file);
  };

  const handleClick = () => {
    if (imageUrl) {
      // 이미지가 있으면 확대 모달 열기
      onImageClick?.(imageUrl);
    } else {
      // 이미지가 없으면 파일 선택
      fileInputRef.current?.click();
    }
  };

  return (
    <div className={`relative ${className}`}>
      {imageUrl ? (
        <div className="relative">
          <div
            className={`w-[150%] ${height} border-2 border-dashed border-gray-300 rounded-lg overflow-hidden cursor-pointer`}
            onClick={handleClick}
          >
            <img
              src={imageUrl}
              alt="통장사본"
              className="w-full h-full object-cover opacity-40 hover:opacity-100 transition-opacity duration-200"
            />
          </div>
          {/* 동그라미 엑스 버튼 */}
          <button
            type="button"
            onClick={e => {
              e.stopPropagation();
              console.log('🗑️ 삭제 버튼 클릭됨');
              console.log('현재 imageUrl:', imageUrl);
              onImageChange(null);
              console.log('onImageChange(null) 호출됨');
            }}
            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors text-sm font-bold"
          >
            ×
          </button>
        </div>
      ) : (
        <div
          className={`w-[150%] ${height} border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors`}
          onClick={handleClick}
        >
          <div className="text-center">
            <div className="text-gray-400 text-2xl mb-1">📷</div>
            <div className="text-xs text-gray-500">통장사본 업로드</div>
          </div>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileChange}
        accept=".jpg,.jpeg,.png"
        className="hidden"
      />
    </div>
  );
};

export default AccountImageUploader;
