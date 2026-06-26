// ============================================================
// رسم بياني أعمدة (Bar Chart Widget)
// BarChartWidget.tsx
// ============================================================

import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import WidgetWrapper from './WidgetWrapper';
import { CHART_COLORS, THEME } from '@utils/colors';
import { formatNumber, formatCurrency } from '@utils/formatters';
import type { MetricKey } from '@/types';
import { METRICS } from '@/types';

interface BarItem {
  name: string;
  value: number;
  color?: string;
}

interface BarChartWidgetProps {
  title?: string;
  data: BarItem[];
  metric?: MetricKey;
  loading?: boolean;
  error?: string | null;
  empty?: boolean;
  orientation?: 'vertical' | 'horizontal';
  showLegend?: boolean;
  barSize?: number;
}

export default function BarChartWidget({
  title = 'مقارنة',
  data,
  metric,
  loading = false,
  error = null,
  empty = false,
  orientation = 'vertical',
  showLegend = true,
  barSize = 32,
}: BarChartWidgetProps) {
  const metricInfo = metric ? METRICS[metric] : null;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    const item = payload[0];
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
        <p style={{ margin: 0, fontWeight: 600, fontSize: '0.85rem', color: THEME.text.primary }}>
          {label}
        </p>
        <p style={{ margin: '0.25rem 0 0', fontSize: '0.8rem', color: item.payload.fill || item.color }}>
          {metricInfo?.labelAr || 'القيمة'}: {metricInfo?.unit === 'currency'
            ? formatCurrency(item.value)
            : formatNumber(item.value)}
        </p>
      </div>
    );
  };

  if (orientation === 'horizontal') {
    return (
      <WidgetWrapper
        title={title}
        icon="📊"
        loading={loading}
        error={error}
        empty={empty}
        emptyMessage="لا توجد بيانات للمقارنة"
      >
        <ResponsiveContainer width="100%" height={280}>
          <BarChart
            data={data}
            layout="horizontal"
            margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke={THEME.border} horizontal={false} />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 11, fill: THEME.text.muted }}
              tickLine={false}
              axisLine={{ stroke: THEME.border }}
            />
            <YAxis
              tick={{ fontSize: 11, fill: THEME.text.muted }}
              tickLine={false}
              axisLine={{ stroke: THEME.border }}
              tickFormatter={(val) => formatNumber(val)}
            />
            <Tooltip content={<CustomTooltip />} />
            {showLegend && <Legend />}
            <Bar
              dataKey="value"
              radius={[4, 4, 0, 0]}
              barSize={barSize}
            >
              {data.map((entry, index) => (
                <rect key={index} fill={entry.color || CHART_COLORS[index % CHART_COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </WidgetWrapper>
    );
  }

  return (
    <WidgetWrapper
      title={title}
      icon="📊"
      loading={loading}
      error={error}
      empty={empty}
      emptyMessage="لا توجد بيانات للمقارنة"
    >
      <ResponsiveContainer width="100%" height={280}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={THEME.border} vertical={false} />
          <XAxis
            type="number"
            tick={{ fontSize: 11, fill: THEME.text.muted }}
            tickLine={false}
            axisLine={{ stroke: THEME.border }}
            tickFormatter={(val) => formatNumber(val)}
          />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fontSize: 11, fill: THEME.text.muted }}
            tickLine={false}
            axisLine={{ stroke: THEME.border }}
          />
          <Tooltip content={<CustomTooltip />} />
          {showLegend && <Legend />}
          <Bar
            dataKey="value"
            radius={[0, 4, 4, 0]}
            barSize={barSize}
          >
            {data.map((entry, index) => (
              <rect key={index} fill={entry.color || CHART_COLORS[index % CHART_COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </WidgetWrapper>
  );
}
