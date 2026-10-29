import React, { useState, useEffect } from 'react'
import {
  BrainCircuit,
  Sliders,
  Sparkles,
  Zap,
  Info,
  CheckCircle2,
  TrendingUp,
  Award,
  Layers,
  History,
  AlertTriangle,
  RotateCcw,
  Database,
} from 'lucide-react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from 'recharts'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../common/Card'
import { Button } from '../common/Button'
import { Badge } from '../common/Badge'
import { customerService } from '../../services/customerService'
import {
  ModelMetrics,
  ContractType,
  InternetServiceType,
  RiskLevel,
  RiskFactor,
} from '../../types'
import { useToast } from '../../context/ToastContext'

export const PredictionsPage: React.FC = () => {
  const { success, error: toastError } = useToast()
  const [modelMetrics, setModelMetrics] = useState<ModelMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [isSavingPrediction, setIsSavingPrediction] = useState(false)

  // Interactive Simulator State
  const [simContract, setSimContract] = useState<ContractType>('Month-to-month')
  const [simTenure, setSimTenure] = useState<number>(4)
  const [simMonthlyCharges, setSimMonthlyCharges] = useState<number>(95)
  const [simInternetService, setSimInternetService] = useState<InternetServiceType>('Fiber optic')
  const [simTechSupport, setSimTechSupport] = useState<boolean>(false)
  const [simOnlineSecurity, setSimOnlineSecurity] = useState<boolean>(false)
  const [simPaperlessBilling, setSimPaperlessBilling] = useState<boolean>(true)

  // Simulator Result
  const [simulationResult, setSimulationResult] = useState<{
    riskScore: number
    churnRisk: RiskLevel
    predictionConfidence: number
    factors: RiskFactor[]
  }>({
    riskScore: 0.88,
    churnRisk: 'High',
    predictionConfidence: 91,
    factors: [],
  })

  useEffect(() => {
    async function loadMetrics() {
      try {
        setLoading(true)
        const metrics = await customerService.getModelMetrics()
        setModelMetrics(metrics)
      } finally {
        setLoading(false)
      }
    }
    loadMetrics()
  }, [])

  // Recalculate simulation on parameter change
  useEffect(() => {
  let cancelled = false

  async function runPrediction() {
    try {
      const result = await customerService.predictChurnRisk({
        contract: simContract,
        tenure: simTenure,
        monthlyCharges: simMonthlyCharges,
        internetService: simInternetService,
        techSupport: simTechSupport,
        onlineSecurity: simOnlineSecurity,
        paperlessBilling: simPaperlessBilling,
      })

      if (!cancelled) {
        setSimulationResult(result)
      }
    } catch (err) {
      if (!cancelled) {
        console.error('ML prediction failed:', err)
        toastError(
          'ML prediction failed',
          err instanceof Error ? err.message : 'Could not reach the ML API.'
        )
      }
    }
  }

  void runPrediction()

  return () => {
    cancelled = true
  }
}, [
  simContract,
  simTenure,
  simMonthlyCharges,
  simInternetService,
  simTechSupport,
  simOnlineSecurity,
  simPaperlessBilling,
  toastError,
])

  const handleResetSimulation = () => {
    setSimContract('Month-to-month')
    setSimTenure(4)
    setSimMonthlyCharges(95)
    setSimInternetService('Fiber optic')
    setSimTechSupport(false)
    setSimOnlineSecurity(false)
    setSimPaperlessBilling(true)
    success('Simulator reset to baseline high-risk profile')
  }

  const handleSavePrediction = async () => {
    setIsSavingPrediction(true)
    try {
      const { success: ok } = await customerService.recordChurnPrediction({
        contract: simContract,
        tenure: simTenure,
        monthlyCharges: simMonthlyCharges,
        churnRisk: simulationResult.churnRisk,
        riskScore: simulationResult.riskScore,
        predictionConfidence: simulationResult.predictionConfidence,
        factors: simulationResult.factors,
      })
      if (ok) {
        success(
          'Inference Recorded in Supabase',
          `Saved prediction (${(simulationResult.riskScore * 100).toFixed(0)}% risk) to public.churn_predictions table.`
        )
      }
    } catch (err: any) {
      toastError('Failed to record prediction', err?.message || 'Database error')
    } finally {
      setIsSavingPrediction(false)
    }
  }

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Predictive Model Intelligence & Churn Scoring
            </h1>
            <Badge variant="teal" size="sm">
              Ensemble XGBoost v2.4
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Machine learning model validation metrics, feature importance rankings, and real-time What-If scenario scoring.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="neutral" size="md">
            Status: Production Benchmark
          </Badge>
        </div>
      </div>

      {/* Model Benchmark Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-card">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            ROC - AUC Score
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-teal-600">
              {modelMetrics?.rocAuc.toFixed(3) || '0.864'}
            </span>
            <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
              +0.04 vs baseline
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Discriminative model power</p>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-card">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Precision
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-slate-900">
              {((modelMetrics?.precision || 0.782) * 100).toFixed(1)}%
            </span>
            <span className="text-[11px] text-slate-400">High purity</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">True churners in alert tier</p>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-card">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Recall (Sensitivity)
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-brand-blue">
              {((modelMetrics?.recall || 0.758) * 100).toFixed(1)}%
            </span>
            <span className="text-[11px] text-slate-400">Coverage</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Actual churn captured</p>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-card">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            F1 - Score
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-slate-900">
              {modelMetrics?.f1Score.toFixed(3) || '0.770'}
            </span>
            <span className="text-[11px] text-slate-400">Harmonic</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Balanced accuracy metric</p>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-card col-span-2 lg:col-span-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Training Records
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-slate-900">
              {modelMetrics?.datasetRows.toLocaleString() || '7,043'}
            </span>
            <span className="text-[11px] text-slate-400">Rows</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">21 Telecom features</p>
        </div>
      </div>

      {/* Interactive What-If Churn Simulator Tool */}
      <Card className="border-teal-300/80 shadow-card bg-gradient-to-b from-white to-slate-50/50">
        <CardHeader className="bg-gradient-to-r from-teal-50/70 via-slate-50 to-white border-b border-teal-100">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-teal-600 text-white rounded-lg">
                  <Sparkles className="w-4 h-4" />
                </div>
                <CardTitle>Interactive "What-If" Churn Risk Simulator</CardTitle>
              </div>
              <CardDescription>
                Simulate how contract changes, tenure milestones, and add-on services impact predicted churn probability in real time.
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetSimulation}
              leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
            >
              Reset Inputs
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Controls (7 cols) */}
            <div className="lg:col-span-7 space-y-5">
              {/* Contract Type Radio */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Contract Agreement Type
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Month-to-month', 'One year', 'Two year'] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setSimContract(type)}
                      className={`p-3 rounded-xl border text-xs font-semibold transition-all text-center ${
                        simContract === type
                          ? 'bg-teal-50 border-teal-500 text-teal-900 ring-2 ring-teal-500/20 shadow-sm'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tenure Slider */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Customer Tenure
                  </label>
                  <span className="text-xs font-black text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                    {simTenure} {simTenure === 1 ? 'Month' : 'Months'} ({(simTenure / 12).toFixed(1)} yrs)
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="72"
                  value={simTenure}
                  onChange={(e) => setSimTenure(Number(e.target.value))}
                  className="w-full accent-teal-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                  <span>1 Month (High Risk Period)</span>
                  <span>36 Months</span>
                  <span>72 Months (High Loyalty)</span>
                </div>
              </div>

              {/* Monthly Charges Slider */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Monthly Charges ($ USD)
                  </label>
                  <span className="text-xs font-black text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                    ${simMonthlyCharges.toFixed(2)}/month
                  </span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="135"
                  step="5"
                  value={simMonthlyCharges}
                  onChange={(e) => setSimMonthlyCharges(Number(e.target.value))}
                  className="w-full accent-teal-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                  <span>$20 (Basic Voice)</span>
                  <span>$75 (Average)</span>
                  <span>$135 (Full Premium Fiber)</span>
                </div>
              </div>

              {/* Internet Service Dropdown */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Internet Service
                  </label>
                  <select
                    value={simInternetService}
                    onChange={(e) => setSimInternetService(e.target.value as InternetServiceType)}
                    className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
                  >
                    <option value="Fiber optic">Fiber optic (Gigabit)</option>
                    <option value="DSL">DSL (Broadband)</option>
                    <option value="No">No Internet (Phone only)</option>
                  </select>
                </div>

                {/* Billing type */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Paperless Billing
                  </label>
                  <button
                    type="button"
                    onClick={() => setSimPaperlessBilling(!simPaperlessBilling)}
                    className={`w-full text-xs p-2.5 rounded-lg border font-medium text-left transition-colors flex items-center justify-between ${
                      simPaperlessBilling
                        ? 'bg-slate-50 border-slate-300 text-slate-800'
                        : 'bg-white border-slate-200 text-slate-500'
                    }`}
                  >
                    <span>{simPaperlessBilling ? 'Enabled (Paperless)' : 'Standard Mail Paper Bill'}</span>
                    <span className="w-2.5 h-2.5 rounded-full bg-teal-500" />
                  </button>
                </div>
              </div>

              {/* Value-Add Toggles: Tech Support & Online Security */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Retention Add-ons & Service Protections
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setSimTechSupport(!simTechSupport)}
                    className={`p-3 rounded-xl border text-xs font-medium text-left transition-all flex items-center justify-between ${
                      simTechSupport
                        ? 'bg-emerald-50 border-emerald-400 text-emerald-900 shadow-sm'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <p className="font-bold">Tech Support</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {simTechSupport ? 'Subscribed' : 'None (-8% churn if added)'}
                      </p>
                    </div>
                    {simTechSupport && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => setSimOnlineSecurity(!simOnlineSecurity)}
                    className={`p-3 rounded-xl border text-xs font-medium text-left transition-all flex items-center justify-between ${
                      simOnlineSecurity
                        ? 'bg-emerald-50 border-emerald-400 text-emerald-900 shadow-sm'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <p className="font-bold">Online Security</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {simOnlineSecurity ? 'Subscribed' : 'None (-7% churn if added)'}
                      </p>
                    </div>
                    {simOnlineSecurity && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Right Live Simulation Output Card (5 cols) */}
            <div className="lg:col-span-5 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-card flex flex-col justify-between space-y-5">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Live Predictive Output
                  </span>
                  <Badge risk={simulationResult.churnRisk} size="sm" dot>
                    {simulationResult.churnRisk} Risk Tier
                  </Badge>
                </div>

                <div className="my-5 text-center">
                  <span
                    className={`text-5xl font-black tracking-tight ${
                      simulationResult.churnRisk === 'High'
                        ? 'text-rose-600'
                        : simulationResult.churnRisk === 'Medium'
                        ? 'text-amber-600'
                        : 'text-emerald-600'
                    }`}
                  >
                    {(simulationResult.riskScore * 100).toFixed(0)}%
                  </span>
                  <p className="text-xs font-semibold text-slate-500 mt-1 uppercase tracking-wider">
                    Predicted Churn Probability
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Model Confidence: <strong>{simulationResult.predictionConfidence}%</strong>
                  </p>
                </div>

                {/* Visual Bar */}
                <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden p-0.5 border border-slate-200">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      simulationResult.churnRisk === 'High'
                        ? 'bg-rose-500'
                        : simulationResult.churnRisk === 'Medium'
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${simulationResult.riskScore * 100}%` }}
                  />
                </div>

                {/* Factors impact breakdown */}
                <div className="mt-5 space-y-2">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                    Calculated Factor Weights:
                  </span>
                  {simulationResult.factors.slice(0, 3).map((f, i) => (
                    <div
                      key={i}
                      className="text-xs p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 flex items-center justify-between"
                    >
                      <span className="font-medium text-slate-800 truncate mr-2">{f.factor}</span>
                      <span
                        className={`font-bold ${
                          f.direction === 'increases_risk' ? 'text-rose-600' : 'text-emerald-600'
                        }`}
                      >
                        {f.direction === 'increases_risk' ? '+' : '-'}
                        {f.impact}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Simulation Advice Box */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1">
                <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-teal-600" /> Sensitivity Insight:
                </span>
                <p className="text-[11px] leading-relaxed">
                  {simContract === 'Month-to-month'
                    ? 'Switching this customer to a 1-year contract would drop churn propensity by ~44%.'
                    : 'Customer is on a locked contract. Focus on usage and automated billing.'}
                </p>
              </div>

              {/* Save Simulation to public.churn_predictions */}
              <Button
                variant="outline"
                size="sm"
                loading={isSavingPrediction}
                onClick={handleSavePrediction}
                leftIcon={<Database className="w-3.5 h-3.5 text-teal-600" />}
                className="w-full text-xs font-semibold justify-center"
              >
                Log Prediction to Supabase (public.churn_predictions)
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Feature Importances & Model Confusion Matrix Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Feature Importance Horizontal Bar (2 cols) */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Top Churn Predictor Features (Feature Importance)</CardTitle>
            <CardDescription>
              Relative weighting assigned by Gradient Boosted Trees across 7,043 customer records
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={modelMetrics?.featureImportances || []}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 110, bottom: 5 }}
                >
                  <XAxis
                    type="number"
                    domain={[0, 0.35]}
                    tickFormatter={(v) => `${(v * 100).toFixed(0)}%`}
                    tick={{ fontSize: 11, fill: '#64748B' }}
                    axisLine={{ stroke: '#E2E8F0' }}
                  />
                  <YAxis
                    type="category"
                    dataKey="feature"
                    tick={{ fontSize: 11, fill: '#334155' }}
                    width={130}
                    axisLine={{ stroke: '#E2E8F0' }}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const item = payload[0].payload
                        return (
                          <div className="bg-navy-900 text-white p-3 rounded-xl shadow-xl text-xs space-y-1 border border-navy-700">
                            <p className="font-bold text-slate-200">{item.feature}</p>
                            <p className="text-teal-300">
                              Importance Weight: <strong>{(item.importance * 100).toFixed(1)}%</strong>
                            </p>
                            <p className="text-slate-400 text-[10px]">Category: {item.category}</p>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Bar dataKey="importance" radius={[0, 4, 4, 0]}>
                    {(modelMetrics?.featureImportances || []).map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={index < 2 ? '#0D9488' : index < 4 ? '#2563EB' : '#64748B'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Model Confusion Matrix (1 col) */}
        <Card>
          <CardHeader>
            <CardTitle>Confusion Matrix</CardTitle>
            <CardDescription>Validation set classification outcomes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-2 text-center text-xs">
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                <span className="text-[10px] uppercase font-bold text-emerald-800">
                  True Negative (Stay)
                </span>
                <p className="text-xl font-black text-emerald-700 mt-1">4,398</p>
                <span className="text-[10px] text-emerald-600">Correctly identified safe</span>
              </div>

              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl">
                <span className="text-[10px] uppercase font-bold text-rose-800">
                  False Positive
                </span>
                <p className="text-xl font-black text-rose-700 mt-1">395</p>
                <span className="text-[10px] text-rose-600">Safe flagged as churn</span>
              </div>

              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl">
                <span className="text-[10px] uppercase font-bold text-rose-800">
                  False Negative
                </span>
                <p className="text-xl font-black text-rose-700 mt-1">452</p>
                <span className="text-[10px] text-rose-600">Missed churn cases</span>
              </div>

              <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl">
                <span className="text-[10px] uppercase font-bold text-teal-800">
                  True Positive (Churn)
                </span>
                <p className="text-xl font-black text-teal-700 mt-1">1,420</p>
                <span className="text-[10px] text-teal-600">Correct churn alerts</span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-500 space-y-1">
              <p className="font-semibold text-slate-700">Model Specifications:</p>
              <p className="text-[11px] font-mono">Algorithm: XGBoost + Logistic Regression Stacking</p>
              <p className="text-[11px] font-mono">Hyperparameters: max_depth=6, lr=0.05, n_est=300</p>
              <p className="text-[11px] font-mono">Calibration: Isotonic Regression on Test Split</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

