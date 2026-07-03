'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Bot, Send, Loader2, Sparkles, MessageSquare, RefreshCw, FileText, Globe,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { sandboxApi } from '@/services/api-modules';
import ModelSelector from '@/components/ai/ModelSelector';
import { chatWithClientAI } from '@/lib/client-ai';

export const SandboxPage: React.FC = () => {
  const [chatMessages, setChatMessages] = useState<{ role: string; content: string }[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  const [brief, setBrief] = useState('');
  const [draft, setDraft] = useState<any>(null);
  const [draftLoading, setDraftLoading] = useState(false);

  const [enrichUrl, setEnrichUrl] = useState('');
  const [enrichResult, setEnrichResult] = useState<any>(null);
  const [enrichLoading, setEnrichLoading] = useState(false);

  const [activeTab, setActiveTab] = useState<'chat' | 'campaign' | 'enrich'>('chat');
  const [sandboxModel, setSandboxModel] = useState({ provider: '', model: '' });
  const [useSandboxModel, setUseSandboxModel] = useState(false);

  const handleSend = async () => {
    if (!chatInput.trim()) return;
    const userMsg = chatInput.trim();
    setChatMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setChatInput('');
    setChatLoading(true);
    try {
      let reply = '';
      if (useSandboxModel && sandboxModel.provider === 'puter') {
        const messages: { role: 'system' | 'user' | 'assistant'; content: string }[] = [];
        messages.push(...chatMessages.slice(-10).map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })));
        messages.push({ role: 'user', content: userMsg });
        const result = await chatWithClientAI({ messages, provider: 'puter', model: sandboxModel.model || undefined });
        reply = result.content;
      } else {
        const chatOpts: any = { message: userMsg, history: chatMessages.slice(-10) };
        if (useSandboxModel && sandboxModel.provider) {
          chatOpts.provider = sandboxModel.provider;
          chatOpts.model = sandboxModel.model || undefined;
        }
        const res = await sandboxApi.chat(chatOpts);
        reply = res.data?.data?.reply || '...';
      }
      setChatMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch (err: any) {
      const msg = err?.response?.data?.error || err?.message || 'خطأ غير معروف';
      setChatMessages(prev => [...prev, { role: 'assistant', content: `عذراً، حدث خطأ: ${msg}` }]);
    }
    setChatLoading(false);
  };

  const handleDraft = async () => {
    if (!brief.trim()) return;
    setDraftLoading(true);
    try {
      const res = await sandboxApi.generateCampaignDraft(brief);
      setDraft(res.data?.data);
    } catch {}
    setDraftLoading(false);
  };

  const handleEnrich = async () => {
    if (!enrichUrl.trim()) return;
    setEnrichLoading(true);
    try {
      const res = await sandboxApi.enrich(enrichUrl);
      setEnrichResult(res.data?.data);
    } catch {}
    setEnrichLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-electric" /> اختبر الوكيل الذكي
        </h1>
        <p className="text-gray-500">جرب قدرات الوكيل الذكي قبل التفعيل الفعلي</p>
      </div>

      <div className="flex gap-2 mb-6">
        {[
          { id: 'chat', label: 'محادثة تجريبية', icon: MessageSquare },
          { id: 'campaign', label: 'توليد حملة', icon: FileText },
          { id: 'enrich', label: 'استخراج بيانات', icon: Globe },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab.id ? 'bg-electric text-white' : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'chat' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Card>
            <CardHeader>
              <CardTitle>محادثة تجريبية مع الوكيل الذكي</CardTitle>
              <CardDescription>اسأل الوكيل أي سؤال لترى كيف سيرد بناءً على بيانات نشاطك</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80 overflow-y-auto mb-4 space-y-3 bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                {chatMessages.length === 0 && (
                  <div className="text-center text-gray-400 py-12">
                    <Bot className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>ابدأ محادثة مع الوكيل الذكي</p>
                    <p className="text-sm">اسأل عن منتج أو خدمة أو استفسار عام</p>
                  </div>
                )}
                {chatMessages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-start' : 'justify-end'}`}>
                    <div className={`p-3 rounded-xl max-w-[75%] text-sm ${
                      msg.role === 'user'
                        ? 'bg-electric/10 text-gray-900 dark:text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                ))}
                {chatLoading && (
                  <div className="flex justify-end">
                    <div className="p-3 rounded-xl bg-gray-200 dark:bg-gray-700 flex items-center gap-2 text-sm">
                      <Loader2 className="w-3 h-3 animate-spin" /> الوكيل يكتب...
                    </div>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 p-2 bg-[#1E1B3A]/50 rounded-lg mb-2">
                <input
                  type="checkbox"
                  id="use-sandbox-model"
                  checked={useSandboxModel}
                  onChange={e => setUseSandboxModel(e.target.checked)}
                  className="rounded border-[#7C3AED]/30"
                />
                <label htmlFor="use-sandbox-model" className="text-xs text-[#A1A1C2] cursor-pointer">تحديد نموذج AI</label>
                {useSandboxModel && (
                  <div className="flex-1 max-w-xs mr-auto">
                    <ModelSelector
                      value={sandboxModel}
                      onChange={setSandboxModel}
                      providerLabel="مزود"
                      modelLabel="نموذج"
                      hideLabel
                    />
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <Input
                  value={chatInput}
                  onChange={(e: any) => setChatInput(e.target.value)}
                  placeholder="اكتب سؤالاً..."
                  onKeyDown={(e: any) => e.key === 'Enter' && handleSend()}
                />
                <Button onClick={handleSend} disabled={chatLoading || !chatInput.trim()}>
                  {chatLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </Button>
                <Button variant="outline" onClick={() => setChatMessages([])} title="مسح المحادثة">
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {activeTab === 'campaign' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Card>
            <CardHeader>
              <CardTitle>توليد مسودة حملة إعلانية</CardTitle>
              <CardDescription>اكتب بريف قصير والوكيل سيولد مسودة كاملة</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={brief}
                onChange={e => setBrief(e.target.value)}
                placeholder="مثال: نريد حملة لإطلاق منتج جديد للعناية بالبشرة موجهة للنساء في السعودية"
                rows={3}
              />
              <Button onClick={handleDraft} disabled={draftLoading || !brief.trim()}>
                {draftLoading ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : <Sparkles className="w-4 h-4 ml-2" />}
                توليد مسودة
              </Button>

              {draft && (
                <div className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-lg">{draft.name}</h3>
                    <Badge>{draft.objective}</Badge>
                    <Badge variant="outline">{draft.platform}</Badge>
                  </div>
                  <p className="text-sm text-gray-500">{draft.reasoning}</p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><span className="font-medium">الميزانية المقترحة:</span> ${draft.budgetSuggested}</div>
                    <div><span className="font-medium">الجمهور:</span> {draft.targetAudience?.country} ({draft.targetAudience?.ageMin}-{draft.targetAudience?.ageMax})</div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">النصوص الإعلانية:</h4>
                    {draft.adTexts?.map((ad: any, i: number) => (
                      <div key={i} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg mb-2">
                        <p className="font-medium">{ad.headline}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{ad.mainText}</p>
                        <Badge variant="secondary" className="mt-1">{ad.cta}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {activeTab === 'enrich' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Card>
            <CardHeader>
              <CardTitle>استخراج بيانات النشاط تلقائياً</CardTitle>
              <CardDescription>أدخل رابط موقعك لاستخراج معلومات النشاط التجاري</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input value={enrichUrl} onChange={e => setEnrichUrl(e.target.value)} placeholder="https://example.com" dir="ltr" />
                <Button onClick={handleEnrich} disabled={enrichLoading || !enrichUrl.trim()}>
                  {enrichLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Globe className="w-4 h-4" />}
                </Button>
              </div>

              {enrichResult && (
                <div className="p-4 border rounded-lg space-y-2">
                  <h4 className="font-medium">البيانات المستخرجة:</h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div><span className="font-medium">المجال:</span> {enrichResult.industry || '—'}</div>
                    <div><span className="font-medium">نطاق الأسعار:</span> {enrichResult.priceRange || '—'}</div>
                    <div><span className="font-medium">نغمة الكلام:</span> {enrichResult.toneOfVoice || '—'}</div>
                    <div><span className="font-medium">المنتجات:</span> {enrichResult.productsServices?.join(', ') || '—'}</div>
                  </div>
                  {enrichResult.targetAudience && (
                    <div className="text-sm">
                      <span className="font-medium">الجمهور المستهدف:</span>{' '}
                      {enrichResult.targetAudience.country} ({enrichResult.targetAudience.ageMin}-{enrichResult.targetAudience.ageMax})
                    </div>
                  )}
                </div>
              )}
              {!enrichResult && !enrichLoading && (
                <p className="text-sm text-gray-400 text-center py-8">انتظر النتائج بعد إدخال الرابط</p>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
};
