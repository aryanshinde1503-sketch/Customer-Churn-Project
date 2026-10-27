import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

export interface Toast {
  id: string
  title: string
  description?: string
  type?: ToastType
  duration?: number
}

interface ToastContextType {
  toast: (toast: Omit<Toast, 'id'>) => void
  success: (title: string, description?: string) => void
  error: (title: string, description?: string) => void
  info: (title: string, description?: string) => void
  warning: (title: string, description?: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const addToast = useCallback(
    ({ title, description, type = 'info', duration = 4000 }: Omit<Toast, 'id'>) => {
      const id = Math.random().toString(36).substring(2, 9)
      const newToast: Toast = { id, title, description, type, duration }
      setToasts((prev) => [...prev, newToast])

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id)
        }, duration)
      }
    },
    [removeToast]
  )

  const success = useCallback((title: string, description?: string) => {
    addToast({ title, description, type: 'success' })
  }, [addToast])

  const error = useCallback((title: string, description?: string) => {
    addToast({ title, description, type: 'error' })
  }, [addToast])

  const info = useCallback((title: string, description?: string) => {
    addToast({ title, description, type: 'info' })
  }, [addToast])

  const warning = useCallback((title: string, description?: string) => {
    addToast({ title, description, type: 'warning' })
  }, [addToast])

  return (
    <ToastContext.Provider value={{ toast: addToast, success, error, info, warning }}>
      {children}
      {/* Toast Notification Container */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((t) => {
          const isSuccess = t.type === 'success'
          const isError = t.type === 'error'
          const isWarning = t.type === 'warning'

          return (
            <div
              key={t.id}
              className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-elevated border transition-all duration-300 animate-in slide-in-from-bottom-5 ${
                isSuccess
                  ? 'bg-emerald-950/95 text-emerald-50 border-emerald-800'
                  : isError
                  ? 'bg-rose-950/95 text-rose-50 border-rose-800'
                  : isWarning
                  ? 'bg-amber-950/95 text-amber-50 border-amber-800'
                  : 'bg-navy-900/95 text-white border-navy-700'
              }`}
            >
              <div className="flex-shrink-0 mt-0.5">
                {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
                {isError && <AlertCircle className="w-5 h-5 text-rose-400" />}
                {isWarning && <AlertCircle className="w-5 h-5 text-amber-400" />}
                {!isSuccess && !isError && !isWarning && <Info className="w-5 h-5 text-teal-400" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold tracking-tight">{t.title}</p>
                {t.description && (
                  <p className="text-xs mt-0.5 opacity-90 leading-relaxed">{t.description}</p>
                )}
              </div>
              <button
                onClick={() => removeToast(t.id)}
                className="flex-shrink-0 text-slate-400 hover:text-white transition-colors"
                aria-label="Dismiss toast"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}
