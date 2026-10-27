import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://wnoswnkmrmpjdxtqkxns.supabase.co'
const rawPublishableKey = 
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 
  import.meta.env.VITE_SUPABASE_ANON_KEY || 
  ''

export const isSupabaseConfigured = (): boolean => {
  return (
    Boolean(supabaseUrl) &&
    Boolean(rawPublishableKey) &&
    rawPublishableKey.trim() !== '' &&
    rawPublishableKey !== 'PASTE_MY_PUBLISHABLE_KEY_HERE' &&
    rawPublishableKey !== 'your_supabase_publishable_or_anon_key_here'
  )
}

// Fallback dummy key to prevent immediate module crash if key is not yet configured
const publishableKey = isSupabaseConfigured() 
  ? rawPublishableKey 
  : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.dummy-unconfigured-key'

export const supabase: SupabaseClient = createClient(supabaseUrl, publishableKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})

/**
 * Health check helper to test connection and verify if the tables exist
 */
export async function testSupabaseConnection(): Promise<{
  connected: boolean
  configured: boolean
  error?: string
  tables?: {
    customers: boolean
    churn_predictions: boolean
    retention_campaigns: boolean
    campaign_results: boolean
  }
}> {
  if (!isSupabaseConfigured()) {
    return {
      connected: false,
      configured: false,
      error: 'Publishable key not set in .env.local',
    }
  }

  const tableStatus = {
    customers: false,
    churn_predictions: false,
    retention_campaigns: false,
    campaign_results: false,
  }

  try {
    // 1. Check customers table
    const { error: custErr } = await supabase.from('customers').select('id').limit(1)
    tableStatus.customers = !custErr

    // 2. Check retention_campaigns table
    const { error: campErr } = await supabase.from('retention_campaigns').select('id').limit(1)
    tableStatus.retention_campaigns = !campErr

    // 3. Check churn_predictions table
    const { error: predErr } = await supabase.from('churn_predictions').select('id').limit(1)
    tableStatus.churn_predictions = !predErr

    // 4. Check campaign_results table
    const { error: resErr } = await supabase.from('campaign_results').select('id').limit(1)
    tableStatus.campaign_results = !resErr

    const anySuccess = Object.values(tableStatus).some(Boolean)
    return {
      connected: anySuccess,
      configured: true,
      tables: tableStatus,
      error: custErr ? custErr.message : undefined,
    }
  } catch (err: any) {
    return {
      connected: false,
      configured: true,
      error: err?.message || 'Failed to connect to Supabase',
      tables: tableStatus,
    }
  }
}
