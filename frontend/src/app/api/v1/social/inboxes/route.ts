import { NextResponse } from 'next/server';
import { getFacebookPages } from '@/lib/social/facebook';

export async function GET() {
  try {
    const pages = await getFacebookPages();
    const inboxes = pages.map(p => ({
      id: p.id,
      name: p.name,
      platform: 'messenger',
      phoneNumber: null,
      platformAccountId: p.id,
      isActive: true,
      webhookToken: null,
      _count: { messages: 0 },
      whatsAppSessions: [],
    }));
    return NextResponse.json({ data: inboxes });
  } catch {
    return NextResponse.json({ data: [] });
  }
}
