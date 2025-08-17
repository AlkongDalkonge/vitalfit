import React, { useRef, useState } from 'react';
import { toast } from 'react-toastify';

// API 기본 URL 환경 변수
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

const ImageUploadField = ({
  fieldName,
  title,
  data,
  onImageUpload,
  onImageDelete,
  onImageExpand,
  maxSize = 8 * 1024 * 1024, // 8MB
  allowedTypes = ['.jpg', '.jpeg', '.png', '.pdf'],
  className = '',
}) => {
  const fileInputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFileChange = event => {
    const file = event.target.files[0];
    if (file) {
      // 이미지 및 PDF 파일만 허용
      if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
        toast.error('이미지 또는 PDF 파일만 업로드 가능합니다.');
        return;
      }

      // 파일 크기 제한 (8MB)
      if (file.size > 8 * 1024 * 1024) {
        toast.error('파일 크기가 너무 큽니다. 최대 8MB까지 업로드 가능합니다.');
        return;
      }

      onImageUpload(fieldName, file);
    }
    // 파일 입력 초기화
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragOver = e => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = e => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = event => {
    event.preventDefault();
    setDragOver(false);
    const file = event.dataTransfer.files[0];
    if (file) {
      // 이미지 및 PDF 파일만 허용
      if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
        toast.error('이미지 또는 PDF 파일만 업로드 가능합니다.');
        return;
      }

      // 파일 크기 제한 (8MB)
      if (file.size > 8 * 1024 * 1024) {
        toast.error('파일 크기가 너무 큽니다. 최대 8MB까지 업로드 가능합니다.');
        return;
      }

      onImageUpload(fieldName, file);
    }
  };

  const handleImageClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* 이미지 업로드 영역 */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 transition-colors">
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept={allowedTypes.join(',')}
          onChange={handleFileChange}
        />

        <div
          className="cursor-pointer block"
          onClick={handleImageClick}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="text-gray-600">
            {data.image_url ? (
              <div className="relative group">
                {console.log('🖼️ 이미지 URL 처리:', {
                  original: data.image_url,
                  startsWithHttp: data.image_url.startsWith('http'),
                  final: data.image_url.startsWith('http')
                    ? data.image_url
                    : `${API_BASE_URL}${data.image_url}`,
                })}
                <img
                  src={
                    data.image_url.startsWith('http') || data.image_url.startsWith('data:')
                      ? data.image_url
                      : `${API_BASE_URL}${data.image_url}`
                  }
                  alt={`${title} 이미지`}
                  className="w-32 h-32 object-contain rounded-lg cursor-pointer bg-gray-100"
                  onClick={e => {
                    e.preventDefault();
                    e.stopPropagation();
                    onImageExpand(data.image_url, data.image_name, title);
                  }}
                />
                <button
                  type="button"
                  onClick={e => {
                    e.stopPropagation();
                    onImageDelete(fieldName);
                  }}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                >
                  ×
                </button>
              </div>
            ) : (
              <>
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 48 48"
                >
                  <path
                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <p className="mt-2 text-sm text-gray-600">이미지를 클릭하여 업로드하세요</p>
                <p className="mt-1 text-xs text-gray-500">
                  {allowedTypes.join(', ').toUpperCase()} (최대 {Math.round(maxSize / 1024 / 1024)}
                  MB)
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 업로드된 이미지 정보 */}
      {data.image_url && (
        <div className="text-center">
          <div className="text-xs text-gray-500">
            등록:{' '}
            {new Date(data.uploaded_at)
              .toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
              })
              .replace(/\. /g, '.')
              .replace(/\.$/, '')}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUploadField;
