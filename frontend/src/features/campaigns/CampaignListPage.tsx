'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn, formatCurrency, formatNumber } from '@/lib/utils';
import {
  Plus, Facebook, Instagram, Music2, Ghost, TrendingUp, DollarSign, Eye,
  MousePointerClick, Loader2, AlertCircle, Target, BarChart3, PieChart, Activity,
} from 'lucide-react';
import { campaignsApi } from '@/services/api-modules';
import { ParticlesBackground } from '@/components/ui/ParticlesBackground';

const platformIcons: Record<string, { icon: React.ReactNode; color: string }> = {
  facebook: { icon: <Facebook className="w-4 h-4" />, color: '#1877F2' },
  instagram: { icon: <Instagram className="w-4 h-4" />, color: '#E4405F' },
  tiktok: { icon: <Music2 className="w-4 h-4" />, color: '#25F4EE' },
  snapchat: { icon: <Ghost className="w-4 h-4" />, color: '#FFFC00' },
};

const platformNames: Record<string, string> = {
  facebook: 'فيسبوك', instagram: 'إنستجرام', tiktok: 'تيك توك', snapchat: 'سناب شات',
};

const statusConfig: Record<string, { label: string; badgeClass: string; dot: string }> = {
  active: { label: 'نشط', badgeClass: 'badge-emerald text-emerald-400', dot: 'bg-emerald-400' },
  paused: { label: 'متوقف', badgeClass: 'bg-[#F59E0B]/10 border border-[#F59E0B]/30 text-amber-400', dot: 'bg-amber-400' },
  completed: { label: 'مكتمل', badgeClass: 'badge-cyan text-cyan-400', dot: 'bg-cyan-400' },
  draft: { label: 'مسودة', badgeClass: 'bg-[#6B7280]/10 border border-[#6B7280]/30 text-gray-400', dot: 'bg-gray-400' },
};

const filterTabs = [
  { key: 'all', label: 'الكل' },
  { key: 'active', label: 'نشط' },
  { key: 'paused', label: 'متوقف' },
  { key: 'completed', label: 'مكتمل' },
  { key: 'draft', label: 'مسودة' },
];

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const staggerItem = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' as const } },
};

function useCountUp(end: number, duration: number = 1200, active: boolean = true) {
  const [value, setValue] = useState(0);
  const raf = useRef<number>(0);
  const startTime = useRef<number>(0);

  const animate = useCallback((timestamp: number) => {
    if (!startTime.current) startTime.current = timestamp;
    const elapsed = timestamp - startTime.current;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    setValue(Math.floor(eased * end));
    if (progress < 1) raf.current = requestAnimationFrame(animate);
  }, [end, duration]);

  useEffect(() => {
    if (!active) { setValue(0); return; }
    startTime.current = 0;
    setValue(0);
    raf.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf.current);
  }, [active, animate]);

  return value;
}

function KPICard({
  icon, label, value, prefix = '', suffix = '', format = 'number', active,
}: {
  icon: React.ReactNode; label: string; value: number;
  prefix?: string; suffix?: string; format?: 'number' | 'currency' | 'percent';
  active: boolean;
}) {
  const count = useCountUp(value, 1200, active);
  const display =
    format === 'currency' ? formatCurrency(count) :
    format === 'percent' ? `${count.toFixed(1)}%` :
    formatNumber(count);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel rounded-2xl p-4 sm:p-5 border border-[#7C3AED]/10 hover:border-[#7C3AED]/25 transition-all duration-300 group"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-[#A1A1C2] text-xs font-medium">{label}</span>
        <div className="w-8 h-8 rounded-lg bg-[#7C3AED]/10 flex items-center justify-center group-hover:bg-[#7C3AED]/20 transition-colors">
          {icon}
        </div>
      </div>
      <p className="text-xl sm:text-2xl font-black text-white tracking-tight">
        {active ? <span>{prefix}{display}{suffix}</span> : <span className="opacity-30">{prefix}{format === 'currency' ? formatCurrency(0) : format === 'percent' ? '0.0%' : '0'}{suffix}</span>}
      </p>
    </motion.div>
  );
}

