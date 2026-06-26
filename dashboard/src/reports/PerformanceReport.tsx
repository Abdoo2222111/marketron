// ============================================================
// تقرير الأداء الشامل (Performance Report)
// PerformanceReport.tsx
// ============================================================

import React, { useState, useMemo, useCallback } from 'react';
import { AgGridReact } from '@ag-grid-community/react';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { ModuleRegistry } from '@ag-grid-community/core';
import { THEME, PLATFORM_COLORS, STATUS_COLORS } from '@utils/colors';
import { formatCurrency, formatNumber, formatPercent, formatDate } from '@utils/formatters';
import type { PerformanceData, PlatformType, MetricKey } from '@/types';
import { PLATFORMS } from '@/types';

// تسجيل وحدات AG Grid
ModuleRegistry.registerModules([ClientSideRowModelModule]);

interface PerformanceReportProps {
  data: PerformanceData[];
  loading?: boolean;
}

export default function PerformanceReport({ data, loading }: PerformanceReportProps) {
  const [quickFilter, setQuickFilter] = useState('');

  // تجميع البيانات حسب المنصة
  const rowData = useMemo(() => {
    const grouped = new Map<string, any>();

    for (const item of data) {
      const key = `${item.date}_${item.platform}`;
      if (!grouped.has(key)) {
        grouped.set(key, {
          date: item.date,
          platform: item.platform,
          platformAr: PLATFORMS[item.platform]?.nameAr || item.platform,
          platformColor: PLATFORMS[item.platform]?.color || '#6366f1',
          spend: 0,
          impressions: 0,
          clicks: 0,
          conversions: 0,
          revenue: 0,
          reach: 0,
        });
      }
      const g = grouped.get(key);
      g.spend += item.spend;
      g.impressions += item.impressions;
      g.clicks += item.clicks;
      g.conversions += item.conversions;
      g.revenue += item.revenue;
      g.reach += item.reach;
    }

    return Array.from(grouped.values()).map(g => ({
      ...g,
      ctr: g.impressions > 0 ? (g.clicks / g.impressions) * 100 : 0,
      cpc: g.clicks > 0 ? g.spend / g.clicks : 0,
      cpm: g.impressions > 0 ? (g.spend / g.impressions) * 1000 : 0,
      cpa: g.conversions > 0 ? g.spend / g.conversions : 0,
      roas: g.spend > 0 ? g.revenue / g.spend : 0,
      conversionRate: g.clicks > 0 ? (g.conversions / g.clicks) * 100 : 0,
    }));
  }, [data]);

  // تعريف الأعمدة
  const columnDefs = useMemo(() => [
    {
      headerName: 'التاريخ',
      field: 'date',
      sortable: true,
      filter: 'agDateColumnFilter',
      width: 120,
      cellRenderer: (params: any) => formatDate(params.value),
    },
    {
      headerName: 'المنصة',
      field: 'platformAr',
      sortable: true,
      filter: true,
      width: 120,
      cellRenderer: (params: any) => (
        <span style={{ color: params.data.platformColor, fontWeight: 600 }}>
          {params.data.platformIcon} {params.value}
        </span>
      ),
    },
    {
      headerName: 'الإنفاق',
      field: 'spend',
      sortable: true,
      filter: 'agNumberColumnFilter',
      width: 120,
      type: 'rightAligned',
      cellRenderer: (params: any) => (
        <span dir="ltr" style={{ fontWeight: 600 }}>{formatCurrency(params.value)}</span>
      ),
    },
    {
      headerName: 'مرات الظهور',
      field: 'impressions',
      sortable: true,
      filter: 'agNumberColumnFilter',
      width: 130,
      type: 'rightAligned',
      cellRenderer: (params: any) => formatNumber(params.value),
    },
    {
      headerName: 'النقرات',
      field: 'clicks',
      sortable: true,
      filter: 'agNumberColumnFilter',
      width: 110,
      type: 'rightAligned',
      cellRenderer: (params: any) => formatNumber(params.value),
    },
    {
      headerName: 'CTR',
      field: 'ctr',
      sortable: true,
      filter: 'agNumberColumnFilter',
      width: 90,
      type: 'rightAligned',
      cellRenderer: (params: any) => formatPercent(params.value),
      cellStyle: { color: '#f59e0b', fontWeight: 600 },
    },
    {
      headerName: 'تكلفة النقرة',
      field: 'cpc',
      sortable: true,
      filter: 'agNumberColumnFilter',
      width: 110,
      type: 'rightAligned',
      cellRenderer: (params: any) => (
        <span dir="ltr">{formatCurrency(params.value, 2)}</span>
      ),
    },
    {
      headerName: 'التحويلات',
      field: 'conversions',
      sortable: true,
      filter: 'agNumberColumnFilter',
      width: 110,
      type: 'rightAligned',
      cellRenderer: (params: any) => formatNumber(params.value),
    },
    {
      headerName: 'تكلفة التحويل',
      field: 'cpa',
      sortable: true,
      filter: 'agNumberColumnFilter',
      width: 120,
      type: 'rightAligned',
      cellRenderer: (params: any) => (
        <span dir="ltr">{formatCurrency(params.value, 2)}</span>
      ),
    },
    {
      headerName: 'العائد',
      field: 'revenue',
      sortable: true,
      filter: 'agNumberColumnFilter',
      width: 110,
      type: 'rightAligned',
      cellRenderer: (params: any) => (
        <span style={{ color: '#22c55e', fontWeight: 600, direction: 'ltr' }}>
          {formatCurrency(params.value)}
        </span>
      ),
    },
    {
      headerName: 'ROAS',
      field: 'roas',
      sortable: true,
      filter: 'agNumberColumnFilter',
      width: 100,
      type: 'rightAligned',
      cellRenderer: (params: any) => (
        <span style={{ color: params.value >= 2 ? '#22c55e' : '#ef4444', fontWeight: 700 }}>
          {params.value.toFixed(2)}x
        </span>
      ),
    },
  ], []);

  const defaultColDef = useMemo(() => ({
    resizable: true,
    sortable: true,
    filter: true,
    floatingFilter: true,
    suppressMenu: true,
  }), []);

  const onFilterChanged = useCallback((e: any) => {
    // يمكن إضافة منطق إضافي هنا
  }, []);

  // إجمالي الصف
  const totals = useMemo(() => {
    const t = {
      spend: 0, impressions: 0, clicks: 0, conversions: 0, revenue: 0, reach: 0,
    };
    for (const item of data) {
      t.spend += item.spend;
      t.impressions += item.impressions;
      t.clicks += item.clicks;
      t.conversions += item.conversions;
      t.revenue += item.revenue;
      t.reach += item.reach;
    }
    return {
      ...t,
      ctr: t.impressions > 0 ? (t.clicks / t.impressions) * 100 : 0,
      cpc: t.clicks > 0 ? t.spend / t.clicks : 0,
      cpa: t.conversions > 0 ? t.spend / t.conversions : 0,
      roas: t.spend > 0 ? t.revenue / t.spend : 0,
    };
  }, [data]);

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center', color: THEME.text.muted }}>جاري تحميل التقرير...</div>;
  }

  return (
    <div
      style={{
        background: THEME.bg.card,
        borderRadius: THEME.radius,
        boxShadow: THEME.shadow,
        border: `1px solid ${THEME.border}`,
        padding: '1.5rem',
        direction: 'rtl',
      }}
    >
      {/* عنوان التقرير */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem',
        }}
      >
        <div>
          <h2 style={{ margin: 0, fontWeight: 700, color: THEME.text.primary, fontSize: '1.25rem' }}>
            📊 تقرير الأداء الشامل
          </h2>
          <p style={{ margin: '0.25rem 0 0', color: THEME.text.muted, fontSize: '0.85rem' }}>
            ملخص أداء المنصات - {formatDate(new Date().toISOString())}
          </p>
        </div>

        {/* مربع البحث السريع */}
        <input
          type="text"
          placeholder="🔍 بحث..."
          value={quickFilter}
          onChange={e => setQuickFilter(e.target.value)}
          style={{
            padding: '0.5rem 0.75rem',
            border: `1px solid ${THEME.border}`,
            borderRadius: '0.5rem',
            fontSize: '0.85rem',
            width: '200px',
            background: THEME.bg.secondary,
            color: THEME.text.primary,
          }}
        />
      </div>

      {/* بطاقات الإجمالي السريعة */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '0.75rem',
          marginBottom: '1.5rem',
        }}
      >
        {[
          { label: 'إجمالي الإنفاق', value: formatCurrency(totals.spend), color: '#6366f1' },
          { label: 'إجمالي مرات الظهور', value: formatNumber(totals.impressions), color: '#8b5cf6' },
          { label: 'إجمالي النقرات', value: formatNumber(totals.clicks), color: '#3b82f6' },
          { label: 'إجمالي التحويلات', value: formatNumber(totals.conversions), color: '#10b981' },
          { label: 'ROAS', value: `${totals.roas.toFixed(2)}x`, color: totals.roas >= 2 ? '#22c55e' : '#ef4444' },
          { label: 'CTR', value: formatPercent(totals.ctr), color: '#f59e0b' },
        ].map((stat, i) => (
          <div
            key={i}
            style={{
              padding: '1rem',
              borderRadius: '0.5rem',
              background: THEME.bg.secondary,
              textAlign: 'center',
              borderTop: `3px solid ${stat.color}`,
            }}
          >
            <div style={{ fontSize: '0.75rem', color: THEME.text.muted, marginBottom: '0.25rem' }}>
              {stat.label}
            </div>
            <div style={{ fontSize: '1.15rem', fontWeight: 700, color: stat.color }}>
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      {/* جدول الأداء */}
      <div
        className="ag-theme-quartz"
        style={{ height: '400px', width: '100%', direction: 'rtl' }}
      >
        <AgGridReact
          rowData={rowData}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          quickFilterText={quickFilter}
          pagination={true}
          paginationPageSize={15}
          animateRows={true}
          enableRtl={true}
          onFilterChanged={onFilterChanged}
          modules={[ClientSideRowModelModule]}
        />
      </div>
    </div>
  );
}
