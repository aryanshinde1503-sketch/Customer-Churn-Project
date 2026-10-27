import {
  Customer,
  CustomerFilters,
  RetentionCampaign,
  RetentionStatus,
  ContractType,
  InternetServiceType,
  RiskLevel,
  RiskFactor,
  ChurnPredictionRecord,
  CampaignResult,
} from '../types'
import {
  DEMO_CUSTOMERS,
  DEMO_CHURN_TRENDS,
  DEMO_RISK_DISTRIBUTION,
  DEMO_CAMPAIGNS,
  DEMO_MODEL_METRICS,
  DEMO_REVENUE_AT_RISK,
  DEMO_COHORT_RETENTION,
} from '../data/mockData'
import { supabase, isSupabaseConfigured } from '../lib/supabase'

/**
 * ============================================================================
 * CUSTOMER CHURN SYSTEM - HYBRID SERVICE LAYER
 * 
 * Supports both:
 * 1. Live Supabase PostgreSQL database tables:
 *    - public.customers
 *    - public.retention_campaigns
 *    - public.churn_predictions
 *    - public.campaign_results
 * 2. Graceful offline/demo fallback when Supabase is not yet configured or tables are loading.
 * ============================================================================
 */

// In-memory state for offline/demo fallback
let customersState: Customer[] = [...DEMO_CUSTOMERS]
let campaignsState: RetentionCampaign[] = [...DEMO_CAMPAIGNS]

// DB <-> Frontend Mappers
function mapDbToCustomer(row: any): Customer {
  return {
    id: row.id,
    name: row.name || 'Unnamed Subscriber',
    email: row.email || '',
    phone: row.phone || '',
    avatarUrl: row.avatar_url,
    tenure: Number(row.tenure ?? 1),
    monthlyCharges: Number(row.monthly_charges ?? row.monthlyCharges ?? 0),
    totalCharges: Number(row.total_charges ?? row.totalCharges ?? 0),
    contract: (row.contract as ContractType) || 'Month-to-month',
    paymentMethod: row.payment_method || row.paymentMethod || 'Electronic check',
    internetService: (row.internet_service || row.internetService || 'Fiber optic') as InternetServiceType,
    techSupport: Boolean(row.tech_support ?? row.techSupport ?? false),
    onlineSecurity: Boolean(row.online_security ?? row.onlineSecurity ?? false),
    paperlessBilling: Boolean(row.paperless_billing ?? row.paperlessBilling ?? true),
    seniorCitizen: Boolean(row.senior_citizen ?? row.seniorCitizen ?? false),
    partner: Boolean(row.partner ?? false),
    dependents: Boolean(row.dependents ?? false),
    churnRisk: (row.churn_risk || row.churnRisk || 'Low') as RiskLevel,
    riskScore: Number(row.risk_score ?? row.riskScore ?? 0.15),
    predictionConfidence: Number(row.prediction_confidence ?? row.predictionConfidence ?? 85),
    lastInteractionDate: row.last_interaction_date || row.lastInteractionDate || new Date().toISOString().split('T')[0],
    retentionStatus: (row.retention_status || row.retentionStatus || 'Not Contacted') as RetentionStatus,
    assignedCampaignId: row.assigned_campaign_id || row.assignedCampaignId || undefined,
    suggestedAction: row.suggested_action || row.suggestedAction || 'Review account and assess retention eligibility.',
    factors: Array.isArray(row.factors) ? row.factors : [],
  }
}

function mapCustomerToDb(c: Partial<Customer>): Record<string, any> {
  const db: Record<string, any> = {}
  if (c.id !== undefined) db.id = c.id
  if (c.name !== undefined) db.name = c.name
  if (c.email !== undefined) db.email = c.email
  if (c.phone !== undefined) db.phone = c.phone
  if (c.avatarUrl !== undefined) db.avatar_url = c.avatarUrl
  if (c.tenure !== undefined) db.tenure = c.tenure
  if (c.monthlyCharges !== undefined) db.monthly_charges = c.monthlyCharges
  if (c.totalCharges !== undefined) db.total_charges = c.totalCharges
  if (c.contract !== undefined) db.contract = c.contract
  if (c.paymentMethod !== undefined) db.payment_method = c.paymentMethod
  if (c.internetService !== undefined) db.internet_service = c.internetService
  if (c.techSupport !== undefined) db.tech_support = c.techSupport
  if (c.onlineSecurity !== undefined) db.online_security = c.onlineSecurity
  if (c.paperlessBilling !== undefined) db.paperless_billing = c.paperlessBilling
  if (c.seniorCitizen !== undefined) db.senior_citizen = c.seniorCitizen
  if (c.partner !== undefined) db.partner = c.partner
  if (c.dependents !== undefined) db.dependents = c.dependents
  if (c.churnRisk !== undefined) db.churn_risk = c.churnRisk
  if (c.riskScore !== undefined) db.risk_score = c.riskScore
  if (c.predictionConfidence !== undefined) db.prediction_confidence = c.predictionConfidence
  if (c.lastInteractionDate !== undefined) db.last_interaction_date = c.lastInteractionDate
  if (c.retentionStatus !== undefined) db.retention_status = c.retentionStatus
  if (c.assignedCampaignId !== undefined) db.assigned_campaign_id = c.assignedCampaignId
  if (c.suggestedAction !== undefined) db.suggested_action = c.suggestedAction
  if (c.factors !== undefined) db.factors = c.factors
  return db
}

