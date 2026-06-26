// ============================================================
// بطاقة مؤشر الأداء (KPI Card)
// KpiCard.tsx
// ============================================================

import React from 'react';
import WidgetWrapper from './WidgetWrapper';
import { formatCurrency, formatNumber, formatPercent, formatCompactNumber, formatChange, formatCompactCurrency } from '@utils/formatters';
import { CHANGE_COLORS, THEME } from '@utils/colors';
import type { MetricKey, MetricInfo } from '@/types';
import { METRICS } from '@/types';

interface KpiCardProps {
  title: string;
  metric: MetricKey;
  value: number;
  previousValue?: number;
  change?: number;
  loading?: boolean;
  error?: string | null;
  format?: 'currency' | 'number' | 'percentage' | 'ratio' | 'compact';
  icon?: string;
  prefix?: string;
  suffix?: string;
  comparison?: string;
  style?: React.CSSProperties;
}

export default function KpiCard({
  title,
  metric,
  value,
  previousValue,
  change,
  loading = false,
  error = null,
  format: formatType,
  icon,
  prefix = '',
  suffix = '',
  comparison,
  style,
}: KpiCardProps) {
  const metricInfo: MetricInfo | undefined = METRICS[metric];
  const displayIcon = icon || metricInfo?.icon || '📊';

  // حساب التغيير إذا لم يتم تمريره
  const displayChange = change ?? (previousValue != null && previousValue > 0
    ? ((value - previousValue) / previousValue) * 100
    : undefined);

  const changeInfo = displayChange != null ? formatChange(displayChange) : null;

  // تنسيق القيمة
  const formatValue = () => {
    if (value == null) return '—';
    const fmt = formatType || metricInfo?.unit;
    switch (fmt) {
      case 'currency':
        return formatCompactCurrency(value);
      case 'percentage':
        return formatPercent(value);
      case 'ratio':
        return `${formatNumber(value, 2)}x`;
      case 'compact':
        return formatCompactNumber(value);
      default:
        return formatNumber(value);
    }
  };

  // النص التوضيحي للتغيير
  const comparisonText = comparison || (previousValue != null ? 'مقارنة بالفترة السابقة' : '');

  return (
    <WidgetWrapper
      title={title}
      icon={displayIcon}
      loading={loading}
      error={error}
      style={{
        padding: '1.25rem',
        position: 'relative',
        overflow: 'hidden',
        minHeight: '140px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        ...style,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <p
            style={{
              margin: 0,
              fontSize: '0.8rem',
              color: THEME.text.secondary,
              fontWeight: 500,
            }}
          >
            {title}
          </p>
          <p
            style={{
              margin: '0.5rem 0 0',
              fontSize: '1.75rem',
              fontWeight: 700,
              color: THEME.text.primary,
              lineHeight: 1.2,
              fontFamily: 'system-ui, -apple-system, sans-serif',
            }}
          >
            {prefix}{formatValue()}{suffix}
          </p>
        </div>
        <span style={{ fontSize: '1.5rem', opacity: 0.8 }}>{displayIcon}</span>
      </div>

      {(changeInfo || comparisonText) && (
        <div
          style={{
            marginTop: '0.75rem',
            display: 'flex',
            alignItems: 'baseline',
            gap: '0.5rem',
            fontSize: '0.8rem',
          }}
        >
          {changeInfo && !changeInfo.isNeutral && (
            <span
              style={{
                color: changeInfo.isPositive ? CHANGE_COLORS.positive : CHANGE_COLORS.negative,
                fontWeight: 600,
                background: changeInfo.isPositive ? THEME.bg.success : THEME.bg.error,
                padding: '0.15rem 0.5rem',
                borderRadius: '0.25rem',
                fontSize: '0.75rem',
              }}
            >
              {changeInfo.text}
            </span>
          )}
          {comparisonText && (
            <span style={{ color: THEME.text.muted, fontSize: '0.75rem' }}>
              {comparisonText}
            </span>
          )}
        </div>
      )}

      {/* شريط لوني سفلي */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '3px',
          background: metricInfo?.color || '#6366f1',
          opacity: 0.3,
        }}
      />
    </WidgetWrapper>
  );
}
