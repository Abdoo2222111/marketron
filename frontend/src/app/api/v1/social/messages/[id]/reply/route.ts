import { NextRequest, NextResponse } from 'next/server';
import { sendFacebookReply, getFacebookPages, getFacebookPageByToken } from '@/lib/social/facebook';
import { requireAuth } from '@/lib/auth-utils';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { error } = await requireAuth(req);
  if (error) return error;
  try {
    const body = await req.json();
    const { text } = body;

    if (!text || !text.trim()) {
      return NextResponse.json({ error: 'الرجاء إدخال نص الرد' }, { status: 400 });
    }

    const conversationId = params.id;
    let pages = await getFacebookPages();
    if (pages.length === 0) {
      const page = await getFacebookPageByToken();
      if (page) pages = [page];
    }

    if (pages.length === 0) {
      return NextResponse.json({ error: 'لا توجد صفحات فيسبوك متصلة' }, { status: 400 });
    }

    const result = await sendFacebookReply(conversationId, text, pages[0].access_token);

    return NextResponse.json({
      data: {
        id: result.message_id,
        inboxId: pages[0].id,
        platform: 'messenger',
        direction: 'outbound',
        status: 'sent',
        senderName: pages[0].name,
        senderId: pages[0].id,
        messageText: text,
        createdAt: new Date().toISOString(),
      },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'فشل إرسال الرد' }, { status: 500 });
  }
}
