'use client';

import React, { useEffect, useState } from 'react';
import { FileText, Sparkles, Loader2, AlertCircle, Plus, Trash2, Eye, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { contentApi, type ContentItem } from '@/services/api-modules';
import { EmptyState } from '@/components/ui/empty-state';

const typeLabels: Record<string, string> = {
  post: 'منشور',
  article: 'مقال',
  ad: 'إعلان',
  description: 'وصف منتج',
  video: 'فيديو',
  image: 'صورة',
};

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

export default function ContentPage({ params: { locale } }: { params: { locale: string } }) {
  const [contents, setContents] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ type: 'post', platform: 'facebook', title: '', description: '', fileUrl: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    load();
  }, [filter]);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await contentApi.list({ limit: 50, type: filter !== 'all' ? filter : undefined });
      setContents(res.data?.data || res.data?.contents || []);
    } catch (err: any) {
      setError(err?.response?.data?.error || 'فشل تحميل المحتوى');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!form.title.trim()) return;
    try {
      setSaving(true);
      await contentApi.create(form);
      setShowCreate(false);
      setForm({ type: 'post', platform: 'facebook', title: '', description: '', fileUrl: '' });
      await load();
    } catch (err: any) {
      setError(err?.response?.data?.error || 'فشل إنشاء المحتوى');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا المحتوى؟')) return;
    try {
      await contentApi.delete(id);
      await load();
    } catch (err: any) {
      setError(err?.response?.data?.error || 'فشل الحذف');
    }
  };

  return (
      <div className="space-y-6" dir="rtl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black gradient-brand-text">إدارة المحتوى</h1>
            <p className="text-[#A1A1C2] text-sm mt-1">إنشاء وإدارة المحتوى التسويقي</p>
          </div>
          <Button onClick={() => setShowCreate(true)} className="gradient-brand text-white border-0">
            <Plus size={16} className="ml-1" />محتوى جديد
          </Button>
        </div>

        {error && (
          <div className="bg-[#F43F5E]/10 border border-[#F43F5E]/20 rounded-xl p-3 flex items-center gap-2 text-sm text-[#F43F5E]">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        <div className="flex gap-2 flex-wrap">
          {['all', 'post', 'article', 'ad', 'description'].map(t => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                filter === t
                  ? 'bg-gradient-to-r from-electric to-cyan text-white border-transparent font-medium'
                  : 'bg-[#2D2B55]/30 border-[#2D2B55]/50 hover:border-[#7C3AED]/50'
              }`}
            >
              {t === 'all' ? 'الكل' : typeLabels[t] || t}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-[#7C3AED]" />
          </div>
        ) : contents.length === 0 ? (
          <EmptyState
            icon={<FileText className="w-10 h-10" />}
            title="لا يوجد محتوى بعد"
            description="أنشئ محتوى تسويقي احترافي بمساعدة الذكاء الاصطناعي"
            actionLabel="إنشاء محتوى"
            onAction={() => setShowCreate(true)}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {contents.map((c) => (
              <Card key={c.id} className="border-0 shadow-lg dark:shadow-black/30 hover:shadow-xl transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${platformColors[c.platform || ''] || 'from-gray-400 to-gray-600'} flex items-center justify-center text-white`}>
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="flex items-center gap-1">
                      <Badge variant="secondary" className="text-[10px]">
                        {typeLabels[c.type] || c.type}
                      </Badge>
                    </div>
                  </div>
                  <h3 className="font-bold text-sm mb-1 line-clamp-2">{c.title}</h3>
                  {c.description && (
                    <p className="text-xs text-[#A1A1C2] mb-3 line-clamp-2">{c.description}</p>
                  )}
                  <div className="flex items-center justify-between text-[10px] text-[#A1A1C2]">
                    <span>{platformLabels[c.platform || ''] || c.platform}</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(c.createdAt).toLocaleDateString('ar')}
                    </span>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Eye size={14} className="ml-1" />عرض
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(c.id)} className="text-[#F43F5E]">
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {showCreate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowCreate(false)}>
            <Card className="w-full max-w-lg mx-4" onClick={(e) => e.stopPropagation()}>
              <CardHeader>
                <CardTitle className="text-lg gradient-brand-text">إنشاء محتوى جديد</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>العنوان</Label>
                  <Input
                    placeholder="عنوان المحتوى"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>النوع</Label>
                    <select
                      className="w-full h-10 px-3 rounded-xl border border-[#2D2B55]/50 bg-[#14102B]/80 backdrop-blur-sm text-sm"
                      value={form.type}
                      onChange={(e) => setForm({ ...form, type: e.target.value })}
                    >
                      {Object.entries(typeLabels).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                    </select>
                  </div>
                  <div>
                    <Label>المنصة</Label>
                    <select
                      className="w-full h-10 px-3 rounded-xl border border-[#2D2B55]/50 bg-[#14102B]/80 backdrop-blur-sm text-sm"
                      value={form.platform}
                      onChange={(e) => setForm({ ...form, platform: e.target.value })}
                    >
                      {Object.entries(platformLabels).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <Label>الوصف</Label>
                  <textarea
                    className="w-full p-2.5 rounded-xl border border-[#2D2B55]/50 bg-[#14102B]/80 backdrop-blur-sm text-sm h-24"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="وصف المحتوى..."
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={() => setShowCreate(false)}>إلغاء</Button>
                  <Button onClick={handleCreate} disabled={saving || !form.title.trim()} className="gradient-brand text-white border-0">
                    {saving ? <Loader2 className="w-4 h-4 ml-1 animate-spin" /> : <Sparkles className="w-4 h-4 ml-1" />}
                    إنشاء
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
  );
}