function mapDbToCampaign(row: any): RetentionCampaign {
  return {
    id: row.id,
    name: row.name,
    description: row.description || '',
    status: row.status,
    targetSegment: row.target_segment || row.targetSegment || 'All At-Risk',
    riskTier: row.risk_tier || row.riskTier || 'High Risk',
    offerType: row.offer_type || row.offerType || 'Discount (15-20%)',
    channel: row.channel || 'Email & SMS',
    targetCount: Number(row.target_count ?? row.targetCount ?? 0),
    contactedCount: Number(row.contacted_count ?? row.contactedCount ?? 0),
    retainedCount: Number(row.retained_count ?? row.retainedCount ?? 0),
    spend: Number(row.spend ?? 0),
    revenueSaved: Number(row.revenue_saved ?? row.revenueSaved ?? 0),
    launchDate: row.launch_date || row.launchDate || new Date().toISOString().split('T')[0],
    endDate: row.end_date || row.endDate || undefined,
  }
}

function mapCampaignToDb(c: Partial<RetentionCampaign>): Record<string, any> {
  const db: Record<string, any> = {}
  if (c.id !== undefined) db.id = c.id
  if (c.name !== undefined) db.name = c.name
  if (c.description !== undefined) db.description = c.description
  if (c.status !== undefined) db.status = c.status
  if (c.targetSegment !== undefined) db.target_segment = c.targetSegment
  if (c.riskTier !== undefined) db.risk_tier = c.riskTier
  if (c.offerType !== undefined) db.offer_type = c.offerType
  if (c.channel !== undefined) db.channel = c.channel
  if (c.targetCount !== undefined) db.target_count = c.targetCount
  if (c.contactedCount !== undefined) db.contacted_count = c.contactedCount
  if (c.retainedCount !== undefined) db.retained_count = c.retainedCount
  if (c.spend !== undefined) db.spend = c.spend
  if (c.revenueSaved !== undefined) db.revenue_saved = c.revenueSaved
  if (c.launchDate !== undefined) db.launch_date = c.launchDate
  if (c.endDate !== undefined) db.end_date = c.endDate
  return db
}

