// ============================================================
// أعلى 5 أداءً (Top Performance Widget)
// TopPerformanceWidget.tsx
// ============================================================

import React from 'react';
import WidgetWrapper from './WidgetWrapper';
import { formatCurrency, formatPercent, formatNumber, formatCompactNumber } from '@utils/formatters';
import { THEME, CHART_COLORS } from '@utils/colors';

interface TopItem {
  rank: number;
  name: string;
  value: number;
  metric: string;
  platform?: string;
  platformIcon?: string;
  change?: number;
}

interface TopPerformanceWidgetProps {
  title?: string;
  items: TopItem[];
  loading?: boolean;
  error?: string | null;
  empty?: boolean;
  maxItems?: number;
}

export default function TopPerformanceWidget({
  title = 'أفضل الأداء',
  items,
  loading = false,
  error = null,
  empty = false,
  maxItems = 5,
}: TopPerformanceWidgetProps) {
  const displayedItems = items.slice(0, maxItems);
  const maxValue = Math.max(...displayedItems.map(i => i.value), 1);

  const formatTopValue = (item: TopItem) => {
    if (item.metric.includes('ROAS') || item.metric.includes('roas')) {
      return `${formatNumber(item.value, 2)}x`;
    }
    if (item.metric.includes('CTR') || item.metric.includes('ctr') || item.metric.includes('نسبة')) {
      return formatPercent(item.value);
    }
    if (item.value > 10000) {
      return formatCompactNumber(item.value);
    }
    return formatNumber(item.value);
  };

  return (
    <WidgetWrapper
      title={title}
      icon="🏆"
      loading={loading}
      error={error}
      empty={empty || items.length === 0}
      emptyMessage="لا توجد بيانات أداء كافية بعد"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {displayedItems.map((item, index) => (
          <div
            key={index}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.5rem 0',
              borderBottom: index < displayedItems.length - 1 ? `1px solid ${THEME.border}` : 'none',
            }}
          >
            {/* الترتيب */}
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                backgroundColor: index < 3 ? CHART_COLORS[index] : THEME.bg.tertiary,
                color: index < 3 ? '#fff' : THEME.text.secondary,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.75rem',
                fontWeight: 700,
                flexShrink: 0,
              }}
            >
              {item.rank}
            </div>

            {/* أيقونة المنصة إن وجدت */}
            {item.platformIcon && (
              <span style={{ fontSize: '1.2rem', flexShrink: 0 }}>{item.platformIcon}</span>
            )}

            {/* الاسم والقيمة */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: '0.85rem',
                  fontWeight: 500,
                  color: THEME.text.primary,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {item.name}
              </div>
              <div style={{ fontSize: '0.7rem', color: THEME.text.muted }}>
                {item.metric}
                {item.platform ? ` · ${item.platform}` : ''}
              </div>
            </div>

            {/* القيمة */}
            <div style={{ textAlign: 'left' }}>
              <div
                style={{
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  color: THEME.text.primary,
                  direction: 'ltr',
                }}
              >
                {formatTopValue(item)}
              </div>
              {item.change != null && (
                <div
                  style={{
                    fontSize: '0.7rem',
                    color: item.change >= 0 ? '#22c55e' : '#ef4444',
                    textAlign: 'right',
                  }}
                >
                  {item.change >= 0 ? '↑' : '↓'} {Math.abs(item.change).toFixed(1)}%
                </div>
              )}
            </div>

            {/* شريط تقدم بصري */}
            <div
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                bottom: 0,
                width: '3px',
                backgroundColor: CHART_COLORS[index % CHART_COLORS.length],
                borderRadius: '0 2px 2px 0',
                opacity: 0.4,
              }}
            />
          </div>
        ))}
      </div>
    </WidgetWrapper>
  );
}
