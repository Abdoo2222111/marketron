'use client';

import React, { useEffect, useState } from 'react';
import { Eye, MousePointerClick, Target, DollarSign, TrendingUp, Download, Filter, Loader2, AlertCircle, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { analyticsApi, campaignsApi, type AnalyticsOverview, type Campaign } from '@/services/api-modules';
import { formatNumber, formatCurrency } from '@/lib/utils';
import { EmptyState } from '@/components/ui/empty-state';

export default function AnalyticsPage({ params: { locale } }: { params: { locale: string } }) {
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    if (!token) {
      window.location.href = '/ar/auth/login';
      return;
    }
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const [overviewRes, campaignsRes] = await Promise.allSettled([
          analyticsApi.getOverview(),
          campaignsApi.list({ limit: 100 }),
        ]);
        if (overviewRes.status === 'fulfilled') {
          setOverview(overviewRes.value.data?.data || overviewRes.value.data);
        }
        if (campaignsRes.status === 'fulfilled') {
          setCampaigns(campaignsRes.value.data?.data || campaignsRes.value.data?.campaigns || []);
        }
      } catch (err: any) {
        setError(err?.response?.data?.error || 'فشل تحميل التحليلات');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [locale]);

  const handleExport = (format: 'pdf' | 'excel') => {
    alert(`سيتم تصدير التقرير بصيغة ${format} قريباً`);
  };

  const metrics = [
    { title: 'مرات الظهور', value: overview?.totalImpressions ?? campaigns.reduce((s, c) => s + (c.impressions || 0), 0), icon: Eye, gradient: 'from-electric to-cyan' },
    { title: 'النقرات', value: overview?.totalClicks ?? campaigns.reduce((s, c) => s + (c.clicks || 0), 0), icon: MousePointerClick, gradient: 'from-cyan to-blue-500' },
    { title: 'التحويلات', value: overview?.totalConversions ?? campaigns.reduce((s, c) => s + (c.conversions || 0), 0), icon: Target, gradient: 'from-emerald-500 to-teal-500' },
    { title: 'الإنفاق', value: overview?.totalSpend ?? campaigns.reduce((s, c) => s + (c.spent || 0), 0), icon: DollarSign, gradient: 'from-purple to-violet', format: 'currency' as const },
    { title: 'CTR', value: overview?.ctr ?? (campaigns.reduce((s, c) => s + (c.ctr || 0), 0) / Math.max(campaigns.length, 1)), icon: TrendingUp, gradient: 'from-amber-500 to-orange-500', format: 'percentage' as const, decimals: 2 },
    { title: 'CPC', value: overview?.cpc ?? 0, icon: DollarSign, gradient: 'from-pink-500 to-rose-500', format: 'currency' as const },
    { title: 'CPA', value: overview?.cpa ?? 0, icon: DollarSign, gradient: 'from-indigo-500 to-blue-500', format: 'currency' as const },
    { title: 'ROAS', value: overview?.roas ?? 0, icon: TrendingUp, gradient: 'from-green-500 to-emerald-500', format: 'percentage' as const },
  ];

  return (
    <DashboardShell>
      <div className="space-y-6" dir="rtl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black gradient-brand-text">التحليلات</h1>
            <p className="text-muted-foreground text-sm mt-1">تحليل متقدم لأداء حملاتك على MARKETRON</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => handleExport('pdf')}>
              <Download size={16} className="ml-1" />تصدير PDF
            </Button>
            <Button variant="outline" onClick={() => handleExport('excel')}>
              <Download size={16} className="ml-1" />Excel
            </Button>
          </div>
        </div>

        {error && (
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-3 flex items-center gap-2 text-sm text-amber-700 dark:text-amber-300">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-electric" />
          </div>
        ) : campaigns.length === 0 ? (
          <EmptyState
            icon={<BarChart3 className="w-10 h-10" />}
            title="لا توجد بيانات تحليل بعد"
            description="أنشئ حملات إعلانية لبدء جمع البيانات وتحليل الأداء"
            actionLabel="إنشاء حملة"
            actionHref={`/${locale}/dashboard/campaigns/create`}
          />
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {metrics.map((m, i) => {
                const Icon = m.icon;
                return (
                  <Card key={m.title} className="border-0 shadow-md">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${m.gradient} flex items-center justify-center text-white shadow-md`}>
                          <Icon className="h-5 w-5" />
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mb-1">{m.title}</p>
                      <p className="text-2xl font-black gradient-brand-text">
                        {m.format === 'currency' ? formatCurrency(m.value) : m.format === 'percentage' ? `${(m.value || 0).toFixed(m.decimals || 2)}%` : formatNumber(m.value)}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="text-lg font-bold">أداء الحملات</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {campaigns.slice(0, 10).map((c) => (
                    <div key={c.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                      <div>
                        <p className="font-semibold text-sm">{c.name}</p>
                        <p className="text-xs text-muted-foreground">{c.platform}</p>
                      </div>
                      <div className="flex gap-4 text-xs">
                        <div className="text-center">
                          <p className="text-muted-foreground">ظهور</p>
                          <p className="font-semibold">{formatNumber(c.impressions || 0)}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-muted-foreground">نقرات</p>
                          <p className="font-semibold">{formatNumber(c.clicks || 0)}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-muted-foreground">صرف</p>
                          <p className="font-semibold text-electric">{formatCurrency(c.spent || 0)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </DashboardShell>
  );
}


