import React, { useState, useCallback, useRef, useEffect } from 'react';

const CareerSection = ({
  title,
  fieldName,
  data,
  onContentChange,
  onAddItem,
  onRemoveItem,
  onItemContentChange,
  onItemDateChange,
}) => {
  const [localItems, setLocalItems] = useState(
    data.items && data.items.length > 0
      ? data.items
      : [
          {
            startDate: '',
            endDate: '',
            content: '',
            status: fieldName === 'education' ? '' : undefined,
          },
        ]
  );
  const debounceTimeoutRef = useRef(null);
  const inputRefs = useRef([]);

  // 초기 데이터 동기화
  useEffect(() => {
    if (data.items && data.items.length > 0) {
      setLocalItems(data.items);
    } else {
      // 기본 항목이 없으면 1개 생성
      setLocalItems([
        {
          startDate: '',
          endDate: '',
          content: '',
          status: fieldName === 'education' ? '' : undefined,
        },
      ]);
    }
  }, [data.items, fieldName]);

  // 디바운싱으로 부모 컴포넌트 상태 업데이트
  const updateParentState = useCallback(
    newItems => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      debounceTimeoutRef.current = setTimeout(() => {
        console.log(`🔄 ${fieldName} 부모 상태 업데이트:`, newItems);
        // 올바른 데이터 구조로 전달
        onContentChange(fieldName, { items: newItems });
      }, 300);
    },
    [fieldName, onContentChange]
  );

  // 새 항목 추가
  const handleAddItem = useCallback(() => {
    const newItems = [
      ...localItems,
      {
        startDate: '',
        endDate: '',
        content: '',
        status: fieldName === 'education' ? '' : undefined,
      },
    ];
    setLocalItems(newItems);
    updateParentState(newItems);

    // 새로 추가된 input에 포커스
    setTimeout(() => {
      if (inputRefs.current[newItems.length - 1]) {
        inputRefs.current[newItems.length - 1].focus();
      }
    }, 0);
  }, [localItems, fieldName, updateParentState]);

  // 항목 삭제
  const handleRemoveItem = useCallback(
    index => {
      if (localItems.length > 1) {
        const newItems = localItems.filter((_, i) => i !== index);
        setLocalItems(newItems);
        updateParentState(newItems);

        // 삭제 후 이전 input에 포커스
        setTimeout(() => {
          const focusIndex = Math.min(index, newItems.length - 1);
          if (inputRefs.current[focusIndex]) {
            inputRefs.current[focusIndex].focus();
          }
        }, 0);
      }
    },
    [localItems, updateParentState]
  );

  // 항목 내용 변경
  const handleItemContentChange = useCallback(
    (index, value) => {
      const newItems = [...localItems];
      newItems[index] = { ...newItems[index], content: value };
      setLocalItems(newItems);
      updateParentState(newItems);
    },
    [localItems, updateParentState]
  );

  // 항목 날짜 변경
  const handleItemDateChange = useCallback(
    (index, dateType, value) => {
      const newItems = [...localItems];
      newItems[index] = { ...newItems[index], [dateType]: value };
      setLocalItems(newItems);
      updateParentState(newItems);
    },
    [localItems, updateParentState]
  );

  // 항목 상태 변경 (학력만)
  const handleItemStatusChange = useCallback(
    (index, value) => {
      if (fieldName === 'education') {
        const newItems = [...localItems];
        newItems[index] = { ...newItems[index], status: value };
        setLocalItems(newItems);
        updateParentState(newItems);
      }
    },
    [localItems, fieldName, updateParentState]
  );

  // input refs 배열 초기화
  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, localItems.length);
  }, [localItems.length]);

  return (
    <div
      className="rounded-lg p-6 transition-all duration-300 shadow-md hover:-translate-y-1 hover:shadow-lg border-[0.1px]"
      style={{
        background:
          fieldName === 'education'
            ? 'radial-gradient(circle at center -50%, rgba(235,245,255,0.8) 0%, rgba(235,245,255,0.6) 20%, #b6ecf1 60%, #b6ecf1 100%)'
            : 'radial-gradient(circle at center -50%, rgba(235,245,255,0.8) 0%, rgba(235,245,255,0.6) 20%, #4d6be6 60%, #4d6be6 100%)',
        borderColor: fieldName === 'education' ? '#b6ecf1' : '#4d6be6',
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="font-medium text-white drop-shadow-md">{title}</h4>
        </div>
      </div>

      <div className="space-y-3">
        {localItems.map((item, index) => (
          <div key={index} className="border rounded-lg p-4 bg-white">
            <div className="flex items-center justify-end mb-3">
              {localItems.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveItem(index)}
                  className="text-red-500 hover:text-red-700 text-sm"
                >
                  삭제
                </button>
              )}
            </div>

            {/* 한 줄에 3-4개 입력 필드 배열 */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
              {/* 시작일 */}
              <div className="relative">
                <input
                  type="date"
                  value={item.startDate || ''}
                  onChange={e => handleItemDateChange(index, 'startDate', e.target.value)}
                  className="w-full p-3 pt-7 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
                <span className="absolute left-3 top-1 text-gray-400 text-sm pointer-events-none select-none">
                  시작일
                </span>
              </div>

              {/* 종료일 */}
              <div className="relative">
                <input
                  type="date"
                  value={item.endDate || ''}
                  onChange={e => handleItemDateChange(index, 'endDate', e.target.value)}
                  className="w-full p-3 pt-7 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
                <span className="absolute left-3 top-1 text-gray-400 text-sm pointer-events-none select-none">
                  종료일
                </span>
              </div>

              {/* 상태 선택 (학력만) */}
              {fieldName === 'education' && (
                <div>
                  <select
                    value={item.status || ''}
                    onChange={e => handleItemStatusChange(index, e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  >
                    <option value="">학위 선택</option>
                    <option value="졸업">졸업</option>
                    <option value="재학중">재학중</option>
                    <option value="휴학">휴학</option>
                    <option value="중퇴">중퇴</option>
                    <option value="수료">수료</option>
                  </select>
                </div>
              )}

              {/* 내용 입력 (경력인 경우 4번째 칸에 배치) */}
              {fieldName === 'experience' && (
                <div className="md:col-span-2">
                  <input
                    type="text"
                    value={item.content || ''}
                    onChange={e => handleItemContentChange(index, e.target.value)}
                    placeholder="회사명-담당업무를 입력하세요"
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    maxLength={200}
                  />
                  <div className="text-xs text-gray-500 mt-1">재직 시 종료일 생략 가능</div>
                </div>
              )}
            </div>

            {/* 학력인 경우 내용을 별도 줄에 배치 */}
            {fieldName === 'education' && (
              <div>
                <textarea
                  ref={el => (inputRefs.current[index] = el)}
                  value={item.content || ''}
                  onChange={e => handleItemContentChange(index, e.target.value)}
                  placeholder="학교명-전공을 입력하세요"
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm resize-none"
                  rows={2}
                  maxLength={200}
                />
              </div>
            )}
          </div>
        ))}

        {/* 새 항목 추가 버튼 */}
        <button
          type="button"
          onClick={handleAddItem}
          className="w-full p-2 border-2 border-dashed border-white/50 rounded-lg text-white hover:border-white hover:bg-white/10 transition-colors text-sm"
        >
          + 새 {title} 항목 추가
        </button>
      </div>
    </div>
  );
};

export default CareerSection;
