// ============================================================
// تحويل بيانات API إلى بيانات مناسبة للرسوم البيانية
// Data transformers for charts
// ============================================================

import type {
  PerformanceData,
  MetricKey,
  PlatformType,
  Campaign,
  AudienceData,
  GeoData,
  DeviceData,
  TimeHeatmapData,
  Competitor,
  Alert,
} from '@/types';
import { METRICS } from '@/types';
import { addDays, format, subDays, startOfWeek } from 'date-fns';

// --- أنواع البيانات المحولة للرسوم البيانية ---

export interface ChartDataPoint {
  date: string;
  [key: string]: string | number | undefined;
}

export interface PieChartData {
  name: string;
  value: number;
  color: string;
  percentage: number;
}

export interface ComparisonData {
  metric: string;
  current: number;
  previous: number;
  change: number;
  unit: 'currency' | 'number' | 'percentage' | 'ratio';
}

export interface FunnelData {
  stage: string;
  value: number;
  percentage: number;
}

export interface TimeSeriesPoint {
  date: string;
  value: number;
  metric: string;
}

// --- تحويل بيانات الأداء إلى نقاط رسم بياني خطي ---

export function toLineChartData(
  data: PerformanceData[],
  metrics: MetricKey[],
  groupBy: 'day' | 'week' | 'month' = 'day'
): ChartDataPoint[] {
  const grouped = groupByDay(data, metrics, groupBy);
  return Object.entries(grouped)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, values]) => ({
      date,
      ...values,
    }));
}

function groupByDay(
  data: PerformanceData[],
  metrics: MetricKey[],
  groupBy: 'day' | 'week' | 'month'
): Record<string, Record<string, number>> {
  const result: Record<string, Record<string, number>> = {};

  for (const item of data) {
    const key = groupKey(item.date, groupBy);
    if (!result[key]) result[key] = {};

    for (const metric of metrics) {
      const value = item[metric] as number || 0;
      result[key][metric] = (result[key][metric] || 0) + value;
    }
  }

  return result;
}

function groupKey(date: string, groupBy: 'day' | 'week' | 'month'): string {
  const d = new Date(date);
  switch (groupBy) {
    case 'day':
      return format(d, 'yyyy-MM-dd');
    case 'week':
      return format(startOfWeek(d, { weekStartsOn: 1 }), 'yyyy-MM-dd');
    case 'month':
      return format(d, 'yyyy-MM');
  }
}

// --- تحويل بيانات المقارنة بين المنصات إلى رسم بياني أعمدة ---

export function toBarChartByPlatform(
  data: PerformanceData[],
  metric: MetricKey
): { platform: string; value: number; color: string }[] {
  const grouped: Record<string, number> = {};

  for (const item of data) {
    const value = (item[metric] as number) || 0;
    grouped[item.platform] = (grouped[item.platform] || 0) + value;
  }

  const platformColors: Record<string, string> = {
    facebook: '#1877F2',
    instagram: '#E4405F',
    tiktok: '#000000',
    snapchat: '#FFFC00',
    google: '#4285F4',
    twitter: '#1DA1F2',
  };

  const platformNames: Record<string, string> = {
    facebook: 'فيسبوك',
    instagram: 'إنستغرام',
    tiktok: 'تيك توك',
    snapchat: 'سناب شات',
    google: 'جوجل',
    twitter: 'إكس',
  };

  return Object.entries(grouped)
    .sort(([, a], [, b]) => b - a)
    .map(([platform, value]) => ({
      platform: platformNames[platform] || platform,
      value,
      color: platformColors[platform] || '#6366f1',
    }));
}

// --- تحويل بيانات المقارنة بين الحملات ---

export function toBarChartByCampaign(
  data: PerformanceData[],
  campaigns: Campaign[],
  metric: MetricKey
): { campaign: string; value: number; color: string }[] {
  const grouped: Record<string, number> = {};
  const campaignMap = new Map(campaigns.map(c => [c.id, c.nameAr]));

  for (const item of data) {
    if (!item.campaignId) continue;
    const value = (item[metric] as number) || 0;
    grouped[item.campaignId] = (grouped[item.campaignId] || 0) + value;
  }

  const colors = ['#6366f1', '#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

  return Object.entries(grouped)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([id, value], index) => ({
      campaign: campaignMap.get(id) || id,
      value,
      color: colors[index % colors.length],
    }));
}

// --- تحويل إلى رسم بياني دائري (توزيع الإنفاق حسب المنصة) ---

