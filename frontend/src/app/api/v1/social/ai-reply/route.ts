import { NextRequest, NextResponse } from 'next/server';
import { aiChat } from '@/lib/ai-engine';
import { requireAuth } from '@/lib/auth-utils';

export async function POST(req: NextRequest) {
  const { error } = await requireAuth(req);
  if (error) return error;
  try {
    const body = await req.json();
    const { messageText, tone } = body;

    if (!messageText) {
      return NextResponse.json({ error: 'الرجاء إدخال نص الرسالة' }, { status: 400 });
    }

    const tonePrompt = tone ? `استخدم نبرة ${tone}` : '';
    const prompt = `رسالة العميل: "${messageText}"\n\nقم بصياغة رد احترافي على هذه الرسالة. ${tonePrompt}`;

    const reply = await aiChat([
      { role: 'system', content: 'أنت مندوب خدمة عملاء في منصة MARKETRON للتسويق الإلكتروني. رد باحترافية وباللغة العربية. اجعل الرد مختصراً ومفيداً.' },
      { role: 'user', content: prompt },
    ], { temperature: 0.5, maxTokens: 300, isServer: true });

    return NextResponse.json({ data: { suggestion: reply } });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'فشل إنشاء الرد' }, { status: 500 });
  }
}
