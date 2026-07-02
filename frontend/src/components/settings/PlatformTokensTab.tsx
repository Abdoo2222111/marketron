'use client';

import React, { useEffect, useState } from 'react';
import {
  AlertCircle, CheckCircle2, Loader2, Save, Search, Trash2, ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { platformTokensApi } from '@/services/api-modules';
import { cn } from '@/lib/utils';

const AD_PLATFORMS = [
  { id: 'facebook', label: 'فيسبوك / ميتا', icon: '📘', color: 'from-blue-600 to-blue-800', desc: 'Page Access Token لإدارة الإعلانات والصفحات', docUrl: 'https://developers.facebook.com/docs/facebook-login/access-tokens' },
  { id: 'instagram', label: 'إنستجرام', icon: '📸', color: 'from-pink-500 via-rose-500 to-orange-500', desc: 'Instagram Graph API Token للرسائل والإعلانات', docUrl: 'https://developers.facebook.com/docs/instagram-api' },
  { id: 'google', label: 'Google Ads', icon: '🔵', color: 'from-blue-400 to-blue-600', desc: 'Google Ads API Token (OAuth 2.0)', docUrl: 'https://developers.google.com/google-ads/api/docs/oauth/overview' },
  { id: 'tiktok', label: 'TikTok', icon: '🎵', color: 'from-gray-800 to-gray-900', desc: 'TikTok Business API Access Token', docUrl: 'https://developers.tiktok.com/' },
  { id: 'snapchat', label: 'Snapchat', icon: '👻', color: 'from-yellow-300 to-yellow-500', desc: 'Snapchat Ads API Access Token', docUrl: 'https://developers.snap.com/api/advertising' },
  { id: 'twitter', label: 'Twitter / X', icon: '🐦', color: 'from-sky-400 to-sky-600', desc: 'X Ads API Token', docUrl: 'https://developer.x.com/' },
  { id: 'pinterest', label: 'Pinterest', icon: '📌', color: 'from-red-500 to-red-700', desc: 'Pinterest Ads API Token', docUrl: 'https://developers.pinterest.com/' },
];

export function PlatformTokensTab() {
  const [tokens, setTokens] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [formData, setFormData] = useState<Record<string, { accessToken: string; label: string }>>({});
  const [validating, setValidating] = useState<string | null>(null);
  const [validationResult, setValidationResult] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => { loadTokens(); }, []);

  const loadTokens = async () => {
    try {
      setLoading(true);
      const res = await platformTokensApi.list();
      setTokens(res.data?.data || []);
    } catch { setError('فشل تحميل التوكنات'); }
    finally { setLoading(false); }
  };

  const handleSave = async (platform: string) => {
    const data = formData[platform];
    if (!data?.accessToken) return;
    setSaving(true);
    setError(null);
    try {
      await platformTokensApi.upsert(platform, data);
      setEditing(null);
      setSuccess('تم حفظ التوكن بنجاح');
      setTimeout(() => setSuccess(null), 3000);
      await loadTokens();
    } catch (err: any) {
      setError(err?.response?.data?.error || 'فشل حفظ التوكن');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا التوكن؟')) return;
    try {
      await platformTokensApi.delete(id);
      await loadTokens();
      setSuccess('تم حذف التوكن');
      setTimeout(() => setSuccess(null), 3000);
    } catch { setError('فشل حذف التوكن'); }
  };

  const handleValidate = async (platform: string) => {
    setValidating(platform);
    try {
      const res = await platformTokensApi.validate(platform);
      setValidationResult(prev => ({ ...prev, [platform]: res.data?.data }));
    } catch (err: any) {
      setValidationResult(prev => ({ ...prev, [platform]: { valid: false, error: err?.response?.data?.error || 'فشل التحقق' } }));
    } finally { setValidating(null); }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold">توكنات منصات الإعلانات</h2>
        <p className="text-sm text-[#A1A1C2]">قم بإضافة توكنات API لمنصات الإعلانات المختلفة لتتمكن من إدارة حملاتك مباشرة من MARKETRON</p>
      </div>

      {error && <div className="bg-[#F43F5E]/10 border border-[#F43F5E]/20 rounded-xl p-3 flex items-center gap-2 text-sm text-[#F43F5E]"><AlertCircle className="w-4 h-4" />{error}</div>}
      {success && <div className="bg-[#10B981]/10 border border-[#10B981]/20 rounded-xl p-3 flex items-center gap-2 text-sm text-[#10B981]"><CheckCircle2 className="w-4 h-4" />{success}</div>}

      {loading ? (
        <div className="flex items-center justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-[#7C3AED]" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {AD_PLATFORMS.map(p => {
            const token = tokens.find(t => t.platform === p.id);
            const isEditing = editing === p.id;
            const result = validationResult[p.id];
            return (
              <Card key={p.id} className={cn('overflow-hidden', token && 'ring-2 ring-[#10B981]/50')}>
                <div className={cn('h-2 bg-gradient-to-r', p.color)} />
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={cn('w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center text-2xl', p.color)}>{p.icon}</div>
                      <div>
                        <h3 className="font-bold">{p.label}</h3>
                        <p className="text-xs text-[#A1A1C2]">{p.desc}</p>
                      </div>
                    </div>
                    {token ? (
                      <Badge variant="success" className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> مضاف</Badge>
                    ) : (
                      <Badge variant="secondary">غير مضاف</Badge>
                    )}
                  </div>

                  {isEditing ? (
                    <div className="space-y-3 mt-4">
                      <div>
                        <Label>Access Token</Label>
                        <Input
                          type="password"
                          value={formData[p.id]?.accessToken || ''}
                          onChange={e => setFormData(prev => ({ ...prev, [p.id]: { ...prev[p.id], accessToken: e.target.value, label: prev[p.id]?.label || p.label } }))}
                          placeholder={`أدخل ${p.label} Access Token`}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => handleSave(p.id)} disabled={saving || !formData[p.id]?.accessToken}>
                          {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />} حفظ
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setEditing(null)}>إلغاء</Button>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Button size="sm" variant="outline" onClick={() => {
                        setEditing(p.id);
                        setFormData(prev => ({ ...prev, [p.id]: { accessToken: token?.accessToken || '', label: token?.label || p.label } }));
                      }}>
                        {token ? 'تحديث' : 'إضافة'} التوكن
                      </Button>
                      {token && (
                        <>
                          <Button size="sm" variant="outline" onClick={() => handleValidate(p.id)} disabled={validating === p.id}>
                            {validating === p.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Search className="w-3 h-3" />} تحقق
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleDelete(token.id)}>
                            <Trash2 className="w-3 h-3" /> حذف
                          </Button>
                        </>
                      )}
                      <a href={p.docUrl} target="_blank" rel="noopener noreferrer">
                        <Button size="sm" variant="ghost"><ExternalLink className="w-3 h-3" /> كيف أحصل على التوكن؟</Button>
                      </a>
                    </div>
                  )}

                  {result && (
                    <div className={cn('mt-3 p-3 rounded-lg text-sm', result.valid ? 'bg-[#10B981]/10 text-[#10B981]' : 'bg-[#F43F5E]/10 text-[#F43F5E]')}>
                      {result.valid ? (
                        <div className="space-y-1">
                          <p className="font-medium flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> التوكن صالح</p>
                          {result.pages?.length > 0 && <p>الصفحات: {result.pages.map((p: any) => p.name).join(', ')}</p>}
                          {result.adAccounts?.length > 0 && <p>حسابات الإعلانات: {result.adAccounts.map((a: any) => a.name).join(', ')}</p>}
                          {result.expiresAt && <p>تاريخ الانتهاء: {new Date(result.expiresAt).toLocaleDateString('ar-EG')}</p>}
                        </div>
                      ) : (
                        <p className="flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" /> {result.error || 'التوكن غير صالح'}</p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
