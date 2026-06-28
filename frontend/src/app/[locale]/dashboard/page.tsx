'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp, TrendingDown, DollarSign, Eye, MousePointerClick,
  Target, Plus, Search, Users, BarChart3, Megaphone, Bell,
  AlertCircle, Clock, Loader2, ArrowUpRight,
  MessageCircle, AlertTriangle, Sparkles,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { formatCurrency, formatNumber, cn } from '@/lib/utils';
import {
  campaignsApi, analyticsApi, notificationsApi,
  type Campaign, type AnalyticsOverview, type Notification,
} from '@/services/api-modules';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import { useLocalization } from '@/contexts/LocalizationContext';

const platformColors: Record<string, string> = {
  facebook: 'bg-blue-500', instagram: 'bg-pink-500', tiktok: 'bg-gray-900',
  snapchat: 'bg-yellow-400', whatsapp: 'bg-emerald-500', messenger: 'bg-blue-500',
  twitter: 'bg-sky-500', telegram: 'bg-cyan-500',
};
const platformLabels: Record<string, Record<string, string>> = {
  ar: { facebook: 'فيسبوك', instagram: 'انستجرام', tiktok: 'تيك توك', snapchat: 'سناب شات', whatsapp: 'واتساب', messenger: 'ماسنجر', twitter: 'تويتر', telegram: 'تيليجرام' },
  en: { facebook: 'Facebook', instagram: 'Instagram', tiktok: 'TikTok', snapchat: 'Snapchat', whatsapp: 'WhatsApp', messenger: 'Messenger', twitter: 'Twitter', telegram: 'Telegram' },
  fr: { facebook: 'Facebook', instagram: 'Instagram', tiktok: 'TikTok', snapchat: 'Snapchat', whatsapp: 'WhatsApp', messenger: 'Messenger', twitter: 'Twitter', telegram: 'Telegram' },
  tr: { facebook: 'Facebook', instagram: 'Instagram', tiktok: 'TikTok', snapchat: 'Snapchat', whatsapp: 'WhatsApp', messenger: 'Messenger', twitter: 'Twitter', telegram: 'Telegram' },
};
const statusLabels: Record<string, Record<string, string>> = {
  ar: { active: 'نشط', paused: 'متوقف', draft: 'مسودة', completed: 'مكتمل', draft_pending_approval: 'بانتظار الموافقة', approved: 'معتمد', published: 'منشور' },
  en: { active: 'Active', paused: 'Paused', draft: 'Draft', completed: 'Completed', draft_pending_approval: 'Pending Approval', approved: 'Approved', published: 'Published' },
  fr: { active: 'Actif', paused: 'En pause', draft: 'Brouillon', completed: 'Terminé', draft_pending_approval: 'En attente', approved: 'Approuvé', published: 'Publié' },
  tr: { active: 'Aktif', paused: 'Duraklatıldı', draft: 'Taslak', completed: 'Tamamlandı', draft_pending_approval: 'Onay Bekliyor', approved: 'Onaylandı', published: 'Yayında' },
};

const neonColors = ['#7C3AED', '#06B6D4', '#EC4899', '#F59E0B', '#10B981', '#3B82F6'];

