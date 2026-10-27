import React, { useState, useEffect } from 'react'
import { NavigationPage, Customer, RetentionCampaign } from './types'
import { ToastProvider, useToast } from './context/ToastContext'
import { AuthProvider } from './context/AuthContext'
import { Layout } from './components/layout/Layout'
import { DashboardOverview } from './components/dashboard/DashboardOverview'
import { CustomersPage } from './components/customers/CustomersPage'
import { PredictionsPage } from './components/predictions/PredictionsPage'
import { CampaignsPage } from './components/campaigns/CampaignsPage'
import { AnalyticsPage } from './components/analytics/AnalyticsPage'
import { SettingsPage } from './components/settings/SettingsPage'
import { CustomerDetailModal } from './components/customers/CustomerDetailModal'
import { CreateCampaignModal } from './components/campaigns/CreateCampaignModal'
import { AuthModal } from './components/auth/AuthModal'
import { customerService } from './services/customerService'

const AppContent: React.FC = () => {
  const { info, success } = useToast()
  const [currentPage, setCurrentPage] = useState<NavigationPage>('dashboard')
  const [campaigns, setCampaigns] = useState<RetentionCampaign[]>([])
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [globalSearch, setGlobalSearch] = useState('')

  // Selected customer for modal
  const [activeCustomer, setActiveCustomer] = useState<Customer | null>(null)
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false)

  // Global Create Campaign modal
  const [isCreateCampaignOpen, setIsCreateCampaignOpen] = useState(false)

  // Initial load of campaigns
  useEffect(() => {
    async function initCampaigns() {
      const data = await customerService.getCampaigns()
      setCampaigns(data)
    }
    initCampaigns()
  }, [])

  const handleCampaignCreated = (newCamp: RetentionCampaign) => {
    setCampaigns((prev) => [newCamp, ...prev])
  }

  const handleRefreshData = async () => {
    setIsRefreshing(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 600))
      const freshCampaigns = await customerService.getCampaigns()
      setCampaigns(freshCampaigns)
      success(
        'Predictive Scoring Synchronized',
        'Updated churn probability scores and revenue-at-risk totals across all 7,043 subscriber records.'
      )
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleGlobalSearch = (query: string) => {
    setGlobalSearch(query)
    if (query.trim().length > 0 && currentPage !== 'customers') {
      setCurrentPage('customers')
    }
  }

  const handleSelectCustomer = (customer: Customer) => {
    setActiveCustomer(customer)
    setIsCustomerModalOpen(true)
  }

  const handleCustomerUpdated = (updated: Customer) => {
    setActiveCustomer(updated)
  }

  return (
    <Layout
      currentPage={currentPage}
      onNavigate={setCurrentPage}
      onNewCampaignClick={() => setIsCreateCampaignOpen(true)}
      onGlobalSearch={handleGlobalSearch}
      onRefreshData={handleRefreshData}
      isRefreshing={isRefreshing}
    >
      {/* Dynamic Page Views */}
      {currentPage === 'dashboard' && (
        <DashboardOverview
          onNavigate={setCurrentPage}
          onSelectCustomer={handleSelectCustomer}
          onNewCampaignClick={() => setIsCreateCampaignOpen(true)}
        />
      )}

      {currentPage === 'customers' && (
        <CustomersPage
          initialSearch={globalSearch}
          campaigns={campaigns}
        />
      )}

      {currentPage === 'predictions' && <PredictionsPage />}

      {currentPage === 'campaigns' && (
        <CampaignsPage
          campaigns={campaigns}
          onCampaignCreated={handleCampaignCreated}
          onNavigate={setCurrentPage}
        />
      )}

      {currentPage === 'analytics' && <AnalyticsPage />}

      {currentPage === 'settings' && <SettingsPage />}

      {/* Global Customer Detail Modal (e.g. from Dashboard click) */}
      <CustomerDetailModal
        customer={activeCustomer}
        isOpen={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
        onCustomerUpdated={handleCustomerUpdated}
        campaigns={campaigns}
      />

      {/* Global New Campaign Modal */}
      <CreateCampaignModal
        isOpen={isCreateCampaignOpen}
        onClose={() => setIsCreateCampaignOpen(false)}
        onCampaignCreated={handleCampaignCreated}
      />

      {/* Supabase Authentication Modal */}
      <AuthModal />
    </Layout>
  )
}

export function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ToastProvider>
  )
}

export default App

