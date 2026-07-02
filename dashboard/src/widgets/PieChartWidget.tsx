// ============================================================
// رسم بياني دائري (Pie Chart Widget)
// PieChartWidget.tsx
// ============================================================

import React, { useState } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Sector,
} from 'recharts';
import WidgetWrapper from './WidgetWrapper';
import { CHART_COLORS, THEME } from '@utils/colors';
import { formatNumber, formatCurrency, formatPercent } from '@utils/formatters';
import type { MetricKey } from '@/types';
import { METRICS } from '@/types';

interface PieItem {
  name: string;
  value: number;
  color: string;
  percentage: number;
}

interface PieChartWidgetProps {
  title?: string;
  data: PieItem[];
  metric?: MetricKey;
  loading?: boolean;
  error?: string | null;
  empty?: boolean;
  showLegend?: boolean;
  innerRadius?: number;
  outerRadius?: number;
}

// المقطع النشط (عند التحويم)
const renderActiveShape = (props: any) => {
  const {
    cx, cy, innerRadius, outerRadius, startAngle, endAngle,
    fill, payload, percent, value,
  } = props;

  return (
    <g>
      <text x={cx} y={cy - 15} textAnchor="middle" fill={THEME.text.primary} fontSize={14} fontWeight={600}>
        {payload.name}
      </text>
      <text x={cx} y={cy + 10} textAnchor="middle" fill={THEME.text.primary} fontSize={16} fontWeight={700}>
        {formatNumber(value)}
      </text>
      <text x={cx} y={cy + 30} textAnchor="middle" fill={THEME.text.secondary} fontSize={12}>
        {formatPercent(percent * 100)}
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 8}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={outerRadius + 12}
        outerRadius={outerRadius + 16}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
    </g>
  );
};

export default function PieChartWidget({
  title = 'التوزيع',
  data,
  metric,
  loading = false,
  error = null,
  empty = false,
  showLegend = true,
  innerRadius = 60,
  outerRadius = 100,
}: PieChartWidgetProps) {
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const metricInfo = metric ? METRICS[metric] : null;

  const CustomTooltip = ({ active, payload }: any) => {
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
          <span style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: item.payload.fill }} />
          <span style={{ fontWeight: 600, fontSize: '0.85rem', color: THEME.text.primary }}>
            {item.name}
          </span>
        </div>
        <p style={{ margin: 0, fontSize: '0.8rem', color: THEME.text.secondary }}>
          {metricInfo?.labelAr || 'القيمة'}: {formatNumber(item.value)}
        </p>
        <p style={{ margin: 0, fontSize: '0.8rem', color: THEME.text.secondary }}>
          النسبة: {formatPercent(item.payload.percentage)}
        </p>
      </div>
    );
  };

  // تخصيص وسيلة الإيضاح
  const CustomLegend = ({ payload }: any) => {
    if (!payload) return null;
    return (
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.75rem',
          justifyContent: 'center',
          marginTop: '0.5rem',
        }}
      >
        {payload.map((entry: any, index: number) => (
          <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                backgroundColor: entry.color,
                display: 'inline-block',
              }}
            />
            <span style={{ fontSize: '0.75rem', color: THEME.text.secondary }}>
              {entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <WidgetWrapper
      title={title}
      icon="🥧"
      loading={loading}
      error={error}
      empty={empty}
      emptyMessage="لا توجد بيانات توزيع"
    >
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            dataKey="value"
            nameKey="name"
            activeIndex={activeIndex}
            activeShape={renderActiveShape as any}
            onMouseEnter={(_, index) => setActiveIndex(index)}
            onMouseLeave={() => setActiveIndex(-1)}
            animationBegin={0}
            animationDuration={800}
            animationEasing="ease-out"
          >
            {data.map((entry, index) => (
              <Cell key={index} fill={entry.color || CHART_COLORS[index % CHART_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          {showLegend && <Legend content={<CustomLegend />} />}
        </PieChart>
      </ResponsiveContainer>
    </WidgetWrapper>
  );
}
