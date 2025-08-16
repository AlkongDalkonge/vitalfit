export const preparePDFData = ({
  selectedMonth,
  trainerSalary,
  sessionRevenue,
  bonusData,
  commissionRate,
  teamPTIncentive,
  previousCarryoverAmount,
  centers,
  selectedCenter,
  selectedTrainerInfo,
  netSalary,
  ptSessionStats,
  totalRevenue,
}) => {
  const [year, month] = selectedMonth.split('-').map(Number);

  // 지급 항목
  const earnings = [
    { label: '기본급', amount: trainerSalary?.base_salary || 0 },
    { label: '수업료', amount: sessionRevenue },
    { label: '보너스', amount: bonusData?.total_bonus || 0 },
    { label: '커미션', amount: commissionRate?.monthly_commission || 0 },
    { label: '팀 PT 인센티브', amount: teamPTIncentive },
    { label: '저번달 이월매출', amount: previousCarryoverAmount },
  ].filter(item => item.amount > 0);

  // 공제 항목
  const totalSalaryForTax =
    (trainerSalary?.base_salary || 0) +
    sessionRevenue +
    (bonusData?.total_bonus || 0) +
    (commissionRate?.monthly_commission || 0) +
    teamPTIncentive;
  const withholdingTax = Math.round(totalSalaryForTax * 0.033); // 3.3% 원천징수세

  const deductions = [{ label: '원천징수세 (3.3%)', amount: withholdingTax }];

  return {
    company: {
      name: 'VitalFit',
      bizNo: '123-45-67890',
      contact: '02-123-4567',
    },
    center: {
      name: centers.find(c => c.id === selectedCenter)?.name || '-',
    },
    employee: {
      name: selectedTrainerInfo?.name || '-',
      id: selectedTrainerInfo?.id || '-',
      position: selectedTrainerInfo?.position_id === 7 ? '팀장' : '트레이너',
    },
    period: { year, month },
    summary: {
      payDate: `${year}.${String(month + 1).padStart(2, '0')}.25`,
      netPay: netSalary,
    },
    payment: {
      bank: '국민',
      account: '123456-78-901234',
      holder: selectedTrainerInfo?.name || '-',
    },
    metrics: {
      regularPT: ptSessionStats?.regular_sessions || 0,
      eventPT: ptSessionStats?.event_sessions || 0,
      hourlyFee: 21000,
      grossSales: totalRevenue,
    },
    earnings,
    deductions,
  };
};
