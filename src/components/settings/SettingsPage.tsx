import React, { useState } from 'react'
import {
  User,
  Sliders,
  Database,
  Cpu,
  Save,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Shield,
  Bell,
  Sparkles,
  Lock,
  RefreshCw,
  LogOut,
  LogIn,
  CheckCircle,
  XCircle,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../common/Card'
import { Button } from '../common/Button'
import { Badge } from '../common/Badge'
import { useToast } from '../../context/ToastContext'
import { useAuth } from '../../context/AuthContext'
import { testSupabaseConnection, isSupabaseConfigured } from '../../lib/supabase'

export const SettingsPage: React.FC = () => {
  const { success, info, error: toastError } = useToast()
  const { user, signOut, openAuthModal, isConfigured } = useAuth()
  const [testingConnection, setTestingConnection] = useState(false)
  const [connectionResult, setConnectionResult] = useState<any>(null)

  // Profile Form state
  const [userName, setUserName] = useState('Alex Morgan')
  const [userEmail, setUserEmail] = useState('alex.morgan@telecom-enterprise.io')
  const [userRole, setUserRole] = useState('Lead Customer Retention Specialist')
  const [alertFrequency, setAlertFrequency] = useState('Real-time for High-Risk (>85%)')

  // Model & Alert Thresholds
  const [highRiskThreshold, setHighRiskThreshold] = useState(70)
  const [mediumRiskThreshold, setMediumRiskThreshold] = useState(40)
  const [autoEnrollThreshold, setAutoEnrollThreshold] = useState(85)
  const [currencySymbol, setCurrencySymbol] = useState('$ USD')

  const handleSavePreferences = (e: React.FormEvent) => {
    e.preventDefault()
    success(
      'Preferences Saved',
      'System preferences and predictive thresholds updated successfully.'
    )
  }

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200 max-w-5xl">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          System Settings & Platform Configuration
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Manage your user profile, risk scoring sensitivity thresholds, and backend integration status.
        </p>
      </div>

      <form onSubmit={handleSavePreferences} className="space-y-6">
        {/* User Profile Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-teal-600" />
              <CardTitle>User Profile & Permissions</CardTitle>
            </div>
            <CardDescription>
              Your account details and administrative role in the Churn Management System
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full text-xs sm:text-sm px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  className="w-full text-xs sm:text-sm px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Role Title
                </label>
                <input
                  type="text"
                  value={userRole}
                  onChange={(e) => setUserRole(e.target.value)}
                  className="w-full text-xs sm:text-sm px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Alert Notification Mode
                </label>
                <select
                  value={alertFrequency}
                  onChange={(e) => setAlertFrequency(e.target.value)}
                  className="w-full text-xs sm:text-sm px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="Real-time for High-Risk (>85%)">Real-time for High-Risk (&gt;85%)</option>
                  <option value="Daily Executive Digest">Daily Executive Digest</option>
                  <option value="Weekly Cohort Summary">Weekly Cohort Summary</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Model Thresholds & Risk Categorization */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Sliders className="w-5 h-5 text-teal-600" />
              <CardTitle>ML Churn Risk Thresholds & Calibration</CardTitle>
            </div>
            <CardDescription>
              Configure the numerical cutoffs that classify subscribers into High, Medium, or Low risk tiers
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* High risk cutoff */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> High Risk Cutoff Threshold
                </label>
                <span className="text-xs font-black text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                  {highRiskThreshold}% Probability
                </span>
              </div>
              <input
                type="range"
                min="50"
                max="90"
                value={highRiskThreshold}
                onChange={(e) => setHighRiskThreshold(Number(e.target.value))}
                className="w-full accent-rose-600 cursor-pointer"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Subscribers with churn probability above {highRiskThreshold}% trigger urgent retention queues.
              </p>
            </div>

            {/* Medium risk cutoff */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Medium Risk Cutoff Threshold
                </label>
                <span className="text-xs font-black text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  {mediumRiskThreshold}% Probability
                </span>
              </div>
              <input
                type="range"
                min="20"
                max="50"
                value={mediumRiskThreshold}
                onChange={(e) => setMediumRiskThreshold(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Subscribers between {mediumRiskThreshold}% and {highRiskThreshold}% enter monitored nurturing campaigns.
              </p>
            </div>

            {/* Currency Preference */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Currency Display Format
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Applies to all MRR, total spend, and revenue-saved calculations
                </p>
              </div>
              <select
                value={currencySymbol}
                onChange={(e) => setCurrencySymbol(e.target.value)}
                className="text-xs px-3 py-1.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 font-semibold"
              >
                <option value="$ USD">$ USD ($)</option>
                <option value="€ EUR">€ EUR (€)</option>
                <option value="£ GBP">£ GBP (£)</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Integration Status Section (Phase 2 Decoupled Readiness) */}
        <Card className="border-slate-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-teal-600" />
                <CardTitle>Backend Integration Status & Phase 2 Roadmap</CardTitle>
              </div>
              <Badge variant="teal" size="sm">
                Frontend Phase 1
              </Badge>
            </div>
            <CardDescription>
              Backend database and AI model services are cleanly decoupled in the service layer ready for Phase 2 connection.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Supabase Status & Live Health Check */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs shadow-xs">
                    SB
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900">
                        Supabase Project & PostgreSQL Database
                      </span>
                      {isConfigured ? (
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-semibold border border-emerald-200">
                          Configured (.env.local)
                        </span>
                      ) : (
                        <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-semibold border border-amber-200">
                          Publishable Key Required
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 font-mono mt-0.5">
                      https://wnoswnkmrmpjdxtqkxns.supabase.co
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    loading={testingConnection}
                    onClick={async () => {
                      setTestingConnection(true)
                      try {
                        const res = await testSupabaseConnection()
                        setConnectionResult(res)
                        if (res.connected) {
                          success('Supabase Connected!', 'Successfully queried your Supabase project tables.')
                        } else if (!res.configured) {
                          info('Key Required', 'Please enter your Supabase Publishable Key in .env.local first.')
                        } else {
                          toastError('Connection Notice', res.error || 'Could not query tables. Have you run supabase_schema.sql?')
                        }
                      } finally {
                        setTestingConnection(false)
                      }
                    }}
                    leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
                  >
                    Test Connection
                  </Button>

                  {user ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={async () => {
                        await signOut()
                        success('Signed Out', 'Supabase session terminated.')
                      }}
                      className="text-rose-600 border-rose-200 hover:bg-rose-50"
                      leftIcon={<LogOut className="w-3.5 h-3.5" />}
                    >
                      Sign Out
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      variant="primary"
                      size="sm"
                      onClick={() => openAuthModal('signin')}
                      leftIcon={<LogIn className="w-3.5 h-3.5" />}
                    >
                      Sign In / Register
                    </Button>
                  )}
                </div>
              </div>

              {/* Live Connection Results Box */}
              {connectionResult && (
                <div className={`p-3 rounded-lg border text-xs space-y-2 animate-in fade-in ${
                  connectionResult.connected
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : 'bg-amber-50 border-amber-200 text-amber-900'
                }`}>
                  <div className="flex items-center justify-between font-bold">
                    <span>
                      {connectionResult.connected ? '✓ Connection Verified & Active' : '⚠ Connection Test Status'}
                    </span>
                    <span>{connectionResult.configured ? 'Key Present' : 'Key Missing'}</span>
                  </div>

                  {connectionResult.tables && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-emerald-200/50">
                      {Object.entries(connectionResult.tables).map(([tableName, exists]) => (
                        <div key={tableName} className="flex items-center gap-1.5 font-mono text-[11px]">
                          {exists ? (
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                          ) : (
                            <XCircle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                          )}
                          <span>{tableName}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {connectionResult.error && (
                    <p className="text-[11px] opacity-90 pt-1">
                      Note: {connectionResult.error}
                    </p>
                  )}
                </div>
              )}

              {/* Instructions Box */}
              <div className="p-3 bg-white rounded-lg border border-slate-200 text-xs text-slate-600 space-y-1.5">
                <p className="font-semibold text-slate-800">Supabase Integration Setup Guide:</p>
                <p className="text-[11px] font-mono text-slate-600">
                  1. Paste your Supabase Publishable / Anon key into <strong className="text-slate-800">.env.local</strong>:
                  <br />
                  <code className="bg-slate-100 px-1 py-0.5 rounded">VITE_SUPABASE_PUBLISHABLE_KEY=your_key_here</code>
                </p>
                <p className="text-[11px] font-mono text-slate-600">
                  2. Open your Supabase Dashboard &rarr; SQL Editor and execute <strong className="text-slate-800">supabase_schema.sql</strong>.
                </p>
                <p className="text-[11px] font-mono text-slate-600">
                  3. Row Level Security (RLS) is automatically enabled with secure policies for customers, churn_predictions, retention_campaigns, and campaign_results.
                </p>
              </div>
            </div>

            {/* Gemini / Python ML API Status */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-xs">
                    <Sparkles className="w-4 h-4 text-teal-700" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900">
                        Gemini & ML Churn Inference Engine
                      </span>
                      <span className="text-[10px] bg-teal-100 text-teal-800 px-2 py-0.5 rounded font-semibold">
                        Active In-Memory Simulator (v2.4)
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Provides explainable churn propensity scoring and tailored retention actions.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Engine Ready
                </div>
              </div>

              <div className="p-3 bg-white rounded-lg border border-slate-200 text-xs text-slate-600 space-y-1">
                <p className="font-semibold text-slate-800">Standalone Execution Mode:</p>
                <p className="text-[11px] text-slate-500">
                  Currently running calibrated benchmark heuristics based on the IBM Telco 7,043 dataset. No external API keys or paid tokens are consumed during prototype testing.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Save Preferences Button */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            type="submit"
            variant="primary"
            size="md"
            leftIcon={<Save className="w-4 h-4" />}
            className="shadow-sm font-semibold"
          >
            Save All Preferences
          </Button>
        </div>
      </form>
    </div>
  )
}
