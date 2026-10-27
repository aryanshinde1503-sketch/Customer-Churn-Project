import React from 'react'
import { cn } from '../../utils/cn'
import { Loader2 } from 'lucide-react'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'navy'
  size?: 'sm' | 'md' | 'lg' | 'icon'
  isLoading?: boolean
  loading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      loading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const isSpinnerActive = isLoading || loading
    const baseStyles =
      'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]'

    const variants = {
      primary:
        'bg-teal-600 hover:bg-teal-700 text-white shadow-sm focus:ring-teal-500 border border-teal-700/20',
      navy:
        'bg-navy-900 hover:bg-navy-800 text-white shadow-sm focus:ring-navy-600 border border-navy-700/50',
      secondary:
        'bg-slate-100 hover:bg-slate-200 text-slate-800 focus:ring-slate-400 border border-slate-200',
      outline:
        'bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 focus:ring-teal-500 shadow-subtle',
      ghost:
        'bg-transparent hover:bg-slate-100 text-slate-600 hover:text-slate-900 focus:ring-slate-300',
      danger:
        'bg-rose-600 hover:bg-rose-700 text-white shadow-sm focus:ring-rose-500 border border-rose-700/20',
    }

    const sizes = {
      sm: 'text-xs px-2.5 py-1.5 gap-1.5',
      md: 'text-sm px-4 py-2 gap-2',
      lg: 'text-base px-5 py-2.5 gap-2.5',
      icon: 'p-2 text-slate-500 hover:text-slate-800',
    }

    return (
      <button
        ref={ref}
        disabled={disabled || isSpinnerActive}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isSpinnerActive && <Loader2 className="w-4 h-4 animate-spin" />}
        {!isSpinnerActive && leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
        {children}
        {!isSpinnerActive && rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
      </button>
    )
  }
)

Button.displayName = 'Button'
