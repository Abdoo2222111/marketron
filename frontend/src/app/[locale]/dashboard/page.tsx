'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp, TrendingDown, DollarSign, Eye, MousePointerClick,
  Target, Plus, Search, Users, BarChart3, Megaphone, Bell,
  AlertCircle, Clock, Loader2, ArrowUpRight,
  MessageCircle, AlertTriangle,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { formatCurrency, formatNumber } from '@/lib/utils';
import {
  campaignsApi, analyticsApi, notificationsApi,
  type Campaign, type AnalyticsOverview, type Notification,
} from '@/services/api-modules';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';

const platformColors: Record<string, string> = {
  facebook: 'bg-blue-500', instagram: 'bg-pink-500', tiktok: 'bg-gray-900',
  snapchat: 'bg-yellow-400', whatsapp: 'bg-emerald-500', messenger: 'bg-blue-500',
  twitter: 'bg-sky-500', telegram: 'bg-cyan-500',
};
const platformLabels: Record<string, string> = {
  facebook: 'فيسبوك', instagram: 'انستجرام', tiktok: 'تيك توك',
  snapchat: 'سناب شات', whatsapp: 'واتساب', messenger: 'ماسنجر',
  twitter: 'تويتر', telegram: 'تيليجرام',
};
const statusLabels: Record<string, string> = {
  active: 'نشط', paused: 'متوقف', draft: 'مسودة', completed: 'مكتمل',
};

const neonColors = ['#7C3AED', '#06B6D4', '#EC4899', '#F59E0B', '#10B981', '#3B82F6'];

const stats = [
  { title: 'إجمالي الحملات', icon: <Megaphone className="w-5 h-5" />, gradient: 'from-[#7C3AED] to-[#A78BFA]' },
  { title: 'الإنفاق', icon: <DollarSign className="w-5 h-5" />, gradient: 'from-[#EC4899] to-[#F472B6]' },
  { title: 'مرات الظهور', icon: <Eye className="w-5 h-5" />, gradient: 'from-[#06B6D4] to-[#22D3EE]' },
  { title: 'النقرات', icon: <MousePointerClick className="w-5 h-5" />, gradient: 'from-[#F59E0B] to-[#FBBF24]' },
  { title: 'التحويلات', icon: <Target className="w-5 h-5" />, gradient: 'from-[#10B981] to-[#34D399]' },
];

