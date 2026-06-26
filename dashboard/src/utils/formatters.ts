// ============================================================
// دوال تنسيق الأرقام والعملات والتواريخ والنسب المئوية
// Formatters for numbers, currency, dates, percentages - Arabic
// ============================================================

/**
 * الأرقام العربية (التي تستخدم في العالم العربي)
 * ملاحظة: الأرقام الشرقية (٠١٢٣٤٥٦٧٨٩) تستخدم في بعض البلدان العربية
 * لكن التنسيق بالفاصلة (١٬٢٠٠) هو الأكثر شيوعاً
 */

/** تحويل الرقم إلى تنسيق عربي مع فواصل */
export function formatNumber(value: number, decimals: number = 0): string {
  if (value == null || isNaN(value)) return '—';
  return new Intl.NumberFormat('ar-SA', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/** تنسيق العملة (ريال سعودي) */
export function formatCurrency(value: number, decimals: number = 0): string {
  if (value == null || isNaN(value)) return '—';
  return new Intl.NumberFormat('ar-SA', {
    style: 'currency',
    currency: 'SAR',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/** تنسيق الدولار */
export function formatUSD(value: number, decimals: number = 0): string {
  if (value == null || isNaN(value)) return '—';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/** تنسيق النسبة المئوية */
export function formatPercentage(value: number, decimals: number = 1): string {
  if (value == null || isNaN(value)) return '—';
  return new Intl.NumberFormat('ar-SA', {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value / 100);
}

/** تنسيق النسبة المئوية كرقم مع % */
export function formatPercent(value: number, decimals: number = 1): string {
  if (value == null || isNaN(value)) return '—';
  return `${formatNumber(value, decimals)}%`;
}

/** تنسيق الأرقام الكبيرة (١٠٠ ك -> ١٠٠ ألف) */
export function formatCompactNumber(value: number): string {
  if (value == null || isNaN(value)) return '—';
  if (value >= 1_000_000_000) return `${formatNumber(value / 1_000_000_000, 1)} مليار`;
  if (value >= 1_000_000) return `${formatNumber(value / 1_000_000, 1)} مليون`;
  if (value >= 1_000) return `${formatNumber(value / 1_000, 1)} ألف`;
  return formatNumber(value);
}

/** تنسيق العملة بشكل مختصر للأرقام الكبيرة */
export function formatCompactCurrency(value: number): string {
  if (value == null || isNaN(value)) return '—';
  if (value >= 1_000_000_000) return `${formatNumber(value / 1_000_000_000, 1)} مليار ر.س`;
  if (value >= 1_000_000) return `${formatNumber(value / 1_000_000, 1)} مليون ر.س`;
  if (value >= 1_000) return `${formatNumber(value / 1_000, 1)} ألف ر.س`;
  return formatCurrency(value, 0);
}

/** تنسيق السعر (للاستخدام في الجداول) */
export function formatPrice(value: number): string {
  return formatCurrency(value, 2);
}

/** تنسيق التاريخ بالعربية */
export function formatDate(date: string | Date, style: 'short' | 'long' | 'full' = 'short'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const options: Intl.DateTimeFormatOptions = {
    calendar: 'gregory',
  };
  switch (style) {
    case 'short':
      options.day = 'numeric';
      options.month = 'short';
      options.year = 'numeric';
      break;
    case 'long':
      options.day = 'numeric';
      options.month = 'long';
      options.year = 'numeric';
      break;
    case 'full':
      options.day = 'numeric';
      options.month = 'long';
      options.year = 'numeric';
      options.weekday = 'long';
      break;
  }
  return new Intl.DateTimeFormat('ar-SA', options).format(d);
}

/** تنسيق التاريخ للعرض في التقويم */
export function formatDateCalendar(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('ar-SA', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(d);
}

/** تنسيق الوقت */
export function formatTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('ar-SA', {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  }).format(d);
}

/** تنسيق التاريخ والوقت */
export function formatDateTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('ar-SA', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  }).format(d);
}

/** أيام الأسبوع بالعربية */
export const DAYS_ARABIC = [
  'الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت',
];

/** أشهر السنة بالعربية */
export const MONTHS_ARABIC = [
  'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
  'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر',
];

/** تنسيق نسبة التغيير (مع سهم وسلوك لون) */
export function formatChange(value: number, decimals: number = 2): {
  text: string;
  isPositive: boolean;
  isNeutral: boolean;
} {
  if (value == null || isNaN(value)) {
    return { text: '—', isPositive: false, isNeutral: true };
  }
  const isPositive = value > 0;
  const isNeutral = value === 0;
  const prefix = value > 0 ? '↑' : value < 0 ? '↓' : '';
  const text = `${prefix} ${Math.abs(value).toFixed(decimals)}%`;
  return { text, isPositive: isPositive || false, isNeutral: isNeutral || false };
}

/** تنسيق ROAS */
export function formatROAS(value: number): string {
  if (value == null || isNaN(value)) return '—';
  return `${formatNumber(value, 2)}x`;
}
