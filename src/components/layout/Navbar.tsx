import React, { useState } from 'react'
import {
  Menu,
  Search,
  Bell,
  RefreshCw,
  Plus,
  Calendar,
  ShieldAlert,
  UserCheck,
  Zap,
  LogOut,
  LogIn,
  User,
  ShieldCheck,
  ChevronDown,
} from 'lucide-react'
import { Button } from '../common/Button'
import { useToast } from '../../context/ToastContext'
import { useAuth } from '../../context/AuthContext'

interface NavbarProps {
  onOpenMobile: () => void
  onNewCampaignClick: () => void
  onGlobalSearch?: (query: string) => void
  onRefreshData?: () => void
  isRefreshing?: boolean
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenMobile,
  onNewCampaignClick,
  onGlobalSearch,
  onRefreshData,
  isRefreshing = false,
}) => {
  const { info, success } = useToast()
  const { user, signOut, openAuthModal, isConfigured } = useAuth()
  const [showNotifications, setShowNotifications] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [searchVal, setSearchVal] = useState('')

  const notifications = [
    {
      id: 1,
      title: 'High Churn Risk Spike Detected',
      time: '12m ago',
      desc: '4 Month-to-month fiber customers crossed 0.85 churn probability threshold.',
      icon: <ShieldAlert className="w-4 h-4 text-rose-500" />,
      unread: true,
    },
    {
      id: 2,
      title: 'Retention Milestone Reached',
      time: '2h ago',
      desc: 'Campaign #101 achieved 428 retained customers ($78.4k MRR saved).',
      icon: <UserCheck className="w-4 h-4 text-emerald-500" />,
      unread: true,
    },
    {
      id: 3,
      title: 'Model Evaluation Ready',
      time: '5h ago',
      desc: 'XGBoost v2.4 validation completed with 0.864 ROC-AUC.',
      icon: <Zap className="w-4 h-4 text-teal-500" />,
      unread: false,
    },
  ]

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (onGlobalSearch) {
      onGlobalSearch(searchVal)
    }
  }

  const handleRefresh = () => {
    if (onRefreshData) {
      onRefreshData()
    } else {
      info('Refreshing analytics cache...', 'Synced 7,043 customer records from synthetic engine.')
    }
  }

  return (
    <header className="h-16 bg-white border-b border-slate-200/80 sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 lg:px-8">
      {/* Left side: Hamburger on mobile + Global search */}
      <div className="flex items-center gap-3 sm:gap-4 flex-1 max-w-lg">
        <button
          onClick={onOpenMobile}
          className="lg:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
          aria-label="Open sidebar menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <form onSubmit={handleSearchSubmit} className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search customers, ID, emails, campaigns..."
            value={searchVal}
            onChange={(e) => {
              setSearchVal(e.target.value)
              if (onGlobalSearch) onGlobalSearch(e.target.value)
            }}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 hover:bg-slate-100/80 focus:bg-white text-xs sm:text-sm text-slate-800 placeholder-slate-400 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
          />
        </form>
      </div>

      {/* Right side controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Date scope pill */}
        <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-slate-100/80 rounded-lg text-xs font-medium text-slate-600 border border-slate-200">
          <Calendar className="w-3.5 h-3.5 text-slate-500" />
          <span>Active Period: Q4 2026</span>
        </div>

        {/* Refresh button */}
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors border border-transparent hover:border-slate-200"
          title="Refresh predictive scores and sync analytics"
          aria-label="Refresh data"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-teal-600' : ''}`} />
        </button>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors border border-transparent hover:border-slate-200"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
          </button>

          {showNotifications && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowNotifications(false)}
              />
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-elevated border border-slate-200 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Alerts & Notifications
                    </span>
                    <span className="text-[10px] bg-rose-100 text-rose-700 px-1.5 py-0.5 rounded font-semibold">
                      2 new
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      success('Notifications marked as read')
                      setShowNotifications(false)
                    }}
                    className="text-xs text-teal-600 hover:text-teal-700 font-medium"
                  >
                    Mark all read
                  </button>
                </div>
                <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`p-3.5 hover:bg-slate-50 transition-colors flex gap-3 ${
                        n.unread ? 'bg-teal-50/20' : ''
                      }`}
                    >
                      <div className="mt-0.5">{n.icon}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-semibold text-slate-900 truncate">{n.title}</p>
                          <span className="text-[10px] text-slate-400">{n.time}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{n.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Primary Action Button */}
        <Button
          variant="primary"
          size="sm"
          onClick={onNewCampaignClick}
          leftIcon={<Plus className="w-3.5 h-3.5" />}
          className="hidden sm:inline-flex font-semibold shadow-sm"
        >
          New Campaign
        </Button>

        {/* User Profile / Supabase Auth Button */}
        <div className="relative pl-2 border-l border-slate-200">
          {user ? (
            <div>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 p-1 rounded-lg hover:bg-slate-100 transition-colors"
                aria-label="User account menu"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-navy-800 to-teal-600 text-white flex items-center justify-center font-bold text-xs ring-2 ring-teal-500/20 shadow-subtle">
                  {(user.user_metadata?.full_name || user.email || 'U').substring(0, 2).toUpperCase()}
                </div>
                <div className="hidden xl:flex flex-col text-left">
                  <span className="text-xs font-semibold text-slate-800 leading-tight">
                    {user.user_metadata?.full_name || user.email?.split('@')[0]}
                  </span>
                  <span className="text-[10px] text-teal-600 font-medium leading-none">
                    Supabase User
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
              </button>

              {showUserMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-elevated border border-slate-200 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                    <div className="p-3.5 bg-slate-50 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        <span className="text-xs font-bold text-slate-900">Authenticated Session</span>
                      </div>
                      <p className="text-xs text-slate-600 font-medium mt-1 truncate">{user.email}</p>
                      <span className="text-[10px] text-slate-400 font-mono mt-0.5 block truncate">
                        ID: {user.id.substring(0, 18)}...
                      </span>
                    </div>

                    <div className="p-1.5">
                      <button
                        onClick={async () => {
                          setShowUserMenu(false)
                          await signOut()
                          success('Signed Out', 'You have been signed out of Supabase.')
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors text-left"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => openAuthModal('signin')}
              leftIcon={<LogIn className="w-3.5 h-3.5 text-teal-600" />}
              className="text-xs font-semibold"
            >
              Sign In
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}
