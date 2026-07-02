import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn, formatCurrency, formatNumber } from '@/lib/utils';
import { Plus, Filter, Facebook, Instagram, Music, Ghost, MoreHorizontal, Eye, Play, Pause, Search, Loader2, AlertCircle } from 'lucide-react';
import { campaignsApi } from '@/services/api-modules';

const platformIcons: Record<string, React.ReactNode> = {
  facebook: <Facebook className="w-4 h-4" style={{ color: '#1877F2' }} />,
  instagram: <Instagram className="w-4 h-4" style={{ color: '#E4405F' }} />,
  tiktok: <Music className="w-4 h-4" />,
  snapchat: <Ghost className="w-4 h-4" style={{ color: '#FFFC00' }} />,
};

const platformNames: Record<string, string> = {
  facebook: 'فيسبوك', instagram: 'إنستجرام', tiktok: 'تيك توك', snapchat: 'سناب شات',
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
    <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-[#7C3AED]" /></div>
  );

  if (error) return (
    <div className="flex items-center justify-center py-20"><AlertCircle className="w-8 h-8 text-red-400" /><p className="text-red-400 mr-2">{error}</p></div>
  );

  return (
    <div className="space-y-6 animate-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">الحملات الإعلانية</h1>
      </div>

      {campaigns.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-[#6B6899] text-lg">لا توجد حملات إعلانية بعد</p>
          <p className="text-[#A1A1C2] text-sm mt-2">الحملات من فيسبوك ستظهر هنا تلقائياً</p>
        </Card>
      ) : (
        <>
          <div className="flex gap-2 flex-wrap">
            {['all', 'active', 'paused', 'completed', 'draft'].map((f) => (
              <button key={f} onClick={() => setFilter(f)} className={cn('px-4 py-2 rounded-lg text-sm transition-colors', filter === f ? 'bg-[#7C3AED] text-white' : 'bg-[#2D2B55]/50 text-[#A1A1C2] hover:bg-[#2D2B55]/80')}>
                {f === 'all' ? 'الكل' : f === 'active' ? 'نشط' : f === 'paused' ? 'متوقف' : f === 'completed' ? 'مكتمل' : 'مسودة'}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((c: any) => (
              <Card key={c.id} className="p-5 hover:shadow-lg dark:shadow-black/30 transition-shadow cursor-pointer" onClick={() => router.push(`/dashboard/campaigns/${c.id}`)}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2">
                    {platformIcons[c.platform] || null}
                    <h3 className="font-semibold truncate">{c.name}</h3>
                  </div>
                  <Badge variant={c.status === 'active' ? 'success' : c.status === 'paused' ? 'warning' : 'secondary'}>{c.status}</Badge>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><span className="text-[#A1A1C2]">الميزانية:</span><p className="font-semibold">{formatCurrency(c.budget || 0)}</p></div>
                  <div><span className="text-[#A1A1C2]">الإنفاق:</span><p className="font-semibold">{formatCurrency(c.spent || 0)}</p></div>
                  <div><span className="text-[#A1A1C2]">مرات الظهور:</span><p className="font-semibold">{formatNumber(c.impressions || 0)}</p></div>
                  <div><span className="text-[#A1A1C2]">النقرات:</span><p className="font-semibold">{formatNumber(c.clicks || 0)}</p></div>
                  <div><span className="text-[#A1A1C2]">التحويلات:</span><p className="font-semibold">{formatNumber(c.conversions || 0)}</p></div>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
