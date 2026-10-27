import React, { useState, useEffect } from 'react'
import {
  TrendingUp,
  DollarSign,
  BarChart3,
  Layers,
  Download,
  AlertCircle,
  Lightbulb,
  CheckCircle2,
  Calendar,
} from 'lucide-react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  LineChart,
  Line,
  AreaChart,
  Area,
  CartesianGrid,
  Cell,
} from 'recharts'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../common/Card'
import { Button } from '../common/Button'
import { Badge } from '../common/Badge'
import { customerService } from '../../services/customerService'
import { RevenueAtRiskBreakdown, ChurnTrendPoint } from '../../types'
import { useToast } from '../../context/ToastContext'

export const AnalyticsPage: React.FC = () => {
  const { success } = useToast()
  const [revenueData, setRevenueData] = useState<RevenueAtRiskBreakdown | null>(null)
  const [churnTrends, setChurnTrends] = useState<ChurnTrendPoint[]>([])
  const [cohortData, setCohortData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadAnalytics() {
      try {
        setLoading(true)
        const [rev, trends, cohorts] = await Promise.all([
          customerService.getRevenueAtRisk(),
          customerService.getChurnTrends(),
          customerService.getCohortRetention(),
        ])
        setRevenueData(rev)
        setChurnTrends(trends)
        setCohortData(cohorts)
      } finally {
        setLoading(false)
      }
    }
    loadAnalytics()
  }, [])

  const handleExportAnalytics = () => {
    success(
      'Analytics Package Exported',
      'Downloaded complete cohort and revenue-at-risk datasets (CSV).'
    )
  }

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Cohort Analytics & Revenue at Risk
            </h1>
            <Badge variant="teal" size="sm">
              Portfolio Intelligence
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Deep dive into customer retention curves, contract churn correlations, and monthly recurring revenue vulnerability.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleExportAnalytics}
          leftIcon={<Download className="w-3.5 h-3.5" />}
        >
          Export Analytics Package
        </Button>
      </div>

      {/* Revenue At Risk KPI Summary Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-card">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Total MRR at Churn Risk
          </span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl sm:text-3xl font-black text-rose-600">
              ${((revenueData?.totalMRRAtRisk || 340995) / 1000).toFixed(1)}k
            </span>
            <span className="text-xs font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded">
              High + Med
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Across 3,984 at-risk subscribers</p>
        </div>

        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-card">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            High-Risk Tier MRR
          </span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900">
              ${((revenueData?.highRiskMRR || 168210) / 1000).toFixed(1)}k
            </span>
            <span className="text-xs text-slate-400">49.3% of risk</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Requiring immediate outreach</p>
        </div>

        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-card">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Total MRR Protected
          </span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl sm:text-3xl font-black text-emerald-600">
              ${((revenueData?.totalRevenueSaved || 276500) / 1000).toFixed(1)}k
            </span>
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
              +18.4% YoY
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Saved via proactive campaigns</p>
        </div>

        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-card">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            12-Month Net Retention Rate
          </span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl sm:text-3xl font-black text-teal-600">
              104.2%
            </span>
            <span className="text-xs font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded">
              Expansion
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Account upgrades offsetting churn</p>
        </div>
      </div>

      {/* Row 1: Revenue at Risk Breakdown Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue at Risk by Contract Type */}
        <Card>
          <CardHeader>
            <CardTitle>MRR at Risk by Contract Agreement</CardTitle>
            <CardDescription>
              Month-to-month contracts account for 71% of total revenue vulnerability
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={revenueData?.byContract || []}
                  margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 12, fill: '#64748B' }}
                    axisLine={{ stroke: '#E2E8F0' }}
                    tickLine={false}
                  />
                  <YAxis
                    tickFormatter={(val) => `$${val / 1000}k`}
                    tick={{ fontSize: 11, fill: '#64748B' }}
                    axisLine={{ stroke: '#E2E8F0' }}
                    tickLine={false}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const item = payload[0].payload
                        return (
                          <div className="bg-navy-900 text-white p-3 rounded-xl shadow-xl text-xs space-y-1 border border-navy-700">
                            <p className="font-bold text-slate-200">{item.name} Contract</p>
                            <p className="text-rose-300 font-semibold">
                              MRR at Risk: ${item.mrr.toLocaleString()}
                            </p>
                            <p className="text-slate-400 text-[10px]">
                              Share of total: {item.percentage}%
                            </p>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Bar dataKey="mrr" radius={[6, 6, 0, 0]}>
                    {(revenueData?.byContract || []).map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={index === 0 ? '#EF4444' : index === 1 ? '#F59E0B' : '#10B981'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-3 flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100">
              <span>Month-to-month: <strong>$242.0k MRR</strong></span>
              <span>1-Year: <strong>$74.2k MRR</strong></span>
              <span>2-Year: <strong>$24.8k MRR</strong></span>
            </div>
          </CardContent>
        </Card>

        {/* Revenue at Risk by Tenure Cohort */}
        <Card>
          <CardHeader>
            <CardTitle>MRR at Risk Across Tenure Cohorts</CardTitle>
            <CardDescription>
              New customers (0-12 months) represent over 63% of vulnerable subscription revenue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={revenueData?.byTenureCohort || []}
                  margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis
                    dataKey="cohort"
                    tick={{ fontSize: 11, fill: '#64748B' }}
                    axisLine={{ stroke: '#E2E8F0' }}
                    tickLine={false}
                  />
                  <YAxis
                    tickFormatter={(val) => `$${val / 1000}k`}
                    tick={{ fontSize: 11, fill: '#64748B' }}
                    axisLine={{ stroke: '#E2E8F0' }}
                    tickLine={false}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const item = payload[0].payload
                        return (
                          <div className="bg-navy-900 text-white p-3 rounded-xl shadow-xl text-xs space-y-1 border border-navy-700">
                            <p className="font-bold text-slate-200">{item.cohort}</p>
                            <p className="text-teal-300 font-semibold">
                              MRR at Risk: ${item.mrr.toLocaleString()}
                            </p>
                            <p className="text-slate-400 text-[10px]">
                              Accounts in cohort: {item.customerCount.toLocaleString()}
                            </p>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Bar dataKey="mrr" fill="#0D9488" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-3 flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100">
              <span className="flex items-center gap-1.5 text-teal-700 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Tenure &gt;24 months drops churn risk by 58%
              </span>
              <span className="font-semibold text-slate-700">7,043 Cohort Baseline</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Row 2: Cohort Retention Curves (Line Chart) */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <CardTitle>Subscriber Retention Curve (24-Month Cohort Lifespan)</CardTitle>
              <CardDescription>
                Proactive retention intervention cohort vs historical unmanaged baseline
              </CardDescription>
            </div>
            <div className="flex items-center gap-4 text-xs font-semibold">
              <span className="flex items-center gap-1.5 text-teal-700">
                <span className="w-3 h-3 rounded-sm bg-teal-600" /> Managed Retention Curve
              </span>
              <span className="flex items-center gap-1.5 text-slate-400">
                <span className="w-3 h-3 rounded-sm bg-slate-300" /> Historical Baseline
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={cohortData}
                margin={{ top: 10, right: 20, left: -10, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11, fill: '#64748B' }}
                  axisLine={{ stroke: '#E2E8F0' }}
                  tickLine={false}
                />
                <YAxis
                  domain={[40, 105]}
                  tickFormatter={(val) => `${val}%`}
                  tick={{ fontSize: 11, fill: '#64748B' }}
                  axisLine={{ stroke: '#E2E8F0' }}
                  tickLine={false}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-navy-900 text-white p-3 rounded-xl shadow-xl text-xs space-y-1.5 border border-navy-700">
                          <p className="font-bold text-slate-200 border-b border-navy-700 pb-1">
                            {label}
                          </p>
                          <p className="text-teal-300 font-semibold flex items-center justify-between gap-4">
                            <span>Managed Program Retention:</span>
                            <span>{payload[0]?.value}%</span>
                          </p>
                          <p className="text-slate-400 flex items-center justify-between gap-4">
                            <span>Historical Baseline:</span>
                            <span>{payload[1]?.value}%</span>
                          </p>
                          <p className="text-emerald-400 text-[10px] pt-1 border-t border-navy-800">
                            Net Lift: +{((payload[0]?.value as number) - (payload[1]?.value as number)).toFixed(1)}% higher retention
                          </p>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="retentionRate"
                  stroke="#0D9488"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#0D9488', strokeWidth: 2, stroke: '#fff' }}
                  name="Managed Program"
                />
                <Line
                  type="monotone"
                  dataKey="baselineRate"
                  stroke="#94A3B8"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={{ r: 3, fill: '#94A3B8' }}
                  name="Historical Baseline"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Strategic Takeaways Callout Card */}
      <Card className="bg-gradient-to-r from-navy-900 to-navy-850 text-white border-navy-700">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-teal-500/20 text-teal-400 flex-shrink-0 border border-teal-500/30">
              <Lightbulb className="w-6 h-6" />
            </div>
            <div className="space-y-2">
              <h3 className="text-base font-bold text-white tracking-tight">
                Executive Strategy Insights: Q4 Priorities
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-3xl">
                1. <strong>Contract Lock-in Window:</strong> Converting only 15% of Month-to-Month Fiber subscribers to 1-Year agreements will protect an estimated <strong>$36,300/mo</strong> in recurring revenue.
                <br />
                2. <strong>First-90-Day Tech Support Pairing:</strong> Fiber Optic subscribers who receive free tech support onboarding show <strong>68% lower defection rates</strong> in months 1-6.
                <br />
                3. <strong>Payment Method Optimization:</strong> Incentivizing Auto-Pay adoption with a $5/mo credit eliminates manual bill shock and reduces unintentional churn by <strong>22%</strong>.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
