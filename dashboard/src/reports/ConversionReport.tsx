// ============================================================
// تقرير التحويلات (Conversion Report)
// ConversionReport.tsx
// ============================================================

import React, { useMemo, useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar,
} from 'recharts';
import { THEME, CHART_COLORS } from '@utils/colors';
import { formatCurrency, formatNumber, formatDate, formatPercent } from '@utils/formatters';
import type { PerformanceData } from '@/types';
import { toFunnelData } from '@utils/dataTransformers';

interface ConversionReportProps {
  data: PerformanceData[];
  loading?: boolean;
}

export default function ConversionReport({ data, loading }: ConversionReportProps) {
  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center', color: THEME.text.muted }}>جاري تحميل تقرير التحويلات...</div>;
  }

  // تجميع حسب التاريخ
  const dailyData = useMemo(() => {
    const grouped = new Map<string, any>();

    for (const item of data) {
      if (!grouped.has(item.date)) {
        grouped.set(item.date, {
          date: item.date,
          conversions: 0, clicks: 0, impressions: 0, revenue: 0, spend: 0,
        });
      }
      const g = grouped.get(item.date);
      g.conversions += item.conversions;
      g.clicks += item.clicks;
      g.impressions += item.impressions;
      g.revenue += item.revenue;
      g.spend += item.spend;
    }

    return Array.from(grouped.values())
      .sort((a, b) => a.date.localeCompare(b.date))
      .map(g => ({
        ...g,
        cvr: g.clicks > 0 ? (g.conversions / g.clicks) * 100 : 0,
        cpa: g.conversions > 0 ? g.spend / g.conversions : 0,
        roas: g.spend > 0 ? g.revenue / g.spend : 0,
      }));
  }, [data]);

  // بيانات Funnel
  const funnelData = useMemo(() => toFunnelData(data), [data]);

  // إحصائيات سريعة
  const stats = useMemo(() => {
    const totals = { impressions: 0, clicks: 0, conversions: 0, revenue: 0, spend: 0 };
    for (const item of data) {
      totals.impressions += item.impressions;
      totals.clicks += item.clicks;
      totals.conversions += item.conversions;
      totals.revenue += item.revenue;
      totals.spend += item.spend;
    }
    return {
      conversions: totals.conversions,
      cvr: totals.clicks > 0 ? (totals.conversions / totals.clicks) * 100 : 0,
      cpa: totals.conversions > 0 ? totals.spend / totals.conversions : 0,
      revenue: totals.revenue,
      roas: totals.spend > 0 ? totals.revenue / totals.spend : 0,
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
            <span style={{ fontWeight: 600, color: THEME.text.primary }}>
              {p.name === 'CVR'
                ? formatPercent(p.value)
                : p.name === 'CPA'
                ? formatCurrency(p.value, 2)
                : formatNumber(p.value)}
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div style={{ direction: 'rtl' }}>
      <h2 style={{ margin: '0 0 0.25rem', fontWeight: 700, color: THEME.text.primary }}>
        ✅ تقرير التحويلات
      </h2>
      <p style={{ margin: '0 0 1.5rem', color: THEME.text.muted, fontSize: '0.85rem' }}>
        تحليل التحويلات وتكلفة الاكتساب
      </p>

      {/* بطاقات سريعة */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '0.75rem',
        marginBottom: '1.5rem',
      }}>
        {[
          { label: 'إجمالي التحويلات', value: formatNumber(stats.conversions), color: '#10b981' },
          { label: 'CVR', value: formatPercent(stats.cvr), color: '#06b6d4' },
          { label: 'CPA', value: formatCurrency(stats.cpa, 2), color: '#f97316' },
          { label: 'ROAS', value: `${stats.roas.toFixed(2)}x`, color: stats.roas >= 2 ? '#22c55e' : '#ef4444' },
          { label: 'العائد', value: formatCurrency(stats.revenue), color: '#14b8a6' },
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
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: stat.color }}>
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      {/* Funnel التحويلات */}
      <div style={{
        background: THEME.bg.card,
        borderRadius: THEME.radius,
        boxShadow: THEME.shadow,
        border: `1px solid ${THEME.border}`,
        padding: '1.25rem',
        marginBottom: '1rem',
      }}>
        <h3 style={{ margin: '0 0 1rem', fontSize: '0.95rem', color: THEME.text.primary, fontWeight: 600 }}>
          🔻 مسار التحويل (Funnel)
        </h3>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', alignItems: 'flex-end', minHeight: '200px' }}>
          {funnelData.map((stage, i) => {
            const width = stage.percentage;
            const colors = ['#8b5cf6', '#3b82f6', '#10b981'];
            return (
              <div key={i} style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.5rem',
                flex: 1,
              }}>
                <div style={{
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: THEME.text.primary,
                }}>
                  {formatNumber(stage.value)}
                </div>
                <div style={{
                  width: '100%',
                  maxWidth: '180px',
                  height: `${Math.max(width * 1.5, 30)}px`,
                  background: `linear-gradient(to top, ${colors[i]}, ${colors[i]}88)`,
                  borderRadius: '0.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'height 0.5s ease',
                  minHeight: '30px',
                  position: 'relative',
                }}>
                  <span style={{
                    color: '#fff',
                    fontSize: '0.7rem',
                    fontWeight: 600,
                    textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                  }}>
                    {formatPercent(stage.percentage)}
                  </span>
                </div>
                <div style={{
                  fontSize: '0.75rem',
                  color: THEME.text.secondary,
                  fontWeight: 500,
                }}>
                  {stage.stage}
                </div>
                {/* سهم الربط */}
                {i < funnelData.length - 1 && (
                  <div style={{ color: THEME.text.muted, fontSize: '0.8rem' }}>
                    ↓
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* التحويلات عبر الزمن */}
      <div style={{
        background: THEME.bg.card,
        borderRadius: THEME.radius,
        boxShadow: THEME.shadow,
        border: `1px solid ${THEME.border}`,
        padding: '1.25rem',
        marginBottom: '1rem',
      }}>
        <h3 style={{ margin: '0 0 1rem', fontSize: '0.95rem', color: THEME.text.primary, fontWeight: 600 }}>
          📈 التحويلات وتكلفة التحويل عبر الزمن
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
              yAxisId="left"
              tick={{ fontSize: 11, fill: THEME.text.muted }}
              tickFormatter={(val) => formatNumber(val)}
              tickLine={false}
              axisLine={{ stroke: THEME.border }}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
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
            <Line yAxisId="left" type="monotone" dataKey="conversions" stroke="#10b981" strokeWidth={2} dot={false} name="التحويلات" />
            <Line yAxisId="right" type="monotone" dataKey="cpa" stroke="#f97316" strokeWidth={2} dot={false} name="CPA" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* CVR وعوائد التحويل */}
      <div style={{
        background: THEME.bg.card,
        borderRadius: THEME.radius,
        boxShadow: THEME.shadow,
        border: `1px solid ${THEME.border}`,
        padding: '1.25rem',
      }}>
        <h3 style={{ margin: '0 0 1rem', fontSize: '0.95rem', color: THEME.text.primary, fontWeight: 600 }}>
          📊 نسبة التحويل (CVR) والعائد
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={dailyData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={THEME.border} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: THEME.text.muted }}
              tickFormatter={(val) => formatDate(val, 'short')}
              tickLine={false}
              axisLine={{ stroke: THEME.border }}
            />
            <YAxis
              yAxisId="left"
              tick={{ fontSize: 11, fill: THEME.text.muted }}
              tickFormatter={(val) => `${val.toFixed(1)}%`}
              tickLine={false}
              axisLine={{ stroke: THEME.border }}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tick={{ fontSize: 11, fill: THEME.text.muted }}
              tickFormatter={(val) => formatCurrency(val)}
              tickLine={false}
              axisLine={{ stroke: THEME.border }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              formatter={(value: string) => (
                <span style={{ color: THEME.text.secondary, fontSize: '0.8rem' }}>{value}</span>
              )}
            />
            <Bar yAxisId="left" dataKey="cvr" fill="#06b6d4" radius={[4, 4, 0, 0]} name="CVR" />
            <Line yAxisId="right" type="monotone" dataKey="roas" stroke="#22c55e" strokeWidth={2} dot={false} name="ROAS" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
