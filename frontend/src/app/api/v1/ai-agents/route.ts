import { NextRequest, NextResponse } from 'next/server';

let agents: any[] = [
  {
    id: '1',
    name: 'وكيل الحملات الذكي',
    type: 'campaign_agent',
    description: 'خبير في إدارة وتحسين الحملات الإعلانية',
    systemPrompt: 'أنت خبير في إدارة الحملات الإعلانية. أجب بالعربية. قدم نصائح عملية.',
    isActive: true,
    provider: 'pollinations',
    model: 'openai',
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'وكيل المحتوى الإبداعي',
    type: 'content_agent',
    description: 'متخصص في إنشاء المحتوى الإعلاني والنصوص',
    systemPrompt: 'أنت خبير في إنشاء المحتوى الإعلاني والتسويقي. أجب بالعربية.',
    isActive: true,
    provider: 'pollinations',
    model: 'openai',
    createdAt: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'وكيل خدمة العملاء',
    type: 'support_agent',
    description: 'للرد على استفسارات العملاء والدعم الفني',
    systemPrompt: 'أنت وكيل دعم عملاء محترف. أجب بالعربية. كن مفيداً ومهذباً.',
    isActive: true,
    provider: 'pollinations',
    model: 'openai',
    createdAt: new Date().toISOString(),
  },
];

export async function GET() {
  return NextResponse.json({ data: agents });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const newAgent = {
      id: String(Date.now()),
      name: body.name || 'وكيل جديد',
      type: body.type || 'general_agent',
      description: body.description || '',
      systemPrompt: body.systemPrompt || 'أنت مساعد ذكي. أجب بالعربية.',
      isActive: true,
      provider: body.provider || 'pollinations',
      model: body.model || 'openai',
      createdAt: new Date().toISOString(),
    };
    agents.push(newAgent);
    return NextResponse.json({ data: newAgent }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'فشل إنشاء الوكيل' }, { status: 500 });
  }
}
