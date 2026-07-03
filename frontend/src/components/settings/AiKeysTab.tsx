'use client';

import React, { useEffect, useState } from 'react';
import {
  Eye, EyeOff, Cpu, Save, Trash2, Loader2, Plus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const BYOK_PROVIDER_META: Record<string, { icon: string; color: string; desc: string; baseUrl: string; defaultModel: string }> = {
  zen: { icon: '🧘', color: 'from-indigo-500 to-purple-600', desc: 'OpenCode Zen — GPT-5.5, GPT-5.4 (الرئيسي)', baseUrl: 'https://opencode.ai/zen', defaultModel: 'gpt-5.4-mini' },
  openai: { icon: '⚡', color: 'from-emerald-500 to-teal-600', desc: 'GPT-4o, DALL-E 3', baseUrl: 'https://api.openai.com', defaultModel: 'gpt-4o-mini' },
  anthropic: { icon: '🌿', color: 'from-amber-500 to-orange-600', desc: 'Claude 3.5 Sonnet', baseUrl: 'https://api.anthropic.com', defaultModel: 'claude-3-5-sonnet-20241022' },
  openrouter: { icon: '🌐', color: 'from-blue-500 to-indigo-600', desc: 'بوابة موحدة لعشرات الموديلات', baseUrl: 'https://openrouter.ai/api', defaultModel: 'openai/gpt-4o-mini' },
  deepseek: { icon: '🐋', color: 'from-sky-500 to-violet-600', desc: 'DeepSeek Chat, Coder', baseUrl: 'https://api.deepseek.com', defaultModel: 'deepseek-chat' },
  google: { icon: '🔮', color: 'from-blue-400 to-indigo-600', desc: 'Gemini 1.5 Flash, Pro', baseUrl: 'https://generativelanguage.googleapis.com', defaultModel: 'gemini-1.5-flash' },
};

export function AiKeysTab() {
  const [keys, setKeys] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [formKey, setFormKey] = useState('');
  const [formBase, setFormBase] = useState('');
  const [formModel, setFormModel] = useState('');
  const [formLabel, setFormLabel] = useState('');
  const [formDefaultType, setFormDefaultType] = useState<'text' | 'image' | 'audio' | ''>('');
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ provider: string; valid: boolean; error?: string } | null>(null);
  const [showKey, setShowKey] = useState(false);

  useEffect(() => { loadKeys(); }, []);

  const loadKeys = async () => {
    setLoading(true);
    try {
      const { apiKeysApi } = await import('@/services/api-modules');
      const res = await apiKeysApi.list();
      setKeys(res.data?.data || []);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  };

  const handleTest = async (provider: string, apiKey: string, baseUrl?: string) => {
    setTesting(provider);
    setTestResult(null);
    try {
      const { apiKeysApi } = await import('@/services/api-modules');
      const res = await apiKeysApi.test(provider, apiKey, baseUrl);
      setTestResult({ provider, valid: res.data?.data?.valid || false, error: res.data?.data?.error });
    } catch { setTestResult({ provider, valid: false, error: 'فشل الاتصال' }); }
    finally { setTesting(null); }
  };

  const handleSave = async (provider: string) => {
    if (!formKey.trim()) return;
    setSaving(true);
    try {
      const { apiKeysApi } = await import('@/services/api-modules');
      await apiKeysApi.upsert(provider, {
        apiKey: formKey,
        baseUrl: formBase || undefined,
        defaultModel: formModel || undefined,
        label: formLabel || undefined,
        isDefaultForType: formDefaultType || undefined,
      });
      setEditing(null);
      setFormKey('');
      setFormBase('');
      setFormModel('');
      setFormLabel('');
      setFormDefaultType('');
      await loadKeys();
    } catch { /* ignore */ }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('حذف هذا المفتاح؟')) return;
    try {
      const { apiKeysApi } = await import('@/services/api-modules');
      await apiKeysApi.delete(id);
      await loadKeys();
    } catch { /* ignore */ }
  };

  if (loading) return <div className="flex justify-center py-8"><Loader2 className="w-8 h-8 animate-spin text-[#7C3AED]" /></div>;

  return (
    <div className="space-y-4">
      <p className="text-sm text-[#A1A1C2]">
        🌸 MARKETRON يوفر توليد مجاني عبر Pollinations.ai تلقائياً. ربط مفاتيحك الخاصة اختياري
        ويمنحك تحكماً أكبر في جودة النتائج والموديلات المستخدمة. جميع المفاتيح تُخزّن مشفّرة.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Card className="overflow-hidden ring-2 ring-[#06B6D4]/50">
          <div className="h-1.5 bg-gradient-to-r from-pink-400 to-rose-500" />
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center text-xl">🌸</div>
                <div>
                  <h3 className="font-bold text-sm">Pollinations AI</h3>
                  <p className="text-xs text-[#A1A1C2]">OpenAI, Mistral, Llama, Gemini (مجاني)</p>
                </div>
              </div>
              <Badge variant="success" className="text-xs">مفعّل دائماً</Badge>
            </div>
            <div className="text-[10px] text-[#A1A1C2] mt-2 border-t pt-2">المحرك الافتراضي المجاني — لا يحتاج مفتاح</div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden ring-2 ring-[#F59E0B]/40">
          <div className="h-1.5 bg-gradient-to-r from-orange-400 to-red-500" />
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-xl">📦</div>
                <div>
                  <h3 className="font-bold text-sm">Puter.js</h3>
                  <p className="text-xs text-[#A1A1C2]">GPT-4o, Claude 3.5 Sonnet, Gemini 1.5 Pro (بدون مفتاح)</p>
                </div>
              </div>
              <Badge variant="success" className="text-xs">مفعّل دائماً</Badge>
            </div>
            <div className="text-[10px] text-[#A1A1C2] mt-2 border-t pt-2">ذكاء اصطناعي مجاني عن طريق المتصفح — ابدأ بالاستخدام فوراً</div>
          </CardContent>
        </Card>

        {Object.entries(BYOK_PROVIDER_META).map(([provider, meta]) => {
          const existing = keys.find(k => k.provider === provider);
          const isEditing = editing === provider;
          return (
            <Card key={provider} className={cn('overflow-hidden', existing && 'ring-2 ring-[#10B981]/50')}>
              <div className={cn('h-1.5 bg-gradient-to-r', meta.color)} />
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className={cn('w-10 h-10 rounded-lg bg-gradient-to-br flex items-center justify-center text-xl', meta.color)}>{meta.icon}</div>
                    <div>
                      <h3 className="font-bold text-sm">{provider.charAt(0).toUpperCase() + provider.slice(1)}</h3>
                      <p className="text-xs text-[#A1A1C2]">{meta.desc}</p>
                    </div>
                  </div>
                  {existing ? (
                    <div className="flex items-center gap-1">
                      <Badge variant="success" className="text-xs">✓ متصل</Badge>
                      {existing.isDefaultForType && <Badge variant="secondary" className="text-xs">افتراضي</Badge>}
                    </div>
                  ) : (
                    <Badge variant="secondary" className="text-xs">غير مضبوط</Badge>
                  )}
                </div>

                {isEditing ? (
                  <div className="space-y-2 mt-2 border-t pt-2">
                    <div>
                      <Label className="text-xs">مفتاح API</Label>
                      <div className="relative">
                        <Input type={showKey ? 'text' : 'password'} value={formKey} onChange={e => setFormKey(e.target.value)} className="text-xs font-mono pl-8" placeholder="sk-..." />
                        <button type="button" onClick={() => setShowKey(!showKey)} className="absolute left-2 top-1/2 -translate-y-1/2 text-[#A1A1C2] hover:text-white">
                          {showKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs">Base URL (اختياري)</Label>
                      <Input type="text" value={formBase} onChange={e => setFormBase(e.target.value)} className="text-xs" placeholder={BYOK_PROVIDER_META[provider]?.baseUrl || 'https://api.openai.com'} />
                    </div>
                    <div>
                      <Label className="text-xs">النموذج الافتراضي (اختياري)</Label>
                      <Input type="text" value={formModel} onChange={e => setFormModel(e.target.value)} className="text-xs" placeholder={BYOK_PROVIDER_META[provider]?.defaultModel || 'gpt-4o-mini'} />
                    </div>
                    <div>
                      <Label className="text-xs">استخدام افتراضي لـ (اختياري)</Label>
                      <select value={formDefaultType} onChange={e => setFormDefaultType(e.target.value as any)} className="w-full text-xs rounded-lg border bg-transparent p-2">
                        <option value="">-- اختر --</option>
                        <option value="text">نصوص</option>
                        <option value="image">صور</option>
                        <option value="audio">صوت</option>
                      </select>
                    </div>
                    <div className="flex gap-2 pt-1">
                      <div className="flex gap-1">
                        <Button size="sm" variant="outline" className="text-xs border-[#7C3AED]/20" onClick={() => handleTest(provider, formKey, formBase || undefined)} disabled={testing === provider || !formKey.trim()}>
                          {testing === provider ? <Loader2 className="w-3 h-3 animate-spin" /> : 'اختبار'}
                        </Button>
                        <Button size="sm" className="gradient-brand text-white border-0" onClick={() => handleSave(provider)} disabled={saving || !formKey.trim()}>
                          {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                          حفظ
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => { setEditing(null); setTestResult(null); }}>إلغاء</Button>
                      </div>
                    </div>
                    {testResult && testResult.provider === provider && (
                      <div className={cn('text-xs rounded-lg p-2', testResult.valid ? 'bg-[#10B981]/10 text-[#10B981]' : 'bg-[#F43F5E]/10 text-[#F43F5E]')}>
                        {testResult.valid ? '✓ المفتاح صالح' : `✗ ${testResult.error || 'المفتاح غير صالح'}`}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-between mt-2 border-t pt-2">
                    <div className="text-[10px] text-[#A1A1C2]">
                      {existing ? `مخزن مشفّر${existing.label ? ` (${existing.label})` : ''}` : 'غير مضبوط'}
                    </div>
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" className="text-xs h-7" onClick={() => {
                        const meta = BYOK_PROVIDER_META[provider];
                        setEditing(provider);
                        setFormKey('');
                        setFormBase(existing?.baseUrl || meta?.baseUrl || '');
                        setFormModel(existing?.defaultModel || meta?.defaultModel || '');
                        setFormLabel(existing?.label || '');
                        setFormDefaultType(existing?.isDefaultForType || '');
                      }}>
                        {existing ? <Cpu className="w-3 h-3 ml-1" /> : <Plus className="w-3 h-3 ml-1" />}
                        {existing ? 'تعديل' : 'إضافة'}
                      </Button>
                      {existing && (
                        <Button size="sm" variant="ghost" className="text-xs h-7 text-[#F43F5E]" onClick={() => handleDelete(existing.id)}>
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
