import React, { useState } from 'react'
import {
  UserPlus,
  Mail,
  Phone,
  DollarSign,
  Calendar,
  Wifi,
  Shield,
  CreditCard,
  Sparkles,
  ArrowRight,
} from 'lucide-react'
import { Modal } from '../common/Modal'
import { Button } from '../common/Button'
import { Customer, ContractType, InternetServiceType } from '../../types'
import { customerService } from '../../services/customerService'
import { useToast } from '../../context/ToastContext'

interface CreateCustomerModalProps {
  isOpen: boolean
  onClose: () => void
  onCustomerCreated: (newCustomer: Customer) => void
}

export const CreateCustomerModal: React.FC<CreateCustomerModalProps> = ({
  isOpen,
  onClose,
  onCustomerCreated,
}) => {
  const { success, error: toastError } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form Fields
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [tenure, setTenure] = useState<number>(6)
  const [monthlyCharges, setMonthlyCharges] = useState<number>(79.99)
  const [contract, setContract] = useState<ContractType>('Month-to-month')
  const [internetService, setInternetService] = useState<InternetServiceType>('Fiber optic')
  const [paymentMethod, setPaymentMethod] = useState<'Electronic check' | 'Mailed check' | 'Bank transfer' | 'Credit card'>('Electronic check')
  const [techSupport, setTechSupport] = useState<boolean>(false)
  const [onlineSecurity, setOnlineSecurity] = useState<boolean>(false)
  const [paperlessBilling, setPaperlessBilling] = useState<boolean>(true)
  const [seniorCitizen, setSeniorCitizen] = useState<boolean>(false)

  // Live Risk Calculation Preview
  const riskSim = customerService.simulateChurnRisk({
    contract,
    tenure,
    monthlyCharges,
    internetService,
    techSupport,
    onlineSecurity,
    paperlessBilling,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !email.trim()) {
      toastError('Validation Error', 'Customer name and email are required.')
      return
    }

    setIsSubmitting(true)

    try {
      const { customer, error } = await customerService.createCustomer({
        name,
        email,
        phone: phone || '+1 (555) 000-0000',
        tenure,
        monthlyCharges,
        totalCharges: Number((monthlyCharges * Math.max(1, tenure)).toFixed(2)),
        contract,
        paymentMethod,
        internetService,
        techSupport,
        onlineSecurity,
        paperlessBilling,
        seniorCitizen,
        partner: false,
        dependents: false,
        churnRisk: riskSim.churnRisk,
        riskScore: riskSim.riskScore,
        predictionConfidence: riskSim.predictionConfidence,
        lastInteractionDate: new Date().toISOString().split('T')[0],
        retentionStatus: 'Not Contacted',
        suggestedAction: riskSim.churnRisk === 'High' 
          ? 'Reach out immediately with contract upgrade incentive.' 
          : 'Standard quarterly satisfaction survey.',
        factors: riskSim.factors,
      })

      if (error) {
        toastError('Failed to Create Customer', error)
      } else {
        success('Customer Account Created', `${customer.name} was successfully registered and scored.`)
        onCustomerCreated(customer)
        onClose()
        // Reset form
        setName('')
        setEmail('')
        setPhone('')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add New Customer & Calculate Churn Risk"
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Predictive Scoring Banner Preview */}
        <div className={`p-3.5 rounded-xl border flex items-center justify-between ${
          riskSim.churnRisk === 'High'
            ? 'bg-rose-50 border-rose-200 text-rose-900'
            : riskSim.churnRisk === 'Medium'
            ? 'bg-amber-50 border-amber-200 text-amber-900'
            : 'bg-emerald-50 border-emerald-200 text-emerald-900'
        }`}>
          <div className="flex items-center gap-2.5">
            <Sparkles className={`w-5 h-5 ${
              riskSim.churnRisk === 'High' ? 'text-rose-600' : riskSim.churnRisk === 'Medium' ? 'text-amber-600' : 'text-emerald-600'
            }`} />
            <div>
              <div className="text-xs font-bold uppercase tracking-wider">
                Predicted Churn Risk: <span className="font-extrabold">{riskSim.churnRisk}</span>
              </div>
              <div className="text-[11px] opacity-80">
                Calculated Score: {(riskSim.riskScore * 100).toFixed(0)}% • Model Confidence: {riskSim.predictionConfidence}%
              </div>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs font-mono font-bold">${monthlyCharges}/mo</span>
          </div>
        </div>

        {/* Contact Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Full Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Jordan Hayes"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full text-xs sm:text-sm px-3 py-2 bg-slate-50 focus:bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Email Address *
            </label>
            <input
              type="email"
              required
              placeholder="jordan.h@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full text-xs sm:text-sm px-3 py-2 bg-slate-50 focus:bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Phone Number
            </label>
            <input
              type="text"
              placeholder="+1 (555) 000-0000"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full text-xs sm:text-sm px-3 py-2 bg-slate-50 focus:bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Tenure ({tenure} months)
            </label>
            <input
              type="range"
              min="1"
              max="72"
              value={tenure}
              onChange={(e) => setTenure(Number(e.target.value))}
              className="w-full accent-teal-600 mt-2"
            />
          </div>
        </div>

        {/* Contract & Billing */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Contract Tier
            </label>
            <select
              value={contract}
              onChange={(e) => setContract(e.target.value as ContractType)}
              className="w-full text-xs px-2.5 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="Month-to-month">Month-to-month</option>
              <option value="One year">One year</option>
              <option value="Two year">Two year</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Internet Service
            </label>
            <select
              value={internetService}
              onChange={(e) => setInternetService(e.target.value as InternetServiceType)}
              className="w-full text-xs px-2.5 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="Fiber optic">Fiber optic</option>
              <option value="DSL">DSL</option>
              <option value="No">No Internet</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Monthly Bill ($)
            </label>
            <input
              type="number"
              step="0.05"
              min="15"
              max="200"
              value={monthlyCharges}
              onChange={(e) => setMonthlyCharges(Number(e.target.value))}
              className="w-full text-xs sm:text-sm px-3 py-2 bg-slate-50 focus:bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </div>

        {/* Service Toggles */}
        <div className="pt-2 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-2">
          <label className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-700 cursor-pointer hover:bg-slate-100">
            <input
              type="checkbox"
              checked={techSupport}
              onChange={(e) => setTechSupport(e.target.checked)}
              className="rounded text-teal-600 focus:ring-teal-500"
            />
            <span>Tech Support</span>
          </label>

          <label className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-700 cursor-pointer hover:bg-slate-100">
            <input
              type="checkbox"
              checked={onlineSecurity}
              onChange={(e) => setOnlineSecurity(e.target.checked)}
              className="rounded text-teal-600 focus:ring-teal-500"
            />
            <span>Security Addon</span>
          </label>

          <label className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-700 cursor-pointer hover:bg-slate-100">
            <input
              type="checkbox"
              checked={paperlessBilling}
              onChange={(e) => setPaperlessBilling(e.target.checked)}
              className="rounded text-teal-600 focus:ring-teal-500"
            />
            <span>Paperless Bill</span>
          </label>

          <label className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-700 cursor-pointer hover:bg-slate-100">
            <input
              type="checkbox"
              checked={seniorCitizen}
              onChange={(e) => setSeniorCitizen(e.target.checked)}
              className="rounded text-teal-600 focus:ring-teal-500"
            />
            <span>Senior Citizen</span>
          </label>
        </div>

        {/* Action Buttons */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            loading={isSubmitting}
            leftIcon={<UserPlus className="w-4 h-4" />}
          >
            Save to Database
          </Button>
        </div>
      </form>
    </Modal>
  )
}
