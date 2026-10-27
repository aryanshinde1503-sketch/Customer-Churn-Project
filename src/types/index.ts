export type RiskLevel = 'High' | 'Medium' | 'Low'
export type ContractType = 'Month-to-month' | 'One year' | 'Two year'
export type InternetServiceType = 'Fiber optic' | 'DSL' | 'No'
export type RetentionStatus = 'Not Contacted' | 'In Campaign' | 'Retained' | 'Lost'
export type CampaignStatus = 'Active' | 'Scheduled' | 'Completed' | 'Draft'

export interface RiskFactor {
  factor: string
  impact: number // percentage e.g. 35
  direction: 'increases_risk' | 'decreases_risk'
  description: string
}

export interface Customer {
  id: string
  name: string
  email: string
  phone: string
  avatarUrl?: string
  tenure: number // months
  monthlyCharges: number // USD
  totalCharges: number // USD
  contract: ContractType
  paymentMethod: 'Electronic check' | 'Mailed check' | 'Bank transfer' | 'Credit card'
  internetService: InternetServiceType
  techSupport: boolean
  onlineSecurity: boolean
  paperlessBilling: boolean
  seniorCitizen: boolean
  partner: boolean
  dependents: boolean
  churnRisk: RiskLevel
  riskScore: number // 0.00 to 1.00
  predictionConfidence: number // percentage e.g. 91
  lastInteractionDate: string
  retentionStatus: RetentionStatus
  assignedCampaignId?: string
  suggestedAction: string
  factors: RiskFactor[]
}

export interface RetentionCampaign {
  id: string
  name: string
  description: string
  status: CampaignStatus
  targetSegment: string
  riskTier: 'High Risk' | 'Medium Risk' | 'All At-Risk'
  offerType: 'Discount (15-20%)' | 'Free Speed Upgrade' | 'Complimentary Tech Support' | 'Contract Renewal Perk' | 'Loyalty Gift Box'
  channel: 'Email & SMS' | 'Direct Phone Call' | 'In-App Notification' | 'Executive Outreach'
  targetCount: number
  contactedCount: number
  retainedCount: number
  spend: number
  revenueSaved: number
  launchDate: string
  endDate?: string
}

export interface ChurnTrendPoint {
  month: string
  actualChurnRate: number // percentage
  predictedChurnRate: number // percentage
  activeCustomers: number
  churnedCount: number
  retainedCount: number
  revenueAtRisk: number
}

export interface RiskDistributionData {
  level: RiskLevel
  count: number
  percentage: number
  mrrAtRisk: number
  color: string
}

export interface FeatureImportance {
  feature: string
  importance: number // 0 to 1
  category: 'Contract' | 'Usage' | 'Demographics' | 'Services' | 'Billing'
}

export interface ModelMetrics {
  name: string
  version: string
  status: string
  lastTrained: string
  datasetRows: number
  featuresCount: number
  rocAuc: number
  precision: number
  recall: number
  f1Score: number
  accuracy: number
  featureImportances: FeatureImportance[]
  confusionMatrix: {
    truePositive: number
    falsePositive: number
    trueNegative: number
    falseNegative: number
  }
}

export interface RevenueAtRiskBreakdown {
  totalMRRAtRisk: number
  highRiskMRR: number
  mediumRiskMRR: number
  lowRiskMRR: number
  totalRevenueSaved: number
  byContract: { name: string; mrr: number; percentage: number }[]
  byService: { name: string; mrr: number; percentage: number }[]
  byTenureCohort: { cohort: string; mrr: number; customerCount: number }[]
}

export interface CustomerFilters {
  search: string
  riskLevel: 'All' | RiskLevel
  contractType: 'All' | ContractType
  internetService: 'All' | InternetServiceType
  retentionStatus: 'All' | RetentionStatus
  minTenure: number
  maxTenure: number
  minCharges: number
  maxCharges: number
  sortBy: 'riskScore' | 'monthlyCharges' | 'tenure' | 'name' | 'id'
  sortDirection: 'asc' | 'desc'
}

export type NavigationPage = 
  | 'dashboard' 
  | 'customers' 
  | 'predictions' 
  | 'campaigns' 
  | 'analytics' 
  | 'settings'

export interface ChurnPredictionRecord {
  id?: string
  customerId?: string
  modelVersion?: string
  riskScore: number
  churnRisk: RiskLevel
  predictionConfidence: number
  factors?: RiskFactor[]
  contract: ContractType
  tenure: number
  monthlyCharges: number
  createdAt?: string
}

export interface CampaignResult {
  id?: string
  campaignId: string
  customerId?: string
  actionType: string
  channel: string
  revenueImpact?: number
  notes?: string
  recordedAt?: string
}

