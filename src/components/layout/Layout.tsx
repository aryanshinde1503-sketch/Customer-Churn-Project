import React, { useState } from 'react'
import { Sidebar } from './Sidebar'
import { Navbar } from './Navbar'
import { DemoBanner } from '../common/DemoBanner'
import { NavigationPage } from '../../types'

interface LayoutProps {
  currentPage: NavigationPage
  onNavigate: (page: NavigationPage) => void
  onNewCampaignClick: () => void
  onGlobalSearch?: (query: string) => void
  onRefreshData?: () => void
  isRefreshing?: boolean
  children: React.ReactNode
}

export const Layout: React.FC<LayoutProps> = ({
  currentPage,
  onNavigate,
  onNewCampaignClick,
  onGlobalSearch,
  onRefreshData,
  isRefreshing = false,
  children,
}) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Demo Banner */}
      <DemoBanner />

      <div className="flex flex-1">
        {/* Left Dark Navy Sidebar */}
        <Sidebar
          currentPage={currentPage}
          onNavigate={onNavigate}
          isMobileOpen={isMobileOpen}
          onCloseMobile={() => setIsMobileOpen(false)}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
          <Navbar
            onOpenMobile={() => setIsMobileOpen(true)}
            onNewCampaignClick={onNewCampaignClick}
            onGlobalSearch={onGlobalSearch}
            onRefreshData={onRefreshData}
            isRefreshing={isRefreshing}
          />

          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}
