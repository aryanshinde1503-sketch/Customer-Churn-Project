import React, { useEffect, useState } from 'react'
import {
  Users,
  AlertTriangle,
  UserCheck,
  TrendingDown,
  ArrowRight,
  ShieldAlert,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Download,
  Info,
} from 'lucide-react'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../common/Card'
import { MetricCard } from '../common/MetricCard'
import { Button } from '../common/Button'
import { Badge } from '../common/Badge'
import { TableSkeleton } from '../common/LoadingSkeleton'
import { customerService } from '../../services/customerService'
import { Customer, ChurnTrendPoint, RiskDistributionData, NavigationPage } from '../../types'
import { useToast } from '../../context/ToastContext'

interface DashboardProps {
  onNavigate: (page: NavigationPage) => void
  onSelectCustomer: (customer: Customer) => void
  onNewCampaignClick: () => void
}

export const DashboardOverview: React.FC<DashboardProps> = ({
  onNavigate,
  onSelectCustomer,
  onNewCampaignClick,
}) => {
  const { success, info } = useToast()
  const [loading, setLoading] = useState(true)
  const [summary, setSummary] = useState<any>(null)
  const [trends, setTrends] = useState<ChurnTrendPoint[]>([])
  const [riskDist, setRiskDist] = useState<RiskDistributionData[]>([])
  const [highRiskSample, setHighRiskSample] = useState<Customer[]>([])

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        const [sum, tr, rd, custRes] = await Promise.all([
          customerService.getDashboardSummary(),
          customerService.getChurnTrends(),
          customerService.getRiskDistribution(),
          customerService.getCustomers({
            search: '',
            riskLevel: 'High',
            contractType: 'All',
            internetService: 'All',
            retentionStatus: 'All',
            minTenure: 0,
            maxTenure: 72,
            minCharges: 0,
            maxCharges: 150,
            sortBy: 'riskScore',
            sortDirection: 'desc',
          }),
        ])
        setSummary(sum)
        setTrends(tr)
        setRiskDist(rd)
        setHighRiskSample(custRes.customers.slice(0, 5))
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const handleExportBrief = () => {
    success('Executive Churn Brief Exported', 'Downloaded summary report (PDF/CSV ready).')
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 bg-white rounded-xl shadow-card border border-slate-200 animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-80 bg-white rounded-xl border border-slate-200 animate-pulse" />
          <div className="h-80 bg-white rounded-xl border border-slate-200 animate-pulse" />
        </div>
        <TableSkeleton rows={4} />
      </div>
    )
  }

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Executive Churn Intelligence
            </h1>
            <Badge variant="teal" size="sm">
              Q4 Overview
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time churn risk indicators, predictive model forecasts, and active retention impact.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportBrief}
            leftIcon={<Download className="w-3.5 h-3.5" />}
          >
            Export Brief
          </Button>
          <Button
            variant="navy"
            size="sm"
            onClick={() => onNavigate('predictions')}
            leftIcon={<Sparkles className="w-3.5 h-3.5 text-teal-400" />}
          >
            What-If Simulator
          </Button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <MetricCard
          title="Total Customers"
          value={summary?.totalCustomers?.toLocaleString() || '7,043'}
          delta={{ value: '+3.4%', isPositiveGood: true, label: 'vs last quarter' }}
          icon={<Users className="w-5 h-5" />}
          iconBgColor="bg-blue-50 text-brand-blue border-blue-100"
          subtext="Active telecom subscriber accounts tracked"
        />

        <MetricCard
          title="Predicted Churn Rate"
          value={`${summary?.predictedChurnRate}%`}
          delta={{ value: `${summary?.churnRateDelta}%`, isPositiveGood: false, label: 'MoM' }}
          icon={<TrendingDown className="w-5 h-5" />}
          iconBgColor="bg-teal-50 text-teal-600 border-teal-100"
          subtext="Target benchmark: under 20.0%"
          progressBar={{ value: summary?.predictedChurnRate * 3, color: 'bg-teal-500' }}
        />

        <MetricCard
          title="High-Risk Customers"
          value={summary?.highRiskCount?.toLocaleString() || '1,869'}
          delta={{ value: '26.5%', isPositiveGood: false, label: 'of base' }}
          icon={<AlertTriangle className="w-5 h-5" />}
          iconBgColor="bg-rose-50 text-rose-600 border-rose-100"
          subtext={`$${(summary?.highRiskMRR / 1000).toFixed(1)}k Monthly Recurring Revenue at stake`}
          progressBar={{ value: 26.5, color: 'bg-rose-500' }}
        />

        <MetricCard
          title="Customers Retained"
          value={summary?.customersRetainedQuarter?.toLocaleString() || '642'}
          delta={{ value: '+14.2%', isPositiveGood: true, label: 'quarterly' }}
          icon={<UserCheck className="w-5 h-5" />}
          iconBgColor="bg-emerald-50 text-emerald-600 border-emerald-100"
          subtext={`$${(summary?.revenueSavedQuarter / 1000).toFixed(1)}k protected revenue this quarter`}
          progressBar={{ value: 74.8, color: 'bg-emerald-500' }}
        />
      </div>

      {/* Primary Analytics Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Churn Trend Area Chart (2 cols) */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <CardTitle>12-Month Churn Trajectory & Forecast</CardTitle>
                <CardDescription>
                  Actual churn rate % vs machine learning model predictive estimates
                </CardDescription>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1.5 text-slate-600 font-medium">
                  <span className="w-3 h-3 rounded-sm bg-teal-500" /> Actual Churn %
                </span>
                <span className="flex items-center gap-1.5 text-slate-600 font-medium">
                  <span className="w-3 h-3 rounded-sm bg-brand-blue" /> ML Predicted %
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={trends}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="actualGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0D9488" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#0D9488" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="predGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563EB" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#2563EB" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 11, fill: '#64748B' }}
                    axisLine={{ stroke: '#E2E8F0' }}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[18, 32]}
                    tick={{ fontSize: 11, fill: '#64748B' }}
                    axisLine={{ stroke: '#E2E8F0' }}
                    tickLine={false}
                    tickFormatter={(val) => `${val}%`}
                  />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-navy-900 text-white p-3 rounded-xl shadow-xl text-xs space-y-1.5 border border-navy-700">
                            <p className="font-bold text-slate-200 border-b border-navy-700 pb-1">
                              {label}
                            </p>
                            <p className="text-teal-300 font-medium flex items-center justify-between gap-4">
                              <span>Actual Churn Rate:</span>
                              <span className="font-bold">{payload[0]?.value}%</span>
                            </p>
                            <p className="text-blue-300 font-medium flex items-center justify-between gap-4">
                              <span>ML Predicted Rate:</span>
                              <span className="font-bold">{payload[1]?.value}%</span>
                            </p>
                            <p className="text-slate-400 text-[10px] pt-1 border-t border-navy-800">
                              Active Cohort: {payload[0]?.payload?.activeCustomers?.toLocaleString()} accounts
                            </p>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="actualChurnRate"
                    stroke="#0D9488"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#actualGradient)"
                    name="Actual Churn %"
                  />
                  <Area
                    type="monotone"
                    dataKey="predictedChurnRate"
                    stroke="#2563EB"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    fillOpacity={1}
                    fill="url(#predGradient)"
                    name="Predicted Churn %"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100">
              <span className="flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-teal-600" />
                Churn has dropped <strong>6.6%</strong> since retention initiatives launched in Nov 2025.
              </span>
              <button
                onClick={() => onNavigate('analytics')}
                className="text-teal-600 hover:text-teal-700 font-semibold inline-flex items-center gap-1"
              >
                Deep Analytics <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Risk Distribution Donut Chart (1 col) */}
        <Card>
          <CardHeader>
            <CardTitle>Customer Risk Distribution</CardTitle>
            <CardDescription>Subscriber segmentation by predicted churn probability</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="h-56 relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={riskDist}
                    dataKey="count"
                    nameKey="level"
                    cx="50%"
                    cy="50%"
                    innerRadius={62}
                    outerRadius={88}
                    paddingAngle={4}
                  >
                    {riskDist.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload as RiskDistributionData
                        return (
                          <div className="bg-navy-900 text-white p-3 rounded-xl shadow-xl text-xs space-y-1 border border-navy-700">
                            <p className="font-bold text-slate-200">
                              {data.level} Risk Tier
                            </p>
                            <p className="text-slate-300">
                              Accounts: <strong className="text-white">{data.count.toLocaleString()}</strong> ({data.percentage}%)
                            </p>
                            <p className="text-slate-400 text-[10px]">
                              MRR at Risk: ${(data.mrrAtRisk / 1000).toFixed(1)}k
                            </p>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>

              {/* Center Metric Display */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-black text-slate-900 tracking-tight">7,043</span>
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Total Base
                </span>
              </div>
            </div>

            {/* Custom Legend */}
            <div className="space-y-2.5 mt-2 pt-2 border-t border-slate-100">
              {riskDist.map((item) => (
                <div key={item.level} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="font-medium text-slate-700">{item.level} Risk (&gt;{item.level === 'High' ? '70%' : item.level === 'Medium' ? '40%' : '0%'})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900">
                      {item.count.toLocaleString()}
                    </span>
                    <span className="text-slate-500 font-normal">({item.percentage}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Row: Top Risk Drivers & High-Risk Accounts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Churn Drivers Box (1 col) */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-teal-600" />
              Leading Churn Drivers
            </CardTitle>
            <CardDescription>
              Highest weighted predictive factors in current telecom model
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 flex-1">
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-800 mb-1">
                <span>Month-to-Month Contract Type</span>
                <span className="text-rose-600 font-bold">+28.5% impact</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div className="bg-rose-500 h-full rounded-full" style={{ width: '85%' }} />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Subscribers without contract lock-in churn at 4.6x higher rates.
              </p>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-800 mb-1">
                <span>Low Tenure (&lt;6 Months)</span>
                <span className="text-rose-600 font-bold">+21.0% impact</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div className="bg-amber-500 h-full rounded-full" style={{ width: '70%' }} />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Highest onboarding flight vulnerability period.
              </p>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-800 mb-1">
                <span>Absence of Tech Support / Security</span>
                <span className="text-rose-600 font-bold">+18.2% impact</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div className="bg-amber-500 h-full rounded-full" style={{ width: '58%' }} />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Fiber optic users without add-on tech support churn when experiencing lag.
              </p>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-800 mb-1">
                <span>Electronic Check Payment</span>
                <span className="text-amber-600 font-bold">+12.4% impact</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div className="bg-teal-500 h-full rounded-full" style={{ width: '42%' }} />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Higher payment dispute rate vs automated credit card / ACH billing.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Priority High-Risk Customers Action Table (2 cols) */}
        <Card className="lg:col-span-2 flex flex-col">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Priority Retention Queue</CardTitle>
                <CardDescription>
                  Urgent high-risk accounts requiring targeted retention intervention
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onNavigate('customers')}
                rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
              >
                View All Customers
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0 flex-1 overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider text-[11px] font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3">Customer</th>
                  <th className="px-4 py-3">Contract</th>
                  <th className="px-4 py-3">Monthly Bill</th>
                  <th className="px-4 py-3">Risk Score</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {highRiskSample.map((c) => (
                  <tr
                    key={c.id}
                    className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                    onClick={() => onSelectCustomer(c)}
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center flex-shrink-0 group-hover:bg-teal-100 group-hover:text-teal-800 transition-colors">
                          {c.name.split(' ').map((n) => n[0]).join('').substring(0, 2)}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 group-hover:text-teal-700 transition-colors">
                            {c.name}
                          </p>
                          <p className="text-[11px] text-slate-400 font-mono">{c.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-slate-700 font-medium">
                      {c.contract}
                      <span className="block text-[11px] text-slate-400 font-normal">
                        {c.tenure} mos tenure
                      </span>
                    </td>
                    <td className="px-4 py-3.5 font-semibold text-slate-900">
                      ${c.monthlyCharges.toFixed(2)}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <Badge risk={c.churnRisk} size="sm" dot>
                          {(c.riskScore * 100).toFixed(0)}%
                        </Badge>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <Badge status={c.retentionStatus} size="sm">
                        {c.retentionStatus}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          onSelectCustomer(c)
                        }}
                        className="text-xs py-1"
                      >
                        Inspect
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