export function toPieChartByPlatform(data: PerformanceData[], metric: MetricKey = 'spend'): PieChartData[] {
  const grouped: Record<string, number> = {};
  const total = data.reduce((sum, item) => sum + ((item[metric] as number) || 0), 0);

  for (const item of data) {
    const value = (item[metric] as number) || 0;
    grouped[item.platform] = (grouped[item.platform] || 0) + value;
  }

  const platformColors: Record<string, string> = {
    facebook: '#1877F2',
    instagram: '#E4405F',
    tiktok: '#000000',
    snapchat: '#FFFC00',
    google: '#4285F4',
    twitter: '#1DA1F2',
  };

  const platformNames: Record<string, string> = {
    facebook: 'فيسبوك',
    instagram: 'إنستغرام',
    tiktok: 'تيك توك',
    snapchat: 'سناب شات',
    google: 'جوجل',
    twitter: 'إكس',
  };

  return Object.entries(grouped)
    .sort(([, a], [, b]) => b - a)
    .map(([platform, value]) => ({
      name: platformNames[platform] || platform,
      value,
      color: platformColors[platform] || '#6366f1',
      percentage: total > 0 ? (value / total) * 100 : 0,
    }));
}

// --- تحويل بيانات الجمهور ---

export function toAgePieData(data: AudienceData[]): PieChartData[] {
  const ageColors: Record<string, string> = {
    '18-24': '#6366f1',
    '25-34': '#8b5cf6',
    '35-44': '#3b82f6',
    '45-54': '#10b981',
    '55-64': '#f59e0b',
    '65+': '#ef4444',
  };

  return data.map(item => ({
    name: item.ageGroup,
    value: item.percentage,
    color: ageColors[item.ageGroup] || '#6366f1',
    percentage: item.percentage,
  }));
}

export function toGenderPieData(data: AudienceData[]): PieChartData[] {
  const genderNames: Record<string, string> = {
    male: 'ذكر',
    female: 'أنثى',
    other: 'أخرى',
  };
  const genderColors: Record<string, string> = {
    male: '#3b82f6',
    female: '#ec4899',
    other: '#94a3b8',
  };

  return data.map(item => ({
    name: genderNames[item.gender] || item.gender,
    value: item.percentage,
    color: genderColors[item.gender] || '#6366f1',
    percentage: item.percentage,
  }));
}

export function toDevicePieData(data: DeviceData[]): PieChartData[] {
  const deviceNames: Record<string, string> = {
    mobile: 'جوال',
    desktop: 'كمبيوتر',
    tablet: 'تابلت',
  };
  const deviceColors: Record<string, string> = {
    mobile: '#6366f1',
    desktop: '#3b82f6',
    tablet: '#10b981',
  };

  return data.map(item => ({
    name: deviceNames[item.device] || item.device,
    value: item.percentage,
    color: deviceColors[item.device] || '#6366f1',
    percentage: item.percentage,
  }));
}

// --- تحويل بيانات الأداء إلى جدول مقارنة ---

export function toComparisonData(
  currentData: PerformanceData[],
  previousData: PerformanceData[],
  metrics: MetricKey[]
): ComparisonData[] {
  const currentTotals = aggregateMetrics(currentData);
  const previousTotals = aggregateMetrics(previousData);

  return metrics.map(metric => {
    const current = currentTotals[metric] || 0;
    const previous = previousTotals[metric] || 0;
    const change = previous > 0 ? ((current - previous) / previous) * 100 : 0;
    const info = METRICS[metric];

    return {
      metric: info.labelAr,
      current,
      previous,
      change,
      unit: info.unit,
    };
  });
}

function aggregateMetrics(data: PerformanceData[]): Record<string, number> {
  const totals: Record<string, number> = {};
  for (const item of data) {
    for (const [key, value] of Object.entries(item)) {
      if (typeof value === 'number') {
        totals[key] = (totals[key] || 0) + value;
      }
    }
  }
  return totals;
}

// --- تحويل إلى بيانات Funnel ---

export function toFunnelData(data: PerformanceData[]): FunnelData[] {
  const totals = aggregateMetrics(data);
  const impressions = totals.impressions || 0;
  const clicks = totals.clicks || 0;
  const conversions = totals.conversions || 0;

  const stages = [
    { key: 'ظهور', value: impressions },
    { key: 'نقرات', value: clicks },
    { key: 'تحويلات', value: conversions },
  ];

  const maxValue = impressions;

  return stages.map(s => ({
    stage: s.key,
    value: s.value,
    percentage: maxValue > 0 ? (s.value / maxValue) * 100 : 0,
  }));
}

// --- تحويل بيانات الوقت إلى Heatmap ---

export function toTimeHeatmapData(data: TimeHeatmapData[]): { days: string[]; hours: string[]; grid: number[][] } {
  const days = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
  const hours = Array.from({ length: 24 }, (_, i) => `${i}:00`);

  const grid: number[][] = days.map(() => Array(24).fill(0));

  for (const item of data) {
    if (item.dayOfWeek >= 0 && item.dayOfWeek < 7 && item.hour >= 0 && item.hour < 24) {
      grid[item.dayOfWeek][item.hour] = item.value;
    }
  }

  return { days, hours, grid };
}

// --- تحويل بيانات المنافسين ---

export function toCompetitorBarData(competitors: Competitor[], metric: keyof Competitor = 'spend') {
  return competitors
    .sort((a, b) => (b[metric] as number) - (a[metric] as number))
    .map(c => ({
      name: c.name,
      value: c[metric] as number,
      platform: c.platform,
    }));
}

