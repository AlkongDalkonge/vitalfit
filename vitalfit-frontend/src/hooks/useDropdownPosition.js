import { useState, useEffect, useRef } from 'react';

/**
 * 드롭다운 위치를 자동으로 계산하는 커스텀 훅
 * @param {boolean} isOpen - 드롭다운이 열려있는지 여부
 * @param {number} dropdownHeight - 드롭다운의 예상 높이 (기본값: 200px)
 * @param {number} minSpace - 최소 필요 공간 (기본값: 50px)
 * @returns {object} 드롭다운 위치 정보
 */
export const useDropdownPosition = (isOpen, dropdownHeight = 200, minSpace = 50) => {
  const [direction, setDirection] = useState('down');
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (!isOpen || !triggerRef.current) return;

    const calculatePosition = () => {
      const triggerRect = triggerRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;

      // 아래쪽 공간 계산
      const spaceBelow = viewportHeight - triggerRect.bottom;
      // 위쪽 공간 계산
      const spaceAbove = triggerRect.top;

      // 드롭다운이 아래쪽에 들어갈 수 있는지 확인
      const canFitBelow = spaceBelow >= dropdownHeight + minSpace;
      // 드롭다운이 위쪽에 들어갈 수 있는지 확인
      const canFitAbove = spaceAbove >= dropdownHeight + minSpace;

      let newDirection = 'down';
      let newPosition = { top: 0, left: 0 };

      if (canFitBelow) {
        // 아래쪽에 충분한 공간이 있으면 아래로
        newDirection = 'down';
        newPosition = {
          top: triggerRect.bottom + 8, // 8px 간격
          left: triggerRect.left,
        };
      } else if (canFitAbove) {
        // 위쪽에 충분한 공간이 있으면 위로
        newDirection = 'up';
        newPosition = {
          top: triggerRect.top - dropdownHeight - 8, // 8px 간격
          left: triggerRect.left,
        };
      } else {
        // 둘 다 공간이 부족하면 더 큰 공간 쪽으로
        if (spaceBelow > spaceAbove) {
          newDirection = 'down';
          newPosition = {
            top: triggerRect.bottom + 8,
            left: triggerRect.left,
          };
        } else {
          newDirection = 'up';
          newPosition = {
            top: triggerRect.top - dropdownHeight - 8,
            left: triggerRect.left,
          };
        }
      }

      // 화면 경계를 벗어나지 않도록 조정
      if (newPosition.left + triggerRect.width > viewportWidth) {
        newPosition.left = viewportWidth - triggerRect.width;
      }
      if (newPosition.left < 0) {
        newPosition.left = 0;
      }

      setDirection(newDirection);
      setPosition(newPosition);
    };

    // 초기 위치 계산
    calculatePosition();

    // 리사이즈 이벤트 리스너 추가
    const handleResize = () => {
      calculatePosition();
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', calculatePosition, true);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', calculatePosition, true);
    };
  }, [isOpen, dropdownHeight, minSpace]);

  return {
    direction,
    position,
    triggerRef,
    dropdownRef,
  };
};
