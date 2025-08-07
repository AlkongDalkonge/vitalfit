import { useState } from 'react';

/**
 * 날짜 선택기 관련 상태와 로직을 관리하는 커스텀 훅
 */
export const useDatePicker = () => {
  // 드롭다운 상태
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showYearDropdown, setShowYearDropdown] = useState(false);
  const [showMonthDropdown, setShowMonthDropdown] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  // 드롭다운 토글 함수들
  const toggleDatePicker = () => {
    setShowDatePicker(!showDatePicker);
    setShowYearDropdown(false);
    setShowMonthDropdown(false);
  };

  const toggleYearDropdown = () => {
    setShowYearDropdown(!showYearDropdown);
    setShowMonthDropdown(false);
  };

  const toggleMonthDropdown = () => {
    setShowMonthDropdown(!showMonthDropdown);
    setShowYearDropdown(false);
  };

  const toggleTooltip = () => {
    setShowTooltip(!showTooltip);
  };

  // 모든 드롭다운 닫기
  const closeAllDropdowns = () => {
    setShowDatePicker(false);
    setShowYearDropdown(false);
    setShowMonthDropdown(false);
    setShowTooltip(false);
  };

  // 날짜 선택기만 닫기
  const closeDatePicker = () => {
    setShowDatePicker(false);
    setShowYearDropdown(false);
    setShowMonthDropdown(false);
  };

  return {
    // 상태
    showDatePicker,
    showYearDropdown,
    showMonthDropdown,
    showTooltip,

    // 함수들
    toggleDatePicker,
    toggleYearDropdown,
    toggleMonthDropdown,
    toggleTooltip,
    closeAllDropdowns,
    closeDatePicker,
    setShowDatePicker,
    setShowYearDropdown,
    setShowMonthDropdown,
    setShowTooltip,
  };
};
