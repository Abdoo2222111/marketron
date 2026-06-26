-- ============================================================
-- منصة التسويق الإلكتروني - مخطط قاعدة البيانات (SQL Backup)
-- Marketing Platform Database Schema
--
-- يمكن استيراد هذا الملف في Supabase SQL Editor
-- لإنشاء الجداول يدوياً إذا لم تستخدم Prisma Migrate
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. المستخدمون والمصادقة (Users & Auth)
-- ============================================================

CREATE TYPE public."UserRole" AS ENUM ('admin', 'user', 'client');

CREATE TABLE public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    password_hash VARCHAR(255) NOT NULL,
    role public."UserRole" NOT NULL DEFAULT 'client',
    avatar TEXT,
    company VARCHAR(255),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.client_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    company_name VARCHAR(255),
    company_size VARCHAR(100),
    industry VARCHAR(255),
    country VARCHAR(100),
    city VARCHAR(100),
    vat_number VARCHAR(100),
    logo TEXT,
    settings JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 2. فرق العمل (Teams)
-- ============================================================

CREATE TYPE public."TeamMemberRole" AS ENUM ('owner', 'admin', 'editor', 'viewer');
CREATE TYPE public."TeamMemberStatus" AS ENUM ('pending', 'active', 'invited');

CREATE TABLE public.teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    owner_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.team_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    role public."TeamMemberRole" NOT NULL DEFAULT 'viewer',
    status public."TeamMemberStatus" NOT NULL DEFAULT 'pending',
    invited_email VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 3. ربط المنصات الإعلانية (Platform Connections)
-- ============================================================

CREATE TYPE public."PlatformType" AS ENUM ('facebook', 'instagram', 'tiktok', 'snapchat');

CREATE TABLE public.platform_connections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    platform public."PlatformType" NOT NULL,
    access_token TEXT NOT NULL,
    refresh_token TEXT,
    token_expires_at TIMESTAMPTZ,
    platform_account_id VARCHAR(255) NOT NULL,
    platform_account_name VARCHAR(255),
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 4. الحملات الإعلانية (Campaigns & Ads)
-- ============================================================

CREATE TYPE public."CampaignObjective" AS ENUM ('awareness', 'traffic', 'conversions', 'sales', 'engagement');
CREATE TYPE public."CampaignStatus" AS ENUM ('draft', 'active', 'paused', 'completed');
CREATE TYPE public."BudgetType" AS ENUM ('daily', 'lifetime');

CREATE TABLE public.campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL,
    platform public."PlatformType" NOT NULL,
    name VARCHAR(255) NOT NULL,
    objective public."CampaignObjective" NOT NULL DEFAULT 'awareness',
    status public."CampaignStatus" NOT NULL DEFAULT 'draft',
    budget_type public."BudgetType" NOT NULL DEFAULT 'daily',
    budget_amount FLOAT,
    budget_currency VARCHAR(10) NOT NULL DEFAULT 'USD',
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    target_country VARCHAR(100),
    target_age_min INT,
    target_age_max INT,
    target_gender VARCHAR(20),
    target_interests JSONB,
    creative_text TEXT,
    creative_headline VARCHAR(255),
    creative_cta VARCHAR(100),
    creative_image_url TEXT,
    creative_video_url TEXT,
    platform_campaign_id VARCHAR(255),
    impressions BIGINT NOT NULL DEFAULT 0,
    clicks BIGINT NOT NULL DEFAULT 0,
    conversions BIGINT NOT NULL DEFAULT 0,
    spend FLOAT NOT NULL DEFAULT 0,
    ctr FLOAT NOT NULL DEFAULT 0,
    cpc FLOAT NOT NULL DEFAULT 0,
    cpm FLOAT NOT NULL DEFAULT 0,
    cpa FLOAT NOT NULL DEFAULT 0,
    roas FLOAT NOT NULL DEFAULT 0,
    revenue FLOAT NOT NULL DEFAULT 0,
    last_synced_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_campaigns_user_id ON public.campaigns(user_id);
CREATE INDEX idx_campaigns_team_id ON public.campaigns(team_id);
CREATE INDEX idx_campaigns_status ON public.campaigns(status);
CREATE INDEX idx_campaigns_platform ON public.campaigns(platform);

CREATE TABLE public.ads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
    platform public."PlatformType" NOT NULL,
    name VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    creative_text TEXT,
    creative_headline VARCHAR(255),
    creative_cta VARCHAR(100),
    creative_image_url TEXT,
    creative_video_url TEXT,
    platform_ad_id VARCHAR(255),
    impressions BIGINT NOT NULL DEFAULT 0,
    clicks BIGINT NOT NULL DEFAULT 0,
    conversions BIGINT NOT NULL DEFAULT 0,
    spend FLOAT NOT NULL DEFAULT 0,
    ctr FLOAT NOT NULL DEFAULT 0,
    cpc FLOAT NOT NULL DEFAULT 0,
    cpm FLOAT NOT NULL DEFAULT 0,
    cpa FLOAT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ads_campaign_id ON public.ads(campaign_id);

CREATE TABLE public.ad_snapshots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
    ad_id UUID REFERENCES public.ads(id) ON DELETE SET NULL,
    platform public."PlatformType" NOT NULL,
    date TIMESTAMPTZ NOT NULL,
    impressions BIGINT NOT NULL DEFAULT 0,
    clicks BIGINT NOT NULL DEFAULT 0,
    conversions BIGINT NOT NULL DEFAULT 0,
    spend FLOAT NOT NULL DEFAULT 0,
    ctr FLOAT NOT NULL DEFAULT 0,
    cpc FLOAT NOT NULL DEFAULT 0,
    cpm FLOAT NOT NULL DEFAULT 0,
    cpa FLOAT NOT NULL DEFAULT 0,
    revenue FLOAT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ad_snapshots_campaign_id ON public.ad_snapshots(campaign_id);
