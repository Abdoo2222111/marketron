'use client';

import React, { useEffect, useState } from 'react';
import {
  AlertCircle, CheckCircle2, Loader2, Save,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function ProfileTab() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [currency, setCurrency] = useState('SAR');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const currencies = [
    { value: 'SAR', label: 'ريال سعودي (SAR)', flag: '🇸🇦' },
    { value: 'AED', label: 'درهم إماراتي (AED)', flag: '🇦🇪' },
    { value: 'EGP', label: 'جنيه مصري (EGP)', flag: '🇪🇬' },
    { value: 'USD', label: 'دولار أمريكي (USD)', flag: '🇺🇸' },
    { value: 'EUR', label: 'يورو (EUR)', flag: '🇪🇺' },
    { value: 'GBP', label: 'جنيه إسترليني (GBP)', flag: '🇬🇧' },
    { value: 'QAR', label: 'ريال قطري (QAR)', flag: '🇶🇦' },
    { value: 'KWD', label: 'دينار كويتي (KWD)', flag: '🇰🇼' },
    { value: 'BHD', label: 'دينار بحريني (BHD)', flag: '🇧🇭' },
    { value: 'OMR', label: 'ريال عماني (OMR)', flag: '🇴🇲' },
    { value: 'TRY', label: 'ليرة تركية (TRY)', flag: '🇹🇷' },
  ];

  useEffect(() => {
    (async () => {
      try {
        const api = (await import('@/services/api')).default;
        const res = await api.get('/auth/me');
        const u = res.data?.data || res.data;
        setName(u.name || '');
        setPhone(u.phone || '');
        setCompany(u.company || '');
        setEmail(u.email || '');
        setCurrency(u.currency || 'SAR');
      } catch { /* ignore */ }
      finally { setLoading(false); }
    })();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const api = (await import('@/services/api')).default;
      const res = await api.put('/auth/me', { name, phone, company, currency });
      if (res.data?.success || res.status === 200) {
        setSuccess('تم حفظ التغييرات بنجاح');
        setTimeout(() => setSuccess(null), 4000);
      }
    } catch (err: any) {
      setError(err?.response?.data?.error || 'فشل حفظ التغييرات');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center py-8"><Loader2 className="w-8 h-8 animate-spin text-electric" /></div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">المعلومات الشخصية</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="bg-[#F43F5E]/10 border border-[#F43F5E]/20 rounded-xl p-3 flex items-center gap-2 text-sm text-[#F43F5E]">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />{error}
          </div>
        )}
        {success && (
          <div className="bg-[#10B981]/10 border border-[#10B981]/20 rounded-xl p-3 flex items-center gap-2 text-sm text-[#10B981]">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />{success}
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>الاسم</Label>
            <Input placeholder="اسمك الكامل" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div>
            <Label>البريد الإلكتروني</Label>
            <Input placeholder="email@example.com" value={email} disabled />
          </div>
          <div>
            <Label>رقم الجوال</Label>
            <Input placeholder="+966 5X XXX XXXX" value={phone} onChange={e => setPhone(e.target.value)} />
          </div>
          <div>
            <Label>اسم الشركة</Label>
            <Input placeholder="اسم شركتك" value={company} onChange={e => setCompany(e.target.value)} />
          </div>
          <div>
            <Label>العملة</Label>
            <select
              value={currency}
              onChange={e => setCurrency(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-[#7C3AED]/20 bg-[#0B0A1A] text-[#F5F3FF] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30"
            >
              {currencies.map(c => (
                <option key={c.value} value={c.value}>{c.flag} {c.label}</option>
              ))}
            </select>
          </div>
        </div>
        <Button className="gradient-brand text-white border-0" onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="w-4 h-4 ml-1 animate-spin" /> : <Save className="w-4 h-4 ml-1" />}
          حفظ التغييرات
        </Button>
      </CardContent>
    </Card>
  );
}
