import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  AlertTriangle,
  Calendar,
  Building,
  UserCheck,
  UserX,
  Clock,
} from 'lucide-react';
import { motion } from 'framer-motion';

const AnalyticsReportPage = () => {
  const [selectedMonth, setSelectedMonth] = useState('6월');

  // 더미 데이터
  const monthlyRevenueData = [
    { month: '1월', revenue: 280000000 },
    { month: '2월', revenue: 295000000 },
    { month: '3월', revenue: 310000000 },
    { month: '4월', revenue: 298000000 },
    { month: '5월', revenue: 325000000 },
    { month: '6월', revenue: 364000000 },
    { month: '7월', revenue: 385000000 },
  ];

  const centerRevenueData = [
    { name: '강남센터', revenue: 125000000, growth: 15.2 },
    { name: '홍대센터', revenue: 98000000, growth: 22.8 },
    { name: '신림센터', revenue: 82000000, growth: 8.5 },
  ];

  const trainerSettlementData6 = [
    { name: '김민수', center: '강남센터', revenue: 14100000, settlement: 987000, rate: 100 },
    { name: '이지영', center: '강남센터', revenue: 13200000, settlement: 912000, rate: 100 },
    { name: '박준호', center: '홍대센터', revenue: 13100000, settlement: 893000, rate: 100 },
    { name: '최수진', center: '강남센터', revenue: 12800000, settlement: 851000, rate: 100 },
    { name: '정현우', center: '신림센터', revenue: 12700000, settlement: 832000, rate: 100 },
  ];

  const trainerSettlementData7 = [
    { name: '박준호', center: '홍대센터', revenue: 15800000, settlement: 1106000, rate: 100 },
    { name: '김민수', center: '강남센터', revenue: 15200000, settlement: 1064000, rate: 100 },
    { name: '정현우', center: '신림센터', revenue: 14500000, settlement: 1015000, rate: 100 },
    { name: '이지영', center: '강남센터', revenue: 13800000, settlement: 966000, rate: 100 },
    { name: '최수진', center: '강남센터', revenue: 13500000, settlement: 945000, rate: 100 },
  ];

  const newMembersData = [
    { month: '1월', new: 142, churned: 18 },
    { month: '2월', new: 158, churned: 22 },
    { month: '3월', new: 165, churned: 19 },
    { month: '4월', new: 148, churned: 25 },
    { month: '5월', new: 172, churned: 21 },
    { month: '6월', new: 120, churned: 15 },
    { month: '7월', new: 135, churned: 18 },
  ];

  const churnRateData = [
    { month: '1월', rate: 12.7 },
    { month: '2월', rate: 13.9 },
    { month: '3월', rate: 11.5 },
    { month: '4월', rate: 16.9 },
    { month: '5월', rate: 12.2 },
    { month: '6월', rate: 12.5 },
    { month: '7월', rate: 13.3 },
  ];

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('ko-KR').format(value);
  };

  const formatPercentage = (value) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  const KPICard = ({ title, value, change, icon: Icon, color, subtitle }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`bg-white rounded-xl p-6 border-l-4 border-${color}-500 shadow-lg hover:shadow-xl transition-all duration-300`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg bg-${color}-100`}>
          <Icon className={`w-6 h-6 text-${color}-600`} />
        </div>
        {title !== "정산 승인 지연" && (
          <div className="flex items-center space-x-1">
            {change > 0 ? (
              <TrendingUp className="w-4 h-4 text-emerald-500" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-500" />
            )}
            <span
              className={`text-sm font-medium ${
                change > 0 ? 'text-emerald-600' : 'text-red-500'
              }`}
            >
              {formatPercentage(change)}
            </span>
          </div>
        )}
      </div>
      <h3 className="text-gray-600 text-sm font-medium mb-1">{title}</h3>
      <p className="text-2xl font-bold text-gray-900 mb-1">
        {title.includes('매출')
          ? `${formatCurrency(value).slice(0, -4)}만원`
          : title.includes('지연')
          ? value
          : formatCurrency(value)}
      </p>
      {subtitle && (
        <p className="text-sm text-gray-500">{subtitle}</p>
      )}
    </motion.div>
  );

  const ChartCard = ({ title, children, className = '' }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className={`bg-white rounded-xl p-6 shadow-lg ${className}`}
    >
      <h3 className="text-xl font-semibold mb-4 text-gray-900">{title}</h3>
      {children}
    </motion.div>
  );

  return (
    <div className="w-full bg-gray-50 min-h-screen p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* 최상단 제목 */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          data-layer="분석리포트"
          className="text-black text-3xl font-extrabold font-['Nunito'] bg-white rounded-lg p-4 shadow-sm"
        >
          📊 분석리포트
        </motion.div>

        {/* 월 선택 필터 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white rounded-xl p-4 shadow-sm"
        >
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-700">조회 기간:</span>
            <div className="flex space-x-2">
              {['6월', '7월'].map((month) => (
                <button
                  key={month}
                  onClick={() => setSelectedMonth(month)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    selectedMonth === month
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {month}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

                 {/* KPI 카드 */}
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
           <KPICard
             title="이번 달 매출"
             value={selectedMonth === '6월' ? 364000000 : 385000000}
             change={selectedMonth === '6월' ? 12.0 : 5.8}
             icon={DollarSign}
             color="green"
           />
           <KPICard
             title="신규 회원"
             value={selectedMonth === '6월' ? 120 : 135}
             change={selectedMonth === '6월' ? -30.2 : 12.5}
             icon={UserCheck}
             color="blue"
             subtitle="명"
           />
           <KPICard
             title="회원 이탈률"
             value={selectedMonth === '6월' ? 12.5 : 13.3}
             change={selectedMonth === '6월' ? 2.5 : 6.4}
             icon={UserX}
             color="red"
             subtitle="%"
           />
           <KPICard
             title="정산 승인 지연"
             value="신림 (7일)"
             change={0}
             icon={Clock}
             color="yellow"
             subtitle="센터별 지연 현황"
           />
         </div>

         {/* 인사이트 섹션 */}
         <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.5, delay: 0.3 }}
           className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 shadow-sm border border-blue-100"
         >
           <div className="flex items-center mb-4">
             <div className="p-2 bg-blue-100 rounded-lg mr-3">
               <AlertTriangle className="w-6 h-6 text-blue-600" />
             </div>
             <h3 className="text-xl font-semibold text-gray-900">📊 주요 인사이트</h3>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
             <div className="bg-white rounded-lg p-4 border-l-4 border-green-500">
               <div className="flex items-center mb-2">
                 <TrendingUp className="w-4 h-4 text-green-600 mr-2" />
                 <span className="text-sm font-medium text-green-700">매출 성장</span>
               </div>
               <p className="text-sm text-gray-600">
                 {selectedMonth === '6월' ? '6월 매출이 전월 대비 12% 증가하여 3억 6,400만원 달성' : '7월 매출이 전월 대비 5.8% 증가하여 3억 8,500만원 달성'}
               </p>
             </div>
             <div className="bg-white rounded-lg p-4 border-l-4 border-blue-500">
               <div className="flex items-center mb-2">
                 <Building className="w-4 h-4 text-blue-600 mr-2" />
                 <span className="text-sm font-medium text-blue-700">센터별 성과</span>
               </div>
               <p className="text-sm text-gray-600">
                 {selectedMonth === '6월' ? '강남센터가 1억 2,500만원으로 최고 매출, 홍대센터는 22.8% 성장률 기록' : '홍대센터 트레이너 박준호가 1,580만원으로 개인 최고 매출 달성'}
               </p>
             </div>
             <div className="bg-white rounded-lg p-4 border-l-4 border-yellow-500">
               <div className="flex items-center mb-2">
                 <Clock className="w-4 h-4 text-yellow-600 mr-2" />
                 <span className="text-sm font-medium text-yellow-700">관리 포인트</span>
               </div>
               <p className="text-sm text-gray-600">
                 신림센터 정산 승인 지연 7일로 개선 필요, 회원 이탈률 {selectedMonth === '6월' ? '12.5%' : '13.3%'}로 관리 강화 필요
               </p>
             </div>
           </div>
         </motion.div>

        {/* 메인 콘텐츠 영역 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 좌측 영역 - 매출/정산 요약 */}
          <div className="space-y-6">
            {/* 월별 총 매출 추이 */}
            <ChartCard title="📈 월별 총 매출 추이">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyRevenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" stroke="#6b7280" />
                  <YAxis
                    stroke="#6b7280"
                    tickFormatter={(value) => `${(value / 100000000).toFixed(1)}억`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                    }}
                    formatter={(value) => [`${formatCurrency(value).slice(0, -4)}만원`, '매출']}
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    dot={{ fill: '#3b82f6', strokeWidth: 2, r: 6 }}
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>

                         {/* 센터별 매출 비교 */}
             <ChartCard title="🏢 센터별 매출 비교">
               <ResponsiveContainer width="100%" height={300}>
                 <BarChart data={centerRevenueData} barSize={40}>
                   <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                   <XAxis dataKey="name" stroke="#6b7280" />
                   <YAxis
                     stroke="#6b7280"
                     tickFormatter={(value) => `${(value / 10000000).toFixed(0)}천만`}
                   />
                   <Tooltip
                     contentStyle={{
                       backgroundColor: '#ffffff',
                       border: '1px solid #e5e7eb',
                       borderRadius: '8px',
                     }}
                     formatter={(value) => [`${formatCurrency(value).slice(0, -4)}만원`, '매출']}
                   />
                   <Bar dataKey="revenue" fill="#10b981" radius={[4, 4, 0, 0]} />
                 </BarChart>
               </ResponsiveContainer>
             </ChartCard>

            {/* 트레이너별 정산 TOP5 */}
            <ChartCard title="👨‍🏫 트레이너별 정산 TOP5">
              <div className="overflow-x-auto">
                <table className="w-full">
                                     <thead>
                     <tr className="border-b border-gray-200">
                       <th className="text-left py-3 px-4 font-medium text-gray-700">순위</th>
                       <th className="text-left py-3 px-4 font-medium text-gray-700">트레이너</th>
                       <th className="text-left py-3 px-4 font-medium text-gray-700">센터</th>
                       <th className="text-right py-3 px-4 font-medium text-gray-700">매출</th>
                       <th className="text-right py-3 px-4 font-medium text-gray-700">정산금</th>
                       <th className="text-right py-3 px-4 font-medium text-gray-700">정산률</th>
                     </tr>
                   </thead>
                  <tbody>
                                         {(selectedMonth === '6월' ? trainerSettlementData6 : trainerSettlementData7).map((trainer, index) => (
                      <tr key={trainer.name} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-sm font-medium ${
                            index === 0 ? 'bg-yellow-100 text-yellow-800' :
                            index === 1 ? 'bg-gray-100 text-gray-800' :
                            index === 2 ? 'bg-orange-100 text-orange-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {index + 1}
                          </span>
                        </td>
                                                 <td className="py-3 px-4 font-medium text-gray-900">{trainer.name}</td>
                         <td className="py-3 px-4 text-gray-600">{trainer.center}</td>
                         <td className="py-3 px-4 text-right text-gray-700">
                           {formatCurrency(trainer.revenue).slice(0, -4)}만원
                         </td>
                        <td className="py-3 px-4 text-right text-gray-700">
                          {formatCurrency(trainer.settlement).slice(0, -4)}만원
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {trainer.rate}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </ChartCard>
          </div>

          {/* 우측 영역 - 회원/수강 분석 */}
          <div className="space-y-6">
            {/* 신규 가입 회원 수 */}
            <ChartCard title="📊 신규 vs 퇴회 회원">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={newMembersData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                  <Bar dataKey="new" fill="#10b981" radius={[4, 4, 0, 0]} name="신규 회원" />
                  <Bar dataKey="churned" fill="#ef4444" radius={[4, 4, 0, 0]} name="퇴회 회원" />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* 회원 이탈률 추이 */}
            <ChartCard title="📉 회원 이탈률 추이">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={churnRateData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                    }}
                    formatter={(value) => [`${value}%`, '이탈률']}
                  />
                  <Line
                    type="monotone"
                    dataKey="rate"
                    stroke="#ef4444"
                    strokeWidth={3}
                    dot={{ fill: '#ef4444', strokeWidth: 2, r: 6 }}
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>

                         {/* 센터별 성과 요약 */}
             <ChartCard title="🏆 센터별 성과 요약">
               <div className="space-y-4 h-[300px] overflow-y-auto">
                 {centerRevenueData.map((center, index) => (
                   <div
                     key={center.name}
                     className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                   >
                     <div className="flex items-center space-x-3">
                       <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                         index === 0 ? 'bg-yellow-100 text-yellow-800' :
                         index === 1 ? 'bg-gray-100 text-gray-800' :
                         index === 2 ? 'bg-orange-100 text-orange-800' :
                         'bg-blue-100 text-blue-800'
                       }`}>
                         {index + 1}
                       </span>
                       <div>
                         <div className="font-medium text-gray-900">{center.name}</div>
                         <div className="text-sm text-gray-500">
                           {formatCurrency(center.revenue).slice(0, -4)}만원
                         </div>
                       </div>
                     </div>
                     <div className="text-right">
                       <div className={`text-sm font-medium ${
                         center.growth > 15 ? 'text-green-600' : 'text-yellow-600'
                       }`}>
                         +{center.growth}%
                       </div>
                       <div className="text-xs text-gray-500">성장률</div>
                     </div>
                   </div>
                 ))}
               </div>
             </ChartCard>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsReportPage;