CREATE INDEX idx_ad_snapshots_date ON public.ad_snapshots(date);

-- ============================================================
-- 5. المحتوى (Content)
-- ============================================================

CREATE TYPE public."ContentType" AS ENUM ('image', 'video', 'text', 'template');

CREATE TABLE public.contents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    type public."ContentType" NOT NULL,
    platform public."PlatformType",
    title VARCHAR(255),
    description TEXT,
    file_url TEXT NOT NULL,
    thumbnail_url TEXT,
    file_size INT,
    tags JSONB DEFAULT '[]'::jsonb,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_contents_user_id ON public.contents(user_id);
CREATE INDEX idx_contents_type ON public.contents(type);

-- ============================================================
-- 6. المنافسون (Competitors)
-- ============================================================

CREATE TABLE public.competitors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    platform public."PlatformType" NOT NULL,
    platform_page_id VARCHAR(255),
    platform_username VARCHAR(255),
    notes TEXT,
    estimated_spend FLOAT,
    active_ads_count INT DEFAULT 0,
    last_analyzed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_competitors_user_id ON public.competitors(user_id);

CREATE TABLE public.competitor_ads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    competitor_id UUID NOT NULL REFERENCES public.competitors(id) ON DELETE CASCADE,
    platform public."PlatformType" NOT NULL,
    snapshot_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    headline VARCHAR(255),
    text TEXT,
    cta VARCHAR(100),
    image_url TEXT,
    video_url TEXT,
    likes BIGINT NOT NULL DEFAULT 0,
    comments BIGINT NOT NULL DEFAULT 0,
    shares BIGINT NOT NULL DEFAULT 0,
    estimated_spend FLOAT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_competitor_ads_competitor_id ON public.competitor_ads(competitor_id);

-- ============================================================
-- 7. أبحاث السوق (Market Research)
-- ============================================================

CREATE TABLE public.market_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    product_name VARCHAR(255) NOT NULL,
    product_category VARCHAR(255),
    country VARCHAR(100) NOT NULL,
    report_data JSONB NOT NULL,
    report_summary TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_market_reports_user_id ON public.market_reports(user_id);

-- ============================================================
-- 8. توليدات الذكاء الاصطناعي (AI Generations)
-- ============================================================

CREATE TYPE public."AiGenerationType" AS ENUM ('text', 'image', 'analysis', 'recommendation', 'market_research');

CREATE TABLE public.ai_generations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    type public."AiGenerationType" NOT NULL,
    input_data JSONB NOT NULL,
    output_data JSONB NOT NULL,
    model_used VARCHAR(255),
    tokens_used INT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ai_generations_user_id ON public.ai_generations(user_id);
CREATE INDEX idx_ai_generations_type ON public.ai_generations(type);

-- ============================================================
-- 9. التحليلات والتقارير (Analytics & Reports)
-- ============================================================

CREATE TYPE public."ReportType" AS ENUM ('overview', 'audience', 'timing', 'cost', 'custom');

CREATE TABLE public.analytics_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    type public."ReportType" NOT NULL DEFAULT 'overview',
    filters JSONB DEFAULT '{}'::jsonb,
    chart_data JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_analytics_reports_user_id ON public.analytics_reports(user_id);

-- ============================================================
-- 10. الفواتير (Invoices)
-- ============================================================

CREATE TYPE public."InvoiceStatus" AS ENUM ('pending', 'paid', 'overdue', 'cancelled');

CREATE TABLE public.invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL,
    invoice_number VARCHAR(100) UNIQUE NOT NULL,
    amount FLOAT NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'USD',
    status public."InvoiceStatus" NOT NULL DEFAULT 'pending',
    plan_type VARCHAR(100),
    period_start TIMESTAMPTZ,
    period_end TIMESTAMPTZ,
    payment_method VARCHAR(100),
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_invoices_user_id ON public.invoices(user_id);
CREATE INDEX idx_invoices_status ON public.invoices(status);

-- ============================================================
-- 11. الإشعارات (Notifications)
-- ============================================================

CREATE TYPE public."NotificationType" AS ENUM ('campaign', 'invoice', 'system', 'alert');

CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    type public."NotificationType" NOT NULL DEFAULT 'system',
    title VARCHAR(255) NOT NULL,
    message TEXT,
    link TEXT,
    is_read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_is_read ON public.notifications(is_read);

-- ============================================================
-- 12. مفاتيح API (API Keys)
-- ============================================================

CREATE TABLE public.api_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    key_hash VARCHAR(255) UNIQUE NOT NULL,
    permissions JSONB DEFAULT '[]'::jsonb,
    last_used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_api_keys_user_id ON public.api_keys(user_id);

-- ============================================================
-- تحديث تلقائي لـ updated_at
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- تطبيق التريغر على الجداول التي تحتوي updated_at
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_client_profiles_updated_at
    BEFORE UPDATE ON public.client_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_campaigns_updated_at
    BEFORE UPDATE ON public.campaigns
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ads_updated_at
    BEFORE UPDATE ON public.ads
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contents_updated_at
    BEFORE UPDATE ON public.contents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_competitors_updated_at
    BEFORE UPDATE ON public.competitors
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_analytics_reports_updated_at
    BEFORE UPDATE ON public.analytics_reports
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at
    BEFORE UPDATE ON public.invoices
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
