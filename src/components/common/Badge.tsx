import React from 'react'
import { cn } from '../../utils/cn'
import { RiskLevel, CampaignStatus, RetentionStatus } from '../../types'

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'outline' | 'risk' | 'status' | 'teal' | 'blue' | 'neutral'
  risk?: RiskLevel
  status?: CampaignStatus | RetentionStatus
  size?: 'sm' | 'md' | 'lg'
  dot?: boolean
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'default',
  risk,
  status,
  size = 'md',
  dot = false,
  children,
  ...props
}) => {
  // Size classes
  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5 leading-none',
    md: 'text-xs px-2.5 py-1 font-medium',
    lg: 'text-sm px-3 py-1.5 font-medium',
  }[size]

  // Dynamic styling based on Risk
  let colorClasses = 'bg-slate-100 text-slate-700 border-slate-200'
  let dotColor = 'bg-slate-400'

  if (risk) {
    if (risk === 'High') {
      colorClasses = 'bg-rose-50 text-rose-700 border-rose-200/80 ring-1 ring-rose-200/50'
      dotColor = 'bg-rose-500 animate-pulse'
    } else if (risk === 'Medium') {
      colorClasses = 'bg-amber-50 text-amber-800 border-amber-200/80 ring-1 ring-amber-200/50'
      dotColor = 'bg-amber-500'
    } else {
      colorClasses = 'bg-emerald-50 text-emerald-700 border-emerald-200/80 ring-1 ring-emerald-200/50'
      dotColor = 'bg-emerald-500'
    }
  } else if (status) {
    if (status === 'Active' || status === 'Retained') {
      colorClasses = 'bg-emerald-50 text-emerald-700 border-emerald-200'
      dotColor = 'bg-emerald-500'
    } else if (status === 'In Campaign' || status === 'Scheduled') {
      colorClasses = 'bg-blue-50 text-blue-700 border-blue-200'
      dotColor = 'bg-blue-500'
    } else if (status === 'Draft' || status === 'Not Contacted') {
      colorClasses = 'bg-slate-100 text-slate-700 border-slate-200'
      dotColor = 'bg-slate-400'
    } else if (status === 'Completed') {
      colorClasses = 'bg-teal-50 text-teal-700 border-teal-200'
      dotColor = 'bg-teal-500'
    } else if (status === 'Lost') {
      colorClasses = 'bg-rose-50 text-rose-700 border-rose-200'
      dotColor = 'bg-rose-500'
    }
  } else if (variant === 'teal') {
    colorClasses = 'bg-teal-50 text-teal-800 border-teal-200 ring-1 ring-teal-200/40'
    dotColor = 'bg-teal-600'
  } else if (variant === 'blue') {
    colorClasses = 'bg-blue-50 text-blue-800 border-blue-200'
    dotColor = 'bg-blue-600'
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border transition-colors',
        sizeClasses,
        colorClasses,
        className
      )}
      {...props}
    >
      {dot && <span className={cn('w-1.5 h-1.5 rounded-full', dotColor)} />}
      {children}
    </span>
  )
}
