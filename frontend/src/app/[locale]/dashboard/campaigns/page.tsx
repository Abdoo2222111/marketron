'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Plus, Search, Filter, Grid3X3, List, Loader2, AlertCircle, Megaphone,
  Calendar, DollarSign, TrendingUp, Pause, Play, Trash2, Eye,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

import { campaignsApi, type Campaign } from '@/services/api-modules';
import { formatCurrency, formatNumber, cn } from '@/lib/utils';

const platformLabels: Record<string, string> = {
  facebook: 'فيسبوك', instagram: 'انستجرام', tiktok: 'تيك توك',
  snapchat: 'سناب شات', whatsapp: 'واتساب', messenger: 'ماسنجر',
  twitter: 'تويتر', telegram: 'تيليجرام',
};
const statusLabels: Record<string, string> = {
  active: 'نشط', paused: 'متوقف', draft_pending_approval: 'بانتظار الموافقة', approved: 'موافق عليه', published: 'منشور', draft: 'مسودة', completed: 'مكتمل',
};
const platformColors: Record<string, string> = {
  facebook: 'from-blue-500 to-blue-600', instagram: 'from-pink-500 via-rose-500 to-orange-500',
  tiktok: 'from-gray-900 to-gray-700', snapchat: 'from-yellow-400 to-yellow-500',
  whatsapp: 'from-emerald-500 to-green-600', messenger: 'from-blue-400 to-blue-600',
  twitter: 'from-sky-400 to-sky-600', telegram: 'from-cyan-400 to-cyan-600',
};

