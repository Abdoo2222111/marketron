// ============================================================
// أنواع البيانات الأساسية لمنصة التسويق الإلكتروني
// Core data types for the marketing platform dashboard
// ============================================================

// --- المقاييس (Metrics) ---
export type MetricKey =
  | 'spend'
  | 'impressions'
  | 'clicks'
  | 'conversions'
  | 'ctr'
  | 'cpc'
  | 'cpm'
  | 'cpa'
  | 'roas'
  | 'revenue'
  | 'reach'
  | 'frequency'
  | 'conversionRate'
  | 'costPerConversion';

export interface MetricInfo {
  key: MetricKey;
  labelAr: string;
  labelEn: string;
  unit: 'currency' | 'number' | 'percentage' | 'ratio';
  icon: string;
  color: string;
  decimals: number;
}

export const METRICS: Record<MetricKey, MetricInfo> = {
  spend:            { key: 'spend', labelAr: 'الإنفاق', labelEn: 'Spend', unit: 'currency', icon: '💰', color: '#6366f1', decimals: 0 },
  impressions:      { key: 'impressions', labelAr: 'مرات الظهور', labelEn: 'Impressions', unit: 'number', icon: '👁️', color: '#8b5cf6', decimals: 0 },
  clicks:           { key: 'clicks', labelAr: 'النقرات', labelEn: 'Clicks', unit: 'number', icon: '🖱️', color: '#3b82f6', decimals: 0 },
  conversions:      { key: 'conversions', labelAr: 'التحويلات', labelEn: 'Conversions', unit: 'number', icon: '✅', color: '#10b981', decimals: 0 },
  ctr:              { key: 'ctr', labelAr: 'نسبة النقر', labelEn: 'CTR', unit: 'percentage', icon: '📊', color: '#f59e0b', decimals: 2 },
  cpc:              { key: 'cpc', labelAr: 'تكلفة النقرة', labelEn: 'CPC', unit: 'currency', icon: '💲', color: '#ef4444', decimals: 2 },
  cpm:              { key: 'cpm', labelAr: 'تكلفة الألف ظهور', labelEn: 'CPM', unit: 'currency', icon: '📈', color: '#ec4899', decimals: 2 },
  cpa:              { key: 'cpa', labelAr: 'تكلفة التحويل', labelEn: 'CPA', unit: 'currency', icon: '🎯', color: '#f97316', decimals: 2 },
  roas:             { key: 'roas', labelAr: 'العائد على الإنفاق', labelEn: 'ROAS', unit: 'ratio', icon: '📈', color: '#22c55e', decimals: 2 },
  revenue:          { key: 'revenue', labelAr: 'العائد', labelEn: 'Revenue', unit: 'currency', icon: '💵', color: '#14b8a6', decimals: 0 },
  reach:            { key: 'reach', labelAr: 'الوصول', labelEn: 'Reach', unit: 'number', icon: '👥', color: '#a855f7', decimals: 0 },
  frequency:        { key: 'frequency', labelAr: 'التكرار', labelEn: 'Frequency', unit: 'ratio', icon: '🔄', color: '#64748b', decimals: 2 },
  conversionRate:   { key: 'conversionRate', labelAr: 'نسبة التحويل', labelEn: 'CVR', unit: 'percentage', icon: '📐', color: '#06b6d4', decimals: 2 },
  costPerConversion: { key: 'costPerConversion', labelAr: 'تكلفة التحويل', labelEn: 'Cost/Conv', unit: 'currency', icon: '💲', color: '#d946ef', decimals: 2 },
};

// --- المنصات (Platforms) ---
export type PlatformType = 'facebook' | 'instagram' | 'tiktok' | 'snapchat' | 'google' | 'twitter';

export interface PlatformInfo {
  id: PlatformType;
  nameAr: string;
  nameEn: string;
  color: string;
  icon: string;
}

