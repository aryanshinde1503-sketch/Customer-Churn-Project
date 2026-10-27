import React from 'react'
import { cn } from '../../utils/cn'

export const Skeleton: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  ...props
}) => {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-slate-200/80', className)}
      {...props}
    />
  )
}

export const TableSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => {
  return (
    <div className="w-full space-y-3">
      <div className="h-10 bg-slate-100 rounded-lg animate-pulse" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center space-x-4 py-3">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-36" />
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-8 w-28" />
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-8 flex-1" />
        </div>
      ))}
    </div>
  )
}
