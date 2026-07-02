'use client';

import React, { useEffect, useState } from 'react';
import {
  Search,
  Loader2,
  AlertCircle,
  Sparkles,
  Globe,
  TrendingUp,
  Users,
  BarChart3,
  Save,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { marketApi, type MarketReport } from '@/services/api-modules';
import { EmptyState } from '@/components/ui/empty-state';

export default function MarketResearchPage({ params: { locale } }: { params: { locale: string } }) {
  const [reports, setReports] = useState<MarketReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ productName: '', country: 'السعودية', productCategory: '' });
  const [selectedReport, setSelectedReport] = useState<MarketReport | null>(null);

  useEffect(() => {
    loadReports();
  }, [locale]);

  const loadReports = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await marketApi.list();
      setReports(res.data?.data || []);
    } catch (err: any) {
      setError(err?.response?.data?.error || 'فشل تحميل التقارير');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!form.productName.trim()) return;
    try {
      setGenerating(true);
      setError(null);
      await marketApi.create(form);
      setForm({ productName: '', country: 'السعودية', productCategory: '' });
      await loadReports();
    } catch (err: any) {
      setError(err?.response?.data?.error || 'فشل إنشاء التقرير');
    } finally {
      setGenerating(false);
    }
  };

  return (
      <div className="space-y-6" dir="rtl">
        <div>
          <h1 className="text-2xl font-black gradient-brand-text">أبحاث السوق</h1>
          <p className="text-muted-foreground text-sm mt-1">تقارير ذكية مدعومة بـ AI عن الأسواق والمنتجات</p>
        </div>

        {error && (
          <div className="bg-[#F43F5E]/10 border border-[#F43F5E]/20 text-[#F43F5E] rounded-xl p-3 flex items-center gap-2 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        <Card className="border-0 shadow-lg dark:shadow-black/30 bg-gradient-to-br from-electric/5 via-transparent to-purple/5">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-electric" />
              إنشاء تقرير جديد
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <Label>اسم المنتج</Label>
                <Input
                  placeholder="مثال: تطبيق توصيل"
                  value={form.productName}
                  onChange={(e) => setForm({ ...form, productName: e.target.value })}
                />
              </div>
              <div>
                <Label>الدولة</Label>
                <Select
                  value={form.country}
                  onValueChange={(value) => setForm({ ...form, country: value })}
                >
                  <SelectTrigger className="w-full h-10">
                    <SelectValue placeholder="اختر الدولة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="السعودية">السعودية</SelectItem>
                    <SelectItem value="الإمارات">الإمارات</SelectItem>
                    <SelectItem value="مصر">مصر</SelectItem>
                    <SelectItem value="الكويت">الكويت</SelectItem>
                    <SelectItem value="قطر">قطر</SelectItem>
                    <SelectItem value="البحرين">البحرين</SelectItem>
                    <SelectItem value="عمان">عمان</SelectItem>
                    <SelectItem value="الأردن">الأردن</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>الفئة (اختياري)</Label>
                <Input
                  placeholder="مثال: تقنية"
                  value={form.productCategory}
                  onChange={(e) => setForm({ ...form, productCategory: e.target.value })}
                />
              </div>
            </div>
            <Button
              onClick={handleGenerate}
              disabled={generating || !form.productName.trim()}
              className="mt-4 gradient-brand text-white border-0"
            >
              {generating ? <Loader2 className="w-4 h-4 ml-1 animate-spin" /> : <Sparkles className="w-4 h-4 ml-1" />}
              {generating ? 'جاري الإنشاء...' : 'إنشاء تقرير ذكي'}
            </Button>
          </CardContent>
        </Card>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-electric" />
          </div>
        ) : reports.length === 0 ? (
          <EmptyState
            icon={<BarChart3 className="w-10 h-10" />}
            title="لا توجد تقارير بعد"
            description="أنشئ أول تقرير ذكي عن السوق لتحليل الفرص والتهديدات"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reports.map((r) => (
              <Card
                key={r.id}
                className="border-0 shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => setSelectedReport(r)}
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl gradient-brand flex items-center justify-center">
                      <Globe className="w-5 h-5 text-white" />
                    </div>
                    <Badge variant="secondary">{r.country}</Badge>
                  </div>
                  <h3 className="font-bold text-sm mb-1">{r.productName}</h3>
                  {r.productCategory && (
                    <p className="text-xs text-muted-foreground mb-2">{r.productCategory}</p>
                  )}
                  <p className="text-xs text-muted-foreground line-clamp-3 mb-3">
                    {r.reportSummary || 'تقرير ذكي شامل عن السوق...'}
                  </p>
                  <p className="text-[10px] text-[#A1A1C2]">
                    {new Date(r.createdAt).toLocaleDateString('ar')}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {selectedReport && (
          <Card className="border-0 shadow-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg gradient-brand-text">{selectedReport.productName}</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setSelectedReport(null)}>إغلاق</Button>
              </div>
            </CardHeader>
            <CardContent>
              {selectedReport.reportData && typeof selectedReport.reportData === 'object' ? (
                <div className="space-y-2">
                  {Object.entries(selectedReport.reportData as Record<string, unknown>).map(([key, value]) => (
                    <div key={key} className="border-b border-gray-100 dark:border-gray-800 pb-2 last:border-0">
                      <p className="text-xs font-medium text-muted-foreground mb-0.5">{key}</p>
                      <p className="text-sm text-gray-800 dark:text-gray-200">
                        {typeof value === 'object' && value !== null
                          ? JSON.stringify(value, null, 2)
                          : String(value)}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {selectedReport.reportData ? String(selectedReport.reportData) : 'لا توجد بيانات متاحة'}
                </p>
              )}
            </CardContent>
          </Card>
        )}
      </div>
  );
}
