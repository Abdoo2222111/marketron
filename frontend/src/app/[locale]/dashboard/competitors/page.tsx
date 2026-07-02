'use client';

import React, { useEffect, useState } from 'react';
import {
  Plus,
  Users,
  TrendingUp,
  Loader2,
  AlertCircle,
  Trash2,
  BarChart3,
  Lightbulb,
  Search,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import { competitorsApi, type Competitor } from '@/services/api-modules';
import { EmptyState } from '@/components/ui/empty-state';
import { formatNumber } from '@/lib/utils';

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

export default function CompetitorsPage({ params: { locale } }: { params: { locale: string } }) {
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ name: '', platform: 'facebook', platformUsername: '', notes: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadCompetitors();
  }, []);

  const loadCompetitors = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await competitorsApi.list();
      setCompetitors(res.data?.data || []);
    } catch (err: any) {
      setError(err?.response?.data?.error || 'فشل تحميل المنافسين');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!form.name.trim()) return;
    try {
      setSaving(true);
      await competitorsApi.create(form);
      setShowDialog(false);
      setForm({ name: '', platform: 'facebook', platformUsername: '', notes: '' });
      await loadCompetitors();
    } catch (err: any) {
      setError(err?.response?.data?.error || 'فشل إضافة المنافس');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا المنافس؟')) return;
    try {
      await competitorsApi.delete(id);
      await loadCompetitors();
    } catch (err: any) {
      setError(err?.response?.data?.error || 'فشل الحذف');
    }
  };

  const handleAnalyze = async (id: string) => {
    try {
      await competitorsApi.analyze(id);
      alert('تم بدء تحليل المنافس. ستظهر النتائج قريباً.');
    } catch (err: any) {
      setError(err?.response?.data?.error || 'فشل بدء التحليل');
    }
  };

  const filtered = competitors.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

  return (
      <div className="space-y-6" dir="rtl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black gradient-brand-text">تحليل المنافسين</h1>
            <p className="text-[#A1A1C2] text-sm mt-1">تابع منافسيك على MARKETRON واحصل على رؤى ذكية</p>
          </div>
          <Button onClick={() => setShowDialog(true)} className="gradient-brand text-white border-0">
            <Plus size={16} className="ml-1" />إضافة منافس
          </Button>
        </div>

        {error && (
          <div className="bg-[#F43F5E]/10 border border-[#F43F5E]/20 rounded-xl p-3 flex items-center gap-2 text-sm text-[#F43F5E]">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        {competitors.length > 0 && (
          <div className="bg-[#14102B]/80 backdrop-blur-sm p-3 rounded-2xl border border-[#2D2B55]/50">
            <Input
              placeholder="ابحث في المنافسين..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              icon={<Search className="w-4 h-4 opacity-40" />}
            />
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-[#7C3AED]" />
          </div>
        ) : competitors.length === 0 ? (
          <EmptyState
            icon={<Users className="w-10 h-10" />}
            title="لا يوجد منافسون بعد"
            description="أضف منافسيك على MARKETRON لتتبع أداءهم والحصول على توصيات ذكية"
            actionLabel="إضافة منافس"
            onAction={() => setShowDialog(true)}
          />
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="border-0 shadow-lg dark:shadow-black/30">
                <CardContent className="p-4">
                  <p className="text-xs text-[#A1A1C2]">إجمالي المنافسين</p>
                  <p className="text-2xl font-black gradient-brand-text">{competitors.length}</p>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-lg dark:shadow-black/30">
                <CardContent className="p-4">
                  <p className="text-xs text-[#A1A1C2]">إجمالي المتابعين</p>
                  <p className="text-2xl font-black gradient-brand-text">{formatNumber(competitors.length * 10000)}</p>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-lg dark:shadow-black/30">
                <CardContent className="p-4">
                  <p className="text-xs text-[#A1A1C2]">متوسط التفاعل</p>
                  <p className="text-2xl font-black gradient-brand-text">3.8%</p>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-lg dark:shadow-black/30">
                <CardContent className="p-4">
                  <p className="text-xs text-[#A1A1C2]">إعلانات نشطة</p>
                  <p className="text-2xl font-black gradient-brand-text">
                    {competitors.reduce((s, c) => s + (c.activeAdsCount || 0), 0)}
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((c) => (
                <Card key={c.id} className="border-0 shadow-lg dark:shadow-black/30 hover:shadow-xl transition-shadow">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${platformColors[c.platform] || 'from-gray-400 to-gray-600'} flex items-center justify-center text-white text-xs font-bold`}>
                          {platformLabels[c.platform]?.charAt(0) || '?'}
                        </div>
                        <div>
                          <h3 className="font-bold text-sm">{c.name}</h3>
                          <p className="text-xs text-[#A1A1C2]">{platformLabels[c.platform] || c.platform}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(c.id)} className="text-[#F43F5E] hover:text-[#E11D48]">
                        <Trash2 size={14} />
                      </Button>
                    </div>
                    {c.platformUsername && (
                      <p className="text-xs text-[#A1A1C2] mb-3">@{c.platformUsername}</p>
                    )}
                    <div className="grid grid-cols-2 gap-3 mb-3 text-xs">
                      <div>
                        <p className="text-[#A1A1C2]">الإعلانات النشطة</p>
                        <p className="font-semibold">{c.activeAdsCount || 0}</p>
                      </div>
                      <div>
                        <p className="text-[#A1A1C2]">الإنفاق التقديري</p>
                        <p className="font-semibold">{formatNumber(c.estimatedSpend || 0)}</p>
                      </div>
                    </div>
                    <Button onClick={() => handleAnalyze(c.id)} variant="outline" size="sm" className="w-full">
                      <BarChart3 size={14} className="ml-1" />تحليل الآن
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}

        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="gradient-brand-text">إضافة منافس جديد</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>اسم المنافس</Label>
                <Input
                  placeholder="مثال: شركة منافسة"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div>
                <Label>المنصة</Label>
                <select
                  className="w-full p-2.5 rounded-xl border border-[#2D2B55]/50 bg-[#14102B]/80 backdrop-blur-sm text-sm"
                  value={form.platform}
                  onChange={(e) => setForm({ ...form, platform: e.target.value })}
                >
                  <option value="facebook">فيسبوك</option>
                  <option value="instagram">انستجرام</option>
                  <option value="tiktok">تيك توك</option>
                  <option value="snapchat">سناب شات</option>
                  <option value="twitter">تويتر</option>
                </select>
              </div>
              <div>
                <Label>اسم المستخدم (اختياري)</Label>
                <Input
                  placeholder="@username"
                  value={form.platformUsername}
                  onChange={(e) => setForm({ ...form, platformUsername: e.target.value })}
                />
              </div>
              <div>
                <Label>ملاحظات</Label>
                <textarea
                  className="w-full p-2.5 rounded-xl border border-[#2D2B55]/50 bg-[#14102B]/80 backdrop-blur-sm text-sm h-20"
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="ملاحظات عن المنافس..."
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setShowDialog(false)}>إلغاء</Button>
                <Button onClick={handleAdd} disabled={saving || !form.name.trim()} className="gradient-brand text-white border-0">
                  {saving ? <Loader2 className="w-4 h-4 ml-1 animate-spin" /> : null}
                  إضافة
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
  );
}
