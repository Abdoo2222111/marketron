'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Plus,
  Search,
  Filter,
  Grid3X3,
  List,
  Loader2,
  AlertCircle,
  Megaphone,
  Calendar,
  DollarSign,
  TrendingUp,
  Pause,
  Play,
  Trash2,
  Eye,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { campaignsApi, type Campaign } from '@/services/api-modules';
import { formatCurrency, formatNumber, cn } from '@/lib/utils';

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

const platformColors: Record<string, string> = {
  facebook: 'from-blue-500 to-blue-600',
  instagram: 'from-pink-500 via-rose-500 to-orange-500',
  tiktok: 'from-gray-900 to-gray-700',
  snapchat: 'from-yellow-400 to-yellow-500',
  whatsapp: 'from-emerald-500 to-green-600',
  messenger: 'from-blue-500 to-blue-700',
  twitter: 'from-sky-400 to-sky-600',
  telegram: 'from-cyan-400 to-cyan-600',
};

export default function CampaignsPage({ params: { locale } }: { params: { locale: string } }) {
  const [view, setView] = useState<'grid' | 'table'>('grid');
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    if (!token) {
      window.location.href = '/ar/auth/login';
      return;
    }
    loadCampaigns();
  }, [statusFilter]);

  const loadCampaigns = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await campaignsApi.list({
        limit: 50,
        status: statusFilter !== 'all' ? statusFilter : undefined,
      });
      const data = res.data?.data || res.data?.campaigns || [];
      setCampaigns(data);
    } catch (err: any) {
      setError(err?.response?.data?.error || 'فشل تحميل الحملات');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    try {
      if (currentStatus === 'active') {
        await campaignsApi.pause(id);
      } else {
        await campaignsApi.activate(id);
      }
      await loadCampaigns();
    } catch (err: any) {
      setError(err?.response?.data?.error || 'فشل تحديث الحملة');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه الحملة؟')) return;
    try {
      await campaignsApi.delete(id);
      await loadCampaigns();
    } catch (err: any) {
      setError(err?.response?.data?.error || 'فشل حذف الحملة');
    }
  };

  const filteredCampaigns = campaigns.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardShell>
      <div className="space-y-6" dir="rtl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black gradient-brand-text">الحملات الإعلانية</h1>
            <p className="text-muted-foreground text-sm mt-1">إدارة ومتابعة حملاتك على جميع المنصات</p>
          </div>
          <Link href={`/${locale}/dashboard/campaigns/create`}>
            <Button className="gradient-brand text-white border-0">
              <Plus size={16} className="ml-1" />
              حملة جديدة
            </Button>
          </Link>
        </div>

        {error && (
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-3 flex items-center gap-2 text-sm text-amber-700 dark:text-amber-300">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center bg-white dark:bg-gray-900 p-3 rounded-2xl border border-gray-200 dark:border-gray-800">
          <div className="flex-1">
            <Input
              placeholder="ابحث في الحملات..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              icon={<Search className="w-4 h-4 opacity-40" />}
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {['all', 'active', 'paused', 'draft', 'completed'].map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={cn(
                  'text-xs px-3 py-1.5 rounded-full border transition-all',
                  statusFilter === s
                    ? 'bg-gradient-to-r from-electric to-cyan text-white border-transparent font-medium'
                    : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 hover:border-electric'
                )}
              >
                {s === 'all' ? 'الكل' : statusLabels[s] || s}
              </button>
            ))}
          </div>
          <div className="flex gap-1 border border-gray-200 dark:border-gray-700 rounded-lg p-1">
            <button
              onClick={() => setView('grid')}
              className={cn('p-1.5 rounded', view === 'grid' ? 'bg-gradient-to-r from-electric to-cyan text-white' : 'text-gray-500')}
            >
              <Grid3X3 size={16} />
            </button>
            <button
              onClick={() => setView('table')}
              className={cn('p-1.5 rounded', view === 'table' ? 'bg-gradient-to-r from-electric to-cyan text-white' : 'text-gray-500')}
            >
              <List size={16} />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-electric" />
          </div>
        ) : filteredCampaigns.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800">
            <div className="w-20 h-20 rounded-2xl gradient-brand mx-auto mb-4 flex items-center justify-center">
              <Megaphone className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-2">
              {search ? 'لا توجد نتائج' : 'لا توجد حملات بعد'}
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              {search ? 'جرب البحث بكلمات مختلفة' : 'ابدأ رحلتك في التسويق الرقمي بإنشاء أول حملة إعلانية على MARKETRON'}
            </p>
            {!search && (
              <Link href={`/${locale}/dashboard/campaigns/create`}>
                <Button className="gradient-brand text-white border-0">
                  <Plus size={16} className="ml-1" />
                  إنشاء أول حملة
                </Button>
              </Link>
            )}
          </div>
        ) : view === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCampaigns.map((c) => (
              <div
                key={c.id}
                className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={cn('w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center text-white text-xs font-bold', platformColors[c.platform] || 'from-gray-400 to-gray-600')}>
                      {platformLabels[c.platform]?.charAt(0) || '?'}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm">{c.name}</h3>
                      <p className="text-xs text-muted-foreground">{platformLabels[c.platform] || c.platform}</p>
                    </div>
                  </div>
                  <Badge variant={c.status === 'active' ? 'success' : c.status === 'paused' ? 'warning' : 'secondary'} className="text-xs">
                    {statusLabels[c.status] || c.status}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-4 text-xs">
                  <div>
                    <p className="text-muted-foreground">الميزانية</p>
                    <p className="font-semibold">{formatCurrency(c.budget || 0)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">المنفق</p>
                    <p className="font-semibold text-electric">{formatCurrency(c.spent || 0)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">الظهور</p>
                    <p className="font-semibold">{formatNumber(c.impressions || 0)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">النقرات</p>
                    <p className="font-semibold">{formatNumber(c.clicks || 0)}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link href={`/${locale}/dashboard/campaigns/${c.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      <Eye size={14} className="ml-1" />
                      عرض
                    </Button>
                  </Link>
                  <Button variant="ghost" size="sm" onClick={() => handleToggleStatus(c.id, c.status)}>
                    {c.status === 'active' ? <Pause size={14} /> : <Play size={14} />}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(c.id)} className="text-red-500 hover:text-red-600">
                    <Trash2 size={14} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-800/50">
                <tr>
                  <th className="text-right p-3 font-semibold">الحملة</th>
                  <th className="text-right p-3 font-semibold">المنصة</th>
                  <th className="text-right p-3 font-semibold">الحالة</th>
                  <th className="text-right p-3 font-semibold">الميزانية</th>
                  <th className="text-right p-3 font-semibold">المنفق</th>
                  <th className="text-right p-3 font-semibold">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filteredCampaigns.map((c) => (
                  <tr key={c.id} className="border-t border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/30">
                    <td className="p-3 font-medium">{c.name}</td>
                    <td className="p-3">{platformLabels[c.platform] || c.platform}</td>
                    <td className="p-3">
                      <Badge variant={c.status === 'active' ? 'success' : c.status === 'paused' ? 'warning' : 'secondary'}>
                        {statusLabels[c.status] || c.status}
                      </Badge>
                    </td>
                    <td className="p-3">{formatCurrency(c.budget || 0)}</td>
                    <td className="p-3 text-electric font-semibold">{formatCurrency(c.spent || 0)}</td>
                    <td className="p-3">
                      <div className="flex gap-1">
                        <Link href={`/${locale}/dashboard/campaigns/${c.id}`}>
                          <Button variant="ghost" size="sm">
                            <Eye size={14} />
                          </Button>
                        </Link>
                        <Button variant="ghost" size="sm" onClick={() => handleToggleStatus(c.id, c.status)}>
                          {c.status === 'active' ? <Pause size={14} /> : <Play size={14} />}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
