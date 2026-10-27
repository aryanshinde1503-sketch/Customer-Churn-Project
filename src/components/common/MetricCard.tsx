import React from 'react'
import { Card, CardContent } from './Card'
import { cn } from '../../utils/cn'
import { ArrowUpRight, ArrowDownRight } from 'lucide-react'

interface MetricCardProps {
  title: string
  value: string | number
  delta?: {
    value: string | number
    isPositiveGood?: boolean // if true, higher is good; if false (e.g. churn rate), lower is good
    label?: string
  }
  icon: React.ReactNode
  iconBgColor?: string
  subtext?: string
  progressBar?: {
    value: number // 0-100
    color?: string
  }
  className?: string
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  delta,
  icon,
  iconBgColor = 'bg-teal-50 text-teal-600 border-teal-100',
  subtext,
  progressBar,
  className,
}) => {
  const isPositive = delta ? String(delta.value).startsWith('+') || Number(delta.value) > 0 : false
  const isGood = delta?.isPositiveGood !== undefined ? (isPositive === delta.isPositiveGood) : isPositive

  return (
    <Card className={cn('relative overflow-hidden', className)}>
      <CardContent className="p-5 sm:p-6">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs sm:text-sm font-medium text-slate-500 uppercase tracking-wider">
            {title}
          </span>
          <div
            className={cn(
              'w-10 h-10 rounded-xl flex items-center justify-center border shadow-subtle',
              iconBgColor
            )}
          >
            {icon}
          </div>
        </div>

        <div className="mt-3 flex items-baseline gap-2.5">
          <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {value}
          </span>
          {delta && (
            <span
              className={cn(
                'inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full',
                isGood
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-rose-50 text-rose-700 border border-rose-200'
              )}
            >
              {isPositive ? (
                <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
              ) : (
                <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />
              )}
              {delta.value}
            </span>
          )}
        </div>

        {subtext && (
          <p className="mt-2 text-xs text-slate-500 font-normal leading-relaxed">
            {delta?.label ? `${delta.label} ` : ''}
            {subtext}
          </p>
        )}

        {progressBar && (
          <div className="mt-3 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div
              className={cn('h-full rounded-full transition-all duration-500', progressBar.color || 'bg-teal-500')}
              style={{ width: `${Math.min(100, Math.max(0, progressBar.value))}%` }}
            />
          </div>
        )}
      </CardContent>
    </Card>
  )
}