// --- إنشاء بيانات تجريبية للتطوير ---

export function generateMockPerformanceData(days: number = 30): PerformanceData[] {
  const platforms: PlatformType[] = ['facebook', 'instagram', 'tiktok', 'snapchat', 'google'];
  const data: PerformanceData[] = [];
  const today = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = format(subDays(today, i), 'yyyy-MM-dd');

    for (const platform of platforms) {
      const baseSpend = platform === 'facebook' ? 5000 : platform === 'google' ? 4000 : 2000;
      const variance = 0.3;
      const randomFactor = 1 + (Math.random() - 0.5) * variance * 2;

      const spend = Math.round(baseSpend * randomFactor);
      const cpm = 12 + Math.random() * 8;
      const impressions = Math.round((spend / cpm) * 1000);
      const ctr = 0.5 + Math.random() * 3;
      const clicks = Math.round(impressions * (ctr / 100));
      const cpc = spend / clicks;
      const cvr = 1 + Math.random() * 4;
      const conversions = Math.round(clicks * (cvr / 100));
      const revenue = conversions * (50 + Math.random() * 200);

      data.push({
        date,
        platform,
        spend,
        impressions,
        clicks,
        conversions,
        revenue,
        reach: Math.round(impressions * (0.6 + Math.random() * 0.3)),
        frequency: 1.2 + Math.random() * 2,
      });
    }
  }

  return data;
}

export function generateMockAlerts(): Alert[] {
  return [
    {
      id: '1',
      type: 'budget_exceeded',
      severity: 'critical',
      titleAr: 'تجاوز حد الإنفاق',
      titleEn: 'Budget Limit Exceeded',
      messageAr: 'حملة "عيد الأضحى ٢٠٢٦" تجاوزت ٨٠٪ من الميزانية المقررة',
      messageEn: 'Campaign "Eid Al-Adha 2026" exceeded 80% of allocated budget',
      timestamp: new Date().toISOString(),
      read: false,
      campaignId: 'camp-1',
      platform: 'facebook',
    },
    {
      id: '2',
      type: 'performance_drop',
      severity: 'warning',
      titleAr: 'انخفاض في الأداء',
      titleEn: 'Performance Drop',
      messageAr: 'انخفاض بنسبة ٢٥٪ في نسبة النقر (CTR) لحملة "الصيف"',
      messageEn: '25% drop in CTR for "Summer" campaign',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      read: false,
      campaignId: 'camp-2',
      platform: 'tiktok',
    },
    {
      id: '3',
      type: 'campaign_ending',
      severity: 'warning',
      titleAr: 'حملة على وشك الانتهاء',
      titleEn: 'Campaign Ending Soon',
      messageAr: 'تنتهي حملة "العودة للمدارس" بعد ٣ أيام',
      messageEn: '"Back to School" campaign ends in 3 days',
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      read: false,
      campaignId: 'camp-3',
      platform: 'instagram',
    },
    {
      id: '4',
      type: 'token_expiry',
      severity: 'info',
      titleAr: 'انتهاء صلاحية التوكن',
      titleEn: 'Token Expiry',
      messageAr: 'رمز API لمنصة تيك توك سينتهي بعد ٧ أيام',
      messageEn: 'TikTok API token expires in 7 days',
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      read: true,
      platform: 'tiktok',
    },
    {
      id: '5',
      type: 'budget_exceeded',
      severity: 'warning',
      titleAr: 'اقتراب من الحد الأقصى',
      titleEn: 'Approaching Budget Limit',
      messageAr: 'حملة "الربع الثالث" استهلكت ٧٥٪ من الميزانية',
      messageEn: '"Q3 Campaign" consumed 75% of budget',
      timestamp: new Date(Date.now() - 172800000).toISOString(),
      read: true,
      campaignId: 'camp-4',
      platform: 'google',
    },
  ];
}

export function generateMockCompetitors(): Competitor[] {
  return [
    { name: 'نون', platform: 'facebook', spend: 45000, impressions: 2500000, clicks: 75000, ctr: 3.0, engagement: 4.2 },
    { name: 'أمازون السعودية', platform: 'google', spend: 52000, impressions: 3100000, clicks: 93000, ctr: 3.0, engagement: 3.8 },
    { name: 'متجر الضيافة', platform: 'instagram', spend: 28000, impressions: 1800000, clicks: 54000, ctr: 3.0, engagement: 5.1 },
    { name: 'أجراس', platform: 'tiktok', spend: 15000, impressions: 3200000, clicks: 96000, ctr: 3.0, engagement: 7.3 },
    { name: 'بنده', platform: 'facebook', spend: 22000, impressions: 1200000, clicks: 31000, ctr: 2.6, engagement: 3.5 },
    { name: 'كارفور', platform: 'facebook', spend: 18000, impressions: 980000, clicks: 25000, ctr: 2.6, engagement: 3.2 },
  ];
}