export default function CampaignsPage({ params: { locale } }: { params: { locale: string } }) {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadCampaigns();
  }, []);

  const loadCampaigns = async () => {
    try { setLoading(true); setError(null); const res = await campaignsApi.list({}); setCampaigns(res.data?.data || res.data?.campaigns || []); }
    catch (err: any) { setError(err?.response?.data?.error || 'فشل تحميل الحملات'); }
    finally { setLoading(false); }
  };

  const handleStatusChange = async (id: string, status: Campaign['status']) => {
    try {
      await campaignsApi.update(id, { status });
      setCampaigns(prev => prev.map(c => c.id === id ? { ...c, status } : c));
    } catch { setError('فشل تغيير الحالة'); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه الحملة؟')) return;
    try { await campaignsApi.delete(id); setCampaigns(prev => prev.filter(c => c.id !== id)); }
    catch { setError('فشل حذف الحملة'); }
  };

  const filtered = campaigns.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

  const statusBadgeVariant = (s: string): string => {
    if (s === 'active' || s === 'published') return 'success';
    if (s === 'paused') return 'warning';
    if (s === 'draft_pending_approval' || s === 'approved') return 'secondary';
    if (s === 'completed') return 'default';
    return 'secondary';
  };

  return (
      <div className="space-y-6" dir="rtl">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black gradient-brand-text">الحملات الإعلانية</h1>
            <p className="text-[#A1A1C2] text-sm mt-1">إدارة وإنشاء جميع حملاتك الإعلانية</p>
          </div>
          <div className="flex gap-2">
            <Link href={`/${locale}/dashboard/campaigns/create`}><Button><Plus size={16} className="ml-1" />حملة جديدة</Button></Link>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-[#F43F5E]/10 border border-[#F43F5E]/20 text-[#F43F5E] text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />{error}
          </div>
        )}

        {/* Summary Bar */}
        {!loading && filtered.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-[#1E1B3A]/60 backdrop-blur-sm rounded-xl px-4 py-3 border border-[#7C3AED]/10">
              <p className="text-[10px] text-[#A1A1C2] uppercase tracking-wider">إجمالي</p>
              <p className="text-lg font-bold mt-0.5">{filtered.length}</p>
            </div>
            <div className="bg-[#1E1B3A]/60 backdrop-blur-sm rounded-xl px-4 py-3 border border-[#7C3AED]/10">
              <p className="text-[10px] text-[#A1A1C2] uppercase tracking-wider">نشطة</p>
              <p className="text-lg font-bold mt-0.5 text-[#10B981] flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
                {filtered.filter(c => c.status === 'active' || c.status === 'published').length}
              </p>
            </div>
            <div className="bg-[#1E1B3A]/60 backdrop-blur-sm rounded-xl px-4 py-3 border border-[#7C3AED]/10">
              <p className="text-[10px] text-[#A1A1C2] uppercase tracking-wider">الميزانية</p>
              <p className="text-lg font-bold mt-0.5">{formatCurrency(filtered.reduce((s, c) => s + (c.budget || 0), 0))}</p>
            </div>
            <div className="bg-[#1E1B3A]/60 backdrop-blur-sm rounded-xl px-4 py-3 border border-[#7C3AED]/10">
              <p className="text-[10px] text-[#A1A1C2] uppercase tracking-wider">الإنفاق</p>
              <p className="text-lg font-bold mt-0.5">{formatCurrency(filtered.reduce((s, c) => s + (c.spent || 0), 0))}</p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A1A1C2]" />
            <Input placeholder="ابحث عن حملة..." value={search} onChange={e => setSearch(e.target.value)} className="pr-10" />
          </div>
          <Button variant="outline" size="icon"><Filter className="w-4 h-4" /></Button>
          <div className="flex rounded-lg border border-[#7C3AED]/20 p-0.5">
            <button onClick={() => setView('grid')} className={`p-2 rounded-md transition-colors ${view === 'grid' ? 'bg-[#7C3AED]/20 text-[#7C3AED]' : 'text-[#A1A1C2] hover:text-[#F5F3FF]'}`}>
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button onClick={() => setView('list')} className={`p-2 rounded-md transition-colors ${view === 'list' ? 'bg-[#7C3AED]/20 text-[#7C3AED]' : 'text-[#A1A1C2] hover:text-[#F5F3FF]'}`}>
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

          {loading ? (
            <div className="space-y-3">
              {[1,2,3,4,5].map(i => <div key={i} className="flex items-center justify-between p-4 rounded-lg bg-[#2D2B55]/30 animate-pulse"><div className="space-y-2"><div className="h-4 w-32 bg-[#2D2B55] rounded" /><div className="h-3 w-20 bg-[#2D2B55] rounded" /></div><div className="flex gap-4"><div className="h-8 w-16 bg-[#2D2B55] rounded" /><div className="h-8 w-16 bg-[#2D2B55] rounded" /></div></div>)}
            </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 rounded-2xl gradient-primary mx-auto mb-4 flex items-center justify-center shadow-[0_0_40px_rgba(124,58,237,0.3)]">
              <Megaphone className="w-10 h-10 text-white" />
            </div>
            <p className="text-xl font-bold mb-1">{search ? 'لا توجد نتائج' : 'لا توجد حملات بعد'}</p>
            <p className="text-[#A1A1C2] text-sm mb-6">{search ? 'حاول تغيير كلمة البحث' : 'ابدأ بإنشاء حملتك الأولى'}</p>
            {!search && <Link href={`/${locale}/dashboard/campaigns/create`}><Button><Plus size={16} className="ml-1" />إنشاء حملة</Button></Link>}
          </div>
        ) : view === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((campaign, i) => (
              <Link key={campaign.id} href={`/${locale}/dashboard/campaigns/${campaign.id}`} className="block">
                <Card className="group h-full">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full bg-gradient-to-br ${platformColors[campaign.platform] || 'from-gray-400 to-gray-500'}`} />
                        <div>
                          <p className="font-bold text-sm leading-tight">{campaign.name}</p>
                          <p className="text-xs text-[#A1A1C2]">{platformLabels[campaign.platform] || campaign.platform}</p>
                        </div>
                      </div>
                      <Badge variant={statusBadgeVariant(campaign.status) as any} className="text-[10px] py-0">
                        {statusLabels[campaign.status] || campaign.status}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-3 mb-4">
                      <div><p className="text-[10px] text-[#A1A1C2]">الميزانية</p><p className="text-sm font-bold">{formatCurrency(campaign.budget || 0)}</p></div>
                      <div><p className="text-[10px] text-[#A1A1C2]">الإنفاق</p><p className="text-sm font-bold">{formatCurrency(campaign.spent || 0)}</p></div>
                      <div><p className="text-[10px] text-[#A1A1C2]">CTR</p><p className="text-sm font-bold">{(campaign.ctr || 0).toFixed(1)}%</p></div>
                    </div>
                    {campaign.description && <p className="text-xs text-[#A1A1C2]/80 line-clamp-2 mb-3">{campaign.description}</p>}
                    <div className="flex items-center justify-between pt-3 border-t border-[#7C3AED]/10">
                      <div className="flex items-center gap-1 text-[10px] text-[#A1A1C2]">
                        <Calendar className="w-3 h-3" />{new Date(campaign.createdAt).toLocaleDateString('ar')}
                      </div>
                      <div className="flex gap-1" onClick={e => e.preventDefault()}>
                        {(campaign.status === 'draft_pending_approval' || campaign.status === 'draft') && (
                          <Button variant="ghost" size="icon" className="w-7 h-7 text-[#06B6D4]" onClick={() => handleStatusChange(campaign.id, 'approved')} title="اعتماد"><Eye className="w-3.5 h-3.5" /></Button>
                        )}
                        {campaign.status === 'active' ? (
                          <Button variant="ghost" size="icon" className="w-7 h-7 text-[#F59E0B]" onClick={() => handleStatusChange(campaign.id, 'paused')} title="إيقاف"><Pause className="w-3.5 h-3.5" /></Button>
                        ) : campaign.status === 'paused' ? (
                          <Button variant="ghost" size="icon" className="w-7 h-7 text-[#10B981]" onClick={() => handleStatusChange(campaign.id, 'active')} title="تشغيل"><Play className="w-3.5 h-3.5" /></Button>
                        ) : null}
                        <Button variant="ghost" size="icon" className="w-7 h-7 text-[#F43F5E]" onClick={() => handleDelete(campaign.id)} title="حذف"><Trash2 className="w-3.5 h-3.5" /></Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#7C3AED]/10">
                      <th className="text-right p-4 text-xs text-[#A1A1C2] font-medium">الحملة</th>
                      <th className="text-right p-4 text-xs text-[#A1A1C2] font-medium">المنصة</th>
                      <th className="text-right p-4 text-xs text-[#A1A1C2] font-medium">الميزانية</th>
                      <th className="text-right p-4 text-xs text-[#A1A1C2] font-medium">الإنفاق</th>
                      <th className="text-right p-4 text-xs text-[#A1A1C2] font-medium">CTR</th>
                      <th className="text-right p-4 text-xs text-[#A1A1C2] font-medium">الحالة</th>
                      <th className="text-right p-4 text-xs text-[#A1A1C2] font-medium">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(campaign => (
                      <tr key={campaign.id} className="border-b border-[#7C3AED]/5 hover:bg-[#7C3AED]/5 transition-colors">
                        <td className="p-4">
                          <Link href={`/${locale}/dashboard/campaigns/${campaign.id}`} className="text-sm font-medium hover:text-[#7C3AED]">{campaign.name}</Link>
                        </td>
                        <td className="p-4 text-sm text-[#A1A1C2]">{platformLabels[campaign.platform] || campaign.platform}</td>
                        <td className="p-4 text-sm">{formatCurrency(campaign.budget || 0)}</td>
                        <td className="p-4 text-sm">{formatCurrency(campaign.spent || 0)}</td>
                        <td className="p-4 text-sm">{(campaign.ctr || 0).toFixed(1)}%</td>
                        <td className="p-4">
                          <Badge variant={statusBadgeVariant(campaign.status) as any} className="text-[10px]">{statusLabels[campaign.status] || campaign.status}</Badge>
                        </td>
                        <td className="p-4">
                          <div className="flex gap-1">
                            {(campaign.status === 'draft_pending_approval' || campaign.status === 'draft') && (
                              <Button variant="ghost" size="icon" className="w-7 h-7 text-[#06B6D4]" onClick={() => handleStatusChange(campaign.id, 'approved')}><Eye className="w-3.5 h-3.5" /></Button>
                            )}
                            {campaign.status === 'active' ? (
                              <Button variant="ghost" size="icon" className="w-7 h-7 text-[#F59E0B]" onClick={() => handleStatusChange(campaign.id, 'paused')}><Pause className="w-3.5 h-3.5" /></Button>
                            ) : campaign.status === 'paused' ? (
                              <Button variant="ghost" size="icon" className="w-7 h-7 text-[#10B981]" onClick={() => handleStatusChange(campaign.id, 'active')}><Play className="w-3.5 h-3.5" /></Button>
                            ) : null}
                            <Button variant="ghost" size="icon" className="w-7 h-7 text-[#F43F5E]" onClick={() => handleDelete(campaign.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
  );
}
