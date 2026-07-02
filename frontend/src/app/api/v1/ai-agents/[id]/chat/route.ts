import { NextRequest, NextResponse } from 'next/server';
import { aiChat } from '@/lib/ai-engine';
import { requireAuth } from '@/lib/auth-utils';
import prisma from '@/lib/prisma';
import { getDefaultPersona } from '@/lib/personas-config';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { error, user } = await requireAuth(req);
  if (error) return error;

  try {
    const u = user!;
    const body = await req.json();
    const { content, provider, model } = body;

    if (!content || !content.trim()) {
      return NextResponse.json({ error: 'الرجاء إدخال نص الرسالة' }, { status: 400 });
    }

    const agent = await prisma.aiAgent.findFirst({
      where: { id: params.id, userId: u.userId },
    });

    let systemPrompt = '';

    if (agent && agent.systemPrompt) {
      systemPrompt = agent.systemPrompt;
    } else {
      const agentType = params.id;
      const personaDef = getDefaultPersona(agentType);

      if (personaDef) {
        const customization = await prisma.personaCustomization.findUnique({
          where: { userId_section: { userId: u.userId, section: agentType } },
        });
        systemPrompt = customization?.customPrompt || personaDef.systemPrompt;
      } else {
        systemPrompt = 'أنت مساعد ذكي في منصة MARKETRON للتسويق الإلكتروني. أجب بالعربية الفصحى بشكل احترافي.';
      }
    }

    const messages = [
      { role: 'system' as const, content: systemPrompt },
      { role: 'user' as const, content: content.trim() },
    ];

    const aiReply = await aiChat(messages, {
      provider: provider as any || undefined,
      model: model || undefined,
      temperature: 0.7,
      maxTokens: 1000,
      isServer: true,
    });

    return NextResponse.json({
      data: {
        message: {
          id: `msg-${Date.now()}`,
          role: 'assistant',
          content: aiReply,
          agentId: params.id,
          createdAt: new Date().toISOString(),
        },
        content: aiReply,
      },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'حدث خطأ في الاتصال بالوكيل' }, { status: 500 });
  }
}