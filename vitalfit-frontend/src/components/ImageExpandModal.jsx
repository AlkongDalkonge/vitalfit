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
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="relative max-w-4xl max-h-[90vh] bg-white rounded-lg shadow-2xl overflow-hidden">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-4 border-b bg-gray-50">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
            {imageName && <p className="text-sm text-gray-600 mt-1">{imageName}</p>}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors"
            aria-label="닫기"
          >
            <svg
              className="w-6 h-6 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* 이미지 컨테이너 */}
        <div className="flex items-center justify-center p-4 bg-gray-100">
          <img
            src={imageUrl}
            alt={imageName || title}
            className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
            style={{ maxHeight: 'calc(90vh - 120px)' }}
          />
        </div>

        {/* 하단 액션 버튼 */}
        <div className="flex items-center justify-center p-4 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageExpandModal;
