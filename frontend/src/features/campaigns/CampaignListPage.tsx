'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn, formatCurrency, formatNumber } from '@/lib/utils';
import {
  Plus, Filter, Facebook, Instagram, Music, Ghost, MoreHorizontal, Eye, Play, Pause, Search, Loader2, AlertCircle, TrendingUp, DollarSign, MousePointer2, Target
} from 'lucide-react';
import { campaignsApi } from '@/services/api-modules';
import { ParticlesBackground } from '@/components/ui/ParticlesBackground';

const platformIcons: Record<string, { icon: React.ReactNode; color: string }> = {
  facebook: { icon: <Facebook className="w-4 h-4" />, color: '#1877F2' },
  instagram: { icon: <Instagram className="w-4 h-4" />, color: '#E4405F' },
  tiktok: { icon: <Music className="w-4 h-4" />, color: '#25F4EE' },
  snapchat: { icon: <Ghost className="w-4 h-4" />, color: '#FFFC00' },
};

const platformNames: Record<string, string> = {
  facebook: 'فيسبوك', instagram: 'إنستجرام', tiktok: 'تيك توك', snapchat: 'سناب شات',
};

const statusConfig: Record<string, { label: string; variant: string; dot: string }> = {
  active: { label: 'نشط', variant: 'success', dot: 'bg-emerald-400' },
  paused: { label: 'متوقف', variant: 'warning', dot: 'bg-amber-400' },
  completed: { label: 'مكتمل', variant: 'secondary', dot: 'bg-blue-400' },
  draft: { label: 'مسودة', variant: 'secondary', dot: 'bg-gray-400' },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export const CampaignListPage: React.FC = () => {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await campaignsApi.list({ limit: 100 });
        setCampaigns(res.data?.data || []);
      } catch (err: any) {
        setError(err?.response?.data?.error || 'فشل تحميل الحملات');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = filter === 'all' ? campaigns : campaigns.filter((c: any) => c.status === filter);

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="text-center">
        <Loader2 className="w-10 h-10 animate-spin text-[#7C3AED] mx-auto mb-4" />
        <p className="text-[#A1A1C2] text-sm">جاري تحميل الحملات...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="flex items-center justify-center py-20">
      <div className="card-neon p-8 text-center max-w-sm">
        <AlertCircle className="w-12 h-12 text-[#F43F5E] mx-auto mb-4" />
        <p className="text-[#F43F5E] font-bold mb-2">خطأ في التحميل</p>
        <p className="text-[#A1A1C2] text-sm mb-4">{error}</p>
        <Button onClick={() => window.location.reload()} className="btn-gradient">إعادة المحاولة</Button>
      </div>
    </div>
  );

  return (
    <div dir="rtl" className="space-y-6 relative">
      <ParticlesBackground count={30} interactive={false} />

      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black gradient-brand-text">الحملات الإعلانية</h1>
          <p className="text-[#A1A1C2] text-sm mt-1">إدارة ومراقبة جميع حملاتك الإعلانية في مكان واحد</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => router.push('/ar/dashboard/campaigns/create')} className="btn-gradient text-white font-bold">
            <Plus className="w-4 h-4 ml-1" /> حملة جديدة
          </Button>
        </div>
      </motion.div>

      {campaigns.length === 0 ? (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
          <Card className="card-neon p-12 sm:p-16 text-center">
            <motion.div
              className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#7C3AED]/20 to-[#06B6D4]/10 flex items-center justify-center mx-auto mb-6 border border-[#7C3AED]/20 glow-purple"
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Target className="w-10 h-10 text-[#7C3AED]" />
            </motion.div>
            <h3 className="text-xl font-bold mb-2">لا توجد حملات إعلانية بعد</h3>
            <p className="text-[#A1A1C2] text-sm mb-6">الحملات من فيسبوك، جوجل، وتيك توك ستظهر هنا تلقائياً بعد الربط</p>
            <Button onClick={() => router.push('/ar/dashboard/campaigns/create')} className="btn-gradient text-white font-bold">
              <Plus className="w-4 h-4 ml-1" /> إنشاء أول حملة
            </Button>
          </Card>
        </motion.div>
      ) : (
        <>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex gap-2 flex-wrap">
            {['all', 'active', 'paused', 'completed', 'draft'].map((f) => (
              <button key={f} onClick={() => setFilter(f)}
                className={cn(
                  'px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200',
                  filter === f
                    ? 'badge-glow text-white'
                    : 'card-neon text-[#A1A1C2] hover:border-[#7C3AED]/30'
                )}>
                {f === 'all' ? 'الكل' : f === 'active' ? 'نشط' : f === 'paused' ? 'متوقف' : f === 'completed' ? 'مكتمل' : 'مسودة'}
                {f !== 'all' && (
                  <span className="mr-1.5 text-xs opacity-60">({campaigns.filter(c => c.status === f).length})</span>
                )}
              </button>
            ))}
          </motion.div>

          <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" variants={staggerContainer} initial="hidden" animate="visible">
            {filtered.map((c: any) => (
              <motion.div key={c.id} variants={staggerItem}>
                <div
                  className="card-neon p-5 cursor-pointer group relative"
                  onClick={() => router.push(`/ar/dashboard/campaigns/${c.id}`)}
                >
                  {/* Platform color bar */}
                  <div className="absolute top-0 right-0 left-0 h-1 rounded-t-2xl overflow-hidden">
                    <div className="h-full w-full" style={{ background: platformIcons[c.platform]?.color || '#7C3AED' }} />
                  </div>

                  <div className="flex items-start justify-between mb-4 mt-1">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${platformIcons[c.platform]?.color || '#7C3AED'}20` }}>
                        {platformIcons[c.platform]?.icon || null}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold truncate group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-[#7C3AED] group-hover:to-[#06B6D4] transition-all duration-300">{c.name}</h3>
                        <span className="text-xs text-[#A1A1C2]">{platformNames[c.platform] || c.platform}</span>
                      </div>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${c.status === 'active' ? 'badge-emerald text-emerald-400' : c.status === 'paused' ? 'badge-amber' : 'badge-cyan'}`}>
                      {statusConfig[c.status]?.label || c.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="glass-panel rounded-lg p-2.5">
                      <div className="flex items-center gap-1 text-[#A1A1C2] text-[10px] mb-1">
                        <DollarSign className="w-3 h-3" /> الميزانية
                      </div>
                      <p className="font-bold text-white">{formatCurrency(c.budget || 0)}</p>
                    </div>
                    <div className="glass-panel rounded-lg p-2.5">
                      <div className="flex items-center gap-1 text-[#A1A1C2] text-[10px] mb-1">
                        <TrendingUp className="w-3 h-3" /> الإنفاق
                      </div>
                      <p className="font-bold text-white">{formatCurrency(c.spent || 0)}</p>
                    </div>
                    <div className="glass-panel rounded-lg p-2.5">
                      <div className="flex items-center gap-1 text-[#A1A1C2] text-[10px] mb-1">
                        <Eye className="w-3 h-3" /> الظهور
                      </div>
                      <p className="font-bold text-white">{formatNumber(c.impressions || 0)}</p>
                    </div>
                    <div className="glass-panel rounded-lg p-2.5">
                      <div className="flex items-center gap-1 text-[#A1A1C2] text-[10px] mb-1">
                        <MousePointer2 className="w-3 h-3" /> النقرات
                      </div>
                      <p className="font-bold text-white">{formatNumber(c.clicks || 0)}</p>
                    </div>
                  </div>

                  {/* Status indicator */}
                  <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-[#7C3AED]/5">
                    <span className={`w-1.5 h-1.5 rounded-full ${statusConfig[c.status]?.dot || 'bg-gray-400'}`} />
                    <span className="text-[10px] text-[#A1A1C2]">{statusConfig[c.status]?.label || c.status}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </>
      )}
    </div>
  );
};