import React, { useState, useEffect } from 'react';
import ImageUploader from './ImageUploader';
import { centerAPI } from '../utils/api';

const CenterImageModal = ({ isOpen, onClose, center, onImagesUpdated }) => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  // 모달이 열릴 때 센터 이미지 로드
  useEffect(() => {
    if (isOpen && center) {
      loadCenterImages();
    }
  }, [isOpen, center]);

  // 센터 이미지 로드
  const loadCenterImages = async () => {
    if (!center?.id) return;

    setLoading(true);
    try {
      const result = await centerAPI.getCenterById(center.id);

      if (result.success && result.data.images) {
        setImages(
          result.data.images.map(img => ({
            id: img.id,
            url: img.image_url,
            image_url: img.image_url,
            isMain: img.is_main,
            name: img.image_name || 'center-image',
            onRemove: index => handleRemoveImage(img.id, index),
          }))
        );
      }
    } catch (error) {
      console.error('센터 이미지 로드 실패:', error);
      alert('이미지를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 새 이미지 업로드
  const handleImageUpload = async newImages => {
    if (!center?.id) return;

    setUploading(true);

    try {
      const uploadPromises = newImages.map(async imageData => {
        const formData = new FormData();
        formData.append('image', imageData.file);
        formData.append('center_id', center.id);
        formData.append('is_main', imageData.isMain ? 'true' : 'false');

        const result = await centerAPI.uploadImage(formData);

        return {
          id: result.data.id,
          url: result.data.image_url,
          image_url: result.data.image_url,
          isMain: result.data.is_main,
          name: imageData.name,
          onRemove: index => handleRemoveImage(result.data.id, index),
        };
      });

      const uploadedImages = await Promise.all(uploadPromises);
      setImages(prev => [...prev, ...uploadedImages]);

      // 부모 컴포넌트에 업데이트 알림
      if (onImagesUpdated) {
        onImagesUpdated();
      }
    } catch (error) {
      console.error('이미지 업로드 실패:', error);
      alert(error.message || '이미지 업로드에 실패했습니다.');
    } finally {
      setUploading(false);
    }
  };

  // 이미지 삭제
  const handleRemoveImage = async (imageId, index) => {
    const confirmDelete = window.confirm('이 이미지를 삭제하시겠습니까?');
    if (!confirmDelete) return;

    try {
      const result = await centerAPI.deleteImage(imageId);

      if (result.success) {
        setImages(prev => prev.filter((_, i) => i !== index));

        // 부모 컴포넌트에 업데이트 알림
        if (onImagesUpdated) {
          onImagesUpdated();
        }
      } else {
        throw new Error(result.message || '이미지 삭제 실패');
      }
    } catch (error) {
      console.error('이미지 삭제 실패:', error);
      alert(error.message || '이미지 삭제에 실패했습니다.');
    }
  };

  // 메인 이미지 변경
  const handleSetMainImage = async (imageId, index) => {
    try {
      const result = await centerAPI.setMainImage(imageId);

      if (result.success) {
        // 모든 이미지의 메인 설정을 해제하고 선택된 이미지만 메인으로 설정
        setImages(prev =>
          prev.map((img, i) => ({
            ...img,
            isMain: i === index,
          }))
        );

        // 부모 컴포넌트에 업데이트 알림
        if (onImagesUpdated) {
          onImagesUpdated();
        }
      } else {
        throw new Error(result.message || '메인 이미지 설정 실패');
      }
    } catch (error) {
      console.error('메인 이미지 설정 실패:', error);
      alert(error.message || '메인 이미지 설정에 실패했습니다.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="w-[900px] max-h-[90vh] bg-white rounded-lg overflow-hidden">
        {/* 헤더 */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-extrabold text-gray-800">{center?.name} - 이미지 관리</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors duration-200"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              className="text-neutral-600"
            >
              <path
                d="M12 4L4 12M4 4L12 12"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        {/* 내용 */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <span className="ml-3 text-gray-600">이미지를 불러오는 중...</span>
            </div>
          ) : (
            <div className="space-y-6">
              {/* 이미지 업로더 */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">새 이미지 업로드</h3>
                <ImageUploader
                  onImageUpload={handleImageUpload}
                  maxImages={10}
                  currentImages={images}
                  isMainImageRequired={images.length === 0}
                  disabled={uploading}
                />
              </div>

              {/* 현재 이미지 목록 */}
              {images.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    현재 이미지 ({images.length}개)
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {images.map((image, index) => (
                      <div key={image.id || index} className="relative group">
                        <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden">
                          <img
                            src={image.url || image.image_url}
                            alt={`센터 이미지 ${index + 1}`}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                          />
                        </div>

                        {/* 메인 이미지 표시 */}
                        {image.isMain && (
                          <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                            메인
                          </div>
                        )}

                        {/* 액션 버튼들 */}
                        <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                          <div className="flex gap-2">
                            {!image.isMain && (
                              <button
                                onClick={() => handleSetMainImage(image.id, index)}
                                className="bg-blue-500 text-white text-xs px-2 py-1 rounded hover:bg-blue-600"
                              >
                                메인 설정
                              </button>
                            )}
                            <button
                              onClick={() => handleRemoveImage(image.id, index)}
                              className="bg-red-500 text-white text-xs px-2 py-1 rounded hover:bg-red-600"
                            >
                              삭제
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 안내 메시지 */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-800 mb-2">이미지 관리 안내</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• 메인 이미지는 센터 목록에서 대표 이미지로 표시됩니다</li>
                  <li>• 이미지에 마우스를 올리면 메인 설정 및 삭제 버튼이 나타납니다</li>
                  <li>• 권장 이미지 크기: 16:9 비율 (예: 1920x1080px)</li>
                  <li>• 지원 형식: JPG, PNG, WebP (최대 5MB)</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* 푸터 */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};

export default CenterImageModal;
