// ============================================================
// رسم بياني خطي (Line Chart Widget)
// LineChartWidget.tsx
// ============================================================

import React, { useState, useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Brush,
  ReferenceArea,
} from 'recharts';
import WidgetWrapper from './WidgetWrapper';
import { CHART_COLORS, THEME } from '@utils/colors';
import { formatNumber, formatCurrency, formatDate } from '@utils/formatters';
import type { MetricKey } from '@/types';
import { METRICS } from '@/types';
import type { ChartDataPoint } from '@utils/dataTransformers';

interface LineChartWidgetProps {
  title?: string;
  data: ChartDataPoint[];
  metrics: MetricKey[];
  loading?: boolean;
  error?: string | null;
  empty?: boolean;
  period?: '7d' | '30d' | '90d' | '1y';
  onPeriodChange?: (period: string) => void;
}

const PERIODS = [
  { key: '7d', label: '٧ أيام' },
  { key: '30d', label: '٣٠ يوماً' },
  { key: '90d', label: '٩٠ يوماً' },
  { key: '1y', label: 'سنة' },
];

export default function LineChartWidget({
  title = 'اتجاهات الأداء',
  data,
  metrics,
  loading = false,
  error = null,
  empty = false,
  period = '30d',
  onPeriodChange,
}: LineChartWidgetProps) {
  // تخصيص التولتيب
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div
        style={{
          background: THEME.bg.card,
          border: `1px solid ${THEME.border}`,
          borderRadius: '0.5rem',
          padding: '0.75rem',
          direction: 'rtl',
          boxShadow: THEME.shadowLg,
        }}
      >
        <p style={{ margin: '0 0 0.5rem', fontWeight: 600, fontSize: '0.8rem', color: THEME.text.primary }}>
          {formatDate(label)}
        </p>
        {payload.map((entry: any, index: number) => {
          const metricInfo = METRICS[entry.dataKey as MetricKey];
          return (
            <div
              key={index}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: '1rem',
                fontSize: '0.8rem',
                color: THEME.text.secondary,
              }}
            >
              <span style={{ color: entry.color }}>
                {metricInfo?.labelAr || entry.dataKey}
              </span>
              <span style={{ fontWeight: 600, color: THEME.text.primary }}>
                {metricInfo?.unit === 'currency'
                  ? formatCurrency(entry.value)
                  : metricInfo?.unit === 'percentage'
                  ? `${formatNumber(entry.value, 1)}%`
                  : formatNumber(entry.value)}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  const CustomLegend = ({ payload }: any) => {
    if (!payload) return null;
    return (
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1rem',
          justifyContent: 'center',
          marginTop: '0.5rem',
        }}
      >
        {payload.map((entry: any, index: number) => {
          const metricInfo = METRICS[entry.dataKey as MetricKey];
          return (
            <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span
                style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  backgroundColor: entry.color,
                  display: 'inline-block',
                }}
              />
              <span style={{ fontSize: '0.75rem', color: THEME.text.secondary }}>
                {metricInfo?.labelAr || entry.dataKey}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <WidgetWrapper
      title={title}
      icon="📈"
      loading={loading}
      error={error}
      empty={empty}
      emptyMessage="لا توجد بيانات أداء كافية بعد"
      headerActions={
        <div style={{ display: 'flex', gap: '0.25rem' }}>
          {PERIODS.map(p => (
            <button
              key={p.key}
              onClick={() => onPeriodChange?.(p.key)}
              style={{
                padding: '0.2rem 0.5rem',
                fontSize: '0.7rem',
                background: period === p.key ? THEME.bg.tertiary : 'transparent',
                border: `1px solid ${period === p.key ? THEME.text.primary : THEME.border}`,
                borderRadius: '0.25rem',
                color: period === p.key ? THEME.text.primary : THEME.text.secondary,
                cursor: 'pointer',
                fontWeight: period === p.key ? 600 : 400,
              }}
            >
              {p.label}
            </button>
          ))}
        </div>
      }
    >
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={THEME.border} />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: THEME.text.muted }}
            tickLine={false}
            axisLine={{ stroke: THEME.border }}
            tickFormatter={(val) => formatDate(val, 'short')}
          />
          <YAxis
            tick={{ fontSize: 11, fill: THEME.text.muted }}
            tickLine={false}
            axisLine={{ stroke: THEME.border }}
            tickFormatter={(val) => formatNumber(val)}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend content={<CustomLegend />} />
          {metrics.map((metric, index) => (
            <Line
              key={metric}
              type="monotone"
              dataKey={metric}
              stroke={CHART_COLORS[index % CHART_COLORS.length]}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 5, strokeWidth: 0 }}
              connectNulls
            />
          ))}
          <Brush
            dataKey="date"
            height={30}
            stroke={CHART_COLORS[0]}
            fill={THEME.bg.tertiary}
            travellerWidth={10}
            gap={1}
          />
        </LineChart>
      </ResponsiveContainer>
    </WidgetWrapper>
  );
}
