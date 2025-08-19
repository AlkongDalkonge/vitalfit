import React, { useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

/**
 * SettlementPDFContent.jsx
 * - A4 급여명세표 스타일의 정산 PDF 레이아웃 (프린트/저장용)
 * - TailwindCSS 기반. 컬러/폰트/로고 영역은 주석 참고.
 * - 사용법: <SettlementPDFContent data={...}/> 후 우측 상단 버튼으로 PDF 저장
 */

const formatKRW = n => (n ?? 0).toLocaleString('ko-KR', { style: 'currency', currency: 'KRW' });

const L = ({ label, value, labelWidth = 'w-16', align = 'left' }) => (
  <div className="flex items-center gap-1 text-sm">
    <div className={`${labelWidth} shrink-0 text-gray-500`}>{label}</div>
    <div
      className={`font-medium text-gray-900 ${
        align === 'right' ? 'text-right w-[140px]' : 'text-left'
      }`}
    >
      {value || '-'}
    </div>
  </div>
);

const SectionTitle = ({ children }) => (
  <div className="text-xs tracking-wider font-semibold text-gray-500 uppercase">{children}</div>
);

const Row = ({ left, right }) => (
  <div className="grid grid-cols-12 gap-2 text-sm">
    <div className="col-span-7">{left}</div>
    <div className="col-span-5">{right}</div>
  </div>
);

const Table = ({ columns = [], rows = [], align = 'right' }) => (
  <div className="border border-gray-200 rounded-xl overflow-hidden">
    <div className="grid grid-cols-12 bg-gray-50 text-xs font-semibold text-gray-600">
      {columns.map((c, i) => (
        <div key={i} className={`col-span-${c.span || 6} py-2 px-3 ${c.className || ''}`}>
          {c.label}
        </div>
      ))}
    </div>
    {rows.map((r, idx) => (
      <div key={idx} className="grid grid-cols-12 border-t border-gray-100 text-sm">
        {r.map((cell, i) => (
          <div
            key={i}
            className={`col-span-${columns[i]?.span || 6} py-2 px-3 ${
              i === 0 ? 'text-gray-700' : align === 'right' ? 'text-right tabular-nums' : ''
            }`}
          >
            {cell}
          </div>
        ))}
      </div>
    ))}
  </div>
);

const SignatureBox = ({ title }) => (
  <div className="flex flex-col items-center justify-center border border-gray-200 rounded-xl h-24">
    <div className="text-xs text-gray-500 mb-1">{title}</div>
    <div className="w-20 h-10 border-b border-dashed" />
  </div>
);

const SettlementPDFContent = ({ data = {} }) => {
  const componentRef = useRef(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  // ref가 설정되었는지 확인
  React.useEffect(() => {
    console.log('componentRef 설정됨:', componentRef.current);
  }, []);

  const handlePrint = async () => {
    if (!componentRef.current) {
      console.error('componentRef가 없습니다');
      return;
    }

    setIsGeneratingPDF(true);
    try {
      console.log('PDF 생성 시작');

      const canvas = await html2canvas(componentRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const fileName = `${data.company?.name || '회사'}_급여명세_${data.period?.year || 'YYYY'}-${String(
        data.period?.month || 'MM'
      ).padStart(2, '0')}_${data.employee?.name || '직원'}.pdf`;

      pdf.save(fileName);
      console.log('PDF 생성 완료');
    } catch (error) {
      console.error('PDF 생성 오류:', error);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const earnings = data.earnings || [];
  const deductions = data.deductions || [];
  const earningsTotal = earnings.reduce((s, v) => s + (v.amount || 0), 0);
  const deductionsTotal = deductions.reduce((s, v) => s + (v.amount || 0), 0);
  const netPay = data.summary?.netPay ?? earningsTotal - deductionsTotal;

  return (
    <div className="w-full flex items-start justify-center py-6">
      {/* Top bar (buttons) */}
      <div className="no-print fixed right-6 top-6 z-10 flex gap-2">
        <button
          onClick={() => {
            console.log('PDF 저장 버튼 클릭됨');
            handlePrint();
          }}
          disabled={isGeneratingPDF}
          className={`px-4 py-2 rounded-xl text-white text-sm font-semibold shadow ${
            isGeneratingPDF ? 'bg-gray-400 cursor-not-allowed' : 'bg-black hover:opacity-90'
          }`}
        >
          {isGeneratingPDF ? 'PDF 생성 중...' : 'PDF로 저장'}
        </button>
      </div>

      {/* A4 Card */}
      <div
        ref={componentRef}
        className="shadow-print bg-white w-[210mm] min-h-[297mm] shadow-2xl rounded-2xl p-8"
      >
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="text-2xl font-bold tracking-tight">
              {data.company?.name || '회사명'}
            </div>
            <div className="text-sm text-gray-500 mt-1">
              사업자등록번호 {data.company?.bizNo || '000-00-00000'}
            </div>
          </div>
          <div className="text-right">
            <div className="text-[11px] text-gray-500">정산(급여) 명세서</div>
            <div className="text-xl font-bold">
              {data.period?.year || 'YYYY'}년 {String(data.period?.month || 'MM').padStart(2, '0')}
              월
            </div>
            <div className="text-xs text-gray-500 mt-1">
              지급일 {data.summary?.payDate || 'YYYY.MM.DD'}
            </div>
          </div>
        </div>

        <hr className="my-6 border-gray-200" />

        {/* Identity */}
        <Row
          left={
            <div className="space-y-1">
              <L label="지점" value={data.center?.name || '-'} labelWidth="w-12" align="left" />
              <L
                label="직급"
                value={data.employee?.position || '-'}
                labelWidth="w-12"
                align="left"
              />
              <L label="성명" value={data.employee?.name || '-'} labelWidth="w-12" align="left" />
              <L label="사번" value={data.employee?.id || '-'} labelWidth="w-12" align="left" />
            </div>
          }
          right={
            <div className="space-y-1">
              <L
                label="정상 PT횟수"
                value={`${data.metrics?.regularPT ?? 0}회`}
                labelWidth="w-24"
                align="right"
              />
              <L
                label="이벤트 PT횟수"
                value={`${data.metrics?.eventPT ?? 0}회`}
                labelWidth="w-24"
                align="right"
              />
              <L
                label="시강당 수업료"
                value={formatKRW(data.metrics?.hourlyFee || 0)}
                labelWidth="w-24"
                align="right"
              />
              <L
                label="총매출"
                value={formatKRW(data.metrics?.grossSales || 0)}
                labelWidth="w-24"
                align="right"
              />
            </div>
          }
        />

        {/* Earnings & Deductions */}
        <div className="grid grid-cols-12 gap-6 mt-6">
          <div className="col-span-7">
            <SectionTitle>지급 항목</SectionTitle>
            <div className="mt-2">
              <Table
                columns={[
                  { label: '항목', span: 7 },
                  { label: '금액', span: 5, className: 'text-right' },
                ]}
                rows={earnings.map(e => [e.label, formatKRW(e.amount)])}
              />
            </div>
          </div>
          <div className="col-span-5">
            <SectionTitle>공제 항목</SectionTitle>
            <div className="mt-2">
              <Table
                columns={[
                  { label: '항목', span: 7 },
                  { label: '금액', span: 5, className: 'text-right' },
                ]}
                rows={deductions.map(d => [d.label, formatKRW(d.amount)])}
              />
            </div>
          </div>
        </div>

        {/* Totals */}
        <div className="grid grid-cols-12 gap-6 mt-6 items-start">
          <div className="col-span-7">
            <div className="border border-gray-200 rounded-xl p-4">
              <div className="flex items-center justify-between text-base">
                <div className="text-gray-600">지급 합계</div>
                <div className="font-semibold tabular-nums">{formatKRW(earningsTotal)}</div>
              </div>
              <div className="flex items-center justify-between text-base mt-2">
                <div className="text-gray-600">공제 합계</div>
                <div className="font-semibold tabular-nums">{formatKRW(deductionsTotal)}</div>
              </div>
              <hr className="my-3" />
              <div className="flex items-center justify-between text-xl">
                <div className="font-semibold">실지급액</div>
                <div className="font-bold tabular-nums">{formatKRW(netPay)}</div>
              </div>
            </div>
          </div>
          <div className="col-span-5">
            <div className="border border-gray-200 rounded-xl p-4">
              <SectionTitle>지급 정보</SectionTitle>
              <div className="space-y-1 mt-2 text-sm">
                <L label="은행" value={data.payment?.bank || '-'} labelWidth="w-12" align="left" />
                <L
                  label="계좌"
                  value={data.payment?.account || '-'}
                  labelWidth="w-12"
                  align="left"
                />
                <L
                  label="예금주"
                  value={data.payment?.holder || data.employee?.name || '-'}
                  labelWidth="w-12"
                  align="left"
                />
                <L
                  label="지급일"
                  value={data.summary?.payDate || 'YYYY.MM.DD'}
                  labelWidth="w-12"
                  align="left"
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 mt-3">
              <SignatureBox title="작성" />
              <SignatureBox title="검토" />
              <SignatureBox title="승인" />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-[11px] text-gray-500 flex items-start justify-between">
          <div>
            ※ 본 명세서는 {data.company?.name || '회사'}에서 발급되었으며, 근로기준법 및 사내 규정에
            따릅니다.
          </div>
          <div className="text-right">문의: {data.company?.contact || '02-000-0000'}</div>
        </div>
      </div>
    </div>
  );
};

export default SettlementPDFContent;

/**
 * 예시 데이터
 * const demo = {
 *  company: { name: "VitalFit", bizNo: "123-45-67890", contact: "02-123-4567" },
 *  center: { name: "강남점" },
 *  employee: { name: "홍길동", id: "VF-0012", position: "팀장" },
 *  period: { year: 2025, month: 7 },
 *  summary: { payDate: "2025.08.25" },
 *  payment: { bank: "국민", account: "123456-78-901234", holder: "홍길동" },
 *  metrics: { regularPT: 63, eventPT: 6, hourlyFee: 21000, grossSales: 10300000 },
 *  earnings: [
 *    { label: "수업비 매출", amount: 1383000 },
 *    { label: "커미션", amount: 700000 },
 *    { label: "이번달 이월매출", amount: 300000 },
 *  ],
 *  deductions: [
 *    { label: "환불금", amount: 0 },
 *  ],
 * };
 */
