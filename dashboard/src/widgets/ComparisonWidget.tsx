// ============================================================
// مقارنة فترتين (Comparison Widget)
// ComparisonWidget.tsx
// ============================================================

import React, { useState } from 'react';
import WidgetWrapper from './WidgetWrapper';
import { formatCurrency, formatNumber, formatPercent } from '@utils/formatters';
import { THEME, CHANGE_COLORS } from '@utils/colors';
import type { MetricKey } from '@/types';
import { METRICS } from '@/types';

interface ComparisonItem {
  metric: string;
  current: number;
  previous: number;
  change: number;
  unit: 'currency' | 'number' | 'percentage' | 'ratio';
}

interface ComparisonWidgetProps {
  title?: string;
  data: ComparisonItem[];
  period1Label?: string;
  period2Label?: string;
  loading?: boolean;
  error?: string | null;
  empty?: boolean;
}

const formatComparisonValue = (value: number, unit: string) => {
  switch (unit) {
    case 'currency':
      return formatCurrency(value);
    case 'percentage':
      return formatPercent(value);
    case 'ratio':
      return `${formatNumber(value, 2)}x`;
    default:
      return formatNumber(value);
  }
};

export default function ComparisonWidget({
  title = 'مقارنة الفترات',
  data,
  period1Label = 'الفترة الحالية',
  period2Label = 'الفترة السابقة',
  loading = false,
  error = null,
  empty = false,
}: ComparisonWidgetProps) {
  return (
    <WidgetWrapper
      title={title}
      icon="⚖️"
      loading={loading}
      error={error}
      empty={empty || data.length === 0}
      emptyMessage="اختر فترتين للمقارنة"
    >
      {/* رؤوس الفترات */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1.5fr 1.5fr 1fr',
          gap: '0.5rem',
          padding: '0.5rem 0.75rem',
          backgroundColor: THEME.bg.tertiary,
          borderRadius: '0.5rem',
          fontSize: '0.75rem',
          fontWeight: 600,
          color: THEME.text.muted,
          marginBottom: '0.5rem',
        }}
      >
        <span>المقياس</span>
        <span style={{ textAlign: 'left' }}>{period1Label}</span>
        <span style={{ textAlign: 'left' }}>{period2Label}</span>
        <span style={{ textAlign: 'center' }}>التغير</span>
      </div>

      {/* صفوف المقارنة */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
        {data.map((item, index) => {
          const isPositive = item.change > 0;
          const isNeutral = item.change === 0;

          // تحديد اللون: للمقاييس التي الأقل فيها أفضل (CPC, CPA, CPM)
          const lowerIsBetter = ['cpc', 'cpa', 'cpm', 'costPerConversion'].includes(
            item.metric.toLowerCase().replace(/[\s_]/g, '')
          );
          const changeColor = isNeutral
            ? CHANGE_COLORS.neutral
            : lowerIsBetter
            ? isPositive
              ? CHANGE_COLORS.negative
              : CHANGE_COLORS.positive
            : isPositive
            ? CHANGE_COLORS.positive
            : CHANGE_COLORS.negative;

          return (
            <div
              key={index}
              style={{
                display: 'grid',
                gridTemplateColumns: '2fr 1.5fr 1.5fr 1fr',
                gap: '0.5rem',
                padding: '0.6rem 0.75rem',
                borderRadius: '0.375rem',
                backgroundColor: index % 2 === 0 ? THEME.bg.secondary : 'transparent',
                alignItems: 'center',
              }}
            >
              <span style={{ fontSize: '0.85rem', fontWeight: 500, color: THEME.text.primary }}>
                {item.metric}
              </span>
              <span
                style={{
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: THEME.text.primary,
                  textAlign: 'left',
                  direction: 'ltr',
                }}
              >
                {formatComparisonValue(item.current, item.unit)}
              </span>
              <span
                style={{
                  fontSize: '0.8rem',
                  color: THEME.text.secondary,
                  textAlign: 'left',
                  direction: 'ltr',
                }}
              >
                {formatComparisonValue(item.previous, item.unit)}
              </span>
              <div style={{ textAlign: 'center' }}>
                <span
                  style={{
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    color: changeColor,
                    background: isNeutral ? 'transparent' : changeColor + '15',
                    padding: '0.15rem 0.4rem',
                    borderRadius: '0.25rem',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {isNeutral ? '—' : `${isPositive ? '+' : ''}${item.change.toFixed(1)}%`}
                </span>
                {/* أيقونة صغيرة */}
                {!isNeutral && (
                  <span style={{ fontSize: '0.7rem', marginRight: '0.2rem' }}>
                    {isPositive ? '▲' : '▼'}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </WidgetWrapper>
  );
}
