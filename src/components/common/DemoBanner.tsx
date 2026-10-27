import React, { useState } from 'react'
import { Sparkles, Database, X, ShieldCheck, Key } from 'lucide-react'
import { isSupabaseConfigured } from '../../lib/supabase'

export const DemoBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true)
  const isLive = isSupabaseConfigured()

  if (!isVisible) return null

  return (
    <div className={`px-4 py-2.5 text-xs sm:text-sm border-b flex items-center justify-between gap-3 shadow-sm transition-colors ${
      isLive
        ? 'bg-gradient-to-r from-emerald-950 via-navy-900 to-slate-900 text-white border-emerald-500/30'
        : 'bg-gradient-to-r from-navy-900 via-navy-850 to-slate-900 text-white border-teal-500/30'
    }`}>
      <div className="flex items-center gap-2.5 overflow-hidden">
        {isLive ? (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold text-[11px] uppercase tracking-wider border border-emerald-500/30">
            <Database className="w-3 h-3 text-emerald-400" /> Supabase Live
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-semibold text-[11px] uppercase tracking-wider border border-amber-500/30">
            <Key className="w-3 h-3 text-amber-400" /> Supabase Setup
          </span>
        )}
        <span className="truncate text-slate-300">
          {isLive ? (
            <>
              <strong className="text-white font-medium">Live PostgreSQL Connection</strong> — Connected to{' '}
              <code className="text-emerald-300 font-mono text-xs">wnoswnkmrmpjdxtqkxns.supabase.co</code> (RLS enforced).
            </>
          ) : (
            <>
              <strong className="text-white font-medium">Supabase Project Configured:</strong> Paste your Publishable Key into{' '}
              <code className="text-amber-300 font-mono text-xs bg-navy-800 px-1 py-0.5 rounded">.env.local</code> to activate live database tables & Supabase Auth.
            </>
          )}
        </span>
      </div>
      <div className="flex items-center gap-3 flex-shrink-0">
        <span className="hidden md:inline-flex items-center gap-1 text-slate-400 text-xs">
          <ShieldCheck className="w-3.5 h-3.5 text-teal-400" /> RLS Protected
        </span>
        <button
          onClick={() => setIsVisible(false)}
          className="text-slate-400 hover:text-white p-1 rounded-md transition-colors"
          aria-label="Dismiss banner"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}
