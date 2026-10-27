-- ============================================================================
-- CUSTOMER CHURN PREDICTION & RETENTION MANAGEMENT SYSTEM
-- Supabase PostgreSQL Database Schema & Row Level Security (RLS) Policies
-- Run this in your Supabase SQL Editor (Dashboard -> SQL Editor -> New Query)
-- ============================================================================

-- 1. CUSTOMERS TABLE
CREATE TABLE IF NOT EXISTS public.customers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    avatar_url TEXT,
    tenure INTEGER NOT NULL DEFAULT 1,
    monthly_charges NUMERIC(10, 2) NOT NULL DEFAULT 50.00,
    total_charges NUMERIC(10, 2) NOT NULL DEFAULT 50.00,
    contract TEXT NOT NULL DEFAULT 'Month-to-month',
    payment_method TEXT NOT NULL DEFAULT 'Electronic check',
    internet_service TEXT NOT NULL DEFAULT 'Fiber optic',
    tech_support BOOLEAN NOT NULL DEFAULT FALSE,
    online_security BOOLEAN NOT NULL DEFAULT FALSE,
    paperless_billing BOOLEAN NOT NULL DEFAULT TRUE,
    senior_citizen BOOLEAN NOT NULL DEFAULT FALSE,
    partner BOOLEAN NOT NULL DEFAULT FALSE,
    dependents BOOLEAN NOT NULL DEFAULT FALSE,
    churn_risk TEXT NOT NULL DEFAULT 'Low', -- 'High' | 'Medium' | 'Low'
    risk_score NUMERIC(5, 4) NOT NULL DEFAULT 0.15,
    prediction_confidence INTEGER NOT NULL DEFAULT 85,
    last_interaction_date DATE DEFAULT CURRENT_DATE,
    retention_status TEXT NOT NULL DEFAULT 'Not Contacted', -- 'Not Contacted' | 'In Campaign' | 'Retained' | 'Lost'
    assigned_campaign_id TEXT,
    suggested_action TEXT,
    factors JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. RETENTION CAMPAIGNS TABLE
