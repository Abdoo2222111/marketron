'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowRight, Edit3, Play, Pause, Trash2, Eye, MousePointerClick, Target, DollarSign,
  TrendingUp, Lightbulb, Users, Loader2, AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import PerformanceChart from '@/components/charts/PerformanceChart';
import ConversionFunnel from '@/components/charts/ConversionFunnel';
import { formatCurrency, formatNumber, formatDate, getPlatformColor } from '@/lib/utils';
import { campaignsApi, type Campaign } from '@/services/api-modules';

const platformLabels: Record<string, string> = {
  facebook: 'فيسبوك', instagram: 'انستجرام', tiktok: 'تيك توك', snapchat: 'سناب شات',
};

export default function CampaignDetailPage({ params }: { params: { locale: string; id: string } }) {
  const { locale, id } = params;
  const [campaign, setCampaign] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadCampaign();
  }, [id]);

  const loadCampaign = async () => {
    try {
      setLoading(true);
      const res = await campaignsApi.get(id);
      setCampaign(res.data?.data || res.data);
    } catch (err: any) {
      setError(err?.response?.data?.error || 'فشل تحميل الحملة');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (action: string) => {
    try {
      if (action === 'pause') await campaignsApi.pause(id);
      else if (action === 'activate') await campaignsApi.activate(id);
      await loadCampaign();
    } catch {}
  };

  if (loading) return (
    <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-electric" /></div>
  );

  if (error) return (
    <div className="flex items-center gap-2 text-[#F43F5E] bg-[#F43F5E]/10 rounded-xl p-4"><AlertCircle className="w-5 h-5" />{error}</div>
  );

  if (!campaign) return (
    <div className="text-center py-20 text-[#A1A1C2]">الحملة غير موجودة</div>
  );

  const metrics = [
    { label: 'مرات الظهور', value: campaign.impressions || 0, format: 'number' as const },
    { label: 'النقرات', value: campaign.clicks || 0, format: 'number' as const },
    { label: 'CTR', value: campaign.ctr || 0, format: 'percentage' as const, highlight: true },
    { label: 'CPC', value: campaign.cpc || 0, format: 'currency' as const },
    { label: 'الإنفاق', value: campaign.spent || campaign.spend || 0, format: 'currency' as const },
    { label: 'التحويلات', value: campaign.conversions || 0, format: 'number' as const },
  ];

  const funnelData = [
    { name: 'مرات الظهور', value: campaign.impressions || 0 },
    { name: 'النقرات', value: campaign.clicks || 0 },
    { name: 'التحويلات', value: campaign.conversions || 0 },
  ];

  const dailyPerformance = Array.from({ length: 30 }, (_, i) => ({
    date: `${i + 1}/1`,
    impressions: 0,
    clicks: 0,
    conversions: 0,
    spent: 0,
  }));

  return (
    <div className="space-y-6" dir="rtl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href={`/${locale}/dashboard/campaigns`} className="h-9 w-9 rounded-lg border border-[#2D2B55] flex items-center justify-center hover:bg-[#2D2B55]/50 transition-colors">
              <ArrowRight size={16} />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold">{campaign.name}</h1>
                <Badge variant={campaign.status === 'active' ? 'success' : campaign.status === 'paused' ? 'warning' : 'secondary'}>
                  {campaign.status === 'active' ? 'نشط' : campaign.status === 'paused' ? 'متوقف' : campaign.status === 'draft' ? 'مسودة' : 'مكتمل'}
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-sm text-[#A1A1C2] mt-1">
                <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: getPlatformColor(campaign.platform) }} />
                <span>{platformLabels[campaign.platform] || campaign.platform}</span>
                <span>·</span>
                <span>{campaign.objective}</span>
                {campaign.startDate && <><span>·</span><span>من {formatDate(campaign.startDate)}</span></>}
                {campaign.endDate && <><span>إلى {formatDate(campaign.endDate)}</span></>}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            {campaign.status === 'active' ? (
              <Button variant="outline" size="sm" onClick={() => handleAction('pause')}><Pause size={14} />إيقاف</Button>
            ) : campaign.status === 'paused' ? (
              <Button variant="outline" size="sm" onClick={() => handleAction('activate')}><Play size={14} />تشغيل</Button>
            ) : null}
            <Button variant="outline" size="sm"><Edit3 size={14} />تعديل</Button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {metrics.map((m) => (
            <Card key={m.label} className="bg-[#14102B]/80 backdrop-blur-sm border border-[#2D2B55]/50">
              <CardContent className="p-4">
                <p className="text-xs text-[#A1A1C2]">{m.label}</p>
                <p className={`text-lg font-bold ${m.highlight ? 'text-emerald-500' : 'text-white'}`}>
                  {m.format === 'currency' ? formatCurrency(m.value) : m.format === 'percentage' ? `${(m.value || 0).toFixed(2)}%` : formatNumber(m.value)}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PerformanceChart data={dailyPerformance} title="الأداء اليومي" height={300} metrics={[
            { key: 'impressions', label: 'مرات الظهور', color: '#7C3AED' },
            { key: 'clicks', label: 'النقرات', color: '#3B82F6' },
          ]} />
          <ConversionFunnel data={funnelData} title="قمع التحويل" height={300} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-[#14102B]/80 backdrop-blur-sm border border-[#2D2B55]/50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2"><Lightbulb className="h-5 w-5 text-yellow-500" />توصيات ذكية</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-start gap-3 p-3 rounded-lg bg-[#2D2B55]/30"><div className="h-6 w-6 rounded-full bg-[#7C3AED]/20 flex items-center justify-center text-[#7C3AED] shrink-0 text-xs font-bold">1</div><p className="text-sm text-[#C4B5FD]">حلل أداء الحملة وابحث عن فرص التحسين</p></li>
                <li className="flex items-start gap-3 p-3 rounded-lg bg-[#2D2B55]/30"><div className="h-6 w-6 rounded-full bg-[#7C3AED]/20 flex items-center justify-center text-[#7C3AED] shrink-0 text-xs font-bold">2</div><p className="text-sm text-[#C4B5FD]">جرب استهداف جماهير مشابهة (Lookalike)</p></li>
                <li className="flex items-start gap-3 p-3 rounded-lg bg-[#2D2B55]/30"><div className="h-6 w-6 rounded-full bg-[#7C3AED]/20 flex items-center justify-center text-[#7C3AED] shrink-0 text-xs font-bold">3</div><p className="text-sm text-[#C4B5FD]">حسّن الإعلانات ذات الأداء المنخفض</p></li>
              </ul>
            </CardContent>
          </Card>
          <Card className="bg-[#14102B]/80 backdrop-blur-sm border border-[#2D2B55]/50">
            <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Users className="h-5 w-5" />الجمهور المستهدف</CardTitle></CardHeader>
            <CardContent>
              <div className="text-sm text-[#A1A1C2] space-y-2">
                {campaign.targetCountry && <p>الدولة: {campaign.targetCountry}</p>}
                {campaign.targetAgeMin && <p>الفئة العمرية: {campaign.targetAgeMin}-{campaign.targetAgeMax || '+'}</p>}
                {campaign.targetGender && <p>الجنس: {campaign.targetGender === 'male' ? 'ذكر' : campaign.targetGender === 'female' ? 'أنثى' : campaign.targetGender}</p>}
                {!campaign.targetCountry && !campaign.targetAgeMin && <p className="text-[#6B6899]">لم يتم تحديد الجمهور المستهدف</p>}
              </div>
            </CardContent>
          </Card>
        </div>
    </div>
  );
}