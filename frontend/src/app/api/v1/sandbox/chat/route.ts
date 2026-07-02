import { NextRequest, NextResponse } from 'next/server';
import { aiChat } from '@/lib/ai-engine';
import { requireAuth } from '@/lib/auth-utils';

export async function POST(req: NextRequest) {
  const { error } = await requireAuth(req);
  if (error) return error;
  try {
    const body = await req.json();
    const { message, history, provider, model } = body;

    if (!message || !message.trim()) {
      return NextResponse.json({ error: 'الرجاء إدخال نص الرسالة' }, { status: 400 });
    }

    const messages: { role: 'system' | 'user' | 'assistant'; content: string }[] = [
      { role: 'system', content: 'أنت مساعد ذكي في بيئة اختبار MARKETRON. أجب بالعربية الفصحى.' },
    ];

    if (history && Array.isArray(history)) {
      for (const msg of history) {
        if (msg.role === 'user' || msg.role === 'assistant') {
          messages.push({ role: msg.role, content: msg.content || '' });
        }
      }
    }

    messages.push({ role: 'user', content: message });

    const aiReply = await aiChat(messages, {
      provider: provider as any || undefined,
      model: model || undefined,
      temperature: 0.7,
      maxTokens: 1500,
      isServer: true,
    });

    const engine = provider || process.env.NEXT_PUBLIC_AI_ENGINE || 'pollinations';
    return NextResponse.json({
      data: { reply: aiReply, provider: engine, model: model || (engine === 'zen' ? 'gpt-5.4-mini' : engine === 'puter' ? 'gpt-4o' : 'openai') },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'فشل الاتصال' }, { status: 500 });
  }
}