export const customerService = {
  isLiveSupabase(): boolean {
    return isSupabaseConfigured()
  },

  /**
   * Fetches filtered, searched, and sorted customers from public.customers
   */
  async getCustomers(filters: CustomerFilters): Promise<{ 
    customers: Customer[]
    totalCount: number
    isLive: boolean
    error?: string 
  }> {
    if (isSupabaseConfigured()) {
      try {
        let query = supabase.from('customers').select('*', { count: 'exact' })

        // 1. Search
        if (filters.search && filters.search.trim() !== '') {
          const q = filters.search.trim()
          query = query.or(`name.ilike.%${q}%,email.ilike.%${q}%,id.ilike.%${q}%,phone.ilike.%${q}%`)
        }

        // 2. Risk Level filter
        if (filters.riskLevel !== 'All') {
          query = query.eq('churn_risk', filters.riskLevel)
        }

        // 3. Contract filter
        if (filters.contractType !== 'All') {
          query = query.eq('contract', filters.contractType)
        }

        // 4. Internet Service filter
        if (filters.internetService !== 'All') {
          query = query.eq('internet_service', filters.internetService)
        }

        // 5. Retention Status filter
        if (filters.retentionStatus !== 'All') {
          query = query.eq('retention_status', filters.retentionStatus)
        }

        // 6. Tenure Range filter
        if (filters.minTenure > 0) {
          query = query.gte('tenure', filters.minTenure)
        }
        if (filters.maxTenure < 72) {
          query = query.lte('tenure', filters.maxTenure)
        }

        // 7. Monthly Charges Range filter
        if (filters.minCharges > 0) {
          query = query.gte('monthly_charges', filters.minCharges)
        }
        if (filters.maxCharges < 150) {
          query = query.lte('monthly_charges', filters.maxCharges)
        }

        // 8. Sorting
        const sortColumnMap: Record<string, string> = {
          riskScore: 'risk_score',
          monthlyCharges: 'monthly_charges',
          tenure: 'tenure',
          name: 'name',
          id: 'id',
        }
        const dbSortCol = sortColumnMap[filters.sortBy] || 'risk_score'
        query = query.order(dbSortCol, { ascending: filters.sortDirection === 'asc' })

        const { data, count, error } = await query

        if (error) {
          console.warn('Supabase getCustomers returned error:', error.message)
          return {
            customers: [],
            totalCount: 0,
            isLive: true,
            error: error.message,
          }
        }

        const mapped = (data || []).map(mapDbToCustomer)
        return {
          customers: mapped,
          totalCount: count ?? mapped.length,
          isLive: true,
        }
      } catch (err: any) {
        console.error('Failed to query Supabase customers:', err)
        return {
          customers: [],
          totalCount: 0,
          isLive: true,
          error: err?.message || 'Database error occurred',
        }
      }
    }

    // Offline / Demo Fallback Mode
    await new Promise((resolve) => setTimeout(resolve, 60))
    let result = [...customersState]

    if (filters.search && filters.search.trim() !== '') {
      const q = filters.search.toLowerCase().trim()
      result = result.filter(
        (c) =>
          c.id.toLowerCase().includes(q) ||
          c.name.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          c.phone.toLowerCase().includes(q)
      )
    }

    if (filters.riskLevel !== 'All') {
      result = result.filter((c) => c.churnRisk === filters.riskLevel)
    }
    if (filters.contractType !== 'All') {
      result = result.filter((c) => c.contract === filters.contractType)
    }
    if (filters.internetService !== 'All') {
      result = result.filter((c) => c.internetService === filters.internetService)
    }
    if (filters.retentionStatus !== 'All') {
      result = result.filter((c) => c.retentionStatus === filters.retentionStatus)
    }
    if (filters.minTenure > 0) {
      result = result.filter((c) => c.tenure >= filters.minTenure)
    }
    if (filters.maxTenure < 72) {
      result = result.filter((c) => c.tenure <= filters.maxTenure)
    }
    if (filters.minCharges > 0) {
      result = result.filter((c) => c.monthlyCharges >= filters.minCharges)
    }
    if (filters.maxCharges < 150) {
      result = result.filter((c) => c.monthlyCharges <= filters.maxCharges)
    }

    result.sort((a, b) => {
      let valA: string | number = a[filters.sortBy]
      let valB: string | number = b[filters.sortBy]

      if (typeof valA === 'string') {
        valA = valA.toLowerCase()
        valB = (valB as string).toLowerCase()
      }

      if (valA < valB) return filters.sortDirection === 'asc' ? -1 : 1
      if (valA > valB) return filters.sortDirection === 'asc' ? 1 : -1
      return 0
    })

    return {
      customers: result,
      totalCount: result.length,
      isLive: false,
    }
  },

  /**
   * Fetches single customer by ID
   */
  async getCustomerById(id: string): Promise<Customer | undefined> {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.from('customers').select('*').eq('id', id).single()
        if (!error && data) {
          return mapDbToCustomer(data)
        }
      } catch (err) {
        console.error('Supabase getCustomerById error:', err)
      }
    }
    return customersState.find((c) => c.id === id)
  },

  /**
   * CREATE: Adds a new customer to public.customers
   */
  async createCustomer(customer: Omit<Customer, 'id'> & { id?: string }): Promise<{ customer: Customer; error?: string }> {
    const newId = customer.id || `CUST-${Math.floor(1000 + Math.random() * 9000)}`
    const fullCustomer: Customer = {
      ...customer,
      id: newId,
      totalCharges: customer.totalCharges || customer.monthlyCharges * customer.tenure,
      factors: customer.factors || [],
      lastInteractionDate: customer.lastInteractionDate || new Date().toISOString().split('T')[0],
      retentionStatus: customer.retentionStatus || 'Not Contacted',
      suggestedAction: customer.suggestedAction || 'Review customer profile and schedule proactive engagement.',
    }

    if (isSupabaseConfigured()) {
      try {
        const dbRow = mapCustomerToDb(fullCustomer)
        const { data, error } = await supabase.from('customers').insert([dbRow]).select().single()
        if (error) {
          return { customer: fullCustomer, error: error.message }
        }
        return { customer: mapDbToCustomer(data) }
      } catch (err: any) {
        return { customer: fullCustomer, error: err?.message || 'Failed to insert customer' }
      }
    }

    // In-memory fallback
    customersState = [fullCustomer, ...customersState]
    return { customer: fullCustomer }
  },

  /**
   * UPDATE: Updates customer record in public.customers
   */
  async updateCustomer(id: string, updates: Partial<Customer>): Promise<{ customer?: Customer; error?: string }> {
    if (isSupabaseConfigured()) {
      try {
        const dbUpdates = mapCustomerToDb(updates)
        dbUpdates.updated_at = new Date().toISOString()
        const { data, error } = await supabase.from('customers').update(dbUpdates).eq('id', id).select().single()
        if (error) {
          return { error: error.message }
        }
        return { customer: mapDbToCustomer(data) }
      } catch (err: any) {
        return { error: err?.message || 'Failed to update customer' }
      }
    }

    // In-memory fallback
    const idx = customersState.findIndex((c) => c.id === id)
    if (idx !== -1) {
      customersState[idx] = { ...customersState[idx], ...updates }
      return { customer: customersState[idx] }
    }
    return { error: 'Customer not found' }
  },

  /**
   * DELETE: Deletes customer from public.customers
   */
  async deleteCustomer(id: string): Promise<{ success: boolean; error?: string }> {
    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase.from('customers').delete().eq('id', id)
        if (error) {
          return { success: false, error: error.message }
        }
        return { success: true }
      } catch (err: any) {
        return { success: false, error: err?.message || 'Failed to delete customer' }
      }
    }

    // In-memory fallback
    customersState = customersState.filter((c) => c.id !== id)
    return { success: true }
  },

  /**
   * Updates customer retention status & campaign enrollment
   */
  async updateCustomerStatus(
    id: string,
    status: RetentionStatus,
    campaignId?: string
  ): Promise<Customer | undefined> {
    const updates: Partial<Customer> = {
      retentionStatus: status,
      lastInteractionDate: new Date().toISOString().split('T')[0],
    }
    if (campaignId) {
      updates.assignedCampaignId = campaignId
    }

    const res = await this.updateCustomer(id, updates)
    if (res.customer) {
      // Also log action in campaign_results table if campaignId is present
      if (campaignId) {
        await this.recordCampaignResult({
          campaignId,
          customerId: id,
          actionType: status === 'Retained' ? 'Retained' : 'Outreach Sent',
          channel: 'Direct Outreach',
          notes: `Status changed to ${status}`,
        })
      }
      return res.customer
    }
    return undefined
  },

  /**
   * Seed demo customers into live Supabase database
   */
  async seedDemoCustomersToSupabase(): Promise<{ count: number; error?: string }> {
    if (!isSupabaseConfigured()) {
      return { count: 0, error: 'Supabase credentials not configured in .env.local' }
    }

    try {
      const rows = DEMO_CUSTOMERS.map(mapCustomerToDb)
      const { data, error } = await supabase.from('customers').upsert(rows, { onConflict: 'id' }).select()
      if (error) {
        return { count: 0, error: error.message }
      }
      return { count: data?.length || rows.length }
    } catch (err: any) {
      return { count: 0, error: err?.message || 'Failed to seed customers' }
    }
  },

  /**
   * Fetches campaigns from public.retention_campaigns
   */
  async getCampaigns(): Promise<RetentionCampaign[]> {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.from('retention_campaigns').select('*').order('created_at', { ascending: false })
        if (!error && data && data.length > 0) {
          return data.map(mapDbToCampaign)
        }
      } catch (err) {
        console.error('Supabase getCampaigns error:', err)
      }
    }
    return [...campaignsState]
  },

  /**
   * Creates a new retention campaign in public.retention_campaigns
   */
  async createCampaign(
    data: Omit<RetentionCampaign, 'id' | 'contactedCount' | 'retainedCount' | 'revenueSaved'>
  ): Promise<RetentionCampaign> {
    const newId = `CAMP-${100 + campaignsState.length + 1}`
    const newCampaign: RetentionCampaign = {
      ...data,
      id: newId,
      contactedCount: 0,
      retainedCount: 0,
      revenueSaved: 0,
    }

    if (isSupabaseConfigured()) {
      try {
        const dbRow = mapCampaignToDb(newCampaign)
        const { data: inserted, error } = await supabase.from('retention_campaigns').insert([dbRow]).select().single()
        if (!error && inserted) {
          return mapDbToCampaign(inserted)
        }
      } catch (err) {
        console.error('Supabase createCampaign error:', err)
      }
    }

    campaignsState = [newCampaign, ...campaignsState]
    return newCampaign
  },

  /**
   * RECORD CHURN PREDICTION: Saves inference audit into public.churn_predictions
   */
  async recordChurnPrediction(prediction: ChurnPredictionRecord): Promise<{ success: boolean; id?: string }> {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.from('churn_predictions').insert([{
          customer_id: prediction.customerId || null,
          model_version: prediction.modelVersion || 'v2.4-xgboost',
          risk_score: prediction.riskScore,
          churn_risk: prediction.churnRisk,
          prediction_confidence: prediction.predictionConfidence,
          factors: prediction.factors || [],
          contract: prediction.contract,
          tenure: prediction.tenure,
          monthly_charges: prediction.monthlyCharges,
        }]).select('id').single()

        if (!error && data) {
          return { success: true, id: data.id }
        }
      } catch (err) {
        console.error('Failed to log churn prediction:', err)
      }
    }
    return { success: true }
  },

  /**
   * RECORD CAMPAIGN RESULT: Saves outreach action into public.campaign_results
   */
  async recordCampaignResult(result: CampaignResult): Promise<{ success: boolean; id?: string }> {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.from('campaign_results').insert([{
          campaign_id: result.campaignId,
          customer_id: result.customerId || null,
          action_type: result.actionType,
          channel: result.channel,
          revenue_impact: result.revenueImpact || 0,
          notes: result.notes || '',
        }]).select('id').single()

        if (!error && data) {
          return { success: true, id: data.id }
        }
      } catch (err) {
        console.error('Failed to log campaign result:', err)
      }
    }
    return { success: true }
  },

  /**
   * Fetches campaign results history from public.campaign_results
   */
  async getCampaignResults(campaignId?: string): Promise<CampaignResult[]> {
    if (isSupabaseConfigured()) {
      try {
        let q = supabase.from('campaign_results').select('*').order('recorded_at', { ascending: false }).limit(20)
        if (campaignId) {
          q = q.eq('campaign_id', campaignId)
        }
        const { data, error } = await q
        if (!error && data) {
          return data.map((r: any) => ({
            id: r.id,
            campaignId: r.campaign_id,
            customerId: r.customer_id,
            actionType: r.action_type,
            channel: r.channel,
            revenueImpact: Number(r.revenue_impact || 0),
            notes: r.notes,
            recordedAt: r.recorded_at,
          }))
        }
      } catch (err) {
        console.error('Failed to get campaign results:', err)
      }
    }
    return []
  },

  /**
   * Fetches dashboard metric overview
   */
  async getDashboardSummary() {
    await new Promise((resolve) => setTimeout(resolve, 50))
    const highRiskCustomers = customersState.filter((c) => c.churnRisk === 'High')
    const totalMRRHighRisk = highRiskCustomers.reduce((acc, curr) => acc + curr.monthlyCharges, 0)

    return {
      totalCustomers: 7043,
      activeTracked: customersState.length,
      predictedChurnRate: 21.8,
      churnRateDelta: -1.2,
      highRiskCount: 1869,
      highRiskPercentage: 26.5,
      highRiskMRR: 168210,
      sampleHighRiskCount: highRiskCustomers.length,
      sampleHighRiskMRR: totalMRRHighRisk,
      customersRetainedQuarter: 642,
      retentionRatePercentage: 74.8,
      revenueSavedQuarter: 276500,
    }
  },

  async getChurnTrends() {
    return DEMO_CHURN_TRENDS
  },

  async getRiskDistribution() {
    return DEMO_RISK_DISTRIBUTION
  },

  async getModelMetrics() {
    return DEMO_MODEL_METRICS
  },

  async getRevenueAtRisk() {
    return DEMO_REVENUE_AT_RISK
  },

  async getCohortRetention() {
    return DEMO_COHORT_RETENTION
  },

  /**
   * Interactive Churn Risk Simulator
   */
  simulateChurnRisk(params: {
    contract: ContractType
    tenure: number
    monthlyCharges: number
    internetService: InternetServiceType
    techSupport: boolean
    onlineSecurity: boolean
    paperlessBilling: boolean
  }): {
    riskScore: number
    churnRisk: RiskLevel
    predictionConfidence: number
    factors: RiskFactor[]
  } {
    let score = 0.40

    const factors: RiskFactor[] = []

    if (params.contract === 'Month-to-month') {
      score += 0.32
      factors.push({
        factor: 'Month-to-month Contract',
        impact: 32,
        direction: 'increases_risk',
        description: 'No contractual lock-in; highest churn driver in telco analytics.',
      })
    } else if (params.contract === 'One year') {
      score -= 0.12
      factors.push({
        factor: '1-Year Contract Lock',
        impact: 12,
        direction: 'decreases_risk',
        description: 'Fixed term dampens immediate flight tendency.',
      })
    } else if (params.contract === 'Two year') {
      score -= 0.28
      factors.push({
        factor: '2-Year Contract Security',
        impact: 28,
        direction: 'decreases_risk',
        description: 'Longest commitment tier has lowest historic churn propensity.',
      })
    }

    if (params.tenure <= 6) {
      score += 0.24
      factors.push({
        factor: `Critical Early Tenure (${params.tenure} mos)`,
        impact: 24,
        direction: 'increases_risk',
        description: 'Customers in first 6 months have 4x higher defection rates.',
      })
    } else if (params.tenure <= 18) {
      score += 0.08
    } else if (params.tenure >= 48) {
      score -= 0.22
      factors.push({
        factor: `High Customer Loyalty (${params.tenure} mos)`,
        impact: 22,
        direction: 'decreases_risk',
        description: 'Habitual usage creates strong brand inertia.',
      })
    }

    if (params.monthlyCharges >= 95) {
      score += 0.14
      factors.push({
        factor: `Premium Tier Bill ($${params.monthlyCharges.toFixed(2)}/mo)`,
        impact: 14,
        direction: 'increases_risk',
        description: 'Price elasticity is high for premium unbundled plans.',
      })
    } else if (params.monthlyCharges <= 50) {
      score -= 0.10
      factors.push({
        factor: `Budget-Friendly Bill ($${params.monthlyCharges.toFixed(2)}/mo)`,
        impact: 10,
        direction: 'decreases_risk',
        description: 'Lower bills reduce monthly billing friction.',
      })
    }

    if (params.internetService === 'Fiber optic') {
      score += 0.08
      factors.push({
        factor: 'Fiber Optic Service (Competitive Market)',
        impact: 8,
        direction: 'increases_risk',
        description: 'Targeted heavily by competitor gigabit marketing promos.',
      })
    } else if (params.internetService === 'No') {
      score -= 0.14
      factors.push({
        factor: 'Voice-Only / No Internet',
        impact: 14,
        direction: 'decreases_risk',
        description: 'Simple service with very low complaint frequency.',
      })
    }

    if (!params.techSupport && params.internetService !== 'No') {
      score += 0.10
      factors.push({
        factor: 'Absence of Tech Support',
        impact: 10,
        direction: 'increases_risk',
        description: 'Unassisted technical issues accelerate churn decisions.',
      })
    } else if (params.techSupport) {
      score -= 0.08
      factors.push({
        factor: 'Tech Support Active',
        impact: 8,
        direction: 'decreases_risk',
        description: 'Support contact reinforces customer satisfaction.',
      })
    }

    if (params.onlineSecurity) {
      score -= 0.07
      factors.push({
        factor: 'Online Security Add-on',
        impact: 7,
        direction: 'decreases_risk',
        description: 'Protection features enhance perceived product value.',
      })
    }

    if (params.paperlessBilling && params.contract === 'Month-to-month') {
      score += 0.04
    }

    score = Math.max(0.03, Math.min(0.98, score))
    const roundedScore = Number(score.toFixed(2))

    let churnRisk: RiskLevel = 'Low'
    if (roundedScore >= 0.70) {
      churnRisk = 'High'
    } else if (roundedScore >= 0.40) {
      churnRisk = 'Medium'
    }

    const confidence = Math.min(99, Math.max(78, Math.round(80 + Math.abs(roundedScore - 0.5) * 35)))

    return {
      riskScore: roundedScore,
      churnRisk,
      predictionConfidence: confidence,
      factors,
    }
  },
}
