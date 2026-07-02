'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Bot, Sparkles, Loader2, Send, RefreshCw, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { generateAiSuggestions } from '@/lib/ai-replies';
import { socialApi } from '@/services/socialApi';
import type { AiReplySuggestion } from '@/types/social';

interface AiReplyPanelProps {
  lastInbound: string;
  onSend: (text: string) => void;
  collapsed?: boolean;
}

const intentLabels: Record<AiReplySuggestion['intent'], string> = {
  greeting: 'ترحيب',
  product_inquiry: 'استفسار منتج',
  pricing: 'استفسار سعر',
  objection: 'اعتراض',
  closing: 'إغلاق بيع',
  support: 'دعم',
  follow_up: 'متابعة',
  general: 'رد عام',
};

export function AiReplyPanel({ lastInbound, onSend, collapsed }: AiReplyPanelProps) {
  const [suggestions, setSuggestions] = useState<AiReplySuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    if (!lastInbound) {
      setSuggestions([]);
      return;
    }
    generate(lastInbound);
  }, [lastInbound]);

  const generate = async (text: string) => {
    setLoading(true);
    setSelectedId(null);
    try {
      const { data } = await socialApi.generateAiReply(text);
      const aiText: string = data?.data?.suggestion || '';
      const aiSuggestions = await generateAiSuggestions(text).catch(() => []);
      if (aiText) {
        setSuggestions([
          { id: `ai-${Date.now()}`, text: aiText, intent: 'general', confidence: 0.96 },
          ...aiSuggestions.slice(0, 2).map((s, i) => ({ id: `gen-${i}`, text: s, intent: 'general' as const, confidence: 0.8 })),
        ]);
      } else {
        setSuggestions(aiSuggestions.map((s, i) => ({ id: `gen-${i}`, text: s, intent: 'general' as const, confidence: 0.8 })));
      }
    } catch {
      const fallback = await generateAiSuggestions(text).catch(() => ['شكراً لتواصلك!']);
      setSuggestions(fallback.map((s, i) => ({ id: `gen-${i}`, text: s, intent: 'general' as const, confidence: 0.8 })));
    } finally {
      setLoading(false);
    }
  };

  const regenerate = () => {
    generate(lastInbound + ' ' + Math.random().toString(36).slice(2, 6));
  };

  if (collapsed) return null;

  return (
    <div className="border-t border-gray-200 dark:border-gray-800 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800/50 p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg gradient-brand flex items-center justify-center">
            <Bot className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-xs font-semibold gradient-brand-text">رد ذكي بالذكاء الاصطناعي</span>
        </div>
        <button
          onClick={regenerate}
          disabled={loading}
          className="text-gray-400 hover:text-primary-600 disabled:opacity-50"
          title="اقتراحات جديدة"
        >
          <RefreshCw className={cn('w-3.5 h-3.5', loading && 'animate-spin')} />
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-3">
          <Loader2 className="w-4 h-4 animate-spin text-primary-500" />
          <span className="text-xs text-gray-500 mr-2">MARKETRON AI يفكر...</span>
        </div>
      ) : suggestions.length === 0 ? (
        <p className="text-xs text-gray-400 text-center py-3">رسل رسالة أو استلم رسالة لظهور اقتراحات ذكية.</p>
      ) : (
        <div className="space-y-2">
          {suggestions.map((s) => (
            <div
              key={s.id}
              className={cn(
                'rounded-xl border p-2.5 cursor-pointer transition-all',
                selectedId === s.id
                  ? 'border-primary-400 bg-white dark:bg-gray-900 shadow-sm'
                  : 'border-transparent bg-white/70 dark:bg-gray-900/70 hover:bg-white dark:hover:bg-gray-900 hover:shadow-sm'
              )}
              onClick={() => setSelectedId(s.id)}
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed flex-1">{s.text}</p>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <span className={cn('text-[10px] px-1.5 py-0.5 rounded-full', badgeForIntent(s.intent))}>
                    {intentLabels[s.intent]}
                  </span>
                  <span className="text-[10px] text-gray-400">{Math.round(s.confidence * 100)}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-2 flex gap-2">
        <Button
          size="sm"
          disabled={!selectedId || loading}
          className="flex-1 gradient-brand text-white border-0"
          onClick={() => {
            const sel = suggestions.find(s => s.id === selectedId);
            if (sel) onSend(sel.text);
          }}
        >
          <Send className="w-3.5 h-3.5 ml-1" />
          إرسال الرد المقترح
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled={!selectedId}
          onClick={() => {
            const sel = suggestions.find(s => s.id === selectedId);
            if (sel) {
              navigator.clipboard?.writeText(sel.text);
            }
          }}
          title="نسخ"
        >
          <Check className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
}

function badgeForIntent(intent: AiReplySuggestion['intent']): string {
  switch (intent) {
    case 'greeting': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300';
    case 'pricing': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300';
    case 'objection': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300';
    case 'closing': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300';
    case 'support': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300';
    default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
  }
}