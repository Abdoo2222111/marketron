import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, facebookUrl } from '@/lib/auth-utils';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const { error } = await requireAuth(req);
  if (error) return error;
  const fbId = params.id.replace('fb_', '');

  try {
    const url = facebookUrl(fbId);
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'PAUSED' }),
      signal: AbortSignal.timeout(10000),
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error.message);
    return NextResponse.json({ data: { id: params.id, status: 'paused' } });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'فشل إيقاف الحملة' }, { status: 500 });
  }
}
