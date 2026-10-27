import React, { useState } from 'react'
import { Modal } from '../common/Modal'
import { Button } from '../common/Button'
import { RetentionCampaign } from '../../types'
import { useToast } from '../../context/ToastContext'
import { customerService } from '../../services/customerService'

interface CreateCampaignModalProps {
  isOpen: boolean
  onClose: () => void
  onCampaignCreated: (campaign: RetentionCampaign) => void
}

export const CreateCampaignModal: React.FC<CreateCampaignModalProps> = ({
  isOpen,
  onClose,
  onCampaignCreated,
}) => {
  const { success, error } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [targetSegment, setTargetSegment] = useState('Month-to-month • High Risk • Fiber Optic')
  const [riskTier, setRiskTier] = useState<RetentionCampaign['riskTier']>('High Risk')
  const [offerType, setOfferType] = useState<RetentionCampaign['offerType']>('Discount (15-20%)')
  const [channel, setChannel] = useState<RetentionCampaign['channel']>('Email & SMS')
  const [targetCount, setTargetCount] = useState<number>(500)
  const [spend, setSpend] = useState<number>(7500)
  const [launchDate, setLaunchDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      error('Campaign name is required')
      return
    }

    try {
      setIsSubmitting(true)
      const newCampaign = await customerService.createCampaign({
        name: name.trim(),
        description: description.trim() || 'Custom targeted retention outreach sprint.',
        status: 'Active',
        targetSegment,
        riskTier,
        offerType,
        channel,
        targetCount,
        spend,
        launchDate,
      })

      onCampaignCreated(newCampaign)
      success(
        'Retention Campaign Created',
        `"${newCampaign.name}" launched with ${newCampaign.targetCount} targeted subscribers.`
      )
      onClose()
      // reset
      setName('')
      setDescription('')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      title="Create Retention Campaign"
      description="Configure and launch a targeted retention intervention program for at-risk subscribers."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Campaign Name */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Campaign Name *
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Q4 Annual Contract Upgrade Surge"
            className="w-full text-xs sm:text-sm px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Campaign Objective & Strategy
          </label>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the primary retention goal and pitch..."
            className="w-full text-xs sm:text-sm p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        {/* Target Risk Tier & Channel */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Target Risk Tier
            </label>
            <select
              value={riskTier}
              onChange={(e) => setRiskTier(e.target.value as any)}
              className="w-full text-xs sm:text-sm px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="High Risk">High Risk (&gt;70% Churn Probability)</option>
              <option value="Medium Risk">Medium Risk (40-70% Churn Probability)</option>
              <option value="All At-Risk">All At-Risk (&gt;40%)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Outreach Channel
            </label>
            <select
              value={channel}
              onChange={(e) => setChannel(e.target.value as any)}
              className="w-full text-xs sm:text-sm px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="Email & SMS">Email & SMS Automated Series</option>
              <option value="Direct Phone Call">Direct Phone Call (Call Center)</option>
              <option value="In-App Notification">In-App Notification & Web Portal</option>
              <option value="Executive Outreach">Executive Account Manager</option>
            </select>
          </div>
        </div>

        {/* Offer Type & Target Segment */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Retention Incentive / Offer
            </label>
            <select
              value={offerType}
              onChange={(e) => setOfferType(e.target.value as any)}
              className="w-full text-xs sm:text-sm px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="Discount (15-20%)">Discount (15-20% Bill Relief)</option>
              <option value="Free Speed Upgrade">Free Speed Upgrade (Fiber Boost)</option>
              <option value="Complimentary Tech Support">Complimentary Tech Support</option>
              <option value="Contract Renewal Perk">Contract Renewal Loyalty Credit</option>
              <option value="Loyalty Gift Box">Loyalty Gift Package / Hardware</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Target Cohort Definition
            </label>
            <input
              type="text"
              value={targetSegment}
              onChange={(e) => setTargetSegment(e.target.value)}
              placeholder="e.g., M2M • Fiber • Charges >$80"
              className="w-full text-xs sm:text-sm px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
            />
          </div>
        </div>

        {/* Target Count, Budget, Date */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Target Subscribers
            </label>
            <input
              type="number"
              min="10"
              max="5000"
              value={targetCount}
              onChange={(e) => setTargetCount(Number(e.target.value))}
              className="w-full text-xs sm:text-sm px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Budget ($ USD)
            </label>
            <input
              type="number"
              min="500"
              step="500"
              value={spend}
              onChange={(e) => setSpend(Number(e.target.value))}
              className="w-full text-xs sm:text-sm px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Launch Date
            </label>
            <input
              type="date"
              value={launchDate}
              onChange={(e) => setLaunchDate(e.target.value)}
              className="w-full text-xs sm:text-sm px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting}>
            Launch Retention Campaign
          </Button>
        </div>
      </form>
    </Modal>
  )
}