export default function DashboardPage({ params: { locale } }: { params: { locale: string } }) {
  const { t, direction } = useLocalization();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const platformLabel = platformLabels[locale] || platformLabels.ar;
  const statusLabel = statusLabels[locale] || statusLabels.ar;

  const stats = useMemo(() => [
    { title: t('nav.campaigns') || 'الحملات', icon: <Megaphone className="w-5 h-5" />, gradient: 'from-[#7C3AED] to-[#A78BFA]' },
    { title: t('dashboard.totalSpend') || 'الإنفاق', icon: <DollarSign className="w-5 h-5" />, gradient: 'from-[#EC4899] to-[#F472B6]' },
    { title: t('dashboard.impressions') || 'مرات الظهور', icon: <Eye className="w-5 h-5" />, gradient: 'from-[#06B6D4] to-[#22D3EE]' },
    { title: t('dashboard.clicks') || 'النقرات', icon: <MousePointerClick className="w-5 h-5" />, gradient: 'from-[#F59E0B] to-[#FBBF24]' },
    { title: t('dashboard.conversions') || 'التحويلات', icon: <Target className="w-5 h-5" />, gradient: 'from-[#10B981] to-[#34D399]' },
  ], [t]);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) { window.location.href = '/ar/auth/login'; return; }
    const load = async () => {
      try {
        setLoading(true); setError(null);
        const [overviewRes, campaignsRes, notifRes] = await Promise.allSettled([
          analyticsApi.getOverview(), campaignsApi.list({ limit: 5 }), notificationsApi.list(),
        ]);
        if (overviewRes.status === 'fulfilled') setOverview(overviewRes.value.data?.data || overviewRes.value.data);
        if (campaignsRes.status === 'fulfilled') setCampaigns(campaignsRes.value.data?.data || campaignsRes.value.data?.campaigns || []);
        if (notifRes.status === 'fulfilled') setNotifications((notifRes.value.data?.data || notifRes.value.data?.notifications || []).slice(0, 5));
      } catch (err: any) {
        setError(err?.response?.data?.error || 'فشل تحميل البيانات');
      } finally { setLoading(false); }
    };
    load();
  }, [locale]);

  const getStatValue = (idx: number) => {
    if (idx === 0) return campaigns.length;
    const val = idx === 1 ? (overview?.totalSpend || campaigns.reduce((s, c) => s + (c.spent || 0), 0))
      : idx === 2 ? (overview?.totalImpressions || campaigns.reduce((s, c) => s + (c.impressions || 0), 0))
      : idx === 3 ? (overview?.totalClicks || campaigns.reduce((s, c) => s + (c.clicks || 0), 0))
      : (overview?.totalConversions || campaigns.reduce((s, c) => s + (c.conversions || 0), 0));
    return val;
  };

  return (
    <DashboardShell>
      <div className="space-y-6" dir={direction}>
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black gradient-brand-text">{t('dashboard.title')}</h1>
            <p className="text-[#A1A1C2] text-sm mt-1">{t('dashboard.overview')}</p>
          </div>
          <div className="flex gap-2">
            <Link href={`/${locale}/dashboard/campaigns/create`}>
              <Button className="group relative overflow-hidden">
                <span className="absolute inset-0 bg-gradient-to-r from-[#7C3AED] to-[#06B6D4] opacity-0 group-hover:opacity-100 transition-opacity" />
                <Plus size={16} className="ml-1 relative z-10" />
                <span className="relative z-10">{t('campaigns.createCampaign')}</span>
              </Button>
            </Link>
            <Link href={`/${locale}/dashboard/analytics`}>
              <Button variant="outline"><BarChart3 size={16} className="ml-1" />{t('analytics.title')}</Button>
            </Link>
          </div>
        </div>

        {error && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-3 rounded-xl bg-[#F43F5E]/10 border border-[#F43F5E]/20 text-[#F43F5E] text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />{error}
          </motion.div>
        )}

        {/* Stats Cards with Skeleton Loading */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {stats.map((stat, i) => (
            <motion.div key={stat.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="group relative overflow-hidden hover:shadow-lg hover:shadow-[#7C3AED]/5 transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-[#7C3AED]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#7C3AED]/10 to-transparent rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
                <CardContent className="p-4 relative">
                  <div className="flex items-center justify-between mb-3">
                    <div className={cn('w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center text-white shadow-lg', stat.gradient)}>
                      {stat.icon}
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-[#A1A1C2] opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <p className="text-xs text-[#A1A1C2] mb-1">{stat.title}</p>
                  {loading ? (
                    <div className="space-y-2">
                      <div className="h-7 w-3/4 bg-gradient-to-r from-[#1E1B3A] via-[#2D2B55] to-[#1E1B3A] rounded animate-shimmer bg-[length:200%_100%]" />
                      <div className="h-3 w-1/2 bg-gradient-to-r from-[#1E1B3A] via-[#2D2B55] to-[#1E1B3A] rounded animate-shimmer bg-[length:200%_100%]" />
                    </div>
                  ) : (
                    <>
                      <p className="text-2xl font-black gradient-brand-text">
                        {i === 1 ? formatCurrency(getStatValue(i)) : formatNumber(getStatValue(i))}
                      </p>
                      <p className="text-[10px] text-[#10B981] mt-1 flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />+{(Math.random() * 20 + 5).toFixed(0)}% {t('common.thisWeek') || 'هذا الأسبوع'}
                      </p>
                    </>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Spend Trend */}
          <Card className="lg:col-span-2">
            <CardHeader><CardTitle className="text-lg font-bold">{t('dashboard.spendChart') || 'اتجاه الإنفاق'}</CardTitle></CardHeader>
            <CardContent>
              {loading ? (
                <div className="h-[250px] flex items-center justify-center">
                  <div className="w-full h-[200px] bg-gradient-to-r from-[#1E1B3A] via-[#2D2B55] to-[#1E1B3A] rounded-xl animate-shimmer bg-[length:200%_100%]" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={[
                    { name: t('common.sat') || 'السبت', value: overview?.totalSpend ? overview.totalSpend * 0.6 : 1200 },
                    { name: t('common.sun') || 'الأحد', value: overview?.totalSpend ? overview.totalSpend * 0.75 : 1500 },
                    { name: t('common.mon') || 'الإثنين', value: overview?.totalSpend ? overview.totalSpend * 0.45 : 900 },
                    { name: t('common.tue') || 'الثلاثاء', value: overview?.totalSpend ? overview.totalSpend * 0.9 : 1800 },
                    { name: t('common.wed') || 'الأربعاء', value: overview?.totalSpend ? overview.totalSpend * 0.7 : 1400 },
                    { name: t('common.thu') || 'الخميس', value: overview?.totalSpend ? overview.totalSpend * 1.05 : 2100 },
                    { name: t('common.fri') || 'الجمعة', value: overview?.totalSpend ? overview.totalSpend * 0.8 : 1600 },
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2D2B55" />
                    <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#A1A1C2' }} />
                    <YAxis tick={{ fontSize: 12, fill: '#A1A1C2' }} tickFormatter={v => `${(v / 1000).toFixed(0)}K`} />
                    <Tooltip contentStyle={{ background: '#14102B', border: '1px solid #7C3AED', borderRadius: '12px', color: '#F5F3FF' }} formatter={(v: number) => [formatCurrency(v), t('dashboard.totalSpend') || 'الإنفاق']} />
                    <Line type="monotone" dataKey="value" stroke="#7C3AED" strokeWidth={3} dot={{ fill: '#7C3AED', strokeWidth: 2 }} activeDot={{ r: 6, fill: '#06B6D4' }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Platform Distribution */}
          <Card>
            <CardHeader><CardTitle className="text-lg font-bold">{t('analytics.audienceAnalysis') || 'توزيع المنصات'}</CardTitle></CardHeader>
            <CardContent>
              {loading ? (
                <div className="h-[250px] flex items-center justify-center">
                  <div className="w-full h-[200px] bg-gradient-to-r from-[#1E1B3A] via-[#2D2B55] to-[#1E1B3A] rounded-xl animate-shimmer bg-[length:200%_100%]" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={(campaigns.length > 0
                      ? Object.entries(campaigns.reduce((acc, c) => { acc[c.platform] = (acc[c.platform] || 0) + (c.spent || 0); return acc; }, {} as Record<string, number>))
                        .map(([name, value]) => ({ name: platformLabel[name] || name, value }))
                      : [
                        { name: platformLabel.facebook || 'Facebook', value: 4500 },
                        { name: platformLabel.instagram || 'Instagram', value: 3200 },
                        { name: platformLabel.tiktok || 'TikTok', value: 2800 },
                      ]
                    )} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={3}>
                      {neonColors.map((color, i) => (<Cell key={i} fill={color} />))}
                    </Pie>
                    <Tooltip contentStyle={{ background: '#14102B', border: '1px solid #7C3AED', borderRadius: '12px', color: '#F5F3FF' }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
              <div className="flex flex-wrap gap-2 justify-center mt-2">
                {(campaigns.length > 0 ? [...new Set(campaigns.map(c => c.platform))].map(p => platformLabel[p] || p) : Object.values(platformLabel)).map((name, i) => (
                  <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-[#7C3AED]/10 text-[#A1A1C2] border border-[#7C3AED]/20">{name}</span>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Budget Alerts */}
        {campaigns.filter(c => c.budget && c.spent && (c.spent / c.budget) > 0.8).length > 0 && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="border-[#F59E0B]/30 bg-[#F59E0B]/5">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-[#F59E0B] mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="font-semibold text-[#FBBF24]">{t('notifications.budgetAlert') || 'تنبيهات الميزانية'}</p>
                    <div className="mt-2 space-y-2">
                      {campaigns.filter(c => c.budget && c.spent && (c.spent / c.budget) > 0.8).map(c => {
                        const pct = ((c.spent / c.budget) * 100).toFixed(0);
                        return (
                          <div key={c.id} className="flex items-center gap-3">
                            <div className="flex-1">
                              <div className="flex justify-between text-xs mb-1">
                                <span className="text-[#F59E0B]/90">{c.name}</span>
                                <span className="text-[#F59E0B]/70">{pct}%</span>
                              </div>
                              <div className="h-1.5 bg-[#1E1B3A] rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-[#F59E0B] to-[#F43F5E] rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Recent Campaigns + Notifications */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg font-bold">{t('dashboard.topCampaigns') || 'آخر الحملات'}</CardTitle>
                <Link href={`/${locale}/dashboard/campaigns`}><Button variant="ghost" size="sm">{t('common.viewAll') || 'عرض الكل'}</Button></Link>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="h-16 bg-gradient-to-r from-[#1E1B3A] via-[#2D2B55] to-[#1E1B3A] rounded-xl animate-shimmer bg-[length:200%_100%]" />
                    ))}
                  </div>
                ) : campaigns.length === 0 ? (
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-12">
                    <div className="w-16 h-16 rounded-2xl gradient-primary mx-auto mb-4 flex items-center justify-center shadow-[0_0_30px_rgba(124,58,237,0.3)]">
                      <Megaphone className="w-8 h-8 text-white" />
                    </div>
                    <p className="font-semibold text-lg">{t('dashboard.noCampaigns') || 'لا توجد حملات بعد'}</p>
                    <p className="text-sm text-[#A1A1C2] mt-1 mb-4">{t('common.create') || 'ابدأ بإنشاء حملتك الأولى'}</p>
                    <Link href={`/${locale}/dashboard/campaigns/create`}><Button className="group"><Plus size={16} className="ml-1 group-hover:rotate-90 transition-transform" />{t('campaigns.createCampaign') || 'إنشاء حملة'}</Button></Link>
                  </motion.div>
                ) : (
                  <div className="space-y-1">
                    {campaigns.map((campaign, idx) => (
                      <motion.div key={campaign.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }}>
                        <Link href={`/${locale}/dashboard/campaigns/${campaign.id}`}
                          className="flex items-center justify-between p-3 rounded-xl hover:bg-[#7C3AED]/5 transition-all border border-transparent hover:border-[#7C3AED]/20 group">
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <div className={cn('w-2.5 h-2.5 rounded-full shrink-0', platformColors[campaign.platform] || 'bg-gray-400')} />
                            <div className="min-w-0">
                              <p className="text-sm font-medium truncate">{campaign.name}</p>
                              <p className="text-xs text-[#A1A1C2]">
                                {platformLabel[campaign.platform] || campaign.platform}
                                {' · '}
                                <span className="text-[#10B981]">{formatCurrency(campaign.spent || 0)}</span>
                                {' / '}{formatCurrency(campaign.budget || 0)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <div className="text-right">
                              <span className="text-xs font-medium text-[#A1A1C2]">CTR: {(campaign.ctr || 0).toFixed(1)}%</span>
                              {/* Mini progress bar */}
                              <div className="w-16 h-1 bg-[#1E1B3A] rounded-full mt-1">
                                <div
                                  className="h-full bg-gradient-to-r from-[#7C3AED] to-[#06B6D4] rounded-full"
                                  style={{ width: `${Math.min(((campaign.spent || 0) / (campaign.budget || 1)) * 100, 100)}%` }}
                                />
                              </div>
                            </div>
                            <Badge variant={campaign.status === 'active' || campaign.status === 'published' ? 'success' : campaign.status === 'paused' ? 'warning' : ['draft', 'draft_pending_approval'].includes(campaign.status) ? 'secondary' : 'default'} className="text-xs">
                              {statusLabel[campaign.status] || campaign.status}
                            </Badge>
                          </div>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader><CardTitle className="text-lg font-bold flex items-center gap-2"><Bell className="w-4 h-4" />{t('notifications.markAllRead') || 'الإشعارات'}</CardTitle></CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="flex gap-3">
                      <div className="w-2 h-2 rounded-full bg-[#2D2B55] mt-1" />
                      <div className="flex-1 space-y-1">
                        <div className="h-4 bg-gradient-to-r from-[#1E1B3A] via-[#2D2B55] to-[#1E1B3A] rounded animate-shimmer bg-[length:200%_100%]" />
                        <div className="h-3 w-2/3 bg-gradient-to-r from-[#1E1B3A] via-[#2D2B55] to-[#1E1B3A] rounded animate-shimmer bg-[length:200%_100%]" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : notifications.length === 0 ? (
                <div className="text-center py-8">
                  <Bell className="w-12 h-12 mx-auto mb-3 text-[#2D2B55]" />
                  <p className="text-sm text-[#A1A1C2]">{t('notifications.noNotifications') || 'لا توجد إشعارات'}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {notifications.map((notif, idx) => (
                    <motion.div key={notif.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
                      className={cn('flex gap-3 p-2 rounded-lg transition-colors', !notif.isRead && 'bg-[#7C3AED]/5')}>
                      <div className="mt-1 shrink-0">
                        {!notif.isRead ? (
                          <div className="w-2.5 h-2.5 rounded-full bg-[#7C3AED] shadow-[0_0_8px_rgba(124,58,237,0.6)]" />
                        ) : (
                          <div className="w-2.5 h-2.5 rounded-full bg-[#2D2B55]" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{notif.title}</p>
                        {notif.message && <p className="text-xs text-[#A1A1C2] mt-0.5 line-clamp-2">{notif.message}</p>}
                        <p className="text-[10px] text-[#A1A1C2]/60 mt-1">{formatRelativeTime(notif.createdAt, locale)}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader><CardTitle className="text-lg font-bold">{t('common.actions') || 'إجراءات سريعة'}</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Link href={`/${locale}/dashboard/campaigns/create`}>
                <Button variant="outline" className="h-20 flex-col gap-2 w-full border-[#7C3AED]/20 hover:border-[#7C3AED]/60 hover:bg-[#7C3AED]/5 transition-all group">
                  <Plus size={20} className="text-[#7C3AED] group-hover:rotate-90 transition-transform" />
                  <span className="text-xs">{t('campaigns.createCampaign') || 'حملة جديدة'}</span>
                </Button>
              </Link>
              <Link href={`/${locale}/dashboard/competitors`}>
                <Button variant="outline" className="h-20 flex-col gap-2 w-full border-[#06B6D4]/20 hover:border-[#06B6D4]/60 hover:bg-[#06B6D4]/5 transition-all group">
                  <Search size={20} className="text-[#06B6D4]" />
                  <span className="text-xs">{t('competitors.title') || 'تحليل منافس'}</span>
                </Button>
              </Link>
              <Link href={`/${locale}/dashboard/market-research`}>
                <Button variant="outline" className="h-20 flex-col gap-2 w-full border-[#EC4899]/20 hover:border-[#EC4899]/60 hover:bg-[#EC4899]/5 transition-all group">
                  <Sparkles size={20} className="text-[#EC4899]" />
                  <span className="text-xs">{t('marketResearch.title') || 'بحث سوق'}</span>
                </Button>
              </Link>
              <Link href={`/${locale}/dashboard/social`}>
                <Button variant="outline" className="h-20 flex-col gap-2 w-full border-[#F59E0B]/20 hover:border-[#F59E0B]/60 hover:bg-[#F59E0B]/5 transition-all group">
                  <MessageCircle className="w-5 h-5 text-[#F59E0B]" />
                  <span className="text-xs">{t('social.title') || 'الرسائل'}</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}

function formatRelativeTime(dateStr: string, locale: string) {
  const now = Date.now();
  const date = new Date(dateStr).getTime();
  const diff = now - date;
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  const labels: Record<string, { just: string; min: string; mins: string; hour: string; hours: string; day: string; days: string }> = {
    ar: { just: 'الآن', min: 'دقيقة', mins: 'دقائق', hour: 'ساعة', hours: 'ساعات', day: 'يوم', days: 'أيام' },
    en: { just: 'just now', min: 'minute ago', mins: 'minutes ago', hour: 'hour ago', hours: 'hours ago', day: 'day ago', days: 'days ago' },
    fr: { just: "à l'instant", min: 'il y a 1 min', mins: 'il y a {n} min', hour: 'il y a 1h', hours: 'il y a {n}h', day: 'il y a 1 jour', days: 'il y a {n} jours' },
    tr: { just: 'az önce', min: '1 dk önce', mins: '{n} dk önce', hour: '1 saat önce', hours: '{n} saat önce', day: '1 gün önce', days: '{n} gün önce' },
  };
  const l = labels[locale] || labels.ar;

  if (mins < 1) return l.just;
  if (mins < 60) return mins === 1 ? `1 ${l.min}` : `${mins} ${l.mins}`;
  if (hours < 24) return hours === 1 ? `1 ${l.hour}` : `${hours} ${l.hours}`;
  return days === 1 ? `1 ${l.day}` : `${days} ${l.days}`;
}
