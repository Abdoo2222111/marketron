import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/tabs';
import { formatCurrency, formatNumber, formatDate, cn } from '@/lib/utils';
import { ArrowLeft, Facebook, Instagram, Music, Ghost, Edit3, Pause, Play, Trash2, DollarSign, Eye, MousePointerClick, Target, TrendingUp, CalendarDays, Users, Loader2, AlertCircle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { campaignsApi } from '@/services/api-modules';

const platformIcons: Record<string, React.ReactNode> = {
  facebook: <Facebook className="w-5 h-5" style={{ color: '#1877F2' }} />,
  instagram: <Instagram className="w-5 h-5" style={{ color: '#E4405F' }} />,
  tiktok: <Music className="w-5 h-5" />,
  snapchat: <Ghost className="w-5 h-5" style={{ color: '#FFFC00' }} />,
};

export const CampaignDetailsPage: React.FC = () => {
  const router = useRouter();
  const { id } = useParams();
  const [campaign, setCampaign] = useState<any>(null);
  const [insights, setInsights] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      try {
        setLoading(true);
        const [campRes, insightRes] = await Promise.allSettled([
          campaignsApi.get(id as string),
          campaignsApi.getInsights(id as string),
        ]);
        if (campRes.status === 'fulfilled') setCampaign(campRes.value.data?.data || campRes.value.data);
        if (insightRes.status === 'fulfilled') setInsights(insightRes.value.data?.data);
      } catch {
        setError('فشل تحميل بيانات الحملة');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleToggle = async (action: 'pause' | 'activate') => {
    if (!id) return;
    try {
      await (action === 'pause' ? campaignsApi.pause(id as string) : campaignsApi.activate(id as string));
      setCampaign((prev: any) => ({ ...prev, status: action === 'pause' ? 'paused' : 'active' }));
    } catch {
      setError('فشل تغيير حالة الحملة');
    }
  };

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-[#7C3AED]" /></div>;
  if (error) return <div className="flex items-center justify-center py-20"><AlertCircle className="w-8 h-8 text-red-400 ml-2" /><span className="text-red-400">{error}</span></div>;
  if (!campaign) return <div className="flex items-center justify-center py-20"><p className="text-[#A1A1C2]">الحملة غير موجودة</p></div>;

  const budget = campaign.budget || 0;
  const spent = insights?.spent || campaign.spent || 0;
  const impressions = insights?.impressions || campaign.impressions || 0;
  const clicks = insights?.clicks || campaign.clicks || 0;
  const conversions = insights?.conversions || campaign.conversions || 0;
  const ctr = insights?.ctr || campaign.ctr || 0;
  const cpc = insights?.cpc || campaign.cpc || 0;

  return (
    <div className="space-y-6 animate-in">
      <div className="flex items-start justify-between">
        <div>
          <button onClick={() => router.push('/dashboard/campaigns')} className="flex items-center gap-2 text-sm text-[#A1A1C2] hover:text-[#7C3AED] mb-2">
            <ArrowLeft className="w-4 h-4" /> رجوع للحملات
          </button>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white">{campaign.name || 'حملة'}</h1>
            <Badge variant={campaign.status === 'active' ? 'success' : campaign.status === 'paused' ? 'warning' : 'secondary'}>
              {campaign.status === 'active' ? 'نشط' : campaign.status === 'paused' ? 'متوقف' : campaign.status}
            </Badge>
          </div>
          <p className="text-[#A1A1C2] text-sm mt-1 flex items-center gap-2">
            {platformIcons[campaign.platform] || null} {campaign.platform || '—'}
            {campaign.objective ? ` • ${campaign.objective}` : ''}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {campaign.status === 'active' ? (
            <Button variant="outline" size="sm" onClick={() => handleToggle('pause')}><Pause className="w-4 h-4 ml-1" />إيقاف</Button>
          ) : (
            <Button variant="outline" size="sm" onClick={() => handleToggle('activate')}><Play className="w-4 h-4 ml-1" />تفعيل</Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {[
          { label: 'الميزانية', value: formatCurrency(budget), icon: DollarSign, color: 'text-[#7C3AED]' },
          { label: 'الإنفاق', value: formatCurrency(spent), icon: DollarSign, color: 'text-amber-600' },
          { label: 'مرات الظهور', value: formatNumber(impressions), icon: Eye, color: 'text-[#7C3AED]' },
          { label: 'النقرات', value: formatNumber(clicks), icon: MousePointerClick, color: 'text-[#7C3AED]' },
          { label: 'التحويلات', value: formatNumber(conversions), icon: Target, color: 'text-[#7C3AED]' },
          { label: 'ROAS', value: insights?.roas ? `${insights.roas}x` : ctr > 0 ? `${(ctr / 100).toFixed(1)}x` : '—', icon: TrendingUp, color: 'text-green-600' },
        ].map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Card key={kpi.label} className="p-4 text-center">
              <Icon className={`w-5 h-5 mx-auto mb-2 ${kpi.color}`} />
              <p className="text-lg font-bold text-white">{kpi.value}</p>
              <p className="text-xs text-[#A1A1C2]">{kpi.label}</p>
            </Card>
          );
        })}
      </div>

      {budget > 0 && (
        <Card className="p-5">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-white">استهلاك الميزانية</h3>
            <span className="text-sm text-[#A1A1C2]">{formatCurrency(spent)} / {formatCurrency(budget)}</span>
          </div>
          <Progress value={Math.min((spent / budget) * 100, 100)} />
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-5">
          <h3 className="font-semibold text-white mb-4">أداء الحملة</h3>
          <div className="flex items-center justify-center h-[300px] text-[#6B6899]">
            <p>بيانات الأداء متاحة من Facebook Insights</p>
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="font-semibold text-white mb-4">معلومات الحملة</h3>
          <div className="space-y-3">
            {[
              { label: 'المنصة', value: campaign.platform || '—' },
              { label: 'الهدف', value: campaign.objective || '—' },
              { label: 'تاريخ البدء', value: campaign.startDate ? formatDate(campaign.startDate) : '—' },
              { label: 'الحالة', value: campaign.status || '—' },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3 text-sm">
                <span className="text-[#A1A1C2] min-w-[80px]">{item.label}:</span>
                <span className="text-white font-medium">{item.value}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
