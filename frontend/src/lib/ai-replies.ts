const FALLBACKS = ['شكراً لتواصلك مع MARKETRON! سنتواصل معك قريباً.', 'نقدر استفسارك. هل يمكنك توضيح المزيد من التفاصيل؟', 'شكراً لاهتمامك. فريقنا سيراجع طلبك ويتواصل معك.'];

export function detectIntent(text: string): string {
  const t = text.toLowerCase();
  if (/سعر|كم|تكلفة|باقة|سعره/.test(t)) return 'pricing';
  if (/خدمة|عرض|منتج|باقة|اشتغل/.test(t)) return 'service';
  if (/شكوى|مشكلة|سيء|مستاء|تأخير/.test(t)) return 'complaint';
  if (/مرحبا|السلام|hi|hello|صباح|مساء/.test(t)) return 'greeting';
  return 'general';
}

export function classifyBySentiment(text: string): 'positive' | 'negative' | 'neutral' {
  const t = text.toLowerCase();
  if (/شكرا|ممتاز|رائع|جميل|تمام/.test(t)) return 'positive';
  if (/سيء|قبيح|مزعج|غبي|فاشل/.test(t)) return 'negative';
  return 'neutral';
}

export async function generateAiSuggestions(messageText: string, platform?: string): Promise<string[]> {
  try {
    const res = await fetch('/api/v1/social/ai-reply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messageText, tone: platform }),
    });
    if (!res.ok) return FALLBACKS;
    const json = await res.json();
    const reply: string = json?.data?.suggestion || '';
    if (!reply) return FALLBACKS;
    return reply.split('\n').filter((l: string) => l.trim().length > 10).slice(0, 3);
  } catch {
    return FALLBACKS;
  }
}