import React, { useState } from 'react'
import {
  Lock,
  Mail,
  User,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Database,
  ExternalLink,
  Sparkles,
} from 'lucide-react'
import { Modal } from '../common/Modal'
import { Button } from '../common/Button'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    closeAuthModal,
    authModalMode,
    setAuthModalMode,
    signIn,
    signUp,
    isConfigured,
  } = useAuth()
  const { success, error: toastError, info } = useToast()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    if (!isConfigured) {
      setFormError('Please paste your Supabase Publishable Key into .env.local to enable real authentication.')
      return
    }

    if (!email || !password) {
      setFormError('Please enter both email and password.')
      return
    }

    setIsSubmitting(true)

    try {
      if (authModalMode === 'signin') {
        const { error } = await signIn(email, password)
        if (error) {
          setFormError(error.message)
          toastError('Sign-in Failed', error.message)
        } else {
          success('Welcome Back!', `Signed in as ${email}`)
          closeAuthModal()
          setEmail('')
          setPassword('')
        }
      } else {
        const { error, user } = await signUp(email, password, fullName)
        if (error) {
          setFormError(error.message)
          toastError('Sign-up Failed', error.message)
        } else {
          if (user?.identities && user.identities.length === 0) {
            setFormError('An account with this email already exists.')
          } else {
            success(
              'Account Created!',
              'You are now registered. Check your email for a confirmation link if required by Supabase.'
            )
            closeAuthModal()
            setEmail('')
            setPassword('')
            setFullName('')
          }
        }
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal
      isOpen={isAuthModalOpen}
      onClose={closeAuthModal}
      title={authModalMode === 'signin' ? 'Sign In to ChurnGuard' : 'Create Retention Specialist Account'}

    >
      <div className="space-y-5">
        {/* Supabase Status Banner */}
        <div className={`p-3 rounded-lg border text-xs flex items-center justify-between ${isConfigured
            ? 'bg-emerald-50/80 border-emerald-200 text-emerald-800'
            : 'bg-amber-50/80 border-amber-200 text-amber-900'
          }`}>
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <div>
              <span className="font-semibold block">
                {isConfigured ? 'Connected to Supabase Project' : 'Supabase Key Required'}
              </span>
              <span className="text-[11px] text-slate-500 font-mono">
                wnoswnkmrmpjdxtqkxns.supabase.co
              </span>
            </div>
          </div>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isConfigured ? 'bg-emerald-200/60 text-emerald-900' : 'bg-amber-200 text-amber-900'
            }`}>
            {isConfigured ? 'Active' : '.env.local'}
          </span>
        </div>

        {/* Tab switcher */}
        <div className="flex bg-slate-100 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => {
              setAuthModalMode('signin')
              setFormError(null)
            }}
            className={`flex-1 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all ${authModalMode === 'signin'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-900'
              }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthModalMode('signup')
              setFormError(null)
            }}
            className={`flex-1 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all ${authModalMode === 'signup'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-900'
              }`}
          >
            Create Account
          </button>
        </div>

        {formError && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-start gap-2.5 text-xs text-rose-700 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1 font-medium leading-relaxed">{formError}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {authModalMode === 'signup' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="e.g. Alex Morgan"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50 focus:bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50 focus:bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                minLength={6}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50 focus:bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Minimum 6 characters</p>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="md"
            loading={isSubmitting}
            className="w-full font-bold shadow-md shadow-teal-700/20"
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            {authModalMode === 'signin' ? 'Sign In to Platform' : 'Complete Registration'}
          </Button>
        </form>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-600" /> Supabase GoTrue Auth
          </span>
          <span>RLS Enforced</span>
        </div>
      </div>
    </Modal>
  )
}
