'use client';

import React, { useEffect, useState } from 'react';
import {
  AlertCircle, CheckCircle2, Eye, EyeOff, Cpu, Save, Trash2, Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { settingsApi } from '@/services/api-modules';
import { cn } from '@/lib/utils';

interface AiProviderConfig {
  provider: string;
  label: string;
  configured: boolean;
  source: string;
  apiKey: string;
  baseUrl: string;
  defaultModel: string;
  isActive: boolean;
}

const AI_PROVIDER_META: Record<string, { icon: string; color: string; desc: string }> = {
  zen: { icon: '🧘', color: 'from-indigo-500 to-purple-600', desc: 'OpenCode Zen — GPT-5.4, GPT-5-mini' },
  puter: { icon: '📦', color: 'from-orange-400 to-red-500', desc: 'Puter.js — GPT-4o, Claude 3.5 (بدون مفتاح)' },
  openai: { icon: '⚡', color: 'from-emerald-500 to-teal-600', desc: 'GPT-4o, GPT-4o-mini' },
  anthropic: { icon: '🌿', color: 'from-amber-500 to-orange-600', desc: 'Claude 3.5 Sonnet, Haiku' },
  gemini: { icon: '🔮', color: 'from-blue-400 to-indigo-600', desc: 'Gemini 1.5 Flash, Pro' },
  groq: { icon: '🚀', color: 'from-purple-500 to-pink-600', desc: 'Llama 3, Mixtral (مجاني)' },
  mistral: { icon: '🌊', color: 'from-cyan-500 to-blue-600', desc: 'Mistral Large, Small' },
  cohere: { icon: '🧠', color: 'from-yellow-500 to-red-600', desc: 'Command R+' },
  deepseek: { icon: '🐋', color: 'from-sky-500 to-violet-600', desc: 'DeepSeek Chat, V2' },
  perplexity: { icon: '🔍', color: 'from-teal-500 to-cyan-600', desc: 'Llama 3.1 Sonar (Online)' },
  pollinations: { icon: '🌸', color: 'from-pink-400 to-rose-500', desc: 'OpenAI, Mistral, Llama (مجاني)' },
};

export function AiProvidersTab() {
  const [providers, setProviders] = useState<AiProviderConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{ provider: string; apiKey: string; baseUrl: string; defaultModel: string } | null>(null);
  const [showKey, setShowKey] = useState(false);

  useEffect(() => { loadProviders(); }, []);

  const loadProviders = async () => {
    setLoading(true);
    try {
      const res = await settingsApi.getAiProviders();
      setProviders(res.data?.data || []);
    } catch { setError('فشل تحميل إعدادات مزودات الذكاء'); }
    finally { setLoading(false); }
  };

  const showSuccessMsg = (msg: string) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(null), 4000);
  };

  const handleSave = async (provider: string) => {
    if (!editForm) return;
    setSaving(provider);
    setError(null);
    try {
      await settingsApi.upsertAiProvider(provider, {
        apiKey: editForm.apiKey,
        baseUrl: editForm.baseUrl || undefined,
        defaultModel: editForm.defaultModel || undefined,
      });
      setEditForm(null);
      await loadProviders();
      showSuccessMsg('تم حفظ مفتاح API بنجاح');
    } catch (err: any) {
      setError(err?.response?.data?.error || 'فشل الحفظ');
    } finally { setSaving(null); }
  };

  const handleDelete = async (provider: string) => {
    if (!confirm('هل تريد حذف مفتاح API لهذا المزود؟')) return;
    setSaving(provider);
    try {
      await settingsApi.deleteAiProvider(provider);
      await loadProviders();
      showSuccessMsg('تم حذف المفتاح');
    } catch (err: any) {
      setError(err?.response?.data?.error || 'فشل الحذف');
    } finally { setSaving(null); }
  };

  if (loading) return <div className="flex justify-center py-8"><Loader2 className="w-8 h-8 animate-spin text-[#7C3AED]" /></div>;

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-[#F43F5E]/10 border border-[#F43F5E]/20 rounded-xl p-3 flex items-center gap-2 text-sm text-[#F43F5E]">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />{error}
          <button onClick={() => setError(null)} className="mr-auto text-[#F43F5E]/60 hover:text-[#F43F5E]">✕</button>
        </div>
      )}
      {success && (
        <div className="bg-[#10B981]/10 border border-[#10B981]/20 rounded-xl p-3 flex items-center gap-2 text-sm text-[#10B981]">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />{success}
        </div>
      )}

      <p className="text-sm text-[#A1A1C2]">
        أضف مفاتيح API لمزودات الذكاء الاصطناعي. Pollinations AI مجاني ولا يحتاج مفتاح.
        {providers.some(p => p.source === 'env') && (
          <span className="block mt-1 text-[#F59E0B]">
            ⚠️ بعض المزودات لديها مفاتيح من متغيرات البيئة. إضافة مفتاح هنا سيتجاوزها لهذا المستخدم.
          </span>
        )}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {providers.map(p => {
          const meta = AI_PROVIDER_META[p.provider] || { icon: '🤖', color: 'from-gray-500 to-gray-600', desc: '' };
          const isEditing = editForm?.provider === p.provider;
          const isSaving = saving === p.provider;

          return (
            <Card key={p.provider} className={cn('overflow-hidden', p.configured && p.source === 'database' && 'ring-2 ring-[#10B981]/50')}>
              <div className={cn('h-1.5 bg-gradient-to-r', meta.color)} />
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className={cn('w-10 h-10 rounded-lg bg-gradient-to-br flex items-center justify-center text-xl', meta.color)}>
                      {meta.icon}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm">{p.label}</h3>
                      <p className="text-xs text-[#A1A1C2]">{meta.desc}</p>
                    </div>
                  </div>
                  <Badge variant={p.configured ? 'success' : 'secondary'} className="text-xs">
                    {p.configured ? (p.source === 'env' ? 'من البيئة' : 'مُضاف') : 'غير مضبوط'}
                  </Badge>
                </div>

                {isEditing ? (
                  <div className="space-y-2 mt-2 border-t pt-2">
                    <div>
                      <Label className="text-xs">مفتاح API</Label>
                      <div className="relative">
                        <Input
                          type={showKey ? 'text' : 'password'}
                          value={editForm.apiKey}
                          onChange={e => setEditForm(f => f ? { ...f, apiKey: e.target.value } : null)}
                          className="text-xs font-mono pl-8"
                          placeholder="sk-..."
                        />
                        <button
                          type="button"
                          onClick={() => setShowKey(!showKey)}
                          className="absolute left-2 top-1/2 -translate-y-1/2 text-[#A1A1C2] hover:text-white"
                        >
                          {showKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs">Base URL (اختياري)</Label>
                      <Input
                        type="text"
                        value={editForm.baseUrl}
                        onChange={e => setEditForm(f => f ? { ...f, baseUrl: e.target.value } : null)}
                        className="text-xs"
                        placeholder={p.baseUrl || 'https://api.openai.com/v1'}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">النموذج الافتراضي (اختياري)</Label>
                      <Input
                        type="text"
                        value={editForm.defaultModel}
                        onChange={e => setEditForm(f => f ? { ...f, defaultModel: e.target.value } : null)}
                        className="text-xs"
                        placeholder={p.defaultModel || 'gpt-4o-mini'}
                      />
                    </div>
                    <div className="flex gap-2 pt-1">
                      <Button size="sm" className="flex-1 gradient-brand text-white border-0" onClick={() => handleSave(p.provider)} disabled={isSaving || !editForm.apiKey.trim()}>
                        {isSaving ? <Loader2 className="w-3.5 h-3.5 ml-1 animate-spin" /> : <Save className="w-3.5 h-3.5 ml-1" />}
                        حفظ
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setEditForm(null)}>إلغاء</Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-2 mt-2 border-t pt-2">
                    <div className="text-[10px] text-[#A1A1C2]">
                      {p.configured && p.source === 'database' ? 'مخزن محلياً' : p.source === 'env' ? 'من متغيرات البيئة' : 'بدون مفتاح'}
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-xs h-7"
                        onClick={() => setEditForm({ provider: p.provider, apiKey: p.apiKey || '', baseUrl: p.baseUrl || '', defaultModel: p.defaultModel || '' })}
                      >
                        <Cpu className="w-3.5 h-3.5 ml-1" />
                        تعديل
                      </Button>
                      {p.configured && p.source === 'database' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-xs h-7 text-[#F43F5E]"
                          onClick={() => handleDelete(p.provider)}
                          disabled={isSaving}
                        >
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
