import { NextRequest, NextResponse } from 'next/server';
import { sendTextMessage, getConnectionState } from '@/lib/evolution-api';
import { requireAuth } from '@/lib/auth-utils';

export async function POST(req: NextRequest) {
  const { error } = await requireAuth(req);
  if (error) return error;
  try {
    const body = await req.json();
    const { recipientId, text } = body;

    if (!recipientId || !text) {
      return NextResponse.json({ error: 'الرجاء إدخال رقم المستلم ونص الرسالة' }, { status: 400 });
    }

    const state = await getConnectionState();
    if (state !== 'open') {
      return NextResponse.json({ error: 'الواتساب غير متصل. يرجى مسح QR code أولاً' }, { status: 400 });
    }

    let number = recipientId.replace(/[^0-9]/g, '');
    if (!number.startsWith('2') && !number.startsWith('966') && !number.startsWith('+')) {
      number = `966${number}`;
    }

    const result = await sendTextMessage(number, text);

    if (!result.ok) {
      return NextResponse.json({ error: result.data?.message || 'فشل إرسال الرسالة' }, { status: 500 });
    }

    return NextResponse.json({
      data: {
        id: result.data?.key?.id || `msg_${Date.now()}`,
        platform: 'whatsapp',
        direction: 'outbound',
        status: 'sent',
        recipientId: number,
        messageText: text,
        createdAt: new Date().toISOString(),
      },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'فشل إرسال الرسالة' }, { status: 500 });
  }
}
