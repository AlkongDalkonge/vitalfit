import React, { useState, useRef } from 'react';

const ImageUploader = ({
  onImageUpload,
  maxImages = 5,
  currentImages = [],
  isMainImageRequired = true,
  disabled = false,
}) => {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  // 파일 검증
  const validateFile = file => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(file.type)) {
      throw new Error('지원하지 않는 파일 형식입니다. (JPG, PNG, WebP만 가능)');
    }

    if (file.size > maxSize) {
      throw new Error('파일 크기가 너무 큽니다. (최대 5MB)');
    }

    return true;
  };

  // 파일 업로드 처리
  const handleFileUpload = async files => {
    if (disabled) return;

    const fileArray = Array.from(files);

    // 최대 이미지 수 체크
    if (currentImages.length + fileArray.length > maxImages) {
      alert(`최대 ${maxImages}개의 이미지만 업로드할 수 있습니다.`);
      return;
    }

    setUploading(true);

    try {
      // 파일 검증
      fileArray.forEach(validateFile);

      const uploadPromises = fileArray.map(async file => {
        // 이미지 미리보기 생성
        const preview = await createImagePreview(file);

        return {
          file,
          preview,
          name: file.name,
          size: file.size,
          isMain: currentImages.length === 0 && isMainImageRequired, // 첫 번째 이미지를 메인으로 설정
        };
      });

      const uploadedImages = await Promise.all(uploadPromises);
      onImageUpload(uploadedImages);
    } catch (error) {
      alert(error.message);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // 이미지 미리보기 생성
  const createImagePreview = file => {
    return new Promise(resolve => {
      const reader = new FileReader();
      reader.onload = e => resolve(e.target.result);
      reader.readAsDataURL(file);
    });
  };

  // 드래그 앤 드롭 핸들러
  const handleDragOver = e => {
    e.preventDefault();
    if (!disabled) {
      setDragOver(true);
    }
  };

  const handleDragLeave = e => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = e => {
    e.preventDefault();
    setDragOver(false);

    if (disabled) return;

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files);
    }
  };

  // 파일 선택 핸들러
  const handleFileSelect = e => {
    const files = e.target.files;
    if (files.length > 0) {
      handleFileUpload(files);
    }
  };

  // 파일 선택 트리거
  const triggerFileSelect = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="w-full">
      {/* 업로드 영역 */}
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200
          ${dragOver ? 'border-blue-400 bg-blue-50' : 'border-gray-300'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-gray-400 cursor-pointer'}
          ${uploading ? 'pointer-events-none' : ''}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={triggerFileSelect}
      >
        {uploading ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="ml-3 text-gray-600">업로드 중...</span>
          </div>
        ) : (
          <div>
            <div className="text-gray-400 text-4xl mb-2">📁</div>
            <p className="text-gray-600 mb-2">이미지를 드래그하여 놓거나 클릭하여 선택하세요</p>
            <p className="text-gray-500 text-sm">
              JPG, PNG, WebP 파일 (최대 5MB, {maxImages}개까지)
            </p>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          disabled={disabled}
        />
      </div>

      {/* 현재 업로드된 이미지 표시 */}
      {currentImages.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            업로드된 이미지 ({currentImages.length}/{maxImages})
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {currentImages.map((image, index) => (
              <div key={index} className="relative group">
                <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden">
                  <img
                    src={image.preview || image.url || image.image_url}
                    alt={`이미지 ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* 메인 이미지 표시 */}
                {image.isMain && (
                  <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                    메인
                  </div>
                )}

                {/* 삭제 버튼 */}
                {!disabled && (
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      // onImageRemove 콜백이 있다면 호출
                      if (image.onRemove) {
                        image.onRemove(index);
                      }
                    }}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  >
                    ×
                  </button>
                )}

                {/* 파일 정보 */}
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <p className="truncate">{image.name || 'image'}</p>
                  {image.size && <p>{(image.size / 1024 / 1024).toFixed(1)}MB</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 사용법 안내 */}
      <div className="mt-3 text-xs text-gray-500">
        <p>• 첫 번째 이미지가 메인 이미지로 설정됩니다</p>
        <p>• 드래그 앤 드롭 또는 클릭하여 여러 이미지를 한 번에 업로드할 수 있습니다</p>
      </div>
    </div>
  );
};

export default ImageUploader;
