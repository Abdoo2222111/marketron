'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowRight, Edit3, Copy, Play, Pause, Trash2, Eye, MousePointerClick, Target, DollarSign,
  TrendingUp, Lightbulb, Users, Loader2, AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DashboardShell } from '@/components/layout/DashboardShell';
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
    const token = localStorage.getItem('auth_token');
    if (!token) { window.location.href = '/ar/auth/login'; return; }
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
    <DashboardShell>
      <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-electric" /></div>
    </DashboardShell>
  );

  if (error) return (
    <DashboardShell>
      <div className="flex items-center gap-2 text-red-500 p-4"><AlertCircle className="w-5 h-5" />{error}</div>
    </DashboardShell>
  );

  if (!campaign) return (
    <DashboardShell>
      <div className="text-center py-20 text-muted-foreground">الحملة غير موجودة</div>
    </DashboardShell>
  );

  const metrics = [
    { label: 'مرات الظهور', value: campaign.impressions || 0, format: 'number' as const },
    { label: 'النقرات', value: campaign.clicks || 0, format: 'number' as const },
    { label: 'CTR', value: campaign.ctr || 0, format: 'percentage' as const, highlight: true },
    { label: 'CPC', value: campaign.cpc || 0, format: 'currency' as const },
    { label: 'الإنفاق', value: campaign.spend || 0, format: 'currency' as const },
    { label: 'التحويلات', value: campaign.conversions || 0, format: 'number' as const },
    { label: 'ROAS', value: campaign.roas || 0, format: 'percentage' as const, special: true },
  ];

  const funnelData = [
    { name: 'مرات الظهور', value: campaign.impressions || 0 },
    { name: 'النقرات', value: campaign.clicks || 0 },
    { name: 'التحويلات', value: campaign.conversions || 0 },
  ];

  const dailyPerformance = Array.from({ length: 30 }, (_, i) => ({
    date: `${i + 1}/1`,
    impressions: Math.floor((campaign.impressions || 10000) / 30 * (0.5 + Math.random())),
    clicks: Math.floor((campaign.clicks || 1000) / 30 * (0.5 + Math.random())),
    conversions: Math.floor((campaign.conversions || 50) / 30 * (0.5 + Math.random())),
    spent: (campaign.spend || 1000) / 30 * (0.5 + Math.random()),
  }));

  return (
    <DashboardShell>
      <div className="space-y-6" dir="rtl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href={`/${locale}/dashboard/campaigns`} className="h-9 w-9 rounded-lg border flex items-center justify-center hover:bg-accent transition-colors">
              <ArrowRight size={16} />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold">{campaign.name}</h1>
                <Badge variant={campaign.status === 'active' ? 'success' : campaign.status === 'paused' ? 'warning' : 'secondary'}>
                  {campaign.status === 'active' ? 'نشط' : campaign.status === 'paused' ? 'متوقف' : campaign.status === 'draft' ? 'مسودة' : 'مكتمل'}
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
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

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {metrics.map((m) => (
            <Card key={m.label} className={`p-4 ${m.special ? 'bg-gradient-to-br from-purple-600/10 to-blue-500/10' : ''}`}>
              <p className="text-xs text-muted-foreground">{m.label}</p>
              <p className={`text-lg font-bold ${m.highlight ? 'text-emerald-500' : ''}`}>
                {m.format === 'currency' ? formatCurrency(m.value) : m.format === 'percentage' ? `${(m.value || 0).toFixed(2)}${m.special ? 'x' : '%'}` : formatNumber(m.value)}
              </p>
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

        {/* Ads */}
        {campaign._count?.ads > 0 && (
          <Card>
            <CardHeader><CardTitle className="text-lg">الإعلانات داخل الحملة ({campaign._count.ads})</CardTitle></CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">تفاصيل الإعلانات متاحة قريباً</p>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2"><Lightbulb className="h-5 w-5 text-yellow-500" />توصيات ذكية</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-start gap-3 p-3 rounded-lg bg-muted/50"><div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0 text-xs font-bold">1</div><p className="text-sm">حلل أداء الحملة وابحث عن فرص التحسين</p></li>
                <li className="flex items-start gap-3 p-3 rounded-lg bg-muted/50"><div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0 text-xs font-bold">2</div><p className="text-sm">جرب استهداف جماهير مشابهة (Lookalike)</p></li>
                <li className="flex items-start gap-3 p-3 rounded-lg bg-muted/50"><div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0 text-xs font-bold">3</div><p className="text-sm">حسّن الإعلانات ذات الأداء المنخفض</p></li>
              </ul>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Users className="h-5 w-5" />الجمهور المستهدف</CardTitle></CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground space-y-2">
                {campaign.targetCountry && <p>الدولة: {campaign.targetCountry}</p>}
                {campaign.targetAgeMin && <p>الفئة العمرية: {campaign.targetAgeMin}-{campaign.targetAgeMax || '+'}</p>}
                {campaign.targetGender && <p>الجنس: {campaign.targetGender === 'male' ? 'ذكر' : campaign.targetGender === 'female' ? 'أنثى' : campaign.targetGender}</p>}
                {!campaign.targetCountry && !campaign.targetAgeMin && <p className="text-gray-400">لم يتم تحديد الجمهور المستهدف</p>}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardShell>
  );
}