export default function DashboardPage({ params: { locale } }: { params: { locale: string } }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

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
      <div className="space-y-6" dir="rtl">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black gradient-brand-text">لوحة التحكم</h1>
            <p className="text-[#A1A1C2] text-sm mt-1">نظرة عامة على أداء حملاتك</p>
          </div>
          <div className="flex gap-2">
            <Link href={`/${locale}/dashboard/campaigns/create`}>
              <Button><Plus size={16} className="ml-1" />حملة جديدة</Button>
            </Link>
            <Link href={`/${locale}/dashboard/analytics`}>
              <Button variant="outline"><BarChart3 size={16} className="ml-1" />تقارير</Button>
            </Link>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-[#F43F5E]/10 border border-[#F43F5E]/20 text-[#F43F5E] text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />{error}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {stats.map((stat, i) => (
            <motion.div key={stat.title} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="group relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-[#7C3AED]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <CardContent className="p-4 relative">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center text-white shadow-lg`}>
                      {stat.icon}
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-[#A1A1C2]" />
                  </div>
                  <p className="text-xs text-[#A1A1C2] mb-1">{stat.title}</p>
                  {loading ? (
                    <div className="h-7 w-20 bg-[#1E1B3A] rounded animate-pulse" />
                  ) : (
                    <p className="text-2xl font-black gradient-brand-text">
                      {i === 1 ? formatCurrency(getStatValue(i)) : formatNumber(getStatValue(i))}
                    </p>
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
            <CardHeader><CardTitle className="text-lg font-bold">اتجاه الإنفاق</CardTitle></CardHeader>
            <CardContent>
              {loading ? (
                <div className="h-[250px] flex items-center justify-center">
                  <Loader2 className="w-5 h-5 animate-spin text-[#7C3AED]" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={[
                    { name: 'السبت', value: overview?.totalSpend ? overview.totalSpend * 0.6 : 1200 },
                    { name: 'الأحد', value: overview?.totalSpend ? overview.totalSpend * 0.75 : 1500 },
                    { name: 'الإثنين', value: overview?.totalSpend ? overview.totalSpend * 0.45 : 900 },
                    { name: 'الثلاثاء', value: overview?.totalSpend ? overview.totalSpend * 0.9 : 1800 },
                    { name: 'الأربعاء', value: overview?.totalSpend ? overview.totalSpend * 0.7 : 1400 },
                    { name: 'الخميس', value: overview?.totalSpend ? overview.totalSpend * 1.05 : 2100 },
                    { name: 'الجمعة', value: overview?.totalSpend ? overview.totalSpend * 0.8 : 1600 },
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2D2B55" />
                    <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#A1A1C2' }} />
                    <YAxis tick={{ fontSize: 12, fill: '#A1A1C2' }} tickFormatter={v => `${(v / 1000).toFixed(0)}K`} />
                    <Tooltip contentStyle={{ background: '#14102B', border: '1px solid #7C3AED', borderRadius: '12px', color: '#F5F3FF' }} formatter={(v: number) => [formatCurrency(v), 'الإنفاق']} />
                    <Line type="monotone" dataKey="value" stroke="#7C3AED" strokeWidth={3} dot={{ fill: '#7C3AED', strokeWidth: 2 }} activeDot={{ r: 6, fill: '#06B6D4' }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Platform Distribution */}
          <Card>
            <CardHeader><CardTitle className="text-lg font-bold">توزيع المنصات</CardTitle></CardHeader>
            <CardContent>
              {loading ? (
                <div className="h-[250px] flex items-center justify-center">
                  <Loader2 className="w-5 h-5 animate-spin text-[#7C3AED]" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={(campaigns.length > 0
                      ? Object.entries(campaigns.reduce((acc, c) => { acc[c.platform] = (acc[c.platform] || 0) + (c.spent || 0); return acc; }, {} as Record<string, number>))
                        .map(([name, value]) => ({ name: platformLabels[name] || name, value }))
                      : [{ name: 'فيسبوك', value: 4500 }, { name: 'انستجرام', value: 3200 }, { name: 'تيك توك', value: 2800 }]
                    )} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={3}>
                      {neonColors.map((color, i) => (<Cell key={i} fill={color} />))}
                    </Pie>
                    <Tooltip contentStyle={{ background: '#14102B', border: '1px solid #7C3AED', borderRadius: '12px', color: '#F5F3FF' }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
              <div className="flex flex-wrap gap-2 justify-center mt-2">
                {(campaigns.length > 0 ? [...new Set(campaigns.map(c => c.platform))].map(p => platformLabels[p] || p) : ['فيسبوك', 'انستجرام', 'تيك توك']).map((name, i) => (
                  <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-[#7C3AED]/10 text-[#A1A1C2] border border-[#7C3AED]/20">{name}</span>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Budget Alerts */}
        {campaigns.filter(c => c.budget && c.spent && (c.spent / c.budget) > 0.8).length > 0 && (
          <Card className="border-[#F59E0B]/30 bg-[#F59E0B]/5">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-[#F59E0B] mt-0.5" />
                <div>
                  <p className="font-semibold text-[#FBBF24]">تنبيهات الميزانية</p>
                  <div className="mt-1 space-y-1">
                    {campaigns.filter(c => c.budget && c.spent && (c.spent / c.budget) > 0.8).map(c => (
                      <p key={c.id} className="text-sm text-[#F59E0B]/80">حملة &quot;{c.name}&quot; استهلكت {((c.spent / c.budget) * 100).toFixed(0)}% من الميزانية</p>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Campaigns + Notifications */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg font-bold">آخر الحملات</CardTitle>
                <Link href={`/${locale}/dashboard/campaigns`}><Button variant="ghost" size="sm">عرض الكل</Button></Link>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-[#7C3AED]" /></div>
                ) : campaigns.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 rounded-2xl gradient-primary mx-auto mb-3 flex items-center justify-center shadow-[0_0_30px_rgba(124,58,237,0.3)]">
                      <Megaphone className="w-8 h-8 text-white" />
                    </div>
                    <p className="font-semibold">لا توجد حملات بعد</p>
                    <p className="text-sm text-[#A1A1C2] mt-1 mb-4">ابدأ بإنشاء حملتك الأولى</p>
                    <Link href={`/${locale}/dashboard/campaigns/create`}><Button><Plus size={16} className="ml-1" />إنشاء حملة</Button></Link>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {campaigns.map(campaign => (
                      <Link key={campaign.id} href={`/${locale}/dashboard/campaigns/${campaign.id}`}
                        className="flex items-center justify-between p-3 rounded-xl hover:bg-[#7C3AED]/5 transition-colors border border-transparent hover:border-[#7C3AED]/20">
                        <div className="flex items-center gap-3">
                          <div className={`w-2.5 h-2.5 rounded-full ${platformColors[campaign.platform] || 'bg-gray-400'}`} />
                          <div>
                            <p className="text-sm font-medium">{campaign.name}</p>
                            <p className="text-xs text-[#A1A1C2]">{platformLabels[campaign.platform] || campaign.platform} · {formatCurrency(campaign.spent || 0)} من {formatCurrency(campaign.budget || 0)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium text-[#A1A1C2]">CTR: {(campaign.ctr || 0).toFixed(1)}%</span>
                          <Badge variant={campaign.status === 'active' ? 'success' : campaign.status === 'paused' ? 'warning' : campaign.status === 'draft' ? 'secondary' : 'default'} className="text-xs">
                            {statusLabels[campaign.status] || campaign.status}
                          </Badge>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader><CardTitle className="text-lg font-bold flex items-center gap-2"><Bell className="w-4 h-4" />الإشعارات</CardTitle></CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-[#7C3AED]" /></div>
              ) : notifications.length === 0 ? (
                <div className="text-center py-6"><Bell className="w-10 h-10 mx-auto mb-2 text-[#2D2B55]" /><p className="text-sm text-[#A1A1C2]">لا توجد إشعارات</p></div>
              ) : (
                <div className="space-y-4">
                  {notifications.map(notif => (
                    <div key={notif.id} className="flex gap-3">
                      <div className="mt-0.5">{!notif.isRead && <div className="w-2 h-2 rounded-full bg-[#7C3AED] shadow-[0_0_8px_rgba(124,58,237,0.6)]" />}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{notif.title}</p>
                        {notif.message && <p className="text-xs text-[#A1A1C2]">{notif.message}</p>}
                        <p className="text-[10px] text-[#A1A1C2]/60 mt-0.5">{new Date(notif.createdAt).toLocaleString('ar')}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader><CardTitle className="text-lg font-bold">إجراءات سريعة</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link href={`/${locale}/dashboard/campaigns/create`}>
                <Button variant="outline" className="h-20 flex-col gap-2 w-full border-[#7C3AED]/20 hover:border-[#7C3AED]/60 hover:bg-[#7C3AED]/5">
                  <Plus size={20} className="text-[#7C3AED]" /><span className="text-xs">حملة جديدة</span>
                </Button>
              </Link>
              <Link href={`/${locale}/dashboard/competitors`}>
                <Button variant="outline" className="h-20 flex-col gap-2 w-full border-[#06B6D4]/20 hover:border-[#06B6D4]/60 hover:bg-[#06B6D4]/5">
                  <Search size={20} className="text-[#06B6D4]" /><span className="text-xs">تحليل منافس</span>
                </Button>
              </Link>
              <Link href={`/${locale}/dashboard/market-research`}>
                <Button variant="outline" className="h-20 flex-col gap-2 w-full border-[#EC4899]/20 hover:border-[#EC4899]/60 hover:bg-[#EC4899]/5">
                  <Users size={20} className="text-[#EC4899]" /><span className="text-xs">بحث سوق</span>
                </Button>
              </Link>
              <Link href={`/${locale}/dashboard/social`}>
                <Button variant="outline" className="h-20 flex-col gap-2 w-full border-[#F59E0B]/20 hover:border-[#F59E0B]/60 hover:bg-[#F59E0B]/5">
                  <MessageCircle className="w-5 h-5 text-[#F59E0B]" /><span className="text-xs">الرسائل</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
