'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Eye,
  MousePointerClick,
  Target,
  Plus,
  Search,
  Users,
  BarChart3,
  Megaphone,
  Bell,
  CheckCircle,
  AlertCircle,
  Clock,
  Loader2,
  ArrowUpRight,
  MessageCircle,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { formatCurrency, formatNumber } from '@/lib/utils';
import {
  campaignsApi,
  analyticsApi,
  notificationsApi,
  type Campaign,
  type AnalyticsOverview,
  type Notification,
} from '@/services/api-modules';

const platformColors: Record<string, string> = {
  facebook: 'bg-blue-500',
  instagram: 'bg-pink-500',
  tiktok: 'bg-gray-900',
  snapchat: 'bg-yellow-400',
  whatsapp: 'bg-emerald-500',
  messenger: 'bg-blue-500',
  twitter: 'bg-sky-500',
  telegram: 'bg-cyan-500',
};

const platformLabels: Record<string, string> = {
  facebook: 'فيسبوك',
  instagram: 'انستجرام',
  tiktok: 'تيك توك',
  snapchat: 'سناب شات',
  whatsapp: 'واتساب',
  messenger: 'ماسنجر',
  twitter: 'تويتر',
  telegram: 'تيليجرام',
};

const statusLabels: Record<string, string> = {
  active: 'نشط',
  paused: 'متوقف',
  draft: 'مسودة',
  completed: 'مكتمل',
};