export const PLATFORMS: Record<PlatformType, PlatformInfo> = {
  facebook:  { id: 'facebook',  nameAr: 'فيسبوك',     nameEn: 'Facebook',  color: '#1877F2', icon: '📘' },
  instagram: { id: 'instagram', nameAr: 'إنستغرام',   nameEn: 'Instagram', color: '#E4405F', icon: '📸' },
  tiktok:    { id: 'tiktok',    nameAr: 'تيك توك',    nameEn: 'TikTok',    color: '#000000', icon: '🎵' },
  snapchat:  { id: 'snapchat',  nameAr: 'سناب شات',   nameEn: 'Snapchat',  color: '#FFFC00', icon: '👻' },
  google:    { id: 'google',    nameAr: 'جوجل',       nameEn: 'Google',    color: '#4285F4', icon: '🔍' },
  twitter:   { id: 'twitter',   nameAr: 'إكس (تويتر)', nameEn: 'X (Twitter)', color: '#1DA1F2', icon: '🐦' },
};

// --- الحملة (Campaign) ---
export interface Campaign {
  id: string;
  name: string;
  nameAr: string;
  platform: PlatformType;
  status: 'active' | 'paused' | 'completed' | 'draft' | 'scheduled';
  budget: number;
  spent: number;
  startDate: string;
  endDate: string;
  objective: string;
}

// --- إعلان (Ad) ---
export interface Ad {
  id: string;
  name: string;
  campaignId: string;
  platform: PlatformType;
  status: 'active' | 'paused' | 'completed';
}

// --- بيانات الأداء (Performance Data) ---
export interface PerformanceData {
  date: string;
  platform: PlatformType;
  campaignId?: string;
  adId?: string;
  spend: number;
  impressions: number;
  clicks: number;
  conversions: number;
  revenue: number;
  reach: number;
  frequency: number;
}

// --- بيانات الجمهور (Audience Data) ---
export interface AudienceData {
  ageGroup: string;
  gender: 'male' | 'female' | 'other';
  percentage: number;
  platform?: PlatformType;
}

export interface GeoData {
  country: string;
  city?: string;
  value: number;
  percentage: number;
}

export interface DeviceData {
  device: 'mobile' | 'desktop' | 'tablet';
  percentage: number;
  platform?: PlatformType;
}

// --- بيانات الوقت (Time Data) ---
export interface TimeHeatmapData {
  dayOfWeek: number; // 0-6
  hour: number;      // 0-23
  value: number;
}

// --- المنافس (Competitor) ---
export interface Competitor {
  name: string;
  platform: PlatformType;
  spend: number;
  impressions: number;
  clicks: number;
  ctr: number;
  engagement: number;
}

// --- التنبيه (Alert) ---
export interface Alert {
  id: string;
  type: 'budget_exceeded' | 'performance_drop' | 'campaign_ending' | 'token_expiry' | 'anomaly';
  severity: 'critical' | 'warning' | 'info';
  titleAr: string;
  titleEn: string;
  messageAr: string;
  messageEn: string;
  timestamp: string;
  read: boolean;
  campaignId?: string;
  platform?: PlatformType;
}

// --- تخطيط Dashboard (Dashboard Layout) ---
export interface DashboardLayout {
  id: string;
  name: string;
  widgets: WidgetConfig[];
  createdAt: string;
  updatedAt: string;
}

export interface WidgetConfig {
  id: string;
  type: WidgetType;
  title: string;
  metric?: MetricKey;
  platform?: PlatformType;
  period?: '7d' | '30d' | '90d' | '1y';
  position: { x: number; y: number; w: number; h: number };
  visible: boolean;
}

export type WidgetType =
  | 'kpi-card'
  | 'line-chart'
  | 'bar-chart'
  | 'pie-chart'
  | 'progress'
  | 'top-performance'
  | 'alert'
  | 'calendar'
  | 'comparison';

// --- معلمات التقرير (Report Parameters) ---
export interface ReportParams {
  dateFrom: string;
  dateTo: string;
  platforms: PlatformType[];
  campaigns?: string[];
  metrics: MetricKey[];
  groupBy: 'day' | 'week' | 'month' | 'platform' | 'campaign';
}

// --- بيانات التصدير (Export Data) ---
export type ExportFormat = 'pdf' | 'excel' | 'csv';

export interface ExportOptions {
  format: ExportFormat;
  title: string;
  subtitle?: string;
  includeCharts: boolean;
  rtl: boolean;
  pageSize?: 'A4' | 'A3' | 'Letter';
  orientation?: 'portrait' | 'landscape';
}