CREATE TABLE IF NOT EXISTS public.retention_campaigns (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'Active', -- 'Active' | 'Scheduled' | 'Completed' | 'Draft'
    target_segment TEXT NOT NULL DEFAULT 'High Churn Risk Cohort',
    risk_tier TEXT NOT NULL DEFAULT 'High Risk',
    offer_type TEXT NOT NULL DEFAULT 'Discount (15-20%)',
    channel TEXT NOT NULL DEFAULT 'Email & SMS',
    target_count INTEGER NOT NULL DEFAULT 0,
    contacted_count INTEGER NOT NULL DEFAULT 0,
    retained_count INTEGER NOT NULL DEFAULT 0,
    spend NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    revenue_saved NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    launch_date DATE DEFAULT CURRENT_DATE,
    end_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. CHURN PREDICTIONS TABLE (ML Model Inference Audit & Simulator Logs)
CREATE TABLE IF NOT EXISTS public.churn_predictions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id TEXT REFERENCES public.customers(id) ON DELETE SET NULL,
    model_version TEXT NOT NULL DEFAULT 'v2.4-xgboost',
    risk_score NUMERIC(5, 4) NOT NULL,
    churn_risk TEXT NOT NULL, -- 'High' | 'Medium' | 'Low'
    prediction_confidence INTEGER NOT NULL,
    factors JSONB DEFAULT '[]'::jsonb,
    contract TEXT NOT NULL,
    tenure INTEGER NOT NULL,
    monthly_charges NUMERIC(10, 2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. CAMPAIGN RESULTS TABLE (Outreach Actions & Conversion Tracking)
CREATE TABLE IF NOT EXISTS public.campaign_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id TEXT REFERENCES public.retention_campaigns(id) ON DELETE CASCADE,
    customer_id TEXT REFERENCES public.customers(id) ON DELETE SET NULL,
    action_type TEXT NOT NULL, -- 'Outreach Sent', 'Offer Accepted', 'Retained', 'Lost'
    channel TEXT NOT NULL,
    revenue_impact NUMERIC(10, 2) DEFAULT 0.00,
    notes TEXT,
    recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Security requirement: Row Level Security must remain enabled on all tables.
-- Never expose service-role or secret keys in the browser!
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.retention_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.churn_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_results ENABLE ROW LEVEL SECURITY;

-- CUSTOMERS POLICIES:
-- 1. Allow read access to all users (anon and authenticated)
DROP POLICY IF EXISTS "Allow public read access on customers" ON public.customers;
CREATE POLICY "Allow public read access on customers" 
ON public.customers FOR SELECT 
USING (true);

-- 2. Allow insert/update/delete for users
DROP POLICY IF EXISTS "Allow insert on customers" ON public.customers;
CREATE POLICY "Allow insert on customers" 
ON public.customers FOR INSERT 
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow update on customers" ON public.customers;
CREATE POLICY "Allow update on customers" 
ON public.customers FOR UPDATE 
USING (true);

DROP POLICY IF EXISTS "Allow delete on customers" ON public.customers;
CREATE POLICY "Allow delete on customers" 
ON public.customers FOR DELETE 
USING (true);

-- RETENTION CAMPAIGNS POLICIES:
DROP POLICY IF EXISTS "Allow public read on retention_campaigns" ON public.retention_campaigns;
CREATE POLICY "Allow public read on retention_campaigns" 
ON public.retention_campaigns FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Allow insert on retention_campaigns" ON public.retention_campaigns;
CREATE POLICY "Allow insert on retention_campaigns" 
ON public.retention_campaigns FOR INSERT 
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow update on retention_campaigns" ON public.retention_campaigns;
CREATE POLICY "Allow update on retention_campaigns" 
ON public.retention_campaigns FOR UPDATE 
USING (true);

-- CHURN PREDICTIONS POLICIES:
DROP POLICY IF EXISTS "Allow public read on churn_predictions" ON public.churn_predictions;
CREATE POLICY "Allow public read on churn_predictions" 
ON public.churn_predictions FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Allow insert on churn_predictions" ON public.churn_predictions;
CREATE POLICY "Allow insert on churn_predictions" 
ON public.churn_predictions FOR INSERT 
WITH CHECK (true);

-- CAMPAIGN RESULTS POLICIES:
DROP POLICY IF EXISTS "Allow public read on campaign_results" ON public.campaign_results;
CREATE POLICY "Allow public read on campaign_results" 
ON public.campaign_results FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Allow insert on campaign_results" ON public.campaign_results;
CREATE POLICY "Allow insert on campaign_results" 
ON public.campaign_results FOR INSERT 
WITH CHECK (true);

-- ============================================================================
-- INITIAL SEED DATA
-- Populate initial demo campaigns and high-risk customer records
-- ============================================================================

INSERT INTO public.retention_campaigns (id, name, description, status, target_segment, risk_tier, offer_type, channel, target_count, contacted_count, retained_count, spend, revenue_saved, launch_date)
VALUES 
('CAMP-101', 'Q4 High-Risk Fiber Lock-in Sprint', 'Targeting month-to-month fiber customers with >0.85 churn risk offering 20% annual plan discount.', 'Active', 'Month-to-month Fiber Subscribers', 'High Risk', 'Discount (15-20%)', 'Email & SMS', 520, 480, 312, 12400.00, 68400.00, '2026-10-01'),
('CAMP-102', 'Early Tenure Care & Support Outreach', 'Proactive onboarding assistance and speed optimization check for 0-6 month new signups.', 'Active', 'New Subscribers (Tenure < 6m)', 'Medium Risk', 'Complimentary Tech Support', 'Direct Phone Call', 340, 290, 218, 8500.00, 42100.00, '2026-10-10'),
('CAMP-103', 'Loyalty Tier Renewal Incentive', 'Executive thank-you package and free hardware upgrade for customers crossing 24 months.', 'Active', 'Tenure 24+ Months', 'All At-Risk', 'Contract Renewal Perk', 'In-App Notification', 750, 610, 520, 15000.00, 89200.00, '2026-09-15')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.customers (
    id, name, email, phone, tenure, monthly_charges, total_charges, contract, 
    payment_method, internet_service, tech_support, online_security, paperless_billing, 
    senior_citizen, partner, dependents, churn_risk, risk_score, prediction_confidence, 
    last_interaction_date, retention_status, assigned_campaign_id, suggested_action, factors
) VALUES
(
    'CUST-8831', 'Eleanor Vance', 'eleanor.vance@example.com', '+1 (555) 234-8901', 3, 104.85, 314.55, 
    'Month-to-month', 'Electronic check', 'Fiber optic', FALSE, FALSE, TRUE, 
    FALSE, FALSE, FALSE, 'High', 0.92, 94, CURRENT_DATE - INTERVAL '3 days', 'Not Contacted', NULL, 
    'Offer 20% discount on 1-year contract lock-in with complimentary Tech Support.',
    '[{"factor": "Short Tenure (< 6 mos)", "impact": 35, "direction": "increases_risk", "description": "Early-stage customers have 4.2x higher churn velocity."}, {"factor": "Month-to-month Contract", "impact": 28, "direction": "increases_risk", "description": "No contractual lock-in creates low switching friction."}, {"factor": "No Tech Support / Security", "impact": 20, "direction": "increases_risk", "description": "Fiber optic without addon protection correlates with unresolved friction."}]'::jsonb
),
(
    'CUST-7742', 'Marcus Sterling', 'm.sterling@globex.org', '+1 (555) 491-3022', 5, 98.40, 492.00, 
    'Month-to-month', 'Electronic check', 'Fiber optic', FALSE, TRUE, TRUE, 
    FALSE, TRUE, FALSE, 'High', 0.88, 91, CURRENT_DATE - INTERVAL '1 day', 'In Campaign', 'CAMP-101', 
    'Escalate to dedicated retention manager with annual tier price match.',
    '[{"factor": "Month-to-month Contract", "impact": 32, "direction": "increases_risk", "description": "Immediate competitor promo targeting."}, {"factor": "High Monthly Bill ($98.40)", "impact": 24, "direction": "increases_risk", "description": "Price sensitivity index elevated."}]'::jsonb
),
(
    'CUST-6520', 'Sophia Chen', 'sophia.c@techforward.io', '+1 (555) 872-4411', 2, 89.20, 178.40, 
    'Month-to-month', 'Mailed check', 'DSL', FALSE, FALSE, FALSE, 
    FALSE, FALSE, FALSE, 'High', 0.84, 89, CURRENT_DATE - INTERVAL '5 days', 'Not Contacted', NULL, 
    'Offer free upgrade to Fiber with 6-month promotional rate and paperless billing incentive.',
    '[{"factor": "Very Low Tenure (2 mos)", "impact": 40, "direction": "increases_risk", "description": "Critical danger period before habit formation."}]'::jsonb
),
(
    'CUST-5409', 'David Rodriguez', 'david.rodriguez@email.net', '+1 (555) 319-7865', 14, 75.10, 1051.40, 
    'One year', 'Bank transfer', 'DSL', TRUE, TRUE, TRUE, 
    TRUE, TRUE, FALSE, 'Medium', 0.54, 82, CURRENT_DATE - INTERVAL '12 days', 'In Campaign', 'CAMP-102', 
    'Send proactive contract renewal notice before 1-year term expires with speed boost.',
    '[{"factor": "1-Year Contract Approaching End", "impact": 22, "direction": "increases_risk", "description": "Window of vulnerability at expiration."}]'::jsonb
),
(
    'CUST-4198', 'Amina Al-Mansoor', 'amina.mansoor@enterprise.co', '+1 (555) 604-9213', 28, 64.30, 1800.40, 
    'Two year', 'Credit card', 'DSL', TRUE, TRUE, TRUE, 
    FALSE, TRUE, TRUE, 'Low', 0.18, 96, CURRENT_DATE - INTERVAL '20 days', 'Retained', 'CAMP-103', 
    'Enroll in VIP loyalty program; request service testimonial.',
    '[{"factor": "Two-year Contract Security", "impact": 35, "direction": "decreases_risk", "description": "Lowest churn bracket in portfolio."}, {"factor": "Tenure > 2 Years", "impact": 30, "direction": "decreases_risk", "description": "Strong habitual service usage."}]'::jsonb
),
(
    'CUST-3312', 'Lucas Becker', 'lucas.becker@becker-labs.de', '+1 (555) 438-1129', 42, 112.50, 4725.00, 
    'Two year', 'Credit card', 'Fiber optic', TRUE, TRUE, TRUE, 
    FALSE, TRUE, FALSE, 'Low', 0.12, 98, CURRENT_DATE - INTERVAL '8 days', 'Retained', 'CAMP-103', 
    'Offer complimentary WiFi 7 gateway upgrade for high-value account.',
    '[{"factor": "42-Month Loyal Customer", "impact": 42, "direction": "decreases_risk", "description": "Highly invested in ecosystem."}]'::jsonb
),
(
    'CUST-2104', 'Rachel Green', 'rachel.g@centralperk.com', '+1 (555) 789-0123', 6, 84.50, 507.00, 
    'Month-to-month', 'Electronic check', 'Fiber optic', FALSE, TRUE, TRUE, 
    FALSE, FALSE, FALSE, 'High', 0.79, 87, CURRENT_DATE - INTERVAL '2 days', 'Not Contacted', NULL, 
    'Trigger SMS alert with 15% discount for switching to 1-year contract.',
    '[{"factor": "Early Tenure (6 mos)", "impact": 28, "direction": "increases_risk", "description": "Competitor promotional targeting."}]'::jsonb
),
(
    'CUST-1980', 'Kenji Sato', 'k.sato@nippon-tech.jp', '+1 (555) 654-3210', 58, 45.20, 2621.60, 
    'Two year', 'Bank transfer', 'DSL', TRUE, TRUE, FALSE, 
    TRUE, TRUE, TRUE, 'Low', 0.08, 99, CURRENT_DATE - INTERVAL '30 days', 'Retained', 'CAMP-103', 
    'Maintain standard relationship; send annual satisfaction survey.',
    '[{"factor": "58-Month Customer", "impact": 50, "direction": "decreases_risk", "description": "Extremely sticky long-term subscriber."}]'::jsonb
)
ON CONFLICT (id) DO NOTHING;

-- Seed sample campaign results
INSERT INTO public.campaign_results (campaign_id, customer_id, action_type, channel, revenue_impact, notes)
VALUES
('CAMP-101', 'CUST-7742', 'Outreach Sent', 'Email & SMS', 0.00, 'Sent 20% discount promo email'),
('CAMP-102', 'CUST-5409', 'Outreach Sent', 'Direct Phone Call', 0.00, 'Call scheduled with retention specialist'),
('CAMP-103', 'CUST-4198', 'Retained', 'In-App Notification', 771.60, 'Customer renewed 2-year contract successfully')
ON CONFLICT DO NOTHING;
