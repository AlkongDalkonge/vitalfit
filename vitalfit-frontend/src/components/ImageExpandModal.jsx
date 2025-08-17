import React from 'react';

const ImageExpandModal = ({ isOpen, onClose, imageUrl, imageName, title }) => {
  if (!isOpen) return null;

  const handleBackdropClick = e => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleKeyDown = e => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  React.useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75"
      onClick={handleBackdropClick}
    >
      <div className="relative max-w-4xl max-h-full p-4">
        {/* 닫기 버튼 */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 z-10 p-2 text-white bg-black bg-opacity-50 rounded-full hover:bg-opacity-75 transition-all duration-200"
          aria-label="닫기"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* 이미지 컨테이너 */}
        <div className="relative">
          {/* 제목 */}
          {title && (
            <div className="absolute top-0 left-0 right-0 z-10 p-3 bg-black bg-opacity-50 text-white text-center rounded-t-lg">
              <h3 className="text-lg font-semibold">{title}</h3>
              {imageName && <p className="text-sm text-gray-300 mt-1">{imageName}</p>}
            </div>
          )}

          {/* 이미지 */}
          <img
            src={imageUrl}
            alt={imageName || '확대된 이미지'}
            className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl"
            onError={e => {
              e.target.src = '/img/error-image.png';
              e.target.alt = '이미지를 불러올 수 없습니다';
            }}
          />

          {/* 이미지 정보 (하단) */}
          {imageName && !title && (
            <div className="absolute bottom-0 left-0 right-0 p-3 bg-black bg-opacity-50 text-white text-center rounded-b-lg">
              <p className="text-sm">{imageName}</p>
            </div>
          )}
        </div>

        {/* 확대/축소 안내 */}
        <div className="mt-4 text-center text-white text-sm">
          <p>ESC 키를 누르거나 배경을 클릭하여 닫을 수 있습니다</p>
        </div>
      </div>
    </div>
  );
};

export default ImageExpandModal;

