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
import { DashboardShell } from '@/components/layout/DashboardShell';
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
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    if (!token) {
      window.location.href = '/ar/auth/login';
      return;
    }
    loadReports();
  }, []);

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
    <DashboardShell>
      <div className="space-y-6" dir="rtl">
        <div>
          <h1 className="text-2xl font-black gradient-brand-text">أبحاث السوق</h1>
          <p className="text-muted-foreground text-sm mt-1">تقارير ذكية مدعومة بـ AI عن الأسواق والمنتجات</p>
        </div>

        {error && (
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-3 flex items-center gap-2 text-sm text-amber-700 dark:text-amber-300">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        <Card className="border-0 shadow-md bg-gradient-to-br from-electric/5 via-transparent to-purple/5">
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
                <select
                  className="w-full h-10 px-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
                  value={form.country}
                  onChange={(e) => setForm({ ...form, country: e.target.value })}
                >
                  <option>السعودية</option>
                  <option>الإمارات</option>
                  <option>مصر</option>
                  <option>الكويت</option>
                  <option>قطر</option>
                  <option>البحرين</option>
                  <option>عمان</option>
                  <option>الأردن</option>
                </select>
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
                    <Badge variant="info">{r.country}</Badge>
                  </div>
                  <h3 className="font-bold text-sm mb-1">{r.productName}</h3>
                  {r.productCategory && (
                    <p className="text-xs text-muted-foreground mb-2">{r.productCategory}</p>
                  )}
                  <p className="text-xs text-muted-foreground line-clamp-3 mb-3">
                    {r.reportSummary || 'تقرير ذكي شامل عن السوق...'}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
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
              <pre className="text-sm whitespace-pre-wrap text-gray-700 dark:text-gray-300">
                {JSON.stringify(selectedReport.reportData, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardShell>
  );
}
