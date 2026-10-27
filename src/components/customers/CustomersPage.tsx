import React, { useState, useEffect, useMemo } from 'react'
import {
  Search,
  Filter,
  Download,
  SlidersHorizontal,
  ChevronUp,
  ChevronDown,
  ArrowUpDown,
  RefreshCw,
  Users,
  Eye,
  Megaphone,
  CheckSquare,
  Square,
  X,
  UserPlus,
  Database,
  AlertTriangle,
  UploadCloud,
  Sparkles,
  ShieldAlert,
} from 'lucide-react'
import {
  Customer,
  CustomerFilters,
  RiskLevel,
  ContractType,
  InternetServiceType,
  RetentionStatus,
  RetentionCampaign,
} from '../../types'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../common/Card'
import { Button } from '../common/Button'
import { Badge } from '../common/Badge'
import { TableSkeleton } from '../common/LoadingSkeleton'
import { EmptyState } from '../common/EmptyState'
import { CustomerDetailModal } from './CustomerDetailModal'
import { CreateCustomerModal } from './CreateCustomerModal'
import { customerService } from '../../services/customerService'
import { useToast } from '../../context/ToastContext'

interface CustomersPageProps {
  initialSearch?: string
  campaigns: RetentionCampaign[]
}

export const CustomersPage: React.FC<CustomersPageProps> = ({
  initialSearch = '',
  campaigns,
}) => {
  const { success, error: toastError, info } = useToast()
  const [loading, setLoading] = useState(true)
  const [customers, setCustomers] = useState<Customer[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  
  // Supabase state
  const [isLiveDb, setIsLiveDb] = useState(false)
  const [dbError, setDbError] = useState<string | null>(null)
  const [isSeeding, setIsSeeding] = useState(false)

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 8

  // Filter state
  const [filters, setFilters] = useState<CustomerFilters>({
    search: initialSearch,
    riskLevel: 'All',
    contractType: 'All',
    internetService: 'All',
    retentionStatus: 'All',
    minTenure: 0,
    maxTenure: 72,
    minCharges: 0,
    maxCharges: 150,
    sortBy: 'riskScore',
    sortDirection: 'desc',
  })

  // Load customers
  const loadCustomers = async () => {
    try {
      setLoading(true)
      setDbError(null)
      const res = await customerService.getCustomers(filters)
      if (res.error) {
        setDbError(res.error)
      }
      setCustomers(res.customers)
      setTotalCount(res.totalCount)
      setIsLiveDb(res.isLive)
      setCurrentPage(1)
    } catch (err: any) {
      setDbError(err?.message || 'Failed to load customers from database')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCustomers()
  }, [filters])

  // Sync initial search if changed from outside
  useEffect(() => {
    if (initialSearch !== filters.search) {
      setFilters((prev) => ({ ...prev, search: initialSearch }))
    }
  }, [initialSearch])

  // Pagination calculations
  const totalPages = Math.ceil(customers.length / itemsPerPage) || 1
  const paginatedCustomers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return customers.slice(start, start + itemsPerPage)
  }, [customers, currentPage])

  // Reset filters
  const handleResetFilters = () => {
    setFilters({
      search: '',
      riskLevel: 'All',
      contractType: 'All',
      internetService: 'All',
      retentionStatus: 'All',
      minTenure: 0,
      maxTenure: 72,
      minCharges: 0,
      maxCharges: 150,
      sortBy: 'riskScore',
      sortDirection: 'desc',
    })
    success('Filters reset to default view')
  }

  // Toggle sorting
  const handleSort = (field: CustomerFilters['sortBy']) => {
    setFilters((prev) => ({
      ...prev,
      sortBy: field,
      sortDirection:
        prev.sortBy === field ? (prev.sortDirection === 'asc' ? 'desc' : 'asc') : 'desc',
    }))
  }

  // Toggle single selection
  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  // Toggle select all on page
  const handleToggleSelectAll = () => {
    const pageIds = paginatedCustomers.map((c) => c.id)
    const allSelected = pageIds.every((id) => selectedIds.includes(id))
    if (allSelected) {
      setSelectedIds((prev) => prev.filter((id) => !pageIds.includes(id)))
    } else {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...pageIds])))
    }
  }

  // Bulk action: Enroll selected in campaign
  const handleBulkEnroll = () => {
    if (selectedIds.length === 0) return
    success(
      'Bulk Enrollment Triggered',
      `Queued ${selectedIds.length} high-risk customers for campaign enrollment.`
    )
    setSelectedIds([])
  }

  // Export to CSV
  const handleExportCSV = () => {
    const headers = [
      'Customer ID',
      'Name',
      'Email',
      'Phone',
      'Tenure (Months)',
      'Monthly Charges ($)',
      'Contract',
      'Internet Service',
      'Churn Risk',
      'Risk Score',
      'Retention Status',
    ]
    const rows = customers.map((c) => [
      c.id,
      `"${c.name}"`,
      c.email,
      c.phone,
      c.tenure,
      c.monthlyCharges,
      `"${c.contract}"`,
      `"${c.internetService}"`,
      c.churnRisk,
      (c.riskScore * 100).toFixed(1) + '%',
      `"${c.retentionStatus}"`,
    ])

    const csvContent = [headers.join(','), ...rows.map((e) => e.join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `customer_churn_cohort_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    success('CSV Export Ready', `Exported ${customers.length} customer records to CSV.`)
  }

  const handleCustomerUpdated = (updated: Customer) => {
    setCustomers((prev) => prev.map((c) => (c.id === updated.id ? updated : c)))
    setSelectedCustomer(updated)
  }

  const handleCustomerCreated = (newCust: Customer) => {
    setCustomers((prev) => [newCust, ...prev])
    setTotalCount((prev) => prev + 1)
  }

  const handleCustomerDeleted = (id: string) => {
    setCustomers((prev) => prev.filter((c) => c.id !== id))
    setTotalCount((prev) => Math.max(0, prev - 1))
    if (selectedCustomer?.id === id) {
      setSelectedCustomer(null)
      setIsDetailOpen(false)
    }
  }

  const handleSeedDatabase = async () => {
    setIsSeeding(true)
    try {
      const res = await customerService.seedDemoCustomersToSupabase()
      if (res.error) {
        toastError('Seed Operation Failed', res.error)
      } else {
        success('Supabase Seed Completed', `Loaded ${res.count} demo subscribers into public.customers.`)
        await loadCustomers()
      }
    } finally {
      setIsSeeding(false)
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Customer Cohorts & Risk Directory
            </h1>
            <Badge variant="neutral" size="sm">
              {totalCount} Total
            </Badge>

            {/* Supabase Connection Status Badge */}
            {isLiveDb ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Live Supabase (public.customers)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 shadow-xs">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                Demo Mode (.env.local key pending)
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Search, segment, and evaluate customer churn risk scores and retention intervention status.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {isLiveDb && customers.length === 0 && (
            <Button
              variant="outline"
              size="sm"
              loading={isSeeding}
              onClick={handleSeedDatabase}
              leftIcon={<UploadCloud className="w-3.5 h-3.5 text-teal-600" />}
            >
              Seed Initial Records
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            leftIcon={<Download className="w-3.5 h-3.5" />}
          >
            Export CSV ({customers.length})
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsCreateOpen(true)}
            leftIcon={<UserPlus className="w-4 h-4" />}
            className="shadow-sm font-semibold"
          >
            Add Customer
          </Button>
        </div>
      </div>

      {/* Supabase Database Error Alert (if table not created or RLS error) */}
      {dbError && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-amber-800">
                Supabase Query Notice: {dbError}
              </p>
              <p className="text-xs text-amber-700 mt-0.5">
                If the <code>public.customers</code> table hasn't been created yet, run the included{' '}
                <code className="bg-amber-100/80 px-1 py-0.5 rounded font-mono font-bold">
                  supabase_schema.sql
                </code>{' '}
                script in your Supabase SQL Editor.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button variant="outline" size="sm" onClick={loadCustomers} leftIcon={<RefreshCw className="w-3.5 h-3.5" />}>
              Retry
            </Button>
            <Button variant="primary" size="sm" loading={isSeeding} onClick={handleSeedDatabase}>
              Seed Demo Data
            </Button>
          </div>
        </div>
      )}

      {/* Filter and Control Bar */}
      <Card className="p-4 sm:p-5">
        <div className="flex flex-col gap-4">
          {/* Top row: Search input + Risk Filter Pills */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search by customer name, ID, email..."
                value={filters.search}
                onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
                className="w-full pl-9 pr-9 py-2 bg-slate-50 focus:bg-white text-xs sm:text-sm text-slate-800 placeholder-slate-400 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              {filters.search && (
                <button
                  onClick={() => setFilters((prev) => ({ ...prev, search: '' }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Risk Level Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
              {(['All', 'High', 'Medium', 'Low'] as const).map((level) => {
                const isSelected = filters.riskLevel === level
                return (
                  <button
                    key={level}
                    onClick={() => setFilters((prev) => ({ ...prev, riskLevel: level }))}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                      isSelected
                        ? level === 'High'
                          ? 'bg-rose-500 text-white shadow-sm'
                          : level === 'Medium'
                          ? 'bg-amber-500 text-white shadow-sm'
                          : level === 'Low'
                          ? 'bg-emerald-500 text-white shadow-sm'
                          : 'bg-navy-900 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {level === 'All' ? 'All Risks' : `${level} Risk`}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Secondary Filter Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-3 border-t border-slate-100 text-xs">
            {/* Contract Type */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Contract
              </label>
              <select
                value={filters.contractType}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    contractType: e.target.value as CustomerFilters['contractType'],
                  }))
                }
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="All">All Contracts</option>
                <option value="Month-to-month">Month-to-month</option>
                <option value="One year">One year</option>
                <option value="Two year">Two year</option>
              </select>
            </div>

            {/* Internet Service */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Service Type
              </label>
              <select
                value={filters.internetService}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    internetService: e.target.value as CustomerFilters['internetService'],
                  }))
                }
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="All">All Services</option>
                <option value="Fiber optic">Fiber optic</option>
                <option value="DSL">DSL</option>
                <option value="No">No Internet</option>
              </select>
            </div>

            {/* Retention Status */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Status
              </label>
              <select
                value={filters.retentionStatus}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    retentionStatus: e.target.value as CustomerFilters['retentionStatus'],
                  }))
                }
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="All">All Statuses</option>
                <option value="Not Contacted">Not Contacted</option>
                <option value="In Campaign">In Campaign</option>
                <option value="Retained">Retained</option>
                <option value="Lost">Lost</option>
              </select>
            </div>

            {/* Tenure Cutoff */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Tenure Filter
              </label>
              <select
                value={
                  filters.maxTenure <= 6
                    ? 'new'
                    : filters.minTenure >= 24
                    ? 'loyal'
                    : 'all'
                }
                onChange={(e) => {
                  const val = e.target.value
                  if (val === 'new') {
                    setFilters((prev) => ({ ...prev, minTenure: 0, maxTenure: 6 }))
                  } else if (val === 'loyal') {
                    setFilters((prev) => ({ ...prev, minTenure: 24, maxTenure: 72 }))
                  } else {
                    setFilters((prev) => ({ ...prev, minTenure: 0, maxTenure: 72 }))
                  }
                }}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="all">Any Tenure</option>
                <option value="new">Early Stage (&le; 6 mos)</option>
                <option value="loyal">Loyalty Tier (&ge; 24 mos)</option>
              </select>
            </div>
          </div>
        </div>
      </Card>

      {/* Bulk Action Bar */}
      {selectedIds.length > 0 && (
        <div className="bg-teal-900 text-white p-3 sm:p-4 rounded-xl flex items-center justify-between shadow-lg shadow-teal-950/20 animate-in slide-in-from-top-2 duration-150">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold">
            <span className="w-6 h-6 rounded-full bg-teal-700 flex items-center justify-center text-xs">
              {selectedIds.length}
            </span>
            <span>Subscribers Selected for Batch Intervention</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedIds([])}
              className="text-white border-teal-700 hover:bg-teal-800 text-xs"
            >
              Deselect All
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleBulkEnroll}
              leftIcon={<Megaphone className="w-3.5 h-3.5" />}
              className="text-xs bg-teal-500 hover:bg-teal-400 font-semibold"
            >
              Enroll in Campaign ({selectedIds.length})
            </Button>
          </div>
        </div>
      )}

      {/* Main Customers Table Card */}
      <Card>
        {loading ? (
          <div className="p-6">
            <TableSkeleton rows={8} />
          </div>
        ) : customers.length === 0 ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">No Customers Found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                {dbError
                  ? 'There was an issue querying Supabase table. Ensure schema is executed or seed demo data.'
                  : 'No customer accounts match your current filters, or the database table is currently empty.'}
              </p>
            </div>
            <div className="flex items-center justify-center gap-2.5 pt-2">
              <Button variant="outline" size="sm" onClick={handleResetFilters}>
                Reset Filters
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsCreateOpen(true)}
                leftIcon={<UserPlus className="w-4 h-4" />}
              >
                Add First Customer
              </Button>
              {isLiveDb && (
                <Button
                  variant="outline"
                  size="sm"
                  loading={isSeeding}
                  onClick={handleSeedDatabase}
                  leftIcon={<UploadCloud className="w-4 h-4 text-teal-600" />}
                >
                  Seed Demo Records
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50/90 text-slate-600 uppercase tracking-wider text-[11px] font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3.5 w-10">
                    <button
                      onClick={handleToggleSelectAll}
                      className="text-slate-400 hover:text-slate-700"
                      aria-label="Select all"
                    >
                      {paginatedCustomers.every((c) => selectedIds.includes(c.id)) ? (
                        <CheckSquare className="w-4 h-4 text-teal-600" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                  </th>

                  <th className="px-4 py-3.5">
                    <button
                      onClick={() => handleSort('id')}
                      className="flex items-center gap-1 hover:text-slate-900"
                    >
                      Customer ID
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>

                  <th className="px-4 py-3.5">
                    <button
                      onClick={() => handleSort('name')}
                      className="flex items-center gap-1 hover:text-slate-900"
                    >
                      Customer Name
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>

                  <th className="px-4 py-3.5">
                    <button
                      onClick={() => handleSort('tenure')}
                      className="flex items-center gap-1 hover:text-slate-900"
                    >
                      Tenure
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>

                  <th className="px-4 py-3.5">
                    <button
                      onClick={() => handleSort('monthlyCharges')}
                      className="flex items-center gap-1 hover:text-slate-900"
                    >
                      Monthly Bill
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>

                  <th className="px-4 py-3.5">Contract Type</th>

                  <th className="px-4 py-3.5">Churn Risk</th>

                  <th className="px-4 py-3.5">
                    <button
                      onClick={() => handleSort('riskScore')}
                      className="flex items-center gap-1 hover:text-slate-900"
                    >
                      Risk Score
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>

                  <th className="px-4 py-3.5">Retention Status</th>

                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedCustomers.map((customer) => {
                  const isSelected = selectedIds.includes(customer.id)
                  return (
                    <tr
                      key={customer.id}
                      className={`hover:bg-slate-50/80 transition-colors group cursor-pointer ${
                        isSelected ? 'bg-teal-50/30' : ''
                      }`}
                      onClick={() => {
                        setSelectedCustomer(customer)
                        setIsDetailOpen(true)
                      }}
                    >
                      {/* Checkbox */}
                      <td
                        className="px-4 py-3.5"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleToggleSelect(customer.id)
                        }}
                      >
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-teal-600" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-300 group-hover:text-slate-400" />
                        )}
                      </td>

                      {/* Customer ID */}
                      <td className="px-4 py-3.5 font-mono text-slate-500 font-medium">
                        {customer.id}
                      </td>

                      {/* Customer Name */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center flex-shrink-0 group-hover:bg-teal-100 group-hover:text-teal-800 transition-colors">
                            {customer.name.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-semibold text-slate-900 block group-hover:text-teal-700 transition-colors">
                              {customer.name}
                            </span>
                            <span className="text-[11px] text-slate-400 truncate max-w-[150px] block">
                              {customer.email}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Tenure */}
                      <td className="px-4 py-3.5 text-slate-700 font-medium">
                        {customer.tenure} mos
                      </td>

                      {/* Monthly Charges */}
                      <td className="px-4 py-3.5 font-semibold text-slate-900">
                        ${customer.monthlyCharges.toFixed(2)}
                      </td>

                      {/* Contract Type */}
                      <td className="px-4 py-3.5 text-slate-700">
                        <span className="inline-block bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-xs font-medium">
                          {customer.contract}
                        </span>
                      </td>

                      {/* Churn Risk */}
                      <td className="px-4 py-3.5">
                        <Badge risk={customer.churnRisk} size="sm" dot>
                          {customer.churnRisk}
                        </Badge>
                      </td>

                      {/* Risk Score Visual Bar */}
                      <td className="px-4 py-3.5">
                        <div className="w-24 space-y-1">
                          <div className="flex justify-between text-[11px] font-semibold">
                            <span
                              className={
                                customer.churnRisk === 'High'
                                  ? 'text-rose-600'
                                  : customer.churnRisk === 'Medium'
                                  ? 'text-amber-600'
                                  : 'text-emerald-600'
                              }
                            >
                              {(customer.riskScore * 100).toFixed(0)}%
                            </span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                customer.churnRisk === 'High'
                                  ? 'bg-rose-500'
                                  : customer.churnRisk === 'Medium'
                                  ? 'bg-amber-500'
                                  : 'bg-emerald-500'
                              }`}
                              style={{ width: `${customer.riskScore * 100}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Retention Status */}
                      <td className="px-4 py-3.5">
                        <Badge status={customer.retentionStatus} size="sm">
                          {customer.retentionStatus}
                        </Badge>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-3.5 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedCustomer(customer)
                            setIsDetailOpen(true)
                          }}
                          className="text-xs text-teal-600 hover:text-teal-800"
                          leftIcon={<Eye className="w-3.5 h-3.5" />}
                        >
                          Details
                        </Button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {customers.length > 0 && (
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
            <div>
              Showing{' '}
              <strong className="text-slate-800">
                {(currentPage - 1) * itemsPerPage + 1}
              </strong>{' '}
              to{' '}
              <strong className="text-slate-800">
                {Math.min(currentPage * itemsPerPage, customers.length)}
              </strong>{' '}
              of <strong className="text-slate-800">{customers.length}</strong> filtered accounts
            </div>

            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="text-xs"
              >
                Previous
              </Button>

              <div className="px-3 py-1 bg-white border border-slate-200 rounded-md font-semibold text-slate-800">
                Page {currentPage} of {totalPages}
              </div>

              <Button
                variant="outline"
                size="sm"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="text-xs"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Customer Detail Modal Drawer */}
      <CustomerDetailModal
        customer={selectedCustomer}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        onCustomerUpdated={handleCustomerUpdated}
        onCustomerDeleted={handleCustomerDeleted}
        campaigns={campaigns}
      />

      {/* Add New Customer Modal */}
      <CreateCustomerModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCustomerCreated={handleCustomerCreated}
      />
    </div>
  )
}
