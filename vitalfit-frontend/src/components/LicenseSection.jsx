import React from 'react';
import ImageUploadField from './ImageUploadField';

const LicenseSection = ({
  title,
  fieldName,
  data,
  onImageUpload,
  onImageDelete,
  onImageExpand,
  onContentChange,
  onAddItem,
  onRemoveItem,
}) => {
  return (
    <div className="border rounded-lg p-6 bg-gray-50">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="font-medium text-gray-600">{title}</h4>
        </div>
      </div>

      <div className="space-y-4">
        {(data?.items || []).map((item, index) => (
          <div key={index} className="border rounded-lg p-4 bg-white">
            <div className="flex items-center justify-end mb-3">
              {(data?.items || []).length > 1 && (
                <button
                  type="button"
                  onClick={() => onRemoveItem(index)}
                  className="text-red-500 hover:text-red-700 text-sm"
                >
                  삭제
                </button>
              )}
            </div>

            <div className="flex gap-4">
              {/* 왼쪽: 이미지 업로드 */}
              <div className="w-40">
                <ImageUploadField
                  fieldName={fieldName}
                  title={title}
                  data={item}
                  onImageUpload={(fieldName, file) => onImageUpload(fieldName, file, index)}
                  onImageDelete={() => onImageDelete(fieldName, index)}
                  onImageExpand={onImageExpand}
                />
              </div>

              {/* 오른쪽: 개별 입력 필드들 */}
              <div className="flex-1 space-y-3">
                {/* 자격증 이름 */}
                <div>
                  <input
                    type="text"
                    value={item.licenseName || ''}
                    onChange={e => onContentChange(index, 'licenseName', e.target.value)}
                    placeholder="자격증 이름을 입력하세요"
                    maxLength={50}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                </div>

                {/* 발급기관 */}
                <div>
                  <input
                    type="text"
                    value={item.issuingOrganization || ''}
                    onChange={e => onContentChange(index, 'issuingOrganization', e.target.value)}
                    placeholder="발급기관을 입력하세요"
                    maxLength={50}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                </div>

                {/* 발급일자 */}
                <div className="relative">
                  <input
                    type="date"
                    value={item.issueDate || ''}
                    onChange={e => onContentChange(index, 'issueDate', e.target.value)}
                    className="w-full p-3 pt-7 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                  <span className="absolute left-3 top-1 text-gray-400 text-sm pointer-events-none select-none">
                    발급일자
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* 새 자격증 항목 추가 버튼 */}
        <button
          type="button"
          onClick={onAddItem}
          className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-colors"
        >
          + 새 자격증 항목 추가
        </button>
      </div>
    </div>
  );
};

export default LicenseSection;
