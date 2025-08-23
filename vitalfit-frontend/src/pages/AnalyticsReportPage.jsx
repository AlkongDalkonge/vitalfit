import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  Target,
  BarChart3,
  Download,
  FileText,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';

const AnalyticsReportPage = () => {
  // 더미 데이터
  const dummyData = {
    totalRevenue: 320000000,
    newMembers: 156,
    churnedMembers: 23,
    avgSettlement: 2800000,
    profitMargin: 68.5,
    revenueChange: 8.2,
    newMembersChange: 12.5,
    churnedMembersChange: -15.3,
    avgSettlementChange: 5.7,
    profitMarginChange: 2.1,
  };

  const [kpiData, setKpiData] = useState({
    totalRevenue: dummyData.totalRevenue,
    newMembers: dummyData.newMembers,
    churnedMembers: dummyData.churnedMembers,
    avgSettlement: dummyData.avgSettlement,
    profitMargin: dummyData.profitMargin,
  });

  // 센터별 성과 데이터
  const centerPerformanceData = [
    { name: '강남센터', revenue: 85000000, growthRate: 12.5, churnRate: 3.2 },
    { name: '홍대센터', revenue: 72000000, growthRate: 18.7, churnRate: 2.1 },
    { name: '신림센터', revenue: 68000000, growthRate: 8.3, churnRate: 7.8 },
  ];

  // 월별 매출 추이
  const monthlyRevenueData = [
    { month: '1월', revenue: 280000000 },
    { month: '2월', revenue: 295000000 },
    { month: '3월', revenue: 310000000 },
    { month: '4월', revenue: 298000000 },
    { month: '5월', revenue: 325000000 },
    { month: '6월', revenue: 320000000 },
  ];

  // 신규 vs 퇴회 회원
  const memberData = [
    { month: '1월', new: 142, churned: 18 },
    { month: '2월', new: 158, churned: 22 },
    { month: '3월', new: 165, churned: 19 },
    { month: '4월', new: 148, churned: 25 },
    { month: '5월', new: 172, churned: 21 },
    { month: '6월', new: 156, churned: 23 },
  ];

  // 강사별 매출 Top 10
  const trainerRevenueData = [
    { name: '김강사', revenue: 12500000 },
    { name: '이강사', revenue: 11800000 },
    { name: '박강사', revenue: 11200000 },
    { name: '최강사', revenue: 10800000 },
    { name: '정강사', revenue: 10200000 },
    { name: '한강사', revenue: 9800000 },
    { name: '조강사', revenue: 9200000 },
    { name: '윤강사', revenue: 8800000 },
    { name: '임강사', revenue: 8500000 },
    { name: '서강사', revenue: 8200000 },
  ];

  // 강사별 정산 비율
  const trainerSettlementData = [
    { name: '30% 미만', value: 15, color: '#ef4444' },
    { name: '30-40%', value: 25, color: '#f97316' },
    { name: '40-50%', value: 35, color: '#eab308' },
    { name: '50% 이상', value: 25, color: '#22c55e' },
  ];

  // 연령대·성별 분포
  const ageGenderData = [
    { name: '20대 남성', value: 25, color: '#3b82f6' },
    { name: '20대 여성', value: 35, color: '#ec4899' },
    { name: '30대 남성', value: 20, color: '#6366f1' },
    { name: '30대 여성', value: 30, color: '#f43f5e' },
    { name: '40대 이상', value: 15, color: '#8b5cf6' },
  ];

  // 고객당 평균 매출
  const arpuData = [
    { month: '1월', arpu: 185000 },
    { month: '2월', arpu: 192000 },
    { month: '3월', arpu: 198000 },
    { month: '4월', arpu: 195000 },
    { month: '5월', arpu: 205000 },
    { month: '6월', arpu: 210000 },
  ];

  const formatCurrency = value => {
    return new Intl.NumberFormat('ko-KR').format(value);
  };

  const formatPercentage = value => {
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  const KPICard = ({ title, value, change, icon: Icon, color = 'blue' }) => (
    <div className="bg-white rounded-xl p-6 border border-gray-200 hover:border-gray-300 transition-all duration-300 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg bg-${color}-500/20 border border-${color}-200`}>
          <Icon className={`w-6 h-6 text-${color}-400`} />
        </div>
        <div className="flex items-center space-x-1">
          {change > 0 ? (
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          ) : (
            <TrendingDown className="w-4 h-4 text-red-500" />
          )}
          <span
            className={`text-sm font-medium ${change > 0 ? 'text-emerald-600' : 'text-red-500'}`}
          >
            {formatPercentage(change)}
          </span>
        </div>
      </div>
      <h3 className="text-gray-600 text-sm font-medium mb-2">{title}</h3>
      <p className="text-2xl font-bold text-gray-900">
        {title.includes('매출') || title.includes('정산')
          ? `${formatCurrency(value).slice(0, -4)}만원`
          : formatCurrency(value)}
      </p>
    </div>
  );

  return (
    <div className="w-full bg-white text-gray-900 p-6 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* 헤더 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              경영 분석 리포트
            </h1>
            <p className="text-gray-600 mt-2">2024년 6월 실적 분석</p>
          </div>
          <div className="flex space-x-3">
            <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
              <FileText className="w-4 h-4" />
              <span>PDF 내보내기</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors">
              <Download className="w-4 h-4" />
              <span>Excel 내보내기</span>
            </button>
          </div>
        </div>

        {/* KPI 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <KPICard
            title="총 매출"
            value={kpiData.totalRevenue}
            change={dummyData.revenueChange}
            icon={DollarSign}
            color="green"
          />
          <KPICard
            title="신규 회원 수"
            value={kpiData.newMembers}
            change={dummyData.newMembersChange}
            icon={Users}
            color="blue"
          />
          <KPICard
            title="퇴회 회원 수"
            value={kpiData.churnedMembers}
            change={dummyData.churnedMembersChange}
            icon={Users}
            color="red"
          />
          <KPICard
            title="센터 평균 정산금액"
            value={kpiData.avgSettlement}
            change={dummyData.avgSettlementChange}
            icon={Target}
            color="purple"
          />
          <KPICard
            title="수익률"
            value={kpiData.profitMargin}
            change={dummyData.profitMarginChange}
            icon={BarChart3}
            color="yellow"
          />
        </div>

        {/* 센터별 성과 비교 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <h3 className="text-xl font-semibold mb-4 text-gray-900">센터별 매출</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={centerPerformanceData}
                margin={{ left: 60, right: 10, top: 20, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" stroke="#6b7280" />
                <YAxis
                  stroke="#6b7280"
                  tickFormatter={value => `${(value / 10000000).toFixed(0)}천만원`}
                  width={80}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    color: '#374151',
                  }}
                  formatter={value => [`${formatCurrency(value).slice(0, -4)}만원`, '매출']}
                />
                <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <h3 className="text-xl font-semibold mb-4 text-gray-900">센터별 성과 지표</h3>
            <div className="space-y-4">
              {centerPerformanceData.map((center, index) => (
                <div
                  key={center.name}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <span className="font-medium text-gray-900">{center.name}</span>
                  <div className="flex items-center space-x-4">
                    <div className="text-center">
                      <div className="text-sm text-gray-600">증가율</div>
                      <div
                        className={`font-semibold ${center.growthRate > 10 ? 'text-green-400' : 'text-yellow-400'}`}
                      >
                        +{center.growthRate}%
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-gray-600">이탈률</div>
                      <div
                        className={`font-semibold ${center.churnRate > 5 ? 'text-red-400' : 'text-green-400'}`}
                      >
                        {center.churnRate}%
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 트렌드 분석 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <h3 className="text-xl font-semibold mb-4 text-gray-900">월별 매출 추이</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyRevenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="month" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                  }}
                  formatter={value => [`${formatCurrency(value).slice(0, -4)}만원`, '매출']}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <h3 className="text-xl font-semibold mb-4 text-gray-900">신규 vs 퇴회 회원</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={memberData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="month" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Bar dataKey="new" fill="#22c55e" radius={[4, 4, 0, 0]} />
                <Bar dataKey="churned" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 강사/팀 분석 & 고객 분석 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <h3 className="text-xl font-semibold mb-4 text-gray-900">강사별 매출 Top 10</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={trainerRevenueData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis type="number" stroke="#9ca3af" />
                <YAxis dataKey="name" type="category" stroke="#9ca3af" width={80} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                  }}
                  formatter={value => [`${formatCurrency(value).slice(0, -4)}만원`, '매출']}
                />
                <Bar dataKey="revenue" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <h3 className="text-xl font-semibold mb-4 text-gray-900">연령대·성별 분포</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={ageGenderData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {ageGenderData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                  }}
                  formatter={value => [`${value}%`, '비율']}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 고객당 평균 매출 */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <h3 className="text-xl font-semibold mb-4 text-gray-900">고객당 평균 매출 (ARPU)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={arpuData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="month" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                }}
                formatter={value => [`${formatCurrency(value)}원`, 'ARPU']}
              />
              <Area
                type="monotone"
                dataKey="arpu"
                stroke="#10b981"
                fill="#10b981"
                fillOpacity={0.3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* 자동 인사이트 카드 */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
          <div className="flex items-start space-x-4">
            <div className="p-3 rounded-lg bg-blue-100">
              <CheckCircle className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold mb-2 text-blue-800">자동 인사이트</h3>
              <p className="text-gray-700 leading-relaxed">
                이번 달 총매출 <span className="text-green-400 font-semibold">3.2억원</span>
                (전월 대비 <span className="text-green-400 font-semibold">+8.2%</span>).
                <span className="text-blue-400 font-semibold">홍대센터</span> 신규 회원 급증으로
                전체 성장률 상승. <span className="text-red-400 font-semibold">신림센터</span>{' '}
                이탈률
                <span className="text-red-400 font-semibold">7.8%</span>로 위험 수준, 즉시 대응
                필요.
              </p>
            </div>
            <div className="p-3 rounded-lg bg-yellow-100">
              <AlertTriangle className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsReportPage;
