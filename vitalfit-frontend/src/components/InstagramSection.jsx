import React from 'react';
import ImageUploadField from './ImageUploadField';

const InstagramSection = ({
  title,
  fieldName,
  data,
  onImageUpload,
  onImageDelete,
  onImageExpand,
  onContentChange,
  onInstagramLink,
  fetchInstagramThumbnail,
  maxLength = 200,
}) => {
  return (
    <div className="border rounded-lg p-6 bg-gray-50">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="font-medium text-gray-600">{title}</h4>
        </div>
      </div>

      <div className="flex gap-4">
        {/* 왼쪽: 이미지 업로드 */}
        <div className="w-40">
          <ImageUploadField
            fieldName={fieldName}
            title={title}
            data={data}
            onImageUpload={onImageUpload}
            onImageDelete={onImageDelete}
            onImageExpand={onImageExpand}
          />
        </div>

        {/* 오른쪽: 계정 정보 입력 */}
        <div className="flex-1 space-y-3">
          {/* 인스타그램 링크 */}
          <div>
            <input
              type="url"
              value={data.instagramLink || ''}
              onChange={e => onContentChange('instagramLink', e.target.value)}
              placeholder="https://instagram.com/username"
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            />

            {/* 인스타그램 링크 버튼들 */}
            {data.instagramLink && data.instagramLink.trim() !== '' && (
              <div className="space-y-2 mt-3">
                <button
                  type="button"
                  onClick={() => onInstagramLink(data.instagramLink)}
                  className="w-full p-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200 font-medium flex items-center justify-center gap-2 text-sm"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                  인스타그램 링크 열기
                </button>

                <button
                  type="button"
                  onClick={() => {
                    console.log('fetchInstagramThumbnail 함수:', fetchInstagramThumbnail);
                    console.log('data.instagramLink:', data.instagramLink);
                    if (typeof fetchInstagramThumbnail === 'function') {
                      fetchInstagramThumbnail(data.instagramLink);
                    } else {
                      console.error(
                        'fetchInstagramThumbnail is not a function:',
                        fetchInstagramThumbnail
                      );
                      alert('썸네일 가져오기 함수를 찾을 수 없습니다.');
                    }
                  }}
                  className="w-full p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-200 font-medium flex items-center justify-center gap-2 text-sm"
                >
                  썸네일 가져오기
                </button>
              </div>
            )}
          </div>

          {/* 추가 설명 */}
        </div>
      </div>
    </div>
  );
};

export default InstagramSection;
