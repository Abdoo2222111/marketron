// ============================================================
// تقرير المنافسين (Competitor Report)
// CompetitorReport.tsx
// ============================================================

import React, { useMemo, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { THEME, CHART_COLORS, PLATFORM_COLORS } from '@utils/colors';
import { formatCurrency, formatNumber, formatPercent } from '@utils/formatters';
import type { Competitor, PlatformType } from '@/types';
import { PLATFORMS } from '@/types';

interface CompetitorReportProps {
  data?: Competitor[];
  loading?: boolean;
}

const COMPARISON_METRICS = [
  { key: 'spend' as const, label: 'الإنفاق', format: (v: number) => formatCurrency(v) },
  { key: 'impressions' as const, label: 'مرات الظهور', format: (v: number) => formatNumber(v) },
  { key: 'clicks' as const, label: 'النقرات', format: (v: number) => formatNumber(v) },
  { key: 'ctr' as const, label: 'CTR', format: (v: number) => formatPercent(v) },
  { key: 'engagement' as const, label: 'التفاعل', format: (v: number) => formatPercent(v) },
];

export default function CompetitorReport({
  data = [],
  loading = false,
}: CompetitorReportProps) {
  const [selectedMetric, setSelectedMetric] = useState<string>('spend');

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center', color: THEME.text.muted }}>جاري تحميل تقرير المنافسين...</div>;
  }

  const chartData = useMemo(() => {
    const metric = COMPARISON_METRICS.find(m => m.key === selectedMetric);
    if (!metric) return [];

    return [...data]
      .sort((a, b) => (b[metric.key] as number) - (a[metric.key] as number))
      .map(c => ({
        name: c.name,
        value: c[metric.key] as number,
        platform: c.platform,
        color: PLATFORM_COLORS[c.platform] || '#6366f1',
        platformName: PLATFORMS[c.platform]?.nameAr || c.platform,
        icon: PLATFORMS[c.platform]?.icon || '📋',
        formatted: metric.format(c[metric.key] as number),
      }));
  }, [data, selectedMetric]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    const item = payload[0].payload;
    return (
      <div style={{
        background: THEME.bg.card,
        border: `1px solid ${THEME.border}`,
        borderRadius: '0.5rem',
        padding: '0.75rem',
        direction: 'rtl',
        boxShadow: THEME.shadowLg,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
          <span>{item.icon}</span>
          <span style={{ fontWeight: 600, fontSize: '0.9rem', color: THEME.text.primary }}>
            {item.name}
          </span>
        </div>
        <p style={{ margin: '0.15rem 0', fontSize: '0.8rem', color: THEME.text.secondary }}>
          المنصة: {item.platformName}
        </p>
        <p style={{ margin: '0.15rem 0', fontSize: '0.8rem', color: THEME.text.secondary }}>
          القيمة: <strong style={{ color: item.color }}>{item.formatted}</strong>
        </p>
      </div>
    );
  };

  return (
    <div style={{ direction: 'rtl' }}>
      <h2 style={{ margin: '0 0 0.25rem', fontWeight: 700, color: THEME.text.primary }}>
        🏢 تقرير المنافسين
      </h2>
      <p style={{ margin: '0 0 1.5rem', color: THEME.text.muted, fontSize: '0.85rem' }}>
        مقارنة الأداء مع المنافسين في السوق
      </p>

      {data.length === 0 ? (
        <div style={{
          background: THEME.bg.card,
          borderRadius: THEME.radius,
          boxShadow: THEME.shadow,
          padding: '3rem',
          textAlign: 'center',
          color: THEME.text.muted,
        }}>
          <span style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}>📊</span>
          <p style={{ fontSize: '1rem', margin: 0 }}>لا توجد بيانات منافسين متاحة حالياً</p>
          <p style={{ fontSize: '0.85rem', margin: '0.5rem 0 0' }}>
            قم بإضافة منافسين من إعدادات المنصة لعرض المقارنات
          </p>
        </div>
      ) : (
        <>
          {/* أزرار اختيار المقياس */}
          <div style={{
            display: 'flex',
            gap: '0.5rem',
            marginBottom: '1rem',
            flexWrap: 'wrap',
          }}>
            {COMPARISON_METRICS.map(metric => (
              <button
                key={metric.key}
                onClick={() => setSelectedMetric(metric.key)}
                style={{
                  padding: '0.4rem 0.75rem',
                  fontSize: '0.8rem',
                  background: selectedMetric === metric.key ? THEME.bg.tertiary : 'transparent',
                  border: `1px solid ${selectedMetric === metric.key ? THEME.text.primary : THEME.border}`,
                  borderRadius: '0.375rem',
                  color: selectedMetric === metric.key ? THEME.text.primary : THEME.text.secondary,
                  cursor: 'pointer',
                  fontWeight: selectedMetric === metric.key ? 600 : 400,
                  transition: 'all 0.2s',
                }}
              >
                {metric.label}
              </button>
            ))}
          </div>

          {/* الرسم البياني للمقارنة */}
          <div style={{
            background: THEME.bg.card,
            borderRadius: THEME.radius,
            boxShadow: THEME.shadow,
            border: `1px solid ${THEME.border}`,
            padding: '1.25rem',
            marginBottom: '1rem',
          }}>
            <h3 style={{ margin: '0 0 1rem', fontSize: '0.95rem', color: THEME.text.primary, fontWeight: 600 }}>
              📊 مقارنة حسب {COMPARISON_METRICS.find(m => m.key === selectedMetric)?.label}
            </h3>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
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
                  tick={{ fontSize: 11, fill: THEME.text.secondary }}
                  tickLine={false}
                  axisLine={{ stroke: THEME.border }}
                  width={100}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={28}>
                  {chartData.map((entry, index) => (
                    <rect key={index} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* جدول المنافسين */}
          <div style={{
            background: THEME.bg.card,
            borderRadius: THEME.radius,
            boxShadow: THEME.shadow,
            border: `1px solid ${THEME.border}`,
            padding: '1.25rem',
          }}>
            <h3 style={{ margin: '0 0 1rem', fontSize: '0.95rem', color: THEME.text.primary, fontWeight: 600 }}>
              📋 جدول المنافسين
            </h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '0.85rem',
              }}>
                <thead>
                  <tr style={{ borderBottom: `2px solid ${THEME.border}` }}>
                    <th style={thStyle}>المنافس</th>
                    <th style={thStyle}>المنصة</th>
                    <th style={thStyle}>الإنفاق</th>
                    <th style={thStyle}>مرات الظهور</th>
                    <th style={thStyle}>النقرات</th>
                    <th style={thStyle}>CTR</th>
                    <th style={thStyle}>التفاعل</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((competitor, i) => (
                    <tr
                      key={i}
                      style={{
                        borderBottom: `1px solid ${THEME.border}`,
                        backgroundColor: i % 2 === 0 ? 'transparent' : THEME.bg.secondary,
                        transition: 'background-color 0.2s',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.backgroundColor = THEME.bg.tertiary)}
                      onMouseLeave={e => (e.currentTarget.style.backgroundColor = i % 2 === 0 ? 'transparent' : THEME.bg.secondary)}
                    >
                      <td style={tdStyle}>
                        <span style={{ fontWeight: 600, color: THEME.text.primary }}>
                          {competitor.name}
                        </span>
                      </td>
                      <td style={tdStyle}>
                        <span style={{
                          color: PLATFORM_COLORS[competitor.platform],
                          fontWeight: 500,
                        }}>
                          {PLATFORMS[competitor.platform]?.icon} {PLATFORMS[competitor.platform]?.nameAr || competitor.platform}
                        </span>
                      </td>
                      <td style={{ ...tdStyle, color: THEME.text.primary, fontWeight: 600, direction: 'ltr' }}>
                        {formatCurrency(competitor.spend)}
                      </td>
                      <td style={tdStyle}>{formatNumber(competitor.impressions)}</td>
                      <td style={tdStyle}>{formatNumber(competitor.clicks)}</td>
                      <td style={{ ...tdStyle, color: '#f59e0b', fontWeight: 600 }}>
                        {formatPercent(competitor.ctr)}
                      </td>
                      <td style={{ ...tdStyle, color: '#10b981', fontWeight: 600 }}>
                        {formatPercent(competitor.engagement)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* تحليل نصي */}
          <div style={{
            background: THEME.bg.card,
            borderRadius: THEME.radius,
            boxShadow: THEME.shadow,
            border: `1px solid ${THEME.border}`,
            padding: '1.25rem',
            marginTop: '1rem',
          }}>
            <h3 style={{ margin: '0 0 1rem', fontSize: '0.95rem', color: THEME.text.primary, fontWeight: 600 }}>
              🤖 تحليل تنافسي
            </h3>
            <CompetitorInsights data={data} />
          </div>
        </>
      )}
    </div>
  );
}

// ============================================================
// تحليل تنافسي نصي (يمكن استبداله ب AI Services)
// ============================================================

function CompetitorInsights({ data }: { data: Competitor[] }) {
  const insights = useMemo(() => {
    const results: string[] = [];

    if (data.length === 0) return results;

    // أعلى إنفاق
    const topSpend = [...data].sort((a, b) => b.spend - a.spend)[0];
    results.push(`- **${topSpend.name}** يتصدر قائمة الإنفاق بـ **${formatCurrency(topSpend.spend)}**، مما يشير إلى حملة تسويقية مكثفة.`);

    // أعلى نسبة تفاعل
    const topEngagement = [...data].sort((a, b) => b.engagement - a.engagement)[0];
    results.push(`- **${topEngagement.name}** يحقق أعلى نسبة تفاعل (${formatPercent(topEngagement.engagement)})، مما يعكس محتوى إعلاني جذاب.`);

    // أعلى CTR
    const topCtr = [...data].sort((a, b) => b.ctr - a.ctr)[0];
    results.push(`- **${topCtr.name}** يتمتع بأعلى نسبة نقر (${formatPercent(topCtr.ctr)})، مما يدل على استهداف دقيق وإعلانات فعّالة.`);

    // متوسط الإنفاق
    const avgSpend = data.reduce((s, c) => s + c.spend, 0) / data.length;
    const ourEstimate = avgSpend * 1.1; // تقدير
    results.push(`- متوسط الإنفاق التقديري للمنافسين هو **${formatCurrency(avgSpend)}**. لتحسين التنافسية، يُوصى بضبط الميزانية لتكون أعلى من المتوسط.`);

    // توزيع المنافسين حسب المنصة
    const platformDistribution = data.reduce((acc, c) => {
      acc[c.platform] = (acc[c.platform] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topPlatform = Object.entries(platformDistribution).sort(([, a], [, b]) => b - a)[0];
    if (topPlatform) {
      const platformName = PLATFORMS[topPlatform[0] as PlatformType]?.nameAr || topPlatform[0];
      results.push(`- **${platformName}** هي المنصة الأكثر استخداماً بين المنافسين (${topPlatform[1]} من أصل ${data.length})، يُوصى بتركيز الجهود عليها.`);
    }

    return results;
  }, [data]);

  if (insights.length === 0) return null;

  return (
    <div style={{ fontSize: '0.85rem', lineHeight: 1.8, color: THEME.text.primary }}>
      {insights.map((insight, i) => (
        <p key={i} style={{ margin: '0.25rem 0' }}>
          {insight.split('**').map((part, j) =>
            j % 2 === 1 ? (
              <strong key={j} style={{ color: THEME.text.primary }}>{part}</strong>
            ) : (
              part
            )
          )}
        </p>
      ))}
      <p style={{ marginTop: '0.75rem', fontSize: '0.75rem', color: THEME.text.muted }}>
        * هذا التحليل مبني على البيانات المتاحة وقد يختلف عن الواقع الفعلي.
      </p>
    </div>
  );
}

const thStyle: React.CSSProperties = {
  padding: '0.75rem 0.5rem',
  textAlign: 'right',
  fontWeight: 600,
  color: THEME.text.muted,
  fontSize: '0.75rem',
  whiteSpace: 'nowrap',
};

const tdStyle: React.CSSProperties = {
  padding: '0.6rem 0.5rem',
  color: THEME.text.secondary,
  fontSize: '0.8rem',
  whiteSpace: 'nowrap',
};
