import { NextRequest, NextResponse } from 'next/server';

let whatsappConfig: any = null;

export async function GET() {
  return NextResponse.json({ data: whatsappConfig || null });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { instanceName, phoneNumber } = body;

    whatsappConfig = {
      id: 'whatsapp-1',
      platform: 'whatsapp',
      platformAccountId: instanceName || 'marketron',
      platformAccountName: phoneNumber || 'WhatsApp Business',
      status: 'connected',
      instanceName: instanceName || 'marketron',
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json({ data: whatsappConfig });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'فشل الاتصال بالواتساب' }, { status: 500 });
  }
}
