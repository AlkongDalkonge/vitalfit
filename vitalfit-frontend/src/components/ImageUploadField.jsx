import React, { useRef, useState } from 'react';
import { uploadImage, getImageUrl, validateImageFile } from '../utils/uploadUtils';

const ImageUploadField = ({
  field,
  label,
  images = [],
  onImageUpload,
  onImageDelete,
  accept = '.jpg,.jpeg,.png,.pdf',
  maxFiles = 10,
  placeholder = '상세 내용을 입력하세요...',
}) => {
  const fileInputRef = useRef(null);

  const handleImageClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleImageChange = e => {
    const files = Array.from(e.target.files || []);

    // 최대 파일 수 제한
    if (images.length + files.length > maxFiles) {
      alert(`최대 ${maxFiles}개까지 업로드 가능합니다.`);
      return;
    }

    // 파일 유효성 검사
    const validFiles = files.filter(file => {
      const validation = validateImageFile(file);
      if (!validation.valid) {
        alert(`${file.name}: ${validation.error}`);
        return false;
      }
      return true;
    });

    if (validFiles.length > 0) {
      onImageUpload(field, validFiles);
    }

    // 파일 입력 초기화
    e.target.value = '';
  };

  const handleImageDelete = index => {
    onImageDelete(field, index);
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">{label}</label>

      {/* 이미지 업로드 영역 */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
        <input
          type="file"
          multiple
          accept={accept}
          onChange={handleImageChange}
          className="hidden"
          id={`${field}-upload`}
        />
        <label htmlFor={`${field}-upload`} className="cursor-pointer">
          <div className="text-gray-500 hover:text-gray-700">
            <svg
              className="mx-auto h-12 w-12 mb-2"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <p className="text-sm">클릭하여 이미지 추가</p>
            <p className="text-xs text-gray-400 mt-1">최대 {maxFiles}개까지 업로드 가능</p>
          </div>
        </label>
      </div>

      {/* 업로드된 이미지 미리보기 */}
      {images.length > 0 ? (
        <div className="grid grid-cols-3 gap-2">
          {images.map((file, index) => (
            <div key={index} className="relative">
              <img
                src={URL.createObjectURL(file)}
                alt={`${label} ${index + 1}`}
                className="w-full h-20 object-cover rounded border"
              />
              <button
                type="button"
                onClick={() => handleImageDelete(index)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      ) : (
        /* 기본 이미지 표시 */
        <div className="grid grid-cols-3 gap-2">
          <div className="relative">
            <img
              src="/logo.png"
              alt="기본 이미지"
              className="w-full h-20 object-cover rounded border opacity-50"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs text-gray-500">기본 이미지</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUploadField;
