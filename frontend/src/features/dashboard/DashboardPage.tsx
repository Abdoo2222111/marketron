import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/avatar';
import { cn, formatCurrency, formatNumber } from '@/lib/utils';
import { DollarSign, Eye, MousePointerClick, TrendingUp, TrendingDown, Target, BarChart3, CalendarDays, Bell, Plus, MoreHorizontal, AlertCircle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { analyticsApi, campaignsApi } from '@/services/api-modules';

export const DashboardPage: React.FC = () => {
  const { t } = useTranslation();
  const [period, setPeriod] = useState<string>('7');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [overview, setOverview] = useState<any>(null);
  const [campaigns, setCampaigns] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [overviewRes, campaignsRes] = await Promise.allSettled([
          analyticsApi.getOverview(),
          campaignsApi.list({ limit: 50 }),
        ]);
        if (overviewRes.status === 'fulfilled') setOverview(overviewRes.value.data?.data);
        if (campaignsRes.status === 'fulfilled') setCampaigns(campaignsRes.value.data?.data || []);
      } catch (err: any) {
        setError(err?.response?.data?.error || 'فشل تحميل البيانات');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const totalImpressions = overview?.totalImpressions ?? 0;
  const totalClicks = overview?.totalClicks ?? 0;
  const totalSpend = overview?.totalSpend ?? 0;
  const totalConversions = overview?.totalConversions ?? 0;
  const ctr = overview?.ctr ?? 0;
  const cpc = overview?.cpc ?? 0;
  const cpa = overview?.cpa ?? 0;
  const roas = overview?.roas ?? 0;

  const kpis = [
    { label: 'إجمالي الإنفاق', value: totalSpend, change: null, icon: DollarSign, color: 'text-primary-600 bg-primary-100 dark:bg-primary-900/30', format: 'currency' as const },
    { label: 'مرات الظهور', value: totalImpressions, change: null, icon: Eye, color: 'text-secondary-600 bg-secondary-100 dark:bg-secondary-900/30' },
    { label: 'النقرات', value: totalClicks, change: null, icon: MousePointerClick, color: 'text-accent-600 bg-accent-100 dark:bg-accent-900/30' },
    { label: 'التحويلات', value: totalConversions, change: null, icon: Target, color: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30' },
  ];

  const topCampaigns = campaigns.slice(0, 5).map((c: any) => ({
    name: c.name, platform: c.platform, spent: c.spent || 0,
    impressions: c.impressions || 0, clicks: c.clicks || 0,
    conversions: c.conversions || 0, roas: c.roas || 0,
  }));

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-32" />)}
        </div>
        <Skeleton className="h-80" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-64" /> <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <p className="text-red-400 font-semibold">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-dark-text">{t('dashboard.title')}</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">مرحباً بك! إليك ملخص أداء حملاتك</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Card key={kpi.label} className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className={cn('p-2 rounded-lg', kpi.color)}><Icon className="w-5 h-5" /></div>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-dark-text">
                {'format' in kpi && kpi.format === 'currency' ? formatCurrency(kpi.value) : formatNumber(kpi.value)}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{kpi.label}</p>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 rounded-lg bg-cyan-100 dark:bg-cyan-900/30"><DollarSign className="w-5 h-5 text-cyan-600" /></div>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-dark-text">{formatCurrency(cpa)}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">تكلفة التحويل (CPA)</p>
        </Card>
        <Card className="p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30"><BarChart3 className="w-5 h-5 text-orange-600" /></div>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-dark-text">{roas}x</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">العائد على الإنفاق (ROAS)</p>
        </Card>
        <Card className="p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/30"><MousePointerClick className="w-5 h-5 text-indigo-600" /></div>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-dark-text">{ctr.toFixed(2)}%</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">نسبة النقر (CTR)</p>
        </Card>
        <Card className="p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 rounded-lg bg-pink-100 dark:bg-pink-900/30"><DollarSign className="w-5 h-5 text-pink-600" /></div>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-dark-text">{formatCurrency(cpc)}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">تكلفة النقرة (CPC)</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-dark-text">الإنفاق</h3>
            <div className="flex gap-1">
              {['7', '30', '90'].map((d) => (
                <button key={d} onClick={() => setPeriod(d)} className={cn('px-3 py-1 text-xs rounded-lg transition-colors', period === d ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200')}>
                  {d} يوم
                </button>
              ))}
            </div>
          </div>
          {campaigns.length === 0 ? (
            <div className="flex items-center justify-center h-[300px] text-gray-400">لا توجد بيانات إنفاق متاحة</div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={campaigns.slice(0, 7).map((c: any) => ({ name: c.name?.slice(0, 8) || '', value: c.spent || 0 }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={3} dot={{ fill: '#6366f1' }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-dark-text">أفضل الحملات</h3>
          </div>
          {topCampaigns.length === 0 ? (
            <div className="flex items-center justify-center h-[300px] text-gray-400">لا توجد حملات بعد</div>
          ) : (
            <div className="space-y-4">
              {topCampaigns.map((c: any, i: number) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-dark-text truncate">{c.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {c.roas > 0 && <Badge variant={c.roas >= 3 ? 'success' : 'info'}>{c.roas}x ROAS</Badge>}
                      <span className="text-xs text-gray-500">{formatCurrency(c.spent)}</span>
                    </div>
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-gray-900 dark:text-dark-text">{formatNumber(c.conversions)}</p>
                    <p className="text-xs text-gray-500">تحويل</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-dark-text flex items-center gap-2"><Bell className="w-4 h-4" /> آخر الإشعارات</h3>
          </div>
          <div className="text-center py-8">
            <Bell className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400">لا توجد إشعارات</p>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-dark-text flex items-center gap-2"><CalendarDays className="w-4 h-4" /> الحملات القادمة</h3>
          </div>
          {campaigns.length === 0 ? (
            <div className="text-center py-8">
              <CalendarDays className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400">لا توجد حملات</p>
            </div>
          ) : (
            <div className="space-y-2">
              {campaigns.slice(0, 5).map((c: any, i: number) => (
                <div key={i} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <span className="text-sm font-medium truncate">{c.name}</span>
                  <Badge variant={c.status === 'active' ? 'success' : c.status === 'paused' ? 'warning' : 'secondary'}>{c.status}</Badge>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
