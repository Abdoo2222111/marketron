// ============================================================
// Marketing Platform - Shared TypeScript Types & Interfaces
// ============================================================

import { Request } from 'express';

// ── Platform & Status Enums ─────────────────────────────────
export type Platform = 'facebook' | 'instagram' | 'tiktok' | 'snapchat';
export type CampaignStatus = 'draft' | 'active' | 'paused' | 'completed' | 'archived';
export type AdObjective = 'awareness' | 'traffic' | 'engagement' | 'leads' | 'sales';
export type UserRole = 'admin' | 'user' | 'agency';
export type PlanType = 'free' | 'starter' | 'professional' | 'enterprise';
export type ContentStatus = 'draft' | 'scheduled' | 'posted' | 'failed';

// ── Database Row Types (returned from pg queries) ─────────

export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  phone?: string;
  company?: string;
  role: UserRole;
  plan: PlanType;
  email_verified: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Campaign {
  id: string;
  user_id: string;
  name: string;
  platform: Platform;
  status: CampaignStatus;
  budget: number;
  start_date?: Date;
  end_date?: Date;
  objective: AdObjective;
  targeting?: Record<string, any>;
  created_at: Date;
  updated_at: Date;
}

export interface Ad {
  id: string;
  campaign_id: string;
  name: string;
  platform: Platform;
  content: string;
  media_url?: string;
  status: CampaignStatus;
  impressions: number;
  clicks: number;
  spend: number;
  conversions: number;
  created_at: Date;
  updated_at: Date;
}

export interface SocialAccount {
  id: string;
  user_id: string;
  platform: Platform;
  access_token: string;
  refresh_token?: string;
  account_id: string;
  account_name: string;
  expires_at?: Date;
  created_at: Date;
}

export interface AnalyticsEvent {
  id: string;
  campaign_id: string;
  ad_id?: string;
  date: Date;
  platform: Platform;
  impressions: number;
  reach: number;
  clicks: number;
  ctr: number;
  cpc: number;
  cpm: number;
  spend: number;
  conversions: number;
  revenue: number;
  roas: number;
  created_at: Date;
}

export interface ContentPiece {
  id: string;
  user_id: string;
  campaign_id?: string;
  title: string;
  body: string;
  media_urls?: string[];
  platform: Platform;
  status: ContentStatus;
  scheduled_at?: Date;
  posted_at?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface Competitor {
  id: string;
  user_id: string;
  name: string;
  platform: Platform;
  page_id: string;
  metrics?: Record<string, any>;
  created_at: Date;
  updated_at: Date;
}

export interface MarketResearch {
  id: string;
  user_id: string;
  query: string;
  results: Record<string, any>;
  created_at: Date;
}

// ── Request Extensions ─────────────────────────────────────

// Augment Express.User to match our custom user payload
declare global {
  namespace Express {
    interface User {
      id: string;
      email: string;
      role: UserRole;
      plan: PlanType;
    }
  }
}

export type AuthenticatedRequest = Request & {
  user?: Express.User;
};

// ── API Response Shapes ────────────────────────────────────

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ── Token Payload ──────────────────────────────────────────

export interface TokenPayload {
  userId: string;
  email: string;
  role: UserRole;
}

// ── Analytics Aggregations ─────────────────────────────────

export interface CampaignAnalytics {
  campaignId: string;
  campaignName: string;
  platform: Platform;
  status: CampaignStatus;
  totalImpressions: number;
  totalReach: number;
  totalClicks: number;
  totalSpend: number;
  totalConversions: number;
  totalRevenue: number;
  ctr: number;
  cpc: number;
  cpm: number;
  roas: number;
  daily: DailyAnalytics[];
}

export interface DailyAnalytics {
  date: string;
  impressions: number;
  clicks: number;
  spend: number;
  conversions: number;
  revenue: number;
}

export interface DashboardData {
  totalCampaigns: number;
  activeCampaigns: number;
  totalImpressions: number;
  totalClicks: number;
  totalSpend: number;
  totalConversions: number;
  totalRevenue: number;
  averageCtr: number;
  averageCpc: number;
  averageCpm: number;
  roas: number;
  byPlatform: Record<Platform, PlatformSummary>;
  recentCampaigns: Campaign[];
}

export interface PlatformSummary {
  impressions: number;
  clicks: number;
  spend: number;
  conversions: number;
  revenue: number;
}

export interface TrendData {
  date: string;
  impressions: number;
  clicks: number;
  spend: number;
  conversions: number;
  revenue: number;
}

export interface ROIResult {
  totalSpend: number;
  totalRevenue: number;
  roas: number;
  profitMargin: number;
  byPlatform: Record<Platform, { spend: number; revenue: number; roas: number }>;
}
