import { NextRequest, NextResponse } from 'next/server';
import { getFacebookPages } from '@/lib/social/facebook';
import { requireAuth } from '@/lib/auth-utils';

export async function GET(req: NextRequest) {
  const { error } = await requireAuth(req);
  if (error) return error;
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
    }));
    return NextResponse.json({ data: inboxes });
  } catch {
    return NextResponse.json({ error: 'فشل جلب البريد الوارد' }, { status: 500 });
  }
}
