import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, facebookUrl } from '@/lib/auth-utils';

export async function GET(req: NextRequest) {
  const { error } = await requireAuth(req);
  if (error) return error;

  try {
    const url = facebookUrl('me/accounts', { fields: 'id,name,username,access_token,picture' });
    const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
    const data = await res.json();

    if (data.error) {
      return NextResponse.json({ error: data.error.message }, { status: 400 });
    }

    const pages = (data.data || []).map((p: any) => ({
      id: p.id,
      name: p.name,
      username: p.username || null,
      picture: p.picture?.data?.url || null,
    }));

    return NextResponse.json({ data: pages });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}