const defaultExport: React.FC = () => {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await campaignsApi.list({ limit: 100 });
        if (!mounted.current) return;
        setCampaigns(res.data?.data || []);
      } catch (err: any) {
        if (!mounted.current) return;
        setError(err?.response?.data?.error || 'فشل تحميل الحملات');
      } finally {
        if (mounted.current) setLoading(false);
      }
    };
    load();
    return () => { mounted.current = false; };
  }, []);

  const filtered = filter === 'all' ? campaigns : campaigns.filter((c: any) => c.status === filter);

  const kpiMetrics = [
    {
      icon: <BarChart3 className="w-4 h-4 text-[#7C3AED]" />,
      label: 'إجمالي الحملات',
      value: filtered.length,
      format: 'number' as const,
    },
    {
      icon: <DollarSign className="w-4 h-4 text-[#06B6D4]" />,
      label: 'إجمالي الميزانية',
      value: filtered.reduce((s: number, c: any) => s + (Number(c.budget) || 0), 0),
      format: 'currency' as const,
    },
    {
      icon: <Activity className="w-4 h-4 text-[#EC4899]" />,
      label: 'إجمالي الإنفاق',
      value: filtered.reduce((s: number, c: any) => s + (Number(c.spent) || 0), 0),
      format: 'currency' as const,
    },
    {
      icon: <TrendingUp className="w-4 h-4 text-[#10B981]" />,
      label: 'متوسط نسبة النقر',
      value: (() => {
        const totalImps = filtered.reduce((s: number, c: any) => s + (Number(c.impressions) || 0), 0);
        const totalClicks = filtered.reduce((s: number, c: any) => s + (Number(c.clicks) || 0), 0);
        return totalImps > 0 ? (totalClicks / totalImps) * 100 : 0;
      })(),
      format: 'percent' as const,
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] relative" dir="rtl">
        <ParticlesBackground count={40} interactive={false} />
        <div className="text-center relative z-10">
          <div className="relative w-16 h-16 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full bg-[#7C3AED]/20 animate-ping" />
            <div className="absolute inset-2 rounded-full bg-[#7C3AED]/30 animate-pulse" />
            <Loader2 className="w-16 h-16 text-[#7C3AED] animate-spin relative z-10" />
          </div>
          <p className="text-[#A1A1C2] text-sm font-medium">جاري تحميل الحملات...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] relative" dir="rtl">
        <ParticlesBackground count={40} interactive={false} />
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card-neon p-10 text-center max-w-sm relative z-10"
        >
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#F43F5E]/20 to-[#EC4899]/10 flex items-center justify-center mx-auto mb-5 border border-[#F43F5E]/20">
            <AlertCircle className="w-8 h-8 text-[#F43F5E]" />
          </div>
          <h3 className="text-lg font-bold text-[#F43F5E] mb-2">خطأ في التحميل</h3>
          <p className="text-[#A1A1C2] text-sm mb-6 leading-relaxed">{error}</p>
          <Button onClick={() => window.location.reload()} className="btn-gradient text-white font-bold px-8">
            إعادة المحاولة
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div dir="rtl" className="space-y-6 relative min-h-screen pb-12">
      <ParticlesBackground count={40} interactive={false} />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10"
      >
        <div>
          <h1 className="text-3xl sm:text-4xl font-black gradient-brand-text leading-tight">
            الحملات الإعلانية
          </h1>
          <p className="text-[#A1A1C2] text-sm mt-1.5">
            إدارة ومراقبة جميع حملاتك الإعلانية في مكان واحد
          </p>
        </div>
        <Button
          onClick={() => router.push('/ar/dashboard/campaigns/create')}
          className="btn-gradient text-white font-bold gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" /> حملة جديدة
        </Button>
      </motion.div>

      {/* KPI Stats */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 relative z-10"
      >
        {kpiMetrics.map((kpi) => (
          <KPICard key={kpi.label} {...kpi} active={!loading} />
        ))}
      </motion.div>

      {/* Filter Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="flex gap-2 flex-wrap relative z-10"
      >
        {filterTabs.map(({ key, label }) => {
          const count = key === 'all' ? campaigns.length : campaigns.filter((c: any) => c.status === key).length;
          return (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={cn(
                'px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center gap-1.5',
                filter === key
                  ? 'badge-glow text-white shadow-lg shadow-[#7C3AED]/20'
                  : 'glass-panel text-[#A1A1C2] hover:text-white hover:border-[#7C3AED]/30 border border-transparent'
              )}
            >
              {label}
              <span className={cn(
                'text-[11px] font-bold px-1.5 py-0.5 rounded-md',
                filter === key ? 'bg-white/10' : 'bg-[#7C3AED]/10 text-[#A1A1C2]'
              )}>
                {count}
              </span>
            </button>
          );
        })}
      </motion.div>

      {/* Content */}
      {campaigns.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="relative z-10"
        >
          <Card className="card-neon p-14 sm:p-20 text-center overflow-hidden">
            <motion.div
              className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[#7C3AED]/20 to-[#06B6D4]/10 flex items-center justify-center mx-auto mb-6 border border-[#7C3AED]/20 glow-purple"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Target className="w-12 h-12 text-[#7C3AED]" />
            </motion.div>
            <h3 className="text-2xl font-bold mb-2 text-white">لا توجد حملات إعلانية بعد</h3>
            <p className="text-[#A1A1C2] text-sm mb-8 max-w-md mx-auto leading-relaxed">
              الحملات من فيسبوك، جوجل، وتيك توك ستظهر هنا تلقائياً بعد الربط. ابدأ بإنشاء أول حملة الآن.
            </p>
            <Button
              onClick={() => router.push('/ar/dashboard/campaigns/create')}
              className="btn-gradient text-white font-bold gap-2 px-8 py-3 text-base"
            >
              <Plus className="w-5 h-5" /> إنشاء أول حملة
            </Button>
          </Card>
        </motion.div>
      ) : filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10"
        >
          <Card className="card-neon p-12 text-center">
            <PieChart className="w-12 h-12 text-[#A1A1C2] mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-bold mb-1 text-white">لا توجد نتائج</h3>
            <p className="text-[#A1A1C2] text-sm">لا توجد حملات مطابقة للفلتر المحدد</p>
          </Card>
        </motion.div>
      ) : (
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 relative z-10"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          <AnimatePresence mode="popLayout">
            {filtered.map((c: any) => {
              const platform = platformIcons[c.platform] || platformIcons.facebook;
              const pName = platformNames[c.platform] || c.platform;
              const st = statusConfig[c.status] || statusConfig.draft;
              const budget = Number(c.budget) || 0;
              const spent = Number(c.spent) || 0;
              const impressions = Number(c.impressions) || 0;
              const clicks = Number(c.clicks) || 0;
              const progress = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0;

              return (
                <motion.div
                  key={c.id}
                  variants={staggerItem}
                  layout
                  exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                >
                  <div
                    className="card-neon p-5 cursor-pointer group relative overflow-hidden"
                    onClick={() => router.push(`/ar/dashboard/campaigns/${c.id}`)}
                  >
                    {/* Platform color bar */}
                    <div className="absolute top-0 right-0 left-0 h-[3px] rounded-t-2xl overflow-hidden z-10">
                      <div className="h-full w-full transition-all duration-500 group-hover:h-[4px]" style={{ background: platform.color }} />
                    </div>
                    <div className="absolute top-0 right-0 left-0 h-[3px] rounded-t-2xl overflow-hidden opacity-30 blur-sm">
                      <div className="h-full w-full" style={{ background: platform.color }} />
                    </div>

                    {/* Hover glow */}
                    <div className="absolute -inset-1 bg-gradient-to-r from-[#7C3AED]/0 via-[#7C3AED]/5 to-[#06B6D4]/0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                    <div className="flex items-start justify-between mb-4 mt-1 relative">
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg"
                          style={{ background: `${platform.color}20` }}
                        >
                          {platform.icon}
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-bold truncate text-white transition-all duration-300 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-[#7C3AED] group-hover:to-[#06B6D4] text-sm">
                            {c.name}
                          </h3>
                          <span className="text-[11px] text-[#A1A1C2]">{pName}</span>
                        </div>
                      </div>
                      <span className={cn('px-2.5 py-0.5 rounded-full text-[11px] font-bold', st.badgeClass)}>
                        {st.label}
                      </span>
                    </div>

                    {/* Metric grid */}
                    <div className="grid grid-cols-2 gap-2.5 mb-3">
                      <div className="glass-panel rounded-xl p-2.5 group-hover:border-[#7C3AED]/20 transition-colors">
                        <div className="flex items-center gap-1 text-[#A1A1C2] text-[10px] mb-1">
                          <DollarSign className="w-3 h-3" /> الميزانية
                        </div>
                        <p className="font-bold text-sm text-white">{formatCurrency(budget)}</p>
                      </div>
                      <div className="glass-panel rounded-xl p-2.5 group-hover:border-[#7C3AED]/20 transition-colors">
                        <div className="flex items-center gap-1 text-[#A1A1C2] text-[10px] mb-1">
                          <TrendingUp className="w-3 h-3" /> الإنفاق
                        </div>
                        <p className="font-bold text-sm text-white">{formatCurrency(spent)}</p>
                      </div>
                      <div className="glass-panel rounded-xl p-2.5 group-hover:border-[#7C3AED]/20 transition-colors">
                        <div className="flex items-center gap-1 text-[#A1A1C2] text-[10px] mb-1">
                          <Eye className="w-3 h-3" /> الظهور
                        </div>
                        <p className="font-bold text-sm text-white">{formatNumber(impressions)}</p>
                      </div>
                      <div className="glass-panel rounded-xl p-2.5 group-hover:border-[#7C3AED]/20 transition-colors">
                        <div className="flex items-center gap-1 text-[#A1A1C2] text-[10px] mb-1">
                          <MousePointerClick className="w-3 h-3" /> النقرات
                        </div>
                        <p className="font-bold text-sm text-white">{formatNumber(clicks)}</p>
                      </div>
                    </div>

                    {/* Budget progress bar */}
                    <div className="relative h-1.5 rounded-full bg-[#1E1B3A] overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                        className={cn(
                          'h-full rounded-full transition-all duration-500',
                          progress > 90 ? 'bg-gradient-to-l from-[#F43F5E] to-[#EC4899]' :
                          progress > 60 ? 'bg-gradient-to-l from-[#F59E0B] to-[#FBBF24]' :
                          'bg-gradient-to-l from-[#7C3AED] to-[#06B6D4]'
                        )}
                      />
                      <div className={cn(
                        'absolute inset-0 rounded-full opacity-20 blur-sm',
                        progress > 90 ? 'bg-[#F43F5E]' :
                        progress > 60 ? 'bg-[#F59E0B]' :
                        'bg-[#7C3AED]'
                      )} />
                    </div>
                    <div className="flex items-center justify-between mt-1.5">
                      <span className="text-[10px] text-[#A1A1C2]">استهلاك الميزانية</span>
                      <span className={cn(
                        'text-[10px] font-bold',
                        progress > 90 ? 'text-[#F43F5E]' :
                        progress > 60 ? 'text-[#F59E0B]' :
                        'text-[#7C3AED]'
                      )}>
                        {progress.toFixed(0)}%
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
};

export default defaultExport;
