import React, { useState } from 'react'
import {
  Customer,
  RetentionStatus,
  RetentionCampaign,
} from '../../types'
import { Modal } from '../common/Modal'
import { Button } from '../common/Button'
import { Badge } from '../common/Badge'
import {
  ShieldAlert,
  Zap,
  Phone,
  Mail,
  Calendar,
  CreditCard,
  Wifi,
  Sparkles,
  CheckCircle,
  HelpCircle,
  ArrowUpRight,
  ArrowDownRight,
  MessageSquare,
  Trash2,
} from 'lucide-react'
import { useToast } from '../../context/ToastContext'
import { customerService } from '../../services/customerService'

interface CustomerDetailModalProps {
  customer: Customer | null
  isOpen: boolean
  onClose: () => void
  onCustomerUpdated: (updatedCustomer: Customer) => void
  onCustomerDeleted?: (customerId: string) => void
  campaigns: RetentionCampaign[]
}

export const CustomerDetailModal: React.FC<CustomerDetailModalProps> = ({
  customer,
  isOpen,
  onClose,
  onCustomerUpdated,
  onCustomerDeleted,
  campaigns,
}) => {
  const { success, info, error: toastError } = useToast()
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>('')
  const [isUpdating, setIsUpdating] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [noteText, setNoteText] = useState('')
  const [showNoteInput, setShowNoteInput] = useState(false)

  if (!customer) return null

  const handleEnrollCampaign = async () => {
    if (!selectedCampaignId) {
      info('Select a campaign', 'Please select an active retention campaign first.')
      return
    }
    setIsUpdating(true)
    try {
      const updated = await customerService.updateCustomerStatus(
        customer.id,
        'In Campaign',
        selectedCampaignId
      )
      if (updated) {
        onCustomerUpdated(updated)
        const camp = campaigns.find((c) => c.id === selectedCampaignId)
        success(
          'Customer Enrolled in Campaign',
          `${customer.name} has been enrolled in "${camp?.name || selectedCampaignId}".`
        )
      }
    } finally {
      setIsUpdating(false)
    }
  }

  const handleStatusChange = async (newStatus: RetentionStatus) => {
    setIsUpdating(true)
    try {
      const updated = await customerService.updateCustomerStatus(customer.id, newStatus)
      if (updated) {
        onCustomerUpdated(updated)
        success(
          'Retention Status Updated',
          `${customer.name} status changed to "${newStatus}".`
        )
      }
    } finally {
      setIsUpdating(false)
    }
  }

  const handleSaveNote = async () => {
    if (!noteText.trim()) return
    await customerService.recordCampaignResult({
      campaignId: customer.assignedCampaignId || 'CAMP-101',
      customerId: customer.id,
      actionType: 'Outreach Note',
      channel: 'Support Portal',
      notes: noteText,
    })
    success('Intervention Note Saved', `Note recorded on account ${customer.id} and synced to campaign results.`)
    setNoteText('')
    setShowNoteInput(false)
  }

  const handleDeleteCustomer = async () => {
    if (!window.confirm(`Are you sure you want to delete customer ${customer.name} (${customer.id}) from the database?`)) {
      return
    }
    setIsDeleting(true)
    try {
      const { success: delSuccess, error } = await customerService.deleteCustomer(customer.id)
      if (delSuccess) {
        success('Customer Deleted', `${customer.name} was removed from the database.`)
        if (onCustomerDeleted) {
          onCustomerDeleted(customer.id)
        }
        onClose()
      } else {
        toastError('Deletion Failed', error || 'Could not delete customer')
      }
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="xl"
      title={
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-navy-900 text-white font-bold flex items-center justify-center text-sm shadow-subtle">
            {customer.name
              .split(' ')
              .map((n) => n[0])
              .join('')
              .substring(0, 2)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-slate-900">{customer.name}</span>
              <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                {customer.id}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-normal">
              Member since {customer.tenure} months ago • Last touchpoint: {customer.lastInteractionDate}
            </p>
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        {/* ML Prediction Risk Spotlight Card */}
        <div
          className={`p-5 rounded-2xl border transition-all ${
            customer.churnRisk === 'High'
              ? 'bg-rose-50/70 border-rose-200'
              : customer.churnRisk === 'Medium'
              ? 'bg-amber-50/70 border-amber-200'
              : 'bg-emerald-50/70 border-emerald-200'
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <ShieldAlert
                  className={`w-5 h-5 ${
                    customer.churnRisk === 'High'
                      ? 'text-rose-600'
                      : customer.churnRisk === 'Medium'
                      ? 'text-amber-600'
                      : 'text-emerald-600'
                  }`}
                />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  ML Churn Propensity Assessment
                </span>
                <Badge risk={customer.churnRisk} size="sm" dot>
                  {customer.churnRisk} Risk
                </Badge>
              </div>
              <p className="text-xs text-slate-600 mt-1">
                Model confidence: <strong>{customer.predictionConfidence}%</strong> (XGBoost Ensemble v2.4)
              </p>
            </div>

            <div className="flex items-baseline gap-2">
              <span
                className={`text-4xl font-black tracking-tight ${
                  customer.churnRisk === 'High'
                    ? 'text-rose-700'
                    : customer.churnRisk === 'Medium'
                    ? 'text-amber-700'
                    : 'text-emerald-700'
                }`}
              >
                {(customer.riskScore * 100).toFixed(0)}%
              </span>
              <span className="text-xs font-semibold text-slate-500">Churn Probability</span>
            </div>
          </div>

          {/* Visual Probability Bar */}
          <div className="mt-3 w-full bg-white/80 rounded-full h-3 p-0.5 border border-slate-200 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
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

        {/* Customer Attributes & Plan Details Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70">
            <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
              <CreditCard className="w-3.5 h-3.5 text-slate-400" /> Contract
            </span>
            <p className="text-xs sm:text-sm font-bold text-slate-900 mt-1">{customer.contract}</p>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70">
            <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" /> Monthly Bill
            </span>
            <p className="text-xs sm:text-sm font-bold text-slate-900 mt-1">
              ${customer.monthlyCharges.toFixed(2)}/mo
            </p>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70">
            <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
              <Wifi className="w-3.5 h-3.5 text-slate-400" /> Internet Service
            </span>
            <p className="text-xs sm:text-sm font-bold text-slate-900 mt-1">
              {customer.internetService}
            </p>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70">
            <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-slate-400" /> Tech Support
            </span>
            <p className="text-xs sm:text-sm font-bold text-slate-900 mt-1">
              {customer.techSupport ? 'Subscribed' : 'None'}
            </p>
          </div>
        </div>

        {/* Contact Info & Billing Method */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/70 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 font-medium">
              <Mail className="w-3.5 h-3.5 text-slate-400" /> {customer.email}
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <Phone className="w-3.5 h-3.5 text-slate-400" /> {customer.phone}
            </span>
          </div>
          <div>
            <span className="text-slate-400">Payment: </span>
            <strong className="text-slate-800">{customer.paymentMethod}</strong>
          </div>
        </div>

        {/* Explainable AI: Contributing Risk Factors */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-teal-600" /> Top Feature Contributions to Churn Probability
          </h4>
          <div className="space-y-2">
            {customer.factors.map((factor, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl border border-slate-200 bg-white shadow-subtle flex items-start justify-between gap-3"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-800">{factor.factor}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded font-semibold inline-flex items-center ${
                        factor.direction === 'increases_risk'
                          ? 'bg-rose-100 text-rose-700'
                          : 'bg-emerald-100 text-emerald-700'
                      }`}
                    >
                      {factor.direction === 'increases_risk' ? (
                        <ArrowUpRight className="w-3 h-3 mr-0.5" />
                      ) : (
                        <ArrowDownRight className="w-3 h-3 mr-0.5" />
                      )}
                      {factor.direction === 'increases_risk' ? '+' : '-'}
                      {factor.impact}%
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">{factor.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recommended Action Playbook */}
        <div className="p-4 bg-teal-50/80 rounded-xl border border-teal-200/80">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-teal-600 text-white rounded-lg flex-shrink-0">
              <Zap className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <h5 className="text-xs font-bold uppercase tracking-wider text-teal-900">
                AI Prescribed Retention Strategy
              </h5>
              <p className="text-xs sm:text-sm text-teal-800 mt-1 font-medium leading-relaxed">
                {customer.suggestedAction}
              </p>
            </div>
          </div>
        </div>

        {/* Retention Campaign Enrollment Section */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Retention Campaign Enrollment
            </span>
            <Badge status={customer.retentionStatus} size="sm">
              Status: {customer.retentionStatus}
            </Badge>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <select
              value={selectedCampaignId}
              onChange={(e) => setSelectedCampaignId(e.target.value)}
              className="w-full sm:flex-1 text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="">-- Choose Retention Campaign --</option>
              {campaigns.map((camp) => (
                <option key={camp.id} value={camp.id}>
                  {camp.name} ({camp.status} • {camp.offerType})
                </option>
              ))}
            </select>
            <Button
              variant="primary"
              size="sm"
              isLoading={isUpdating}
              onClick={handleEnrollCampaign}
              className="w-full sm:w-auto text-xs"
            >
              Enroll Customer
            </Button>
          </div>
        </div>

        {/* Outreach Note Input */}
        {showNoteInput && (
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <label className="text-xs font-semibold text-slate-700">
              Record Support / Retention Note:
            </label>
            <textarea
              rows={2}
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="e.g., Called subscriber regarding price concerns, offered 15% discount for 1-year contract extension..."
              className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <div className="flex justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={() => setShowNoteInput(false)}>
                Cancel
              </Button>
              <Button variant="navy" size="sm" onClick={handleSaveNote}>
                Save Note
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Actions Footer */}
      <div className="mt-6 pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowNoteInput(!showNoteInput)}
            leftIcon={<MessageSquare className="w-3.5 h-3.5" />}
          >
            {showNoteInput ? 'Hide Note' : 'Add Outreach Note'}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            loading={isDeleting}
            onClick={handleDeleteCustomer}
            className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
            leftIcon={<Trash2 className="w-3.5 h-3.5" />}
          >
            Delete
          </Button>
        </div>

        <div className="flex items-center gap-2">
          {customer.retentionStatus !== 'Retained' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleStatusChange('Retained')}
              leftIcon={<CheckCircle className="w-3.5 h-3.5 text-emerald-600" />}
            >
              Mark Retained
            </Button>
          )}
          <Button variant="navy" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  )
}
