import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, facebookUrl } from '@/lib/auth-utils';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const { error } = await requireAuth(req);
  if (error) return error;
  try {
    const fbId = params.id.replace('fb_', '');
    const url = facebookUrl(fbId, {
      fields: 'id,name,status,objective,daily_budget,lifetime_budget,created_time,updated_time'
    });
    const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
    const c = await res.json();

    if (!c.id) return NextResponse.json({ error: 'الحملة غير موجودة' }, { status: 404 });

    return NextResponse.json({
      data: {
        id: `fb_${c.id}`,
        name: c.name,
        platform: 'facebook',
        status: c.status?.toLowerCase() || 'unknown',
        budget: parseInt(c.daily_budget || c.lifetime_budget || '0') / 100,
        startDate: c.created_time,
        objective: c.objective,
        fbId: c.id,
      },
    });
  } catch {
    return NextResponse.json({ error: 'فشل جلب الحملة' }, { status: 500 });
  }
}
