import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/avatar';
import { cn, formatCurrency, formatNumber } from '@/utils/helpers';
import { DollarSign, Eye, MousePointerClick, TrendingUp, TrendingDown, Target, BarChart3, CalendarDays, Bell, Plus, MoreHorizontal } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const spendData = [
  { name: 'السبت', value: 1200 }, { name: 'الأحد', value: 1500 }, { name: 'الإثنين', value: 900 },
  { name: 'الثلاثاء', value: 1800 }, { name: 'الأربعاء', value: 1400 }, { name: 'الخميس', value: 2100 },
  { name: 'الجمعة', value: 1600 },
];

const topCampaigns = [
  { name: 'حملة عيد الأضحى', platform: 'facebook', spent: 4500, impressions: 125000, clicks: 8900, conversions: 345, roas: 3.2 },
  { name: 'حملة الربيع', platform: 'instagram', spent: 3200, impressions: 98000, clicks: 6700, conversions: 234, roas: 2.8 },
  { name: 'تخفيضات الصيف', platform: 'tiktok', spent: 2800, impressions: 245000, clicks: 12000, conversions: 189, roas: 4.1 },
  { name: 'إطلاق منتج جديد', platform: 'snapchat', spent: 2100, impressions: 76000, clicks: 4300, conversions: 156, roas: 2.5 },
  { name: 'حملة العودة للمدارس', platform: 'facebook', spent: 1800, impressions: 54000, clicks: 3200, conversions: 98, roas: 3.8 },
];

const notifications = [
  { id: '1', title: 'تم إنشاء حملة جديدة', message: 'حملة "عيد الأضحى" تم إنشاؤها بنجاح', type: 'info', time: 'منذ 5 دقائق' },
  { id: '2', title: 'تنبيه الميزانية', message: 'حملة "الربيع" تجاوزت 80% من الميزانية', type: 'warning', time: 'منذ ساعة' },
  { id: '3', title: 'تقرير متاح', message: 'تقرير أداء الأسبوع متاح للتحميل', type: 'success', time: 'منذ 3 ساعات' },
  { id: '4', title: 'انتهت حملة', message: 'حملة "إطلاق المنتج" انتهت', type: 'error', time: 'منذ يوم' },
];

