import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, facebookUrl } from '@/lib/auth-utils';

export async function GET(req: NextRequest) {
  const { error } = await requireAuth(req);
  if (error) return error;

  try {
    const fbUrl = facebookUrl('me/conversations', {
      fields: 'id,participants{messaging_actor{id,name,username}},messages.limit(1){message,from,created_time},updated_time',
      limit: '20',
    });
    const res = await fetch(fbUrl, { signal: AbortSignal.timeout(10000) });
    const data = await res.json();

    if (data.error) {
      return NextResponse.json({ error: data.error.message }, { status: 400 });
    }

    const messages = (data.data || []).map((conv: any) => {
      const lastMsg = conv.messages?.data?.[0] || {};
      const actor = conv.participants?.data?.find((p: any) => p.messaging_actor?.id !== 'me');
      return {
        id: conv.id,
        conversationId: conv.id,
        senderName: actor?.messaging_actor?.name || actor?.messaging_actor?.username || 'عميل',
        senderId: actor?.messaging_actor?.id || null,
        content: lastMsg.message || '',
        timestamp: lastMsg.created_time || conv.updated_time,
        platform: 'messenger',
        unread: false,
      };
    });

    return NextResponse.json({ messages, total: data.data?.length || 0 });
  } catch {
    return NextResponse.json({ messages: [], total: 0 });
  }
}