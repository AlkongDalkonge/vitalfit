// import React from 'react'; // React 17+ JSX Transform
import SettlementPDFContent from './SettlementPDFContent';

const SettlementPDFModal = ({ isOpen, onClose, pdfData }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full h-full max-w-7xl mx-4 overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold text-gray-800">정산서 PDF 미리보기</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">
            ×
          </button>
        </div>
        <div className="h-full overflow-auto">
          <SettlementPDFContent data={pdfData} />
        </div>
      </div>
    </div>
  );
};

export default SettlementPDFModal;
