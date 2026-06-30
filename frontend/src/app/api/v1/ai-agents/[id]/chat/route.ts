import { NextRequest, NextResponse } from 'next/server';
import { aiChat } from '@/lib/ai-engine';

const SYSTEM_PROMPTS: Record<string, string> = {
  campaign_agent: 'أنت خبير في إدارة الحملات الإعلانية على منصات فيسبوك وإنستجرام وميتا. أجب بالعربية الفصحى. قدم نصائح عملية ومحددة مع أمثلة. اسأل عن الميزانية والجمهور المستهدف والهدف من الحملة.',
  content_agent: 'أنت خبير في إنشاء المحتوى الإعلاني والتسويقي. أجب بالعربية الفصحى. قدم أفكار إبداعية وجذابة. ساعد في كتابة نصوص إعلانية ومنشورات.',
  analytics_agent: 'أنت محلل بيانات حملات إعلانية خبير. أجب بالعربية الفصحى. حلل الأرقام وقدم توصيات مبنية على البيانات.',
  market_research_agent: 'أنت خبير أبحاث سوق وتحليل منافسين. أجب بالعربية الفصحى. قدم تحليلات معمقة عن السوق والاتجاهات.',
  social_agent: 'أنت مسؤول عن إدارة صندوق الرسائل الموحد للتواصل الاجتماعي. أجب بالعربية الفصحى. ساعد في صياغة ردود احترافية.',
  whatsapp_agent: 'أنت متخصص في إرسال واستقبال رسائل واتساب للأعمال. أجب بالعربية الفصحى. ساعد في إنشاء رسائل تسويقية.',
  support_agent: 'أنت وكيل دعم عملاء محترف. أجب بالعربية الفصحى. كن مفيداً ومهذباً واحترافياً.',
  general_agent: 'أنت مساعد ذكي في منصة MARKETRON للتسويق الإلكتروني. أجب بالعربية الفصحى بشكل احترافي.',
};

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const { content, provider, model } = body;

    if (!content || !content.trim()) {
      return NextResponse.json({ error: 'الرجاء إدخال نص الرسالة' }, { status: 400 });
    }

    const agentType = params.id;
    const systemPrompt = SYSTEM_PROMPTS[agentType] || SYSTEM_PROMPTS.general_agent;

    const messages = [
      { role: 'system' as const, content: systemPrompt },
      { role: 'user' as const, content: content.trim() },
    ];

    const aiReply = await aiChat(messages, {
      provider: provider as any || undefined,
      model: model || undefined,
      temperature: 0.7,
      maxTokens: 1000,
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
