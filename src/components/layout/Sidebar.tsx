import React from 'react'
import {
  LayoutDashboard,
  Users,
  BrainCircuit,
  Megaphone,
  BarChart3,
  Settings,
  ShieldAlert,
  ChevronRight,
  Activity,
  Layers,
} from 'lucide-react'
import { NavigationPage } from '../../types'
import { cn } from '../../utils/cn'

interface SidebarProps {
  currentPage: NavigationPage
  onNavigate: (page: NavigationPage) => void
  isMobileOpen: boolean
  onCloseMobile: () => void
}

interface NavItem {
  id: NavigationPage
  label: string
  icon: React.ReactNode
  badge?: string
  badgeVariant?: 'risk' | 'teal' | 'neutral'
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onNavigate,
  isMobileOpen,
  onCloseMobile,
}) => {
  const navItems: NavItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      id: 'customers',
      label: 'Customers',
      icon: <Users className="w-5 h-5" />,
      badge: '7,043',
      badgeVariant: 'neutral',
    },
    {
      id: 'predictions',
      label: 'Churn Predictions',
      icon: <BrainCircuit className="w-5 h-5" />,
      badge: 'ML v2.4',
      badgeVariant: 'teal',
    },
    {
      id: 'campaigns',
      label: 'Retention Campaigns',
      icon: <Megaphone className="w-5 h-5" />,
      badge: '3 Active',
      badgeVariant: 'teal',
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: <BarChart3 className="w-5 h-5" />,
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <Settings className="w-5 h-5" />,
    },
  ]

  const handleNavClick = (page: NavigationPage) => {
    onNavigate(page)
    onCloseMobile()
  }

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-navy-950/70 backdrop-blur-sm z-40 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={cn(
          'fixed top-0 bottom-0 left-0 z-40 w-64 bg-navy-900 border-r border-navy-800 text-slate-300 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Brand Header */}
        <div className="h-16 px-5 flex items-center gap-3 border-b border-navy-800 bg-navy-950/50">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-500 to-brand-blue flex items-center justify-center text-white shadow-lg shadow-teal-500/20">
            <Activity className="w-5 h-5" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-bold text-white tracking-tight truncate leading-tight">
              ChurnGuard <span className="text-teal-400 font-semibold">AI</span>
            </span>
            <span className="text-[10px] text-slate-400 tracking-wider uppercase font-medium">
              Retention System
            </span>
          </div>
        </div>

        {/* High Risk Alert Banner in Sidebar */}
        <div className="mx-3 mt-4 p-3 rounded-xl bg-navy-850 border border-navy-700/60 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center flex-shrink-0">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-rose-300">High Risk Cohort</span>
              <span className="text-xs font-bold text-white">1,869</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5 truncate">$168.2k MRR vulnerable</p>
          </div>
        </div>

        {/* Navigation list */}
        <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
            Main Navigation
          </div>

          {navItems.map((item) => {
            const isActive = currentPage === item.id
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={cn(
                  'w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all group',
                  isActive
                    ? 'bg-gradient-to-r from-teal-600 to-teal-700 text-white shadow-md shadow-teal-900/40'
                    : 'text-slate-300 hover:text-white hover:bg-navy-800/80'
                )}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      'transition-colors',
                      isActive ? 'text-white' : 'text-slate-400 group-hover:text-teal-400'
                    )}
                  >
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  {item.badge && (
                    <span
                      className={cn(
                        'text-[10px] px-2 py-0.5 rounded-full font-semibold',
                        isActive
                          ? 'bg-teal-800/80 text-teal-100'
                          : item.badgeVariant === 'teal'
                          ? 'bg-teal-500/15 text-teal-300 border border-teal-500/20'
                          : 'bg-navy-800 text-slate-400'
                      )}
                    >
                      {item.badge}
                    </span>
                  )}
                  {isActive && <ChevronRight className="w-4 h-4 text-teal-200" />}
                </div>
              </button>
            )
          })}
        </div>

        {/* System & Model Status Footer */}
        <div className="p-3 border-t border-navy-800 bg-navy-950/40">
          <div className="p-3 rounded-lg bg-navy-850/80 border border-navy-700/50 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 text-slate-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Model Inference
              </span>
              <span className="text-[11px] font-mono text-teal-400 font-semibold">AUC 0.864</span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1">
                <Layers className="w-3 h-3 text-slate-400" /> Demo Dataset
              </span>
              <span>7,043 records</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
