import React, { useState, useCallback, useEffect } from 'react';
import { fetchUrlThumbnail, isInstagramUrl } from '../utils/instagramUtils';

const InstagramLinksSection = ({
  title = '인스타그램 링크',
  fieldName = 'instagramLinks',
  data,
  onContentChange,
}) => {
  const [localItems, setLocalItems] = useState(
    data?.items && data.items.length > 0 ? data.items : []
  );
  const [loadingStates, setLoadingStates] = useState({});
  const [errorStates, setErrorStates] = useState({});

  // 초기 데이터 동기화
  useEffect(() => {
    if (data?.items && data.items.length > 0) {
      setLocalItems(data.items);
    }
  }, [data?.items]);

  // 부모 컴포넌트 상태 업데이트
  const updateParentState = useCallback(
    newItems => {
      onContentChange(fieldName, { items: newItems });
    },
    [fieldName, onContentChange]
  );

  // 새 링크 추가
  const handleAddLink = useCallback(() => {
    const newItems = [
      ...localItems,
      {
        url: '',
        thumbnail: '',
        title: '',
        author: '',
        description: '',
        timestamp: Date.now(),
      },
    ];
    setLocalItems(newItems);
    updateParentState(newItems);
  }, [localItems, updateParentState]);

  // 링크 삭제
  const handleRemoveLink = useCallback(
    index => {
      const newItems = localItems.filter((_, i) => i !== index);
      setLocalItems(newItems);
      updateParentState(newItems);

      // 로딩/에러 상태도 제거
      setLoadingStates(prev => {
        const newStates = { ...prev };
        delete newStates[index];
        return newStates;
      });
      setErrorStates(prev => {
        const newStates = { ...prev };
        delete newStates[index];
        return newStates;
      });
    },
    [localItems, updateParentState]
  );

  // URL 변경 처리
  const handleUrlChange = useCallback(
    async (index, url) => {
      const newItems = [...localItems];
      newItems[index] = { ...newItems[index], url };
      setLocalItems(newItems);
      updateParentState(newItems);

      // URL이 유효하고 변경된 경우에만 썸네일 가져오기
      if (url && url.trim() !== '') {
        setLoadingStates(prev => ({ ...prev, [index]: true }));
        setErrorStates(prev => ({ ...prev, [index]: '' }));

        try {
          const result = await fetchUrlThumbnail(url);

          if (result.success) {
            newItems[index] = {
              ...newItems[index],
              thumbnail: result.thumbnail,
              title: result.title,
              author: result.author,
              description: result.description,
            };
            setLocalItems(newItems);
            updateParentState(newItems);
          } else {
            setErrorStates(prev => ({ ...prev, [index]: result.error }));
          }
        } catch (error) {
          setErrorStates(prev => ({
            ...prev,
            [index]: '링크 정보를 가져오는 중 오류가 발생했습니다.',
          }));
        } finally {
          setLoadingStates(prev => ({ ...prev, [index]: false }));
        }
      }
    },
    [localItems, updateParentState]
  );

  // 링크 클릭 시 새 탭에서 열기
  const handleLinkClick = url => {
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="border rounded-lg p-6 bg-gray-50">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="font-medium text-gray-600">{title}</h4>
          <p className="text-sm text-gray-500 mt-1">
            인스타그램 URL을 입력하면 자동으로 썸네일이 표시됩니다
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {localItems.map((item, index) => (
          <div key={item.timestamp || index} className="border rounded-lg p-4 bg-white">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                {isInstagramUrl(item.url) && (
                  <div className="w-5 h-5 bg-gradient-to-r from-purple-500 to-pink-500 rounded flex items-center justify-center">
                    <span className="text-white text-xs font-bold">IG</span>
                  </div>
                )}
                <span className="text-sm text-gray-500">링크 {index + 1}</span>
              </div>
              <button
                type="button"
                onClick={() => handleRemoveLink(index)}
                className="text-red-500 hover:text-red-700 text-sm"
              >
                삭제
              </button>
            </div>

            {/* URL 입력 필드 */}
            <div className="mb-3">
              <input
                type="url"
                value={item.url || ''}
                onChange={e => handleUrlChange(index, e.target.value)}
                placeholder="https://www.instagram.com/p/..."
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
              {loadingStates[index] && (
                <div className="flex items-center mt-2 text-sm text-blue-600">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                  썸네일을 가져오는 중...
                </div>
              )}
              {errorStates[index] && (
                <div className="mt-2 text-sm text-red-600">⚠️ {errorStates[index]}</div>
              )}
            </div>

            {/* 썸네일 미리보기 */}
            {item.thumbnail && (
              <div className="border rounded-lg p-3 bg-gray-50">
                <div className="flex items-start space-x-3">
                  <img
                    src={item.thumbnail}
                    alt={item.title || '링크 미리보기'}
                    className="w-20 h-20 object-cover rounded-lg border"
                    onError={e => {
                      e.target.style.display = 'none';
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <h5 className="font-medium text-gray-900 text-sm truncate">{item.title}</h5>
                    {item.author && <p className="text-sm text-gray-600 mt-1">{item.author}</p>}
                    {item.description && (
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">{item.description}</p>
                    )}
                    <button
                      type="button"
                      onClick={() => handleLinkClick(item.url)}
                      className="mt-2 text-blue-600 hover:text-blue-800 text-sm underline"
                    >
                      링크 열기 →
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}

        {/* 새 링크 추가 버튼 */}
        <button
          type="button"
          onClick={handleAddLink}
          className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-colors text-sm"
        >
          + 새 링크 추가
        </button>
      </div>
    </div>
  );
};

export default InstagramLinksSection;
