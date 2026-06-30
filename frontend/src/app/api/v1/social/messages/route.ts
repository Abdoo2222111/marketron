import { NextRequest, NextResponse } from 'next/server';
import { getFacebookPages, getFacebookPageByToken, getPageConversations, getConversationMessages } from '@/lib/social/facebook';

export async function GET(req: NextRequest) {
  try {
    let pages = await getFacebookPages();
    if (pages.length === 0) {
      const page = await getFacebookPageByToken();
      if (page) pages = [page];
    }
    if (pages.length === 0) {
      return NextResponse.json({ messages: [] });
    }

    const allMessages: any[] = [];
    for (const page of pages) {
      try {
        const convs = await getPageConversations(page.id, page.access_token);
        for (const conv of convs.slice(0, 10)) {
          try {
            const msgs = await getConversationMessages(conv.id, page.access_token);
            for (const msg of msgs) {
              allMessages.push({
                id: msg.id,
                inboxId: page.id,
                platform: 'messenger',
                direction: msg.from?.id === page.id ? 'outbound' : 'inbound',
                status: conv.is_unread && msg.from?.id !== page.id ? 'unread' : 'read',
                senderName: msg.from?.name || 'عميل',
                senderId: msg.from?.id || 'unknown',
                phoneNumber: null,
                messageText: msg.message || '(رسالة وسائط)',
                mediaUrl: msg.attachments?.data?.[0]?.image_data?.url || msg.attachments?.data?.[0]?.file_url || null,
                replyFromAi: false,
                aiReplyText: null,
                createdAt: msg.created_time,
                inbox: { name: page.name, platform: 'messenger' },
              });
            }
          } catch {}
        }
      } catch {}
    }

    return NextResponse.json({
      messages: allMessages.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    });
  } catch {
    return NextResponse.json({ messages: [] });
  }
}
