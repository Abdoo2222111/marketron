// MARKETRON AI Reply — Intent Detection + Reply Generation
import type { AiReplySuggestion, ConversationMessage } from '@/types/social';
import { MOCK_AI_RULES } from '@/data/social-mock';

export function detectIntent(text: string): AiReplySuggestion['intent'] {
  const t = normalizeArabic(text.toLowerCase());
  if (/(سلام|مرحب|اهلا|hello|hi|صباح|مساء)/.test(t)) return 'greeting';
  if (/(كم|بكم|سعر|price|تكلفة|كلفة)/.test(t)) return 'pricing';
  if (/(توصيل|شحن|delivery|متى توصلون)/.test(t)) return 'product_inquiry';
  if (/(غالي|اوفى من سعر|ليش|لماذا|very expensive|too much)/.test(t)) return 'objection';
  if (/(موافق|تم|اشتري|اطلب|pay|accept)/.test(t)) return 'closing';
  if (/(مشكلة|متابعة|argument|support|help|لم يصل)/.test(t)) return 'support';
  if (/(مت境ن|كيف|لماذا لم|follow up)/.test(t)) return 'follow_up';
  return 'general';
}

function normalizeArabic(s: string): string {
  return s
    .replace(/[إأآ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/\s+/g, ' ');
}

export function generateAiSuggestions(lastInbound: string): AiReplySuggestion[] {
  const t = normalizeArabic(lastInbound.toLowerCase());
  const matches: AiReplySuggestion[] = [];

  for (const rule of MOCK_AI_RULES) {
    if (!rule.enabled) continue;
    const triggerRe = new RegExp(rule.trigger, 'i');
    if (triggerRe.test(t)) {
      matches.push({
        id: rule.id,
        text: rule.reply,
        intent: matches.length === 0 ? detectIntent(lastInbound) : 'general',
        confidence: 0.85 + Math.random() * 0.13,
      });
    }
  }

  // Fallback suggestions
  if (matches.length === 0) {
    matches.push({
      id: 'fallback-1',
      text: 'شكراً لتواصلك مع MARKETRON 🌟 خليني أساعدك بأسرع وقت. تقدر تزودني بتفاصيل أكثر عن طلبك أو سؤالك؟',
      intent: 'general',
      confidence: 0.72,
    });
    matches.push({
      id: 'fallback-2',
      text: 'مرحباً 👋 هل تحتاج مساعدة في منتج معين؟ نقدر نرسلك الكتالوج أو نرد على أي استفسار.',
      intent: 'general',
      confidence: 0.68,
    });
  }

  return matches.slice(0, 3);
}

export function classifyBySentiment(messages: ConversationMessage[]): 'positive' | 'neutral' | 'negative' {
  const txt = normalizeArabic(messages.map(m => m.text).join(' ').toLowerCase());
  if (/(شكر|ممتاز|جميل|حلو|رائع|لاوريكي)/.test(txt)) return 'positive';
  if ((/(غالي|رفض|لن|سيء|bad|persistent|لماذا غالي)/.test(txt))) return 'negative';
  return 'neutral';
}