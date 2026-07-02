'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Eye, MousePointerClick, Target, DollarSign, TrendingUp, Download, Filter, Loader2, AlertCircle, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { analyticsApi, campaignsApi, type AnalyticsOverview, type Campaign } from '@/services/api-modules';
import { formatNumber, formatCurrency } from '@/lib/utils';
import { EmptyState } from '@/components/ui/empty-state';

export default function AnalyticsPage({ params: { locale } }: { params: { locale: string } }) {
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
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

  const totalImpressions = campaigns.reduce((s, c) => s + (c.impressions || 0), 0);
  const totalClicks = campaigns.reduce((s, c) => s + (c.clicks || 0), 0);
  const totalConversions = campaigns.reduce((s, c) => s + (c.conversions || 0), 0);
  const totalSpend = campaigns.reduce((s, c) => s + ((c as any).spent || (c as any).spend || 0), 0);
  const ctr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;

  const metrics = [
    { title: 'مرات الظهور', value: overview?.totalImpressions ?? totalImpressions, icon: Eye, gradient: 'from-electric to-cyan' },
    { title: 'النقرات', value: overview?.totalClicks ?? totalClicks, icon: MousePointerClick, gradient: 'from-cyan to-blue-500' },
    { title: 'التحويلات', value: overview?.totalConversions ?? totalConversions, icon: Target, gradient: 'from-emerald-500 to-teal-500' },
    { title: 'الإنفاق', value: overview?.totalSpend ?? totalSpend, icon: DollarSign, gradient: 'from-purple to-violet', format: 'currency' as const },
    { title: 'CTR', value: overview?.ctr ?? ctr, icon: TrendingUp, gradient: 'from-amber-500 to-orange-500', format: 'percentage' as const, decimals: 2 },
    { title: 'CPC', value: overview?.cpc ?? 0, icon: DollarSign, gradient: 'from-pink-500 to-rose-500', format: 'currency' as const },
    { title: 'CPA', value: overview?.cpa ?? 0, icon: DollarSign, gradient: 'from-indigo-500 to-blue-500', format: 'currency' as const },
    { title: 'ROAS', value: overview?.roas ?? 0, icon: TrendingUp, gradient: 'from-green-500 to-emerald-500', format: 'percentage' as const },
  ];

  return (
      <div className="space-y-6" dir="rtl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black gradient-brand-text">التحليلات</h1>
            <p className="text-[#A1A1C2] text-sm mt-1">تحليل متقدم لأداء حملاتك</p>
          </div>
        </div>

        {error && (
          <div className="bg-[#F43F5E]/10 border border-[#F43F5E]/20 rounded-xl p-3 flex items-center gap-2 text-sm text-[#F43F5E]">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[1,2,3,4,5,6,7,8].map(i => (
              <div key={i} className="bg-[#14102B]/80 backdrop-blur-sm border border-[#2D2B55]/50 rounded-xl p-4 space-y-3 animate-pulse">
                <div className="w-10 h-10 rounded-xl bg-[#2D2B55]"></div>
                <div className="h-3 w-20 bg-[#2D2B55] rounded"></div>
                <div className="h-6 w-28 bg-[#2D2B55] rounded"></div>
              </div>
            ))}
          </div>
        ) : campaigns.length === 0 && !overview ? (
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
              {metrics.map((m) => {
                const Icon = m.icon;
                return (
                  <Card key={m.title} className="bg-[#14102B]/80 backdrop-blur-sm border border-[#2D2B55]/50">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${m.gradient} flex items-center justify-center text-white shadow-md`}>
                          <Icon className="h-5 w-5" />
                        </div>
                      </div>
                      <p className="text-xs text-[#A1A1C2] mb-1">{m.title}</p>
                      <p className="text-2xl font-black gradient-brand-text">
                        {m.format === 'currency' ? formatCurrency(m.value) : m.format === 'percentage' ? `${(m.value || 0).toFixed(m.decimals || 2)}%` : formatNumber(m.value)}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <Card className="bg-[#14102B]/80 backdrop-blur-sm border border-[#2D2B55]/50">
              <CardHeader>
                <CardTitle className="text-lg font-bold">أداء الحملات</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {campaigns.slice(0, 10).map((c) => (
                    <div key={c.id} className="flex items-center justify-between p-3 rounded-lg bg-[#2D2B55]/30">
                      <div>
                        <p className="font-semibold text-sm">{c.name}</p>
                        <p className="text-xs text-[#A1A1C2]">{c.platform}</p>
                      </div>
                      <div className="flex gap-4 text-xs">
                        <div className="text-center">
                          <p className="text-[#A1A1C2]">ظهور</p>
                          <p className="font-semibold">{formatNumber(c.impressions || 0)}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-[#A1A1C2]">نقرات</p>
                          <p className="font-semibold">{formatNumber(c.clicks || 0)}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-[#A1A1C2]">صرف</p>
                          <p className="font-semibold text-electric">{formatCurrency((c as any).spent || (c as any).spend || 0)}</p>
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
  );
}