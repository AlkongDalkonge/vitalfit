import React, { useState } from 'react';
import AccountImageUploader from './AccountImageUploader';

const AccountInfoSection = ({
  accountNumber,
  accountBank,
  accountImage,
  accountImageFile,
  onAccountNumberChange,
  onAccountBankChange,
  onAccountImageChange,
  onImageClick,
  className = '',
}) => {
  const [showAccountNumber, setShowAccountNumber] = useState(false);

  const toggleAccountNumberVisibility = () => {
    setShowAccountNumber(!showAccountNumber);
  };

  return (
    <div className={`bg-gray-50 p-3 rounded-lg ${className}`}>
      {/* 계좌 정보 입력 공간 (항상 표시) - 한 줄에 모든 정보 균형있게 배치 */}
      <div className="flex items-center justify-between gap-6">
        {/* 통장사본 이미지 - 왼쪽 */}
        <div className="flex-shrink-0">
          <AccountImageUploader
            imageUrl={accountImage}
            onImageChange={onAccountImageChange}
            onImageClick={onImageClick}
            height="h-16"
          />
        </div>

        {/* 은행명과 계좌번호 - 오른쪽 균형있게 배치 */}
        <div className="flex items-center gap-6 flex-1 justify-center">
          {/* 은행명 입력란 */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={accountBank}
              onChange={e => onAccountBankChange(e.target.value)}
              placeholder="은행명을 입력하세요"
              className="w-36 p-2.5 border rounded text-sm"
            />
            <span className="text-sm text-gray-600 whitespace-nowrap">은행</span>
          </div>

          {/* 계좌번호 입력란 */}
          <div className="flex items-center gap-2">
            <input
              type={showAccountNumber ? 'text' : 'password'}
              value={accountNumber}
              onChange={e => onAccountNumberChange(e.target.value)}
              placeholder="계좌번호를 입력하세요"
              className="w-60 p-2.5 border rounded text-sm pr-12"
            />
            <button
              type="button"
              onClick={toggleAccountNumberVisibility}
              className="text-gray-500 hover:text-gray-700"
            >
              {showAccountNumber ? '★' : '☆'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountInfoSection;