export default function DashboardPage({ params: { locale } }: { params: { locale: string } }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

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
        const [overviewRes, campaignsRes, notifRes] = await Promise.allSettled([
          analyticsApi.getOverview(),
          campaignsApi.list({ limit: 5 }),
          notificationsApi.list(),
        ]);

        if (overviewRes.status === 'fulfilled') {
          setOverview(overviewRes.value.data?.data || overviewRes.value.data);
        }
        if (campaignsRes.status === 'fulfilled') {
          const data = campaignsRes.value.data?.data || campaignsRes.value.data?.campaigns || [];
          setCampaigns(data);
        }
        if (notifRes.status === 'fulfilled') {
          const data = notifRes.value.data?.data || notifRes.value.data?.notifications || [];
          setNotifications(data.slice(0, 5));
        }
      } catch (err: any) {
        setError(err?.response?.data?.error || 'فشل تحميل البيانات');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [locale]);

  const stats = [
    {
      title: 'إجمالي الحملات',
      value: campaigns.length,
      icon: <Megaphone className="h-5 w-5" />,
      color: 'from-electric to-cyan',
    },
    {
      title: 'الإنفاق',
      value: overview?.totalSpend || campaigns.reduce((s, c) => s + (c.spent || 0), 0),
      format: 'currency' as const,
      icon: <DollarSign className="h-5 w-5" />,
      color: 'from-purple to-violet',
    },
    {
      title: 'مرات الظهور',
      value: overview?.totalImpressions || campaigns.reduce((s, c) => s + (c.impressions || 0), 0),
      icon: <Eye className="h-5 w-5" />,
      color: 'from-cyan to-blue-500',
    },
    {
      title: 'النقرات',
      value: overview?.totalClicks || campaigns.reduce((s, c) => s + (c.clicks || 0), 0),
      icon: <MousePointerClick className="h-5 w-5" />,
      color: 'from-pink-500 to-rose-500',
    },
    {
      title: 'التحويلات',
      value: overview?.totalConversions || campaigns.reduce((s, c) => s + (c.conversions || 0), 0),
      icon: <Target className="h-5 w-5" />,
      color: 'from-emerald-500 to-teal-500',
    },
  ];

  return (
    <DashboardShell>
      <div className="space-y-6" dir="rtl">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black gradient-brand-text">لوحة التحكم</h1>
            <p className="text-muted-foreground text-sm mt-1">نظرة عامة على أداء حملاتك على MARKETRON</p>
          </div>
          <div className="flex gap-2">
            <Link href={`/${locale}/dashboard/campaigns/create`}>
              <Button className="gradient-brand text-white border-0">
                <Plus size={16} className="ml-1" />
                حملة جديدة
              </Button>
            </Link>
            <Link href={`/${locale}/dashboard/analytics`}>
              <Button variant="outline">
                <BarChart3 size={16} className="ml-1" />
                تقارير
              </Button>
            </Link>
          </div>
        </div>

        {error && (
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-3 flex items-center gap-2 text-sm text-amber-700 dark:text-amber-300">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-white shadow-md`}>
                      {stat.icon}
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-gray-400" />
                  </div>
                  <p className="text-xs text-muted-foreground mb-1">{stat.title}</p>
                  {loading ? (
                    <div className="h-7 w-20 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
                  ) : (
                    <p className="text-2xl font-black gradient-brand-text">
                      {stat.format === 'currency' ? formatCurrency(stat.value) : formatNumber(stat.value)}
                    </p>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Recent Campaigns + Notifications */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-md">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg font-bold">آخر الحملات</CardTitle>
                <Link href={`/${locale}/dashboard/campaigns`}>
                  <Button variant="ghost" size="sm">عرض الكل</Button>
                </Link>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-electric" />
                  </div>
                ) : campaigns.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 rounded-2xl gradient-brand mx-auto mb-3 flex items-center justify-center">
                      <Megaphone className="w-8 h-8 text-white" />
                    </div>
                    <p className="font-semibold text-gray-700 dark:text-gray-200">لا توجد حملات بعد</p>
                    <p className="text-sm text-gray-500 mt-1 mb-4">ابدأ بإنشاء حملتك الأولى على MARKETRON</p>
                    <Link href={`/${locale}/dashboard/campaigns/create`}>
                      <Button className="gradient-brand text-white border-0">
                        <Plus size={16} className="ml-1" />
                        إنشاء حملة
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {campaigns.map((campaign) => (
                      <Link
                        key={campaign.id}
                        href={`/${locale}/dashboard/campaigns/${campaign.id}`}
                        className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`h-2.5 w-2.5 rounded-full ${platformColors[campaign.platform] || 'bg-gray-400'}`} />
                          <div>
                            <p className="text-sm font-medium">{campaign.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {platformLabels[campaign.platform] || campaign.platform} · {formatCurrency(campaign.spent || 0)} من {formatCurrency(campaign.budget || 0)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium">CTR: {(campaign.ctr || 0).toFixed(1)}%</span>
                          <Badge variant={
                            campaign.status === 'active' ? 'success' :
                            campaign.status === 'paused' ? 'warning' :
                            campaign.status === 'draft' ? 'secondary' : 'default'
                          } className="text-xs">
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

          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Bell className="h-4 w-4" />
                الإشعارات
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-5 h-5 animate-spin text-electric" />
                </div>
              ) : notifications.length === 0 ? (
                <div className="text-center py-6">
                  <Bell className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm text-gray-400">لا توجد إشعارات</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {notifications.map((notif) => (
                    <div key={notif.id} className="flex gap-3">
                      <div className="mt-0.5">
                        {!notif.isRead && <div className="h-2 w-2 rounded-full bg-gradient-to-r from-electric to-cyan" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{notif.title}</p>
                        {notif.message && <p className="text-xs text-muted-foreground">{notif.message}</p>}
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          {new Date(notif.createdAt).toLocaleString('ar')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="text-lg font-bold">إجراءات سريعة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link href={`/${locale}/dashboard/campaigns/create`}>
                <Button variant="outline" className="h-20 flex-col gap-2 w-full hover:border-electric hover:bg-electric/5">
                  <Plus size={20} className="text-electric" />
                  <span className="text-xs">حملة جديدة</span>
                </Button>
              </Link>
              <Link href={`/${locale}/dashboard/competitors`}>
                <Button variant="outline" className="h-20 flex-col gap-2 w-full hover:border-cyan hover:bg-cyan/5">
                  <Search size={20} className="text-cyan-500" />
                  <span className="text-xs">تحليل منافس</span>
                </Button>
              </Link>
              <Link href={`/${locale}/dashboard/market-research`}>
                <Button variant="outline" className="h-20 flex-col gap-2 w-full hover:border-purple hover:bg-purple/5">
                  <Users size={20} className="text-purple-500" />
                  <span className="text-xs">بحث سوق</span>
                </Button>
              </Link>
              <Link href={`/${locale}/dashboard/social`}>
                <Button variant="outline" className="h-20 flex-col gap-2 w-full hover:border-violet hover:bg-violet/5">
                  <MessageCircle className="w-5 h-5 text-violet-500" />
                  <span className="text-xs">الرسائل</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
