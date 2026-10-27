import React, { useState } from 'react'
import {
  Megaphone,
  Plus,
  Users,
  CheckCircle,
  Clock,
  TrendingUp,
  DollarSign,
  ArrowRight,
  Filter,
  BarChart,
  Calendar,
  Layers,
} from 'lucide-react'
import { RetentionCampaign, CampaignStatus, NavigationPage } from '../../types'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../common/Card'
import { Button } from '../common/Button'
import { Badge } from '../common/Badge'
import { CreateCampaignModal } from './CreateCampaignModal'
import { useToast } from '../../context/ToastContext'

interface CampaignsPageProps {
  campaigns: RetentionCampaign[]
  onCampaignCreated: (campaign: RetentionCampaign) => void
  onNavigate: (page: NavigationPage) => void
}

export const CampaignsPage: React.FC<CampaignsPageProps> = ({
  campaigns,
  onCampaignCreated,
  onNavigate,
}) => {
  const { success, info } = useToast()
  const [activeTab, setActiveTab] = useState<'All' | CampaignStatus>('All')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  // Filter campaigns
  const filteredCampaigns = campaigns.filter((c) =>
    activeTab === 'All' ? true : c.status === activeTab
  )

  // Aggregated KPI numbers
  const activeCount = campaigns.filter((c) => c.status === 'Active').length
  const totalTargeted = campaigns.reduce((acc, c) => acc + c.targetCount, 0)
  const totalContacted = campaigns.reduce((acc, c) => acc + c.contactedCount, 0)
  const totalRetained = campaigns.reduce((acc, c) => acc + c.retainedCount, 0)
  const totalRevenueSaved = campaigns.reduce((acc, c) => acc + c.revenueSaved, 0)
  const totalSpend = campaigns.reduce((acc, c) => acc + c.spend, 0)

  const overallRetentionRate = totalContacted > 0 ? (totalRetained / totalContacted) * 100 : 0
  const overallROI = totalSpend > 0 ? (totalRevenueSaved / totalSpend).toFixed(1) : '0'

  const handleSimulateOutreach = async (campaign: RetentionCampaign) => {
    await customerService.recordCampaignResult({
      campaignId: campaign.id,
      actionType: 'Automated Outreach Sprint',
      channel: campaign.channel,
      revenueImpact: 0,
      notes: `Triggered automated ${campaign.offerType} outreach via ${campaign.channel}`,
    })
    success(
      'Automated Outreach Triggered',
      `Sent 45 personalized offers for "${campaign.name}" and logged in campaign_results table.`
    )
  }

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Proactive Retention Campaigns
            </h1>
            <Badge variant="teal" size="sm">
              {activeCount} Active Sprints
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Automated and high-touch intervention programs designed to convert high-risk subscribers into long-term contracts.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsCreateModalOpen(true)}
          leftIcon={<Plus className="w-4 h-4" />}
          className="shadow-sm"
        >
          New Retention Campaign
        </Button>
      </div>

      {/* Aggregate Performance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Active Campaigns
            </span>
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
              <Megaphone className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">{activeCount}</p>
          <p className="text-[11px] text-slate-500 mt-1">
            Across {totalTargeted.toLocaleString()} targeted accounts
          </p>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Subscribers Contacted
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-brand-blue flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">
            {totalContacted.toLocaleString()}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">
            {((totalContacted / totalTargeted) * 100).toFixed(0)}% outreach completion
          </p>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Retention Win Rate
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-600 mt-2">
            {overallRetentionRate.toFixed(1)}%
          </p>
          <p className="text-[11px] text-slate-500 mt-1">
            {totalRetained.toLocaleString()} accounts saved from churning
          </p>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Protected Revenue (MRR)
            </span>
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-teal-700 mt-2">
            ${(totalRevenueSaved / 1000).toFixed(1)}k
          </p>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">
            {overallROI}x ROI on ${totalSpend.toLocaleString()} spend
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        {(['All', 'Active', 'Scheduled', 'Completed', 'Draft'] as const).map((tab) => {
          const count =
            tab === 'All' ? campaigns.length : campaigns.filter((c) => c.status === tab).length
          const isSelected = activeTab === tab

          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 ${
                isSelected
                  ? 'bg-navy-900 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <span>{tab}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  isSelected ? 'bg-navy-800 text-teal-300' : 'bg-slate-200/80 text-slate-600'
                }`}
              >
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Campaigns Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {filteredCampaigns.map((camp) => {
          const outreachPercent =
            camp.targetCount > 0
              ? Math.min(100, Math.round((camp.contactedCount / camp.targetCount) * 100))
              : 0
          const conversionPercent =
            camp.contactedCount > 0
              ? Math.min(100, Math.round((camp.retainedCount / camp.contactedCount) * 100))
              : 0

          return (
            <Card key={camp.id} className="flex flex-col justify-between">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-slate-400">
                        {camp.id}
                      </span>
                      <Badge status={camp.status} size="sm" dot>
                        {camp.status}
                      </Badge>
                      <Badge variant="teal" size="sm">
                        {camp.channel}
                      </Badge>
                    </div>
                    <CardTitle className="text-base sm:text-lg mt-1 font-bold text-slate-900">
                      {camp.name}
                    </CardTitle>
                  </div>
                </div>
                <CardDescription className="text-xs mt-1 leading-relaxed">
                  {camp.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4 pt-0">
                {/* Cohort definition & Offer pill */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Target Segment:</span>
                    <span className="font-semibold text-slate-800">{camp.targetSegment}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Retention Offer:</span>
                    <span className="font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                      {camp.offerType}
                    </span>
                  </div>
                </div>

                {/* Progress Indicators */}
                <div className="space-y-3">
                  {/* Outreach progress */}
                  <div>
                    <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                      <span>Customers Contacted</span>
                      <span className="font-bold">
                        {camp.contactedCount.toLocaleString()} / {camp.targetCount.toLocaleString()} ({outreachPercent}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-brand-blue h-full rounded-full transition-all duration-500"
                        style={{ width: `${outreachPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Retention Conversion */}
                  <div>
                    <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                      <span>Successfully Retained</span>
                      <span className="font-bold text-emerald-600">
                        {camp.retainedCount.toLocaleString()} accounts ({conversionPercent}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${conversionPercent}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Financial Impact Footer */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Revenue Saved</span>
                    <span className="font-bold text-slate-900 text-sm">
                      ${camp.revenueSaved.toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Campaign Spend</span>
                    <span className="font-bold text-slate-700 text-sm">
                      ${camp.spend.toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Net Benefit</span>
                    <span className="font-bold text-teal-700 text-sm">
                      +${(camp.revenueSaved - camp.spend).toLocaleString()}
                    </span>
                  </div>
                </div>
              </CardContent>

              {/* Action Buttons in footer */}
              <div className="p-3 sm:px-6 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onNavigate('customers')}
                  className="text-xs text-slate-600 hover:text-slate-900"
                  leftIcon={<Users className="w-3.5 h-3.5" />}
                >
                  View Target Cohort
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSimulateOutreach(camp)}
                  className="text-xs"
                >
                  Trigger Batch Outreach
                </Button>
              </div>
            </Card>
          )
        })}
      </div>

      {/* Modal to create a new campaign */}
      <CreateCampaignModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCampaignCreated={onCampaignCreated}
      />
    </div>
  )
}
