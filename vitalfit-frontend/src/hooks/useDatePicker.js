import { useState } from 'react';

/**
 * 날짜 선택기 관련 상태와 로직을 관리하는 커스텀 훅
 */
export const useDatePicker = () => {
  // 현재 날짜 기준으로 기본값 설정
  const currentDate = new Date();
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);

  // 드롭다운 상태
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showYearDropdown, setShowYearDropdown] = useState(false);
  const [showMonthDropdown, setShowMonthDropdown] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  // 년도 목록 생성 (현재 년도 기준 ±5년)
  const years = [];
  const currentYear = currentDate.getFullYear();
  for (let year = currentYear - 5; year <= currentYear + 1; year++) {
    years.push(year);
  }

  // 월 목록 생성
  const months = [];
  for (let month = 1; month <= 12; month++) {
    months.push(month);
  }

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

  // 년도 선택
  const selectYear = year => {
    setSelectedYear(year);
    setShowYearDropdown(false);
  };

  // 월 선택
  const selectMonth = month => {
    setSelectedMonth(month);
    setShowMonthDropdown(false);
  };

  // 날짜 선택기 컴포넌트
  const DatePickerComponent = () => (
    <div className="relative">
      <div className="flex gap-2">
        {/* 년도 선택 */}
        <div className="relative flex-1">
          <button
            type="button"
            onClick={toggleYearDropdown}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-left"
          >
            {selectedYear}년
          </button>
          {showYearDropdown && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
              {years.map(year => (
                <button
                  key={year}
                  type="button"
                  onClick={() => selectYear(year)}
                  className="w-full px-3 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                >
                  {year}년
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 월 선택 */}
        <div className="relative flex-1">
          <button
            type="button"
            onClick={toggleMonthDropdown}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-left"
          >
            {selectedMonth}월
          </button>
          {showMonthDropdown && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
              {months.map(month => (
                <button
                  key={month}
                  type="button"
                  onClick={() => selectMonth(month)}
                  className="w-full px-3 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                >
                  {month}월
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return {
    // 상태
    selectedYear,
    selectedMonth,
    showDatePicker,
    showYearDropdown,
    showMonthDropdown,
    showTooltip,

    // 함수들
    setSelectedYear,
    setSelectedMonth,
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
    selectYear,
    selectMonth,
    DatePickerComponent,
  };
};
