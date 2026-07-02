import { NextRequest, NextResponse } from 'next/server';
import { aiChat } from '@/lib/ai-engine';
import { requireAuth } from '@/lib/auth-utils';

export async function POST(req: NextRequest) {
  const { error } = await requireAuth(req);
  if (error) return error;
  try {
    const body = await req.json();
    const { prompt, systemPrompt, provider, model, temperature, maxTokens } = body;

    if (!prompt || !prompt.trim()) {
      return NextResponse.json({ error: 'الرجاء إدخال النص' }, { status: 400 });
    }

    const messages = [];
    if (systemPrompt) messages.push({ role: 'system' as const, content: systemPrompt });
    messages.push({ role: 'user' as const, content: prompt });

    const text = await aiChat(messages, {
      provider: provider as any || undefined,
      model: model || undefined,
      temperature: temperature ?? 0.7,
      maxTokens: maxTokens ?? 2000,
      isServer: true,
    });

    const engine = provider || process.env.NEXT_PUBLIC_AI_ENGINE || 'pollinations';
    return NextResponse.json({
      data: { text, provider: engine, model: model || (engine === 'zen' ? 'gpt-5.4-mini' : engine === 'puter' ? 'gpt-4o' : 'openai'), tokensUsed: Math.ceil(text.length / 4) },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'فشل إنشاء النص' }, { status: 500 });
  }
}
