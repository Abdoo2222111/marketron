// ============================================================
// ألوان موحدة للرسوم البيانية والمكونات
// ============================================================

/** الألوان الرئيسية للرسوم البيانية */
export const CHART_COLORS = [
  '#6366f1', // Indigo
  '#8b5cf6', // Violet
  '#3b82f6', // Blue
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#ef4444', // Red
  '#ec4899', // Pink
  '#14b8a6', // Teal
  '#f97316', // Orange
  '#06b6d4', // Cyan
  '#84cc16', // Lime
  '#d946ef', // Fuchsia
];

/** ألوان المنصات */
export const PLATFORM_COLORS: Record<string, string> = {
  facebook: '#1877F2',
  instagram: '#E4405F',
  tiktok: '#000000',
  snapchat: '#FFFC00',
  google: '#4285F4',
  twitter: '#1DA1F2',
};

/** ألوان مقاييس الأداء */
export const METRIC_COLORS: Record<string, string> = {
  spend: '#6366f1',
  impressions: '#8b5cf6',
  clicks: '#3b82f6',
  conversions: '#10b981',
  revenue: '#14b8a6',
  ctr: '#f59e0b',
  cpc: '#ef4444',
  cpm: '#ec4899',
  cpa: '#f97316',
  roas: '#22c55e',
  reach: '#a855f7',
};

/** ألوان حالة الحملة */
export const STATUS_COLORS: Record<string, string> = {
  active: '#22c55e',
  paused: '#f59e0b',
  completed: '#64748b',
  draft: '#94a3b8',
  scheduled: '#3b82f6',
};

/** ألوان التنبيهات حسب الخطورة */
export const SEVERITY_COLORS: Record<string, string> = {
  critical: '#ef4444',
  warning: '#f59e0b',
  info: '#3b82f6',
};

/** ألوان فئات العمر */
export const AGE_COLORS: Record<string, string> = {
  '18-24': '#6366f1',
  '25-34': '#8b5cf6',
  '35-44': '#3b82f6',
  '45-54': '#10b981',
  '55-64': '#f59e0b',
  '65+': '#ef4444',
};

/** ألوان الأجهزة */
export const DEVICE_COLORS: Record<string, string> = {
  mobile: '#6366f1',
  desktop: '#3b82f6',
  tablet: '#10b981',
};

/** ألوان فئات الجنس */
export const GENDER_COLORS: Record<string, string> = {
  male: '#3b82f6',
  female: '#ec4899',
  other: '#94a3b8',
};

/** ألوان حالة التغيير */
export const CHANGE_COLORS = {
  positive: '#22c55e',
  negative: '#ef4444',
  neutral: '#64748b',
};

/** ألوان الخلفية والنص */
export const THEME = {
  bg: {
    primary: '#ffffff',
    secondary: '#f8fafc',
    tertiary: '#f1f5f9',
    dark: '#0f172a',
    card: '#ffffff',
    hover: '#f1f5f9',
    skeleton: '#e2e8f0',
    success: '#dcfce7',
    warning: '#fef3c7',
    error: '#fee2e2',
    info: '#dbeafe',
  },
  text: {
    primary: '#1e293b',
    secondary: '#64748b',
    muted: '#94a3b8',
    white: '#ffffff',
    success: '#16a34a',
    warning: '#d97706',
    error: '#dc2626',
    info: '#2563eb',
  },
  border: '#e2e8f0',
  shadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  shadowMd: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  shadowLg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  radius: '0.75rem',
  radiusSm: '0.5rem',
  radiusLg: '1rem',
};

/** استخراج لون من لوحة الألوان */
export function getChartColor(index: number): string {
  return CHART_COLORS[index % CHART_COLORS.length];
}
