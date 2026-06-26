// ============================================================
// تحليل التكلفة (Cost Analysis Report)
// CostAnalysisReport.tsx
// ============================================================

import React, { useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar,
} from 'recharts';
import { THEME, CHART_COLORS, PLATFORM_COLORS } from '@utils/colors';
import { formatCurrency, formatNumber, formatDate, formatPercent } from '@utils/formatters';
import type { PerformanceData, PlatformType } from '@/types';
import { PLATFORMS } from '@/types';
import { toBarChartByPlatform } from '@utils/dataTransformers';

interface CostAnalysisReportProps {
  data: PerformanceData[];
  loading?: boolean;
}

export default function CostAnalysisReport({ data, loading }: CostAnalysisReportProps) {
  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center', color: THEME.text.muted }}>جاري تحميل تحليل التكلفة...</div>;
  }

  // تجميع حسب التاريخ
  const dailyData = useMemo(() => {
    const grouped = new Map<string, any>();

    for (const item of data) {
      if (!grouped.has(item.date)) {
        grouped.set(item.date, {
          date: item.date,
          spend: 0, impressions: 0, clicks: 0, conversions: 0,
        });
      }
      const g = grouped.get(item.date);
      g.spend += item.spend;
      g.impressions += item.impressions;
      g.clicks += item.clicks;
      g.conversions += item.conversions;
    }

    return Array.from(grouped.values())
      .sort((a, b) => a.date.localeCompare(b.date))
      .map(g => ({
        date: g.date,
        cpm: g.impressions > 0 ? (g.spend / g.impressions) * 1000 : 0,
        cpc: g.clicks > 0 ? g.spend / g.clicks : 0,
        cpa: g.conversions > 0 ? g.spend / g.conversions : 0,
        spend: g.spend,
        clicks: g.clicks,
      }));
  }, [data]);

  // توزيع التكلفة حسب المنصة
  const platformCostData = useMemo(() => {
    return toBarChartByPlatform(data, 'spend');
  }, [data]);

  // أدنى وأعلى تكلفة
  const stats = useMemo(() => {
    const totals = { spend: 0, impressions: 0, clicks: 0, conversions: 0 };
    for (const item of data) {
      totals.spend += item.spend;
      totals.impressions += item.impressions;
      totals.clicks += item.clicks;
      totals.conversions += item.conversions;
    }
    return {
      cpm: totals.impressions > 0 ? (totals.spend / totals.impressions) * 1000 : 0,
      cpc: totals.clicks > 0 ? totals.spend / totals.clicks : 0,
      cpa: totals.conversions > 0 ? totals.spend / totals.conversions : 0,
      avgCpm: totals.impressions > 0 ? (totals.spend / totals.impressions) * 1000 : 0,
    };
  }, [data]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={{
        background: THEME.bg.card,
        border: `1px solid ${THEME.border}`,
        borderRadius: '0.5rem',
        padding: '0.75rem',
        direction: 'rtl',
        boxShadow: THEME.shadowLg,
      }}>
        <p style={{ margin: '0 0 0.5rem', fontWeight: 600, fontSize: '0.8rem' }}>
          {formatDate(label)}
        </p>
        {payload.map((p: any, i: number) => (
          <div key={i} style={{
            display: 'flex', justifyContent: 'space-between', gap: '1rem',
            fontSize: '0.8rem', color: THEME.text.secondary,
          }}>
            <span style={{ color: p.color }}>{p.name}</span>
            <span style={{ fontWeight: 600, color: THEME.text.primary, direction: 'ltr' }}>
              {formatCurrency(p.value, 2)}
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div style={{ direction: 'rtl' }}>
      <h2 style={{ margin: '0 0 0.25rem', fontWeight: 700, color: THEME.text.primary }}>
        💰 تحليل التكلفة
      </h2>
      <p style={{ margin: '0 0 1.5rem', color: THEME.text.muted, fontSize: '0.85rem' }}>
        تحليل تكلفة الإعلان عبر المنصات والفترات
      </p>

      {/* بطاقات إحصائيات التكلفة */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '0.75rem',
        marginBottom: '1.5rem',
      }}>
        {[
          { label: 'متوسط CPM', value: formatCurrency(stats.cpm, 2), color: '#ec4899', desc: 'تكلفة الألف ظهور' },
          { label: 'متوسط CPC', value: formatCurrency(stats.cpc, 2), color: '#ef4444', desc: 'تكلفة النقرة' },
          { label: 'متوسط CPA', value: formatCurrency(stats.cpa, 2), color: '#f97316', desc: 'تكلفة التحويل' },
          { label: 'إجمالي الإنفاق', value: formatCurrency(data.reduce((s, d) => s + d.spend, 0)), color: '#6366f1', desc: 'المبلغ المصروف' },
        ].map((stat, i) => (
          <div key={i} style={{
            padding: '1rem',
            borderRadius: '0.5rem',
            background: THEME.bg.secondary,
            textAlign: 'center',
            borderTop: `3px solid ${stat.color}`,
          }}>
            <div style={{ fontSize: '0.75rem', color: THEME.text.muted, marginBottom: '0.25rem' }}>
              {stat.label}
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: stat.color, direction: 'ltr' }}>
              {stat.value}
            </div>
            <div style={{ fontSize: '0.65rem', color: THEME.text.muted, marginTop: '0.2rem' }}>
              {stat.desc}
            </div>
          </div>
        ))}
      </div>

      {/* رسم CPM/CPC/CPA عبر الزمن */}
      <div style={{
        background: THEME.bg.card,
        borderRadius: THEME.radius,
        boxShadow: THEME.shadow,
        border: `1px solid ${THEME.border}`,
        padding: '1.25rem',
        marginBottom: '1rem',
      }}>
        <h3 style={{ margin: '0 0 1rem', fontSize: '0.95rem', color: THEME.text.primary, fontWeight: 600 }}>
          📈 تكاليف الإعلان عبر الزمن
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={dailyData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={THEME.border} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: THEME.text.muted }}
              tickFormatter={(val) => formatDate(val, 'short')}
              tickLine={false}
              axisLine={{ stroke: THEME.border }}
            />
            <YAxis
              tick={{ fontSize: 11, fill: THEME.text.muted }}
              tickFormatter={(val) => formatCurrency(val, 0)}
              tickLine={false}
              axisLine={{ stroke: THEME.border }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              formatter={(value: string) => (
                <span style={{ color: THEME.text.secondary, fontSize: '0.8rem' }}>{value}</span>
              )}
            />
            <Line type="monotone" dataKey="cpm" stroke="#ec4899" strokeWidth={2} dot={false} name="CPM" />
            <Line type="monotone" dataKey="cpc" stroke="#ef4444" strokeWidth={2} dot={false} name="CPC" />
            <Line type="monotone" dataKey="cpa" stroke="#f97316" strokeWidth={2} dot={false} name="CPA" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* مقارنة تكلفة المنصات */}
      <div style={{
        background: THEME.bg.card,
        borderRadius: THEME.radius,
        boxShadow: THEME.shadow,
        border: `1px solid ${THEME.border}`,
        padding: '1.25rem',
      }}>
        <h3 style={{ margin: '0 0 1rem', fontSize: '0.95rem', color: THEME.text.primary, fontWeight: 600 }}>
          📊 توزيع الإنفاق حسب المنصة
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={platformCostData} layout="vertical" margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={THEME.border} vertical={false} />
            <XAxis
              type="number"
              tick={{ fontSize: 11, fill: THEME.text.muted }}
              tickFormatter={(val) => formatCurrency(val, 0)}
              tickLine={false}
              axisLine={{ stroke: THEME.border }}
            />
            <YAxis
              type="category"
              dataKey="platform"
              tick={{ fontSize: 11, fill: THEME.text.secondary }}
              tickLine={false}
              axisLine={{ stroke: THEME.border }}
            />
            <Tooltip
              formatter={(value: number) => formatCurrency(value)}
              contentStyle={{
                background: THEME.bg.card,
                border: `1px solid ${THEME.border}`,
                borderRadius: '0.5rem',
                direction: 'rtl',
              }}
            />
            <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={28}>
              {platformCostData.map((entry, index) => (
                <rect key={index} fill={entry.color || CHART_COLORS[index]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
