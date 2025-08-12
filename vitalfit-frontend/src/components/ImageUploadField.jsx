import React, { useRef, useState } from 'react';
import { uploadImage, getImageUrl, validateImageFile } from '../utils/uploadUtils';

const ImageUploadField = ({
  label,
  value,
  onChange,
  imageUrl,
  onImageChange,
  type = 'field',
  userId,
  placeholder,
}) => {
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const handleImageClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleImageChange = async e => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 파일 유효성 검사
    const validation = validateImageFile(file);
    if (!validation.valid) {
      alert(validation.error);
      return;
    }

    try {
      setUploading(true);

      // 이미지 업로드
      const result = await uploadImage(file, type, userId);

      if (result.success) {
        // 이미지 URL 업데이트
        if (onImageChange) {
          onImageChange(result.url);
        }
        alert('이미지가 업로드되었습니다.');
      } else {
        alert(`이미지 업로드에 실패했습니다: ${result.error}`);
      }
    } catch (error) {
      console.error('이미지 업로드 오류:', error);
      alert('이미지 업로드 중 오류가 발생했습니다.');
    } finally {
      setUploading(false);
    }
  };

  const currentImageUrl = getImageUrl(imageUrl, type);

  return (
    <div className="flex items-center gap-4">
      {/* 이미지 업로드 영역 */}
      <div
        className="relative w-20 h-20 rounded-lg border-2 border-dashed border-gray-300 overflow-hidden cursor-pointer hover:border-blue-400 transition-colors"
        onClick={handleImageClick}
      >
        {uploading ? (
          <div className="flex items-center justify-center w-full h-full bg-gray-100">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <img
            src={currentImageUrl}
            alt={label}
            className="w-full h-full object-cover"
            onError={e => {
              // 이미지 로드 실패 시 기본 이미지로 대체
              e.target.src = type === 'profile' ? '/img/1center0.jpg' : '/img/2center0.jpg';
            }}
          />
        )}

        {/* 업로드 오버레이 */}
        <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all flex items-center justify-center">
          <span className="text-white text-xs font-medium opacity-0 hover:opacity-100 transition-opacity">
            업로드
          </span>
        </div>

        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          onChange={handleImageChange}
          accept=".jpg,.jpeg,.png"
        />
      </div>

      {/* 텍스트 입력 필드 */}
      <div className="flex-1">
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        {type === 'experience' ? (
          <textarea
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className="w-full p-3 border rounded resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows="3"
          />
        ) : (
          <input
            type="text"
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className="w-full p-3 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        )}
      </div>
    </div>
  );
};

export default ImageUploadField;
