'use client';

import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import {
  TrendingUp, DollarSign, Eye, MousePointerClick,
  Target, Plus, Search, BarChart3, Megaphone, Bell,
  AlertCircle, Clock, Loader2, ArrowUpRight, RefreshCw,
  MessageCircle, AlertTriangle, Sparkles, Activity,
  Zap, BarChart4, Layers, Radio,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

import { formatCurrency, formatNumber, cn } from '@/lib/utils';
import {
  campaignsApi, analyticsApi, notificationsApi,
  type Campaign, type AnalyticsOverview, type Notification,
} from '@/services/api-modules';
import {
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import { useLocalization } from '@/contexts/LocalizationContext';

// ── Locale maps ──────────────────────────────────────────
const platformColors: Record<string, string> = {
  facebook: 'bg-blue-500', instagram: 'bg-pink-500', tiktok: 'bg-gray-900',
  snapchat: 'bg-yellow-400', whatsapp: 'bg-emerald-500', messenger: 'bg-blue-500',
  twitter: 'bg-sky-500', telegram: 'bg-cyan-500',
};

const platformGlowColors: Record<string, string> = {
  facebook: 'shadow-blue-500/50', instagram: 'shadow-pink-500/50', tiktok: 'shadow-gray-900/50',
  snapchat: 'shadow-yellow-400/50', whatsapp: 'shadow-emerald-500/50',
  twitter: 'shadow-sky-500/50', telegram: 'shadow-cyan-500/50',
};

const platformLabels: Record<string, Record<string, string>> = {
  ar: { facebook: 'فيسبوك', instagram: 'انستجرام', tiktok: 'تيك توك', snapchat: 'سناب شات', whatsapp: 'واتساب', messenger: 'ماسنجر', twitter: 'تويتر', telegram: 'تيليجرام' },
  en: { facebook: 'Facebook', instagram: 'Instagram', tiktok: 'TikTok', snapchat: 'Snapchat', whatsapp: 'WhatsApp', messenger: 'Messenger', twitter: 'Twitter', telegram: 'Telegram' },
  fr: { facebook: 'Facebook', instagram: 'Instagram', tiktok: 'TikTok', snapchat: 'Snapchat', whatsapp: 'WhatsApp', messenger: 'Messenger', twitter: 'Twitter', telegram: 'Telegram' },
  tr: { facebook: 'Facebook', instagram: 'Instagram', tiktok: 'TikTok', snapchat: 'Snapchat', whatsapp: 'WhatsApp', messenger: 'Messenger', twitter: 'Twitter', telegram: 'Telegram' },
};

const statusBadgeVariant: Record<string, string> = {
  active: 'success', published: 'success', paused: 'warning',
  draft: 'secondary', draft_pending_approval: 'default', approved: 'primary', completed: 'info',
};

const statusLabels: Record<string, Record<string, string>> = {
  ar: { active: 'نشط', paused: 'متوقف', draft: 'مسودة', completed: 'مكتمل', draft_pending_approval: 'بانتظار الموافقة', approved: 'معتمد', published: 'منشور' },
  en: { active: 'Active', paused: 'Paused', draft: 'Draft', completed: 'Completed', draft_pending_approval: 'Pending Approval', approved: 'Approved', published: 'Published' },
  fr: { active: 'Actif', paused: 'En pause', draft: 'Brouillon', completed: 'Terminé', draft_pending_approval: 'En attente', approved: 'Approuvé', published: 'Publié' },
  tr: { active: 'Aktif', paused: 'Duraklatıldı', draft: 'Taslak', completed: 'Tamamlandı', draft_pending_approval: 'Onay Bekliyor', approved: 'Onaylandı', published: 'Yayında' },
};

const neonColors = ['#7C3AED', '#06B6D4', '#EC4899', '#F59E0B', '#10B981', '#3B82F6'];

const textLabels: Record<string, Record<string, string>> = {
  ar: {
    overview: 'نظرة عامة على أدائك', totalCampaigns: 'إجمالي الحملات', activeNow: 'النشطة حالياً',
    totalBudget: 'إجمالي الميزانية', totalSpend: 'الإنفاق الإجمالي',
    campaigns: 'الحملات', spend: 'الإنفاق', impressions: 'مرات الظهور',
    clicks: 'النقرات', conversions: 'التحويلات', thisWeek: 'هذا الأسبوع',
    spendTrend: 'اتجاه الإنفاق', last7Days: 'آخر 7 أيام',
    platformDist: 'توزيع المنصات', budgetAlerts: 'تنبيهات الميزانية',
    recentCampaigns: 'آخر الحملات', viewAll: 'عرض الكل',
    noCampaigns: 'لا توجد حملات بعد', startCreating: 'ابدأ بإنشاء حملتك الأولى',
    createCampaign: 'إنشاء حملة', notifications: 'الإشعارات',
    noNotifications: 'لا توجد إشعارات', quickActions: 'إجراءات سريعة',
    newCampaign: 'حملة جديدة', competitorAnalysis: 'تحليل منافس',
    marketResearch: 'بحث سوق', messages: 'الرسائل', aiAgents: 'وكلاء ذكاء',
    analytics: 'التحليلات', refresh: 'تحديث', lastUpdate: 'آخر تحديث',
    updating: 'جاري التحديث...', budgetWarn: 'تجاوزت 80% من الميزانية',
    sat: 'السبت', sun: 'الأحد', mon: 'الإثنين', tue: 'الثلاثاء',
    wed: 'الأربعاء', thu: 'الخميس', fri: 'الجمعة',
  },
  en: {
    overview: 'Performance overview', totalCampaigns: 'Total Campaigns', activeNow: 'Active Now',
    totalBudget: 'Total Budget', totalSpend: 'Total Spend',
    campaigns: 'Campaigns', spend: 'Spend', impressions: 'Impressions',
    clicks: 'Clicks', conversions: 'Conversions', thisWeek: 'this week',
    spendTrend: 'Spend Trend', last7Days: 'Last 7 days',
    platformDist: 'Platform Distribution', budgetAlerts: 'Budget Alerts',
    recentCampaigns: 'Recent Campaigns', viewAll: 'View All',
    noCampaigns: 'No campaigns yet', startCreating: 'Start creating your first campaign',
    createCampaign: 'Create Campaign', notifications: 'Notifications',
    noNotifications: 'No notifications', quickActions: 'Quick Actions',
    newCampaign: 'New Campaign', competitorAnalysis: 'Competitor Analysis',
    marketResearch: 'Market Research', messages: 'Messages', aiAgents: 'AI Agents',
    analytics: 'Analytics', refresh: 'Refresh', lastUpdate: 'Last updated',
    updating: 'Updating...', budgetWarn: 'exceeded 80% of budget',
    sat: 'Sat', sun: 'Sun', mon: 'Mon', tue: 'Tue', wed: 'Wed', thu: 'Thu', fri: 'Fri',
  },
  fr: {
    overview: "Aperçu des performances", totalCampaigns: 'Campagnes totales', activeNow: 'Actives',
    totalBudget: 'Budget total', totalSpend: 'Dépenses totales',
    campaigns: 'Campagnes', spend: 'Dépenses', impressions: 'Impressions',
    clicks: 'Clics', conversions: 'Conversions', thisWeek: 'cette semaine',
    spendTrend: 'Tendance des dépenses', last7Days: '7 derniers jours',
    platformDist: 'Distribution des plateformes', budgetAlerts: 'Alertes budget',
    recentCampaigns: 'Campagnes récentes', viewAll: 'Voir tout',
    noCampaigns: 'Aucune campagne', startCreating: 'Créez votre première campagne',
    createCampaign: 'Nouvelle campagne', notifications: 'Notifications',
    noNotifications: 'Aucune notification', quickActions: 'Actions rapides',
    newCampaign: 'Nouvelle campagne', competitorAnalysis: 'Analyse concurrents',
    marketResearch: 'Étude marché', messages: 'Messages', aiAgents: 'Agents IA',
    analytics: 'Analytiques', refresh: 'Actualiser', lastUpdate: 'Dernière màj',
    updating: 'Mise à jour...', budgetWarn: 'dépassé 80% du budget',
    sat: 'Sam', sun: 'Dim', mon: 'Lun', tue: 'Mar', wed: 'Mer', thu: 'Jeu', fri: 'Ven',
  },
  tr: {
    overview: 'Performans özeti', totalCampaigns: 'Toplam Kampanyalar', activeNow: 'Aktif',
    totalBudget: 'Toplam Bütçe', totalSpend: 'Toplam Harcama',
    campaigns: 'Kampanyalar', spend: 'Harcama', impressions: 'Gösterim',
    clicks: 'Tıklamalar', conversions: 'Dönüşümler', thisWeek: 'bu hafta',
    spendTrend: 'Harcama Trendi', last7Days: 'Son 7 gün',
    platformDist: 'Platform Dağılımı', budgetAlerts: 'Bütçe Uyarıları',
    recentCampaigns: 'Son Kampanyalar', viewAll: 'Tümünü Gör',
    noCampaigns: 'Henüz kampanya yok', startCreating: 'İlk kampanyanızı oluşturun',
    createCampaign: 'Kampanya Oluştur', notifications: 'Bildirimler',
    noNotifications: 'Bildirim yok', quickActions: 'Hızlı İşlemler',
    newCampaign: 'Yeni Kampanya', competitorAnalysis: 'Rakip Analizi',
    marketResearch: 'Pazar Araştırması', messages: 'Mesajlar', aiAgents: 'Yapay Zeka',
    analytics: 'Analitik', refresh: 'Yenile', lastUpdate: 'Son güncelleme',
    updating: 'Güncelleniyor...', budgetWarn: 'bütçenin %80\'ini aştı',
    sat: 'Cmt', sun: 'Paz', mon: 'Pzt', tue: 'Sal', wed: 'Çar', thu: 'Per', fri: 'Cum',
  },
};

// ── Sub-components ───────────────────────────────────────

function AnimatedCounter({ value, format = 'number' }: { value: number; format?: 'number' | 'currency' }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const startTime = useRef<number>(0);
  const duration = 1400;

  useEffect(() => {
    if (!inView) return;
    startTime.current = Date.now();
    const animate = () => {
      const elapsed = Date.now() - startTime.current;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * value));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [inView, value]);

  const formatted = format === 'currency'
    ? formatCurrency(display)
    : formatNumber(display);

  return <span ref={ref}>{formatted}</span>;
}

function StatusPill({ text, loading = false }: { text: string; loading?: boolean }) {
  return (
    <div className="inline-flex items-center gap-1.5 text-[11px] text-[#A1A1C2] bg-[#1E1B3A]/80 backdrop-blur-sm px-3 py-1.5 rounded-full border border-[#7C3AED]/10">
      {loading ? (
        <Loader2 className="w-3 h-3 animate-spin text-[#7C3AED]" />
      ) : (
        <span className="relative w-1.5 h-1.5 rounded-full bg-[#10B981]">
          <span className="absolute inset-0 rounded-full bg-[#10B981] animate-ping opacity-60" />
        </span>
      )}
      {text}
    </div>
  );
}

function SkeletonBar({ className }: { className?: string }) {
  return (
    <div className={cn('bg-gradient-to-r from-[#1E1B3A] via-[#2D2B55] to-[#1E1B3A] rounded animate-shimmer bg-[length:200%_100%]', className)} />
  );
}

function FloatingOrb({ color = '#7C3AED', size = 300, className }: { color?: string; size?: number; className?: string }) {
  return (
    <div
      className={cn('absolute pointer-events-none', className)}
      style={{
        width: size, height: size,
        background: `radial-gradient(circle, ${color}20 0%, transparent 70%)`,
      }}
    />
  );
}

function GlassCard({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn(
      'relative overflow-hidden rounded-2xl border border-[#7C3AED]/10 bg-[#14102B]/70 backdrop-blur-sm',
      'hover:border-[#7C3AED]/25 hover:shadow-[0_0_40px_rgba(124,58,237,0.12)]',
      'transition-all duration-500',
      className,
    )} {...props}>
      {children}
    </div>
  );
}

// ── Main dashboard component ──────────────────────────────

export default function DashboardPage({ params: { locale } }: { params: { locale: string } }) {
  const { t, direction } = useLocalization();
  const txt = textLabels[locale] || textLabels.ar;
  const platformLabel = platformLabels[locale] || platformLabels.ar;
  const statusLabel = statusLabels[locale] || statusLabels.ar;

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Greeting
  const hours = new Date().getHours();
  const greetings: Record<string, string> = {
    ar: hours < 12 ? 'صباح الخير' : 'مساء الخير',
    en: hours < 12 ? 'Good morning' : hours < 18 ? 'Good afternoon' : 'Good evening',
    fr: hours < 12 ? 'Bonjour' : hours < 18 ? 'Bon après-midi' : 'Bonsoir',
    tr: hours < 12 ? 'Günaydın' : hours < 18 ? 'Tünaydın' : 'İyi akşamlar',
  };
  const greeting = greetings[locale] || greetings.ar;

  // Stat card definitions
  const stats = useMemo(() => [
    { key: 'campaigns', icon: <Megaphone className="w-5 h-5" />, gradient: 'from-[#7C3AED] to-[#A78BFA]', change: '+12%', orbColor: '#7C3AED' },
    { key: 'spend', icon: <DollarSign className="w-5 h-5" />, gradient: 'from-[#EC4899] to-[#F472B6]', change: '+8%', orbColor: '#EC4899' },
    { key: 'impressions', icon: <Eye className="w-5 h-5" />, gradient: 'from-[#06B6D4] to-[#22D3EE]', change: '+23%', orbColor: '#06B6D4' },
    { key: 'clicks', icon: <MousePointerClick className="w-5 h-5" />, gradient: 'from-[#F59E0B] to-[#FBBF24]', change: '+15%', orbColor: '#F59E0B' },
    { key: 'conversions', icon: <Target className="w-5 h-5" />, gradient: 'from-[#10B981] to-[#34D399]', change: '+7%', orbColor: '#10B981' },
  ], []);

  // Budget alerts
  const budgetAlerts = useMemo(() =>
    campaigns.filter(c => c.budget && c.spent && (c.spent / c.budget) > 0.8),
  [campaigns]);

  // Derived stats
  const activeCampaigns = campaigns.filter(c => c.status === 'active' || c.status === 'published').length;
  const totalBudget = campaigns.reduce((s, c) => s + (c.budget || 0), 0);
  const totalSpent = campaigns.reduce((s, c) => s + (c.spent || 0), 0);

  // Data loading
  const loadData = useCallback(async (silent = false) => {
    if (!silent) { setLoading(true); }
    setError(null);
    try {
      const [overviewRes, campaignsRes, notifRes] = await Promise.allSettled([
        analyticsApi.getOverview(), campaignsApi.list({ limit: 5 }), notificationsApi.list(),
      ]);
      if (overviewRes.status === 'fulfilled') setOverview(overviewRes.value.data?.data || overviewRes.value.data);
      if (campaignsRes.status === 'fulfilled') setCampaigns(campaignsRes.value.data?.data || campaignsRes.value.data?.campaigns || []);
      if (notifRes.status === 'fulfilled') setNotifications((notifRes.value.data?.data || notifRes.value.data?.notifications || []).slice(0, 5));
      setLastUpdated(new Date());
    } catch (err: any) {
      setError(err?.response?.data?.error || 'فشل تحميل البيانات');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    const interval = setInterval(() => loadData(true), 45000);
    return () => clearInterval(interval);
  }, [loadData]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadData(true);
  };

  const getStatValue = (idx: number) => {
    if (idx === 0) return campaigns.length;
    const val = idx === 1 ? (overview?.totalSpend || campaigns.reduce((s, c) => s + (c.spent || 0), 0))
      : idx === 2 ? (overview?.totalImpressions || campaigns.reduce((s, c) => s + (c.impressions || 0), 0))
      : idx === 3 ? (overview?.totalClicks || campaigns.reduce((s, c) => s + (c.clicks || 0), 0))
      : (overview?.totalConversions || campaigns.reduce((s, c) => s + (c.conversions || 0), 0));
    return val;
  };

  // Chart data
  const chartData = useMemo(() => {
    const days = [txt.sat, txt.sun, txt.mon, txt.tue, txt.wed, txt.thu, txt.fri];
    const base = overview?.totalSpend || totalSpent || 5000;
    return days.map((name, i) => ({
      name,
      value: Math.round(base * [0.6, 0.75, 0.45, 0.9, 0.7, 1.05, 0.8][i]),
    }));
  }, [overview, totalSpent, txt]);

  const pieData = useMemo(() => {
    if (campaigns.length > 0) {
      const grouped = campaigns.reduce((acc, c) => {
        acc[c.platform] = (acc[c.platform] || 0) + (c.spent || 0);
        return acc;
      }, {} as Record<string, number>);
      return Object.entries(grouped).map(([key, val]) => ({ name: platformLabel[key] || key, value: val }));
    }
    return [
      { name: platformLabel.facebook || 'Facebook', value: 4500 },
      { name: platformLabel.instagram || 'Instagram', value: 3200 },
      { name: platformLabel.tiktok || 'TikTok', value: 2800 },
      { name: platformLabel.snapchat || 'Snapchat', value: 1500 },
    ];
  }, [campaigns, platformLabel]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } },
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <motion.div
      className="space-y-6 relative"
      dir={direction}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* ── Header ────────────────────────────────── */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-black gradient-brand-text tracking-tight">
              {greeting}،
            </h1>
            <div className="flex gap-1">
              <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
              <span className="w-2 h-2 rounded-full bg-[#7C3AED] animate-pulse shadow-[0_0_8px_rgba(124,58,237,0.6)]" style={{ animationDelay: '0.3s' }} />
              <span className="w-2 h-2 rounded-full bg-[#06B6D4] animate-pulse shadow-[0_0_8px_rgba(6,182,212,0.6)]" style={{ animationDelay: '0.6s' }} />
            </div>
          </div>
          <p className="text-[#A1A1C2] text-xs sm:text-sm mt-1">{txt.overview}</p>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
          <StatusPill
            text={refreshing ? txt.updating : `${txt.lastUpdate}: ${lastUpdated.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}`}
            loading={refreshing}
          />
          <Button
            size="sm"
            variant="outline"
            onClick={handleRefresh}
            disabled={refreshing}
            className="border-[#7C3AED]/20 text-xs h-8 px-2"
          >
            <RefreshCw className={cn('w-3 h-3 ml-1', refreshing && 'animate-spin')} />
            <span className="hidden sm:inline">{txt.refresh}</span>
          </Button>
          <Link href={`/${locale}/dashboard/campaigns/create`}>
            <Button className="group relative overflow-hidden text-xs h-8 px-3">
              <span className="absolute inset-0 bg-gradient-to-r from-[#7C3AED] to-[#06B6D4] opacity-0 group-hover:opacity-100 transition-opacity" />
              <Plus size={14} className="ml-1 relative z-10" />
              <span className="relative z-10 hidden sm:inline">{txt.createCampaign}</span>
            </Button>
          </Link>
          <Link href={`/${locale}/dashboard/analytics`} className="hidden sm:inline">
            <Button variant="outline" className="text-xs h-8"><BarChart3 size={14} className="ml-1" />{txt.analytics}</Button>
          </Link>
        </div>
      </motion.div>

      {/* ── Error Banner ─────────────────────────── */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20 }}
            className="p-4 rounded-xl bg-[#F43F5E]/10 border border-[#F43F5E]/20 text-[#F43F5E] text-sm flex items-center gap-3"
          >
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span className="flex-1">{error}</span>
            <Button size="sm" variant="destructive" onClick={() => loadData()} className="text-xs h-7">
              <RefreshCw className="w-3 h-3 ml-1" />إعادة المحاولة
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Hero: 4 Quick Stats ─────────────────── */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: txt.totalCampaigns, value: campaigns.length, color: '#7C3AED' },
          { label: txt.activeNow, value: activeCampaigns, color: '#10B981', pulse: true },
          { label: txt.totalBudget, value: totalBudget, currency: true, color: '#06B6D4' },
          { label: txt.totalSpend, value: totalSpent, currency: true, color: '#EC4899' },
        ].map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.5 }}
            className="group relative overflow-hidden rounded-xl bg-[#14102B]/60 backdrop-blur-sm px-4 py-3.5 border border-[#7C3AED]/10 hover:border-[#7C3AED]/25 transition-all duration-500"
          >
            <FloatingOrb color={item.color} size={200} className="top-0 right-0" />
            <p className="text-[10px] text-[#A1A1C2] uppercase tracking-wider relative z-10">{item.label}</p>
            {loading ? (
              <SkeletonBar className="h-7 w-3/4 mt-1.5" />
            ) : (
              <p className={cn(
                'text-lg font-black mt-1 relative z-10 flex items-center gap-1.5',
                item.pulse ? 'text-[#10B981]' : 'text-white',
              )}>
                {item.pulse && (
                  <span className="relative w-2 h-2 rounded-full bg-[#10B981]">
                    <span className="absolute inset-0 rounded-full bg-[#10B981] animate-ping opacity-60" />
                  </span>
                )}
                {item.currency ? formatCurrency(item.value as number) : item.value}
              </p>
            )}
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#7C3AED]/20 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-700" />
          </motion.div>
        ))}
      </motion.div>

      {/* ── 5 Animated Stat Cards ────────────────── */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.key}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07, duration: 0.5, ease: 'easeOut' }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
          >
            <GlassCard className="group h-full">
              <FloatingOrb color={stat.orbColor} size={250} className="-top-32 -right-32 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              <CardContent className="p-4 relative">
                <div className="flex items-center justify-between mb-3">
                  <div className={cn(
                    'w-11 h-11 rounded-xl bg-gradient-to-br flex items-center justify-center text-white',
                    'shadow-lg shadow-[#7C3AED]/15 group-hover:shadow-xl group-hover:shadow-[#7C3AED]/25',
                    'transition-all duration-300 group-hover:scale-110',
                    stat.gradient,
                  )}>
                    {stat.icon}
                  </div>
                  <motion.div
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.07 }}
                  >
                    <ArrowUpRight className="w-4 h-4 text-[#10B981] opacity-0 group-hover:opacity-100 transition-opacity" />
                  </motion.div>
                </div>
                <p className="text-xs text-[#A1A1C2] mb-1.5">{txt[stat.key as keyof typeof txt] || stat.key}</p>
                {loading ? (
                  <div className="space-y-2">
                    <SkeletonBar className="h-7 w-4/5" />
                    <SkeletonBar className="h-3 w-1/2" />
                  </div>
                ) : (
                  <>
                    <p className="text-2xl font-black gradient-brand-text leading-tight">
                      <AnimatedCounter
                        value={getStatValue(i)}
                        format={i === 1 ? 'currency' : 'number'}
                      />
                    </p>
                    <p className="text-[10px] text-[#10B981] mt-1.5 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      <span>{stat.change}</span>
                      <span className="text-[#A1A1C2]/60 mr-1">{txt.thisWeek}</span>
                    </p>
                  </>
                )}
              </CardContent>
              {/* Glow border on hover */}
              <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{ boxShadow: `0 0 40px ${stat.orbColor}15, inset 0 0 40px ${stat.orbColor}05` }}
              />
            </GlassCard>
          </motion.div>
        ))}
      </motion.div>

      {/* ── Charts Row ───────────────────────────── */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Spend Trend Line Chart (2/3) */}
        <GlassCard className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <BarChart4 className="w-4 h-4 text-[#7C3AED]" />
              {txt.spendTrend}
            </CardTitle>
            <Badge variant="info" className="text-[10px]">
              <Activity className="w-3 h-3 ml-1" />{txt.last7Days}
            </Badge>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-[260px] flex items-center justify-center">
                <SkeletonBar className="w-full h-[220px] rounded-xl" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="spendGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#7C3AED" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#7C3AED" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2D2B55" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#A1A1C2' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: '#A1A1C2' }} axisLine={false} tickLine={false} tickFormatter={v => `${(v / 1000).toFixed(0)}K`} />
                  <Tooltip
                    contentStyle={{
                      background: '#14102B', border: '1px solid #7C3AED40',
                      borderRadius: '12px', color: '#F5F3FF', fontSize: '13px',
                      backdropFilter: 'blur(12px)',
                    }}
                    formatter={(v: number) => [formatCurrency(v), txt.spend]}
                    labelStyle={{ color: '#A1A1C2', marginBottom: 4 }}
                  />
                  <Area type="monotone" dataKey="value" stroke="#7C3AED" strokeWidth={3} fill="url(#spendGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </GlassCard>

        {/* Platform Distribution Donut (1/3) */}
        <GlassCard>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Radio className="w-4 h-4 text-[#06B6D4]" />
              {txt.platformDist}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-[260px] flex items-center justify-center">
                <SkeletonBar className="w-[200px] h-[200px] rounded-full" />
              </div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value" nameKey="name"
                      cx="50%" cy="50%"
                      innerRadius={55} outerRadius={90}
                      paddingAngle={4}
                      stroke="none"
                    >
                      {pieData.map((_, i) => (
                        <Cell key={i} fill={neonColors[i % neonColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: '#14102B', border: '1px solid #7C3AED40',
                        borderRadius: '12px', color: '#F5F3FF', fontSize: '13px',
                        backdropFilter: 'blur(12px)',
                      }}
                      formatter={(v: number, n: string) => [formatCurrency(v), n]}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap gap-1.5 justify-center mt-1">
                  {pieData.map((entry, i) => (
                    <div key={entry.name} className="flex items-center gap-1.5 text-[10px] px-2 py-1 rounded-full bg-[#7C3AED]/5 border border-[#7C3AED]/10 text-[#A1A1C2]">
                      <span className="w-2 h-2 rounded-full" style={{ background: neonColors[i % neonColors.length] }} />
                      {entry.name}
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </GlassCard>
      </motion.div>

      {/* ── Budget Alerts ─────────────────────────── */}
      <AnimatePresence>
        {budgetAlerts.length > 0 && (
          <motion.div
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0, height: 0 }}
          >
            <GlassCard className="border-[#F59E0B]/30 bg-gradient-to-r from-[#F59E0B]/5 to-transparent">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#F59E0B]/20 flex items-center justify-center flex-shrink-0">
                    <AlertTriangle className="w-4 h-4 text-[#F59E0B]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-semibold text-[#FBBF24] text-sm">{txt.budgetAlerts}</p>
                      <Badge variant="warning" size="sm">{budgetAlerts.length}</Badge>
                    </div>
                    <div className="space-y-2">
                      {budgetAlerts.map(c => {
                        const pct = ((c.spent / c.budget) * 100);
                        return (
                          <div key={c.id} className="flex items-center gap-3">
                            <div className="flex-1">
                              <div className="flex justify-between text-xs mb-1">
                                <span className="text-[#F59E0B]/90 font-medium truncate">{c.name}</span>
                                <span className="text-[#F59E0B]/70 font-mono">{pct.toFixed(0)}%</span>
                              </div>
                              <div className="h-2 bg-[#1E1B3A] rounded-full overflow-hidden">
                                <motion.div
                                  className="h-full rounded-full"
                                  style={{
                                    background: `linear-gradient(90deg, #F59E0B ${Math.min(pct, 90)}%, #F43F5E 100%)`,
                                  }}
                                  initial={{ width: 0 }}
                                  animate={{ width: `${pct}%` }}
                                  transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }}
                                />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </CardContent>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Recent Campaigns + Notifications ──────── */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Campaigns */}
        <GlassCard className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-[#EC4899]" />
              {txt.recentCampaigns}
              {!loading && campaigns.length > 0 && (
                <Badge variant="primary" size="sm" className="text-[10px]">{campaigns.length}</Badge>
              )}
            </CardTitle>
            <Link href={`/${locale}/dashboard/campaigns`}>
              <Button variant="ghost" size="sm" className="text-xs text-[#7C3AED]">{txt.viewAll}</Button>
            </Link>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex items-center gap-3 p-3">
                    <SkeletonBar className="w-3 h-3 rounded-full shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <SkeletonBar className="h-4 w-2/3" />
                      <SkeletonBar className="h-3 w-1/2" />
                    </div>
                    <SkeletonBar className="h-4 w-16 rounded-full" />
                  </div>
                ))}
              </div>
            ) : campaigns.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12"
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#7C3AED] to-[#A78BFA] mx-auto mb-4 flex items-center justify-center shadow-[0_0_30px_rgba(124,58,237,0.3)]">
                  <Megaphone className="w-8 h-8 text-white" />
                </div>
                <p className="font-semibold text-lg text-white">{txt.noCampaigns}</p>
                <p className="text-sm text-[#A1A1C2] mt-1 mb-4">{txt.startCreating}</p>
                <Link href={`/${locale}/dashboard/campaigns/create`}>
                  <Button className="group">
                    <Plus size={16} className="ml-1 group-hover:rotate-90 transition-transform" />
                    {txt.createCampaign}
                  </Button>
                </Link>
              </motion.div>
            ) : (
              <div className="space-y-0.5">
                {campaigns.map((campaign, idx) => {
                  const spentPct = Math.min(((campaign.spent || 0) / (campaign.budget || 1)) * 100, 100);
                  return (
                    <motion.div
                      key={campaign.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                    >
                      <Link
                        href={`/${locale}/dashboard/campaigns/${campaign.id}`}
                        className="flex items-center justify-between p-3 rounded-xl hover:bg-[#7C3AED]/5 transition-all border border-transparent hover:border-[#7C3AED]/15 group"
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className={cn(
                            'w-2.5 h-2.5 rounded-full shrink-0 shadow-[0_0_8px_var(--tw-shadow-color)]',
                            platformColors[campaign.platform] || 'bg-gray-400',
                            platformGlowColors[campaign.platform] || '',
                          )} />
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-white truncate">{campaign.name}</p>
                            <p className="text-xs text-[#A1A1C2]">
                              {platformLabel[campaign.platform] || campaign.platform}
                              <span className="mx-1">·</span>
                              <span className="text-[#10B981]">{formatCurrency(campaign.spent || 0)}</span>
                              <span className="text-[#A1A1C2]/50"> / {formatCurrency(campaign.budget || 0)}</span>
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <div className="text-right hidden sm:block">
                            <span className="text-xs font-medium text-[#A1A1C2]">CTR: {(campaign.ctr || 0).toFixed(1)}%</span>
                            <div className="w-16 h-1.5 bg-[#1E1B3A] rounded-full mt-1 overflow-hidden">
                              <motion.div
                                className="h-full rounded-full bg-gradient-to-r from-[#7C3AED] to-[#06B6D4]"
                                initial={{ width: 0 }}
                                animate={{ width: `${spentPct}%` }}
                                transition={{ duration: 0.8, delay: 0.2 + idx * 0.05 }}
                              />
                            </div>
                          </div>
                          <Badge
                            variant={(statusBadgeVariant[campaign.status] || 'neutral') as any}
                            size="sm"
                          >
                            {statusLabel[campaign.status] || campaign.status}
                          </Badge>
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </GlassCard>

        {/* Notifications */}
        <GlassCard>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-bold flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-[#F59E0B]" />
                {txt.notifications}
              </span>
              {unreadCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-[#7C3AED] text-white text-[10px] font-bold flex items-center justify-center shadow-[0_0_12px_rgba(124,58,237,0.5)]">
                  {unreadCount}
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="max-h-[320px] overflow-y-auto scrollbar-thin scrollbar-thumb-[#2D2B55] scrollbar-track-transparent">
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex gap-3">
                    <SkeletonBar className="w-2.5 h-2.5 rounded-full mt-1 shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <SkeletonBar className="h-4 w-3/4" />
                      <SkeletonBar className="h-3 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 rounded-xl bg-[#2D2B55] mx-auto mb-3 flex items-center justify-center">
                  <Bell className="w-6 h-6 text-[#A1A1C2]" />
                </div>
                <p className="text-sm text-[#A1A1C2]">{txt.noNotifications}</p>
              </div>
            ) : (
              <div className="space-y-1">
                {notifications.map((notif, idx) => (
                  <motion.div
                    key={notif.id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.04 }}
                    className={cn(
                      'flex gap-3 p-2.5 rounded-lg transition-colors cursor-pointer',
                      !notif.isRead ? 'bg-[#7C3AED]/8 hover:bg-[#7C3AED]/12' : 'hover:bg-[#7C3AED]/3',
                    )}
                  >
                    <div className="mt-1 shrink-0">
                      {!notif.isRead ? (
                        <span className="relative flex w-2.5 h-2.5">
                          <span className="absolute inset-0 rounded-full bg-[#7C3AED] animate-ping opacity-40" />
                          <span className="relative rounded-full w-2.5 h-2.5 bg-[#7C3AED] shadow-[0_0_8px_rgba(124,58,237,0.6)]" />
                        </span>
                      ) : (
                        <span className="w-2.5 h-2.5 rounded-full bg-[#2D2B55] block" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={cn('text-sm', notif.isRead ? 'text-[#A1A1C2]' : 'text-white font-medium')}>{notif.title}</p>
                      {notif.message && (
                        <p className="text-xs text-[#A1A1C2]/70 mt-0.5 line-clamp-2">{notif.message}</p>
                      )}
                      <p className="text-[10px] text-[#A1A1C2]/40 mt-1 font-mono">{formatRelativeTime(notif.createdAt, locale)}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </GlassCard>
      </motion.div>

      {/* ── Quick Actions ─────────────────────────── */}
      <motion.div variants={itemVariants}>
        <GlassCard>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#F59E0B]" />
              {txt.quickActions}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {[
                { href: `/${locale}/dashboard/campaigns/create`, icon: <Plus size={20} />, label: txt.newCampaign, color: '#7C3AED', borderColor: 'border-[#7C3AED]/20', hoverBorder: 'hover:border-[#7C3AED]/60', hoverBg: 'hover:bg-[#7C3AED]/5' },
                { href: `/${locale}/dashboard/competitors`, icon: <Search size={20} />, label: txt.competitorAnalysis, color: '#06B6D4', borderColor: 'border-[#06B6D4]/20', hoverBorder: 'hover:border-[#06B6D4]/60', hoverBg: 'hover:bg-[#06B6D4]/5' },
                { href: `/${locale}/dashboard/market-research`, icon: <Sparkles size={20} />, label: txt.marketResearch, color: '#EC4899', borderColor: 'border-[#EC4899]/20', hoverBorder: 'hover:border-[#EC4899]/60', hoverBg: 'hover:bg-[#EC4899]/5' },
                { href: `/${locale}/dashboard/social`, icon: <MessageCircle size={20} />, label: txt.messages, color: '#F59E0B', borderColor: 'border-[#F59E0B]/20', hoverBorder: 'hover:border-[#F59E0B]/60', hoverBg: 'hover:bg-[#F59E0B]/5' },
                { href: `/${locale}/dashboard/ai-agents`, icon: <Layers size={20} />, label: txt.aiAgents, color: '#10B981', borderColor: 'border-[#10B981]/20', hoverBorder: 'hover:border-[#10B981]/60', hoverBg: 'hover:bg-[#10B981]/5' },
              ].map((action) => (
                <Link key={action.href} href={action.href}>
                  <motion.div
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <Button
                      variant="outline"
                      className={cn(
                        'h-[76px] flex-col gap-2 w-full border transition-all group relative overflow-hidden',
                        action.borderColor, action.hoverBorder, action.hoverBg,
                      )}
                    >
                      <span className="relative z-10" style={{ color: action.color }}>{action.icon}</span>
                      <span className="text-xs relative z-10">{action.label}</span>
                    </Button>
                  </motion.div>
                </Link>
              ))}
            </div>
          </CardContent>
        </GlassCard>
      </motion.div>
    </motion.div>
  );
}

// ── Helper: relative time ────────────────────────────────
function formatRelativeTime(dateStr: string, locale: string) {
  const now = Date.now();
  const date = new Date(dateStr).getTime();
  const diff = now - date;
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  type Fmt = { just: string; min: string; mins: (n: number) => string; hour: string; hours: (n: number) => string; day: string; days: (n: number) => string };
  const labels: Record<string, Fmt> = {
    ar: { just: 'الآن', min: 'دقيقة', mins: (n) => `${n} دقائق`, hour: 'ساعة', hours: (n) => `${n} ساعات`, day: 'يوم', days: (n) => `${n} أيام` },
    en: { just: 'just now', min: 'minute ago', mins: (n) => `${n} minutes ago`, hour: 'hour ago', hours: (n) => `${n} hours ago`, day: 'day ago', days: (n) => `${n} days ago` },
    fr: { just: "à l'instant", min: 'il y a 1 min', mins: (n) => `il y a ${n} min`, hour: 'il y a 1h', hours: (n) => `il y a ${n}h`, day: 'il y a 1 jour', days: (n) => `il y a ${n} jours` },
    tr: { just: 'az önce', min: '1 dk önce', mins: (n) => `${n} dk önce`, hour: '1 saat önce', hours: (n) => `${n} saat önce`, day: '1 gün önce', days: (n) => `${n} gün önce` },
  };
  const l = labels[locale] || labels.ar;
  if (mins < 1) return l.just;
  if (mins < 60) return mins === 1 ? `1 ${l.min}` : l.mins(mins);
  if (hours < 24) return hours === 1 ? `1 ${l.hour}` : l.hours(hours);
  return days === 1 ? `1 ${l.day}` : l.days(days);
}