const KPIs = [
  { label: 'إجمالي الإنفاق', value: 45600, change: 12.5, icon: DollarSign, color: 'text-primary-600 bg-primary-100 dark:bg-primary-900/30' },
  { label: 'مرات الظهور', value: 1250000, change: 8.3, icon: Eye, color: 'text-secondary-600 bg-secondary-100 dark:bg-secondary-900/30' },
  { label: 'النقرات', value: 78500, change: -2.1, icon: MousePointerClick, color: 'text-accent-600 bg-accent-100 dark:bg-accent-900/30' },
  { label: 'التحويلات', value: 3450, change: 15.7, icon: Target, color: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30' },
];

export const DashboardPage: React.FC = () => {
  const { t } = useTranslation();
  const [period, setPeriod] = useState<string>('7');
  const [loading] = useState(false);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-32" />)}
        </div>
        <Skeleton className="h-80" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-dark-text">{t('dashboard.title')}</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">مرحباً بك! إليك ملخص أداء حملاتك</p>
        </div>
        <Button icon={<Plus className="w-4 h-4" />}>{t('campaigns.createCampaign')}</Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {KPIs.map((kpi) => {
          const Icon = kpi.icon;
          const isUp = kpi.change >= 0;
          return (
            <Card key={kpi.label} className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className={cn('p-2 rounded-lg', kpi.color)}><Icon className="w-5 h-5" /></div>
                <div className={cn('flex items-center gap-1 text-sm font-medium', isUp ? 'text-green-600' : 'text-red-600')}>
                  {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {Math.abs(kpi.change)}%
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-dark-text">{formatNumber(kpi.value)}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{kpi.label}</p>
            </Card>
          );
        })}
      </div>

      {/* Second row - extra KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 rounded-lg bg-cyan-100 dark:bg-cyan-900/30"><DollarSign className="w-5 h-5 text-cyan-600" /></div>
            <span className="text-sm font-medium text-green-600 flex items-center gap-1"><TrendingUp className="w-3 h-3" />5.2%</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-dark-text">{formatCurrency(13.2)}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t('campaigns.cpa')}</p>
        </Card>
        <Card className="p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30"><BarChart3 className="w-5 h-5 text-orange-600" /></div>
            <span className="text-sm font-medium text-green-600 flex items-center gap-1"><TrendingUp className="w-3 h-3" />3.8x</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-dark-text">3.2x</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t('campaigns.roas')}</p>
        </Card>
        <Card className="p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/30"><MousePointerClick className="w-5 h-5 text-indigo-600" /></div>
            <span className="text-sm font-medium text-red-600 flex items-center gap-1"><TrendingDown className="w-3 h-3" />0.8%</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-dark-text">2.45 {t('campaigns.ctr')}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t('campaigns.ctr')}</p>
        </Card>
        <Card className="p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 rounded-lg bg-pink-100 dark:bg-pink-900/30"><DollarSign className="w-5 h-5 text-pink-600" /></div>
            <span className="text-sm font-medium text-green-600 flex items-center gap-1"><TrendingUp className="w-3 h-3" />1.2%</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-dark-text">{formatCurrency(8.5)}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t('analytics.cpc')}</p>
        </Card>
      </div>

      {/* Charts + Top Campaigns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Spend Chart */}
        <Card className="lg:col-span-2 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-dark-text">{t('dashboard.spendChart')}</h3>
            <div className="flex gap-1">
              {['7', '30', '90'].map((d) => (
                <button key={d} onClick={() => setPeriod(d)} className={cn('px-3 py-1 text-xs rounded-lg transition-colors', period === d ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200')}>
                  {d} {t('dashboard[`days${d}`]' as any) || d}
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={spendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#9ca3af" />
              <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb' }} formatter={(v: number) => formatCurrency(v)} />
              <Line type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={3} dot={{ fill: '#6366f1', strokeWidth: 2 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Top Campaigns */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-dark-text">{t('dashboard.topCampaigns')}</h3>
            <Button variant="ghost" size="sm">{t('common.viewAll')}</Button>
          </div>
          <div className="space-y-4">
            {topCampaigns.map((c, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-dark-text truncate">{c.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant={c.roas >= 3 ? 'success' : 'info'}>{c.roas}x ROAS</Badge>
                    <span className="text-xs text-gray-500">{formatCurrency(c.spent)}</span>
                  </div>
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-gray-900 dark:text-dark-text">{formatNumber(c.conversions)}</p>
                  <p className="text-xs text-gray-500">{t('campaigns.conversionsObjective')}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Notifications + Campaigns Calendar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Notifications */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-dark-text flex items-center gap-2"><Bell className="w-4 h-4" /> {t('dashboard.recentNotifications')}</h3>
            <Button variant="ghost" size="sm">{t('common.viewAll')}</Button>
          </div>
          <div className="space-y-3">
            {notifications.map((n) => (
              <div key={n.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <div className={cn('w-2 h-2 rounded-full mt-2 flex-shrink-0', n.type === 'warning' ? 'bg-amber-500' : n.type === 'error' ? 'bg-red-500' : n.type === 'success' ? 'bg-green-500' : 'bg-primary-500')} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-dark-text">{n.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{n.message}</p>
                  <p className="text-xs text-gray-400 mt-1">{n.time}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Campaign Calendar */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-dark-text flex items-center gap-2"><CalendarDays className="w-4 h-4" /> {t('dashboard.campaignsCalendar')}</h3>
            <Button variant="outline" size="sm">عرض التقويم</Button>
          </div>
          <div className="text-center py-8">
            <CalendarDays className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400">{t('dashboard.noCampaigns')}</p>
          </div>
        </Card>
      </div>
    </div>
  );
};



