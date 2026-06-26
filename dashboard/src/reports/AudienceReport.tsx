// ============================================================
// تقرير الجمهور (Audience Report)
// AudienceReport.tsx
// ============================================================

import React, { useMemo } from 'react';
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts';
import { THEME, CHART_COLORS, AGE_COLORS, DEVICE_COLORS, GENDER_COLORS } from '@utils/colors';
import { formatPercent, formatNumber } from '@utils/formatters';
import type { AudienceData, GeoData, DeviceData, TimeHeatmapData } from '@/types';

interface AudienceReportProps {
  ageData?: AudienceData[];
  genderData?: AudienceData[];
  deviceData?: DeviceData[];
  geoData?: GeoData[];
  timeData?: TimeHeatmapData[];
  loading?: boolean;
}

// أداة التولتيب المخصصة
const PieTooltip = ({ active, payload }: any) => {
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
      <p style={{ margin: 0, fontWeight: 600, color: THEME.text.primary }}>
        {payload[0].name}
      </p>
      <p style={{ margin: '0.25rem 0 0', color: THEME.text.secondary, fontSize: '0.85rem' }}>
        {formatPercent(payload[0].value)}
      </p>
    </div>
  );
};

export default function AudienceReport({
  ageData = [],
  genderData = [],
  deviceData = [],
  geoData = [],
  timeData = [],
  loading = false,
}: AudienceReportProps) {
  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: THEME.text.muted }}>
        جاري تحميل تقرير الجمهور...
      </div>
    );
  }

  const hasGeoData = geoData.length > 0;
  const hasTimeData = timeData.length > 0;

  return (
    <div style={{ direction: 'rtl' }}>
      <h2 style={{ margin: '0 0 0.25rem', fontWeight: 700, color: THEME.text.primary }}>
        👥 تقرير الجمهور
      </h2>
      <p style={{ margin: '0 0 1.5rem', color: THEME.text.muted, fontSize: '0.85rem' }}>
        تحليل ديموغرافي وجغرافي للجمهور المستهدف
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
        {/* العمر - رسم دائري */}
        <ReportCard title="الفئة العمرية" icon="👤">
          {ageData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={ageData.map(d => ({ name: d.ageGroup, value: d.percentage }))}
                  cx="50%" cy="50%"
                  innerRadius={55} outerRadius={90}
                  dataKey="value"
                  animationBegin={0}
                  animationDuration={800}
                >
                  {ageData.map((d, i) => (
                    <Cell key={i} fill={AGE_COLORS[d.ageGroup] || CHART_COLORS[i]} />
                  ))}
                </Pie>
                <Tooltip content={<PieTooltip />} />
                <Legend
                  formatter={(value: string) => (
                    <span style={{ color: THEME.text.secondary, fontSize: '0.8rem' }}>{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState message="لا توجد بيانات عمرية" />
          )}
        </ReportCard>

        {/* الجنس - رسم دائري */}
        <ReportCard title="الجنس" icon="⚧️">
          {genderData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={genderData.map(d => ({
                    name: d.gender === 'male' ? 'ذكر' : d.gender === 'female' ? 'أنثى' : 'أخرى',
                    value: d.percentage,
                  }))}
                  cx="50%" cy="50%"
                  innerRadius={55} outerRadius={90}
                  dataKey="value"
                  animationBegin={0}
                  animationDuration={800}
                >
                  {genderData.map((d, i) => (
                    <Cell key={i} fill={GENDER_COLORS[d.gender] || CHART_COLORS[i]} />
                  ))}
                </Pie>
                <Tooltip content={<PieTooltip />} />
                <Legend
                  formatter={(value: string) => (
                    <span style={{ color: THEME.text.secondary, fontSize: '0.8rem' }}>{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState message="لا توجد بيانات جنس" />
          )}
        </ReportCard>

        {/* الأجهزة - رسم دائري */}
        <ReportCard title="الأجهزة" icon="📱">
          {deviceData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={deviceData.map(d => ({
                    name: d.device === 'mobile' ? 'جوال' : d.device === 'desktop' ? 'كمبيوتر' : 'تابلت',
                    value: d.percentage,
                  }))}
                  cx="50%" cy="50%"
                  innerRadius={55} outerRadius={90}
                  dataKey="value"
                  animationBegin={0}
                  animationDuration={800}
                >
                  {deviceData.map((d, i) => (
                    <Cell key={i} fill={DEVICE_COLORS[d.device] || CHART_COLORS[i]} />
                  ))}
                </Pie>
                <Tooltip content={<PieTooltip />} />
                <Legend
                  formatter={(value: string) => (
                    <span style={{ color: THEME.text.secondary, fontSize: '0.8rem' }}>{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState message="لا توجد بيانات أجهزة" />
          )}
        </ReportCard>

        {/* الجغرافيا */}
        <ReportCard title="الدول" icon="🌍">
          {hasGeoData ? (
            <div style={{ maxHeight: '250px', overflowY: 'auto' }}>
              {geoData.slice(0, 10).map((geo, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.4rem 0',
                    borderBottom: `1px solid ${THEME.border}`,
                  }}
                >
                  <span style={{ fontSize: '1.1rem', width: '24px', textAlign: 'center' }}>
                    {getFlagEmoji(geo.country)}
                  </span>
                  <span style={{ flex: 1, fontSize: '0.85rem', color: THEME.text.primary }}>
                    {geo.country}{geo.city ? ` - ${geo.city}` : ''}
                  </span>
                  <div style={{ width: '60px', height: '6px', background: THEME.bg.tertiary, borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{
                      width: `${geo.percentage}%`,
                      height: '100%',
                      background: CHART_COLORS[i % CHART_COLORS.length],
                      borderRadius: '3px',
                    }} />
                  </div>
                  <span style={{ fontSize: '0.75rem', color: THEME.text.muted, width: '50px', textAlign: 'left' }}>
                    {formatPercent(geo.percentage)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState message="لا توجد بيانات جغرافية" />
          )}
        </ReportCard>
      </div>

      {/* Heatmap الزمني */}
      {hasTimeData && (
        <ReportCard title="خريطة الوقت" icon="⏰" style={{ marginTop: '1rem' }}>
          <div style={{ overflowX: 'auto' }}>
            <TimeHeatmap data={timeData} />
          </div>
        </ReportCard>
      )}
    </div>
  );
}

// ============================================================
// مكونات مساعدة
// ============================================================

function ReportCard({ title, icon, children, style }: {
  title: string;
  icon: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <div
      style={{
        background: THEME.bg.card,
        borderRadius: THEME.radius,
        boxShadow: THEME.shadow,
        border: `1px solid ${THEME.border}`,
        padding: '1.25rem',
        ...style,
      }}
    >
      <h3 style={{ margin: '0 0 1rem', fontSize: '0.95rem', color: THEME.text.primary, fontWeight: 600 }}>
        {icon} {title}
      </h3>
      {children}
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '200px',
      color: THEME.text.muted,
    }}>
      <span style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📭</span>
      <p style={{ margin: 0, fontSize: '0.85rem' }}>{message}</p>
    </div>
  );
}

function TimeHeatmap({ data }: { data: TimeHeatmapData[] }) {
  const days = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
  const hours = Array.from({ length: 24 }, (_, i) => `${i}`);

  // بناء المصفوفة
  const grid: number[][] = days.map(() => Array(24).fill(0));
  let maxVal = 0;

  for (const d of data) {
    if (d.dayOfWeek >= 0 && d.dayOfWeek < 7 && d.hour >= 0 && d.hour < 24) {
      grid[d.dayOfWeek][d.hour] = d.value;
      if (d.value > maxVal) maxVal = d.value;
    }
  }

  const getOpacity = (val: number) => maxVal > 0 ? val / maxVal : 0;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
        <div style={{ width: '70px', flexShrink: 0 }} />
        <div style={{ display: 'flex', gap: '1px', flex: 1 }}>
          {hours.map((h, i) => (
            <div key={i} style={{
              flex: 1,
              textAlign: 'center',
              fontSize: '0.6rem',
              color: THEME.text.muted,
              writingMode: 'vertical-lr',
              transform: 'rotate(0deg)',
            }}>
              {i % 3 === 0 ? h : ''}
            </div>
          ))}
        </div>
      </div>
      {days.map((day, di) => (
        <div key={di} style={{ display: 'flex', alignItems: 'center', marginBottom: '2px' }}>
          <div style={{
            width: '70px',
            fontSize: '0.7rem',
            color: THEME.text.secondary,
            flexShrink: 0,
          }}>
            {day}
          </div>
          <div style={{ display: 'flex', gap: '1px', flex: 1 }}>
            {grid[di].map((val, hi) => (
              <div
                key={hi}
                title={`${day} ${hi}:00 - ${formatNumber(val)}`}
                style={{
                  flex: 1,
                  aspectRatio: '1',
                  borderRadius: '1px',
                  backgroundColor: `rgba(99, 102, 241, ${getOpacity(val)})`,
                  border: val > 0 ? 'none' : `1px solid ${THEME.border}`,
                  transition: 'all 0.1s',
                  cursor: 'pointer',
                  minHeight: '14px',
                }}
              />
            ))}
          </div>
        </div>
      ))}
      {/* وسيلة الإيضاح */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.5rem', justifyContent: 'center' }}>
        <span style={{ fontSize: '0.65rem', color: THEME.text.muted }}>أقل</span>
        {[0, 0.25, 0.5, 0.75, 1].map((o, i) => (
          <div key={i} style={{
            width: '16px',
            height: '16px',
            borderRadius: '2px',
            backgroundColor: `rgba(99, 102, 241, ${o})`,
            border: o === 0 ? `1px solid ${THEME.border}` : 'none',
          }} />
        ))}
        <span style={{ fontSize: '0.65rem', color: THEME.text.muted }}>أكثر</span>
      </div>
    </div>
  );
}

// الحصول على علم الدولة (emoji)
function getFlagEmoji(country: string): string {
  const flags: Record<string, string> = {
    'السعودية': '🇸🇦',
    'الإمارات': '🇦🇪',
    'مصر': '🇪🇬',
    'الكويت': '🇰🇼',
    'قطر': '🇶🇦',
    'البحرين': '🇧🇭',
    'عمان': '🇴🇲',
    'الأردن': '🇯🇴',
    'العراق': '🇮🇶',
    'لبنان': '🇱🇧',
    'المغرب': '🇲🇦',
    'الجزائر': '🇩🇿',
    'تونس': '🇹🇳',
    'ليبيا': '🇱🇾',
    'السودان': '🇸🇩',
    'سوريا': '🇸🇾',
    'فلسطين': '🇵🇸',
    'اليمن': '🇾🇪',
  };
  return flags[country] || '🌍';
}
