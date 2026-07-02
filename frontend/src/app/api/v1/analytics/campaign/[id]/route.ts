import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, facebookUrl } from '@/lib/auth-utils';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const { error } = await requireAuth(req);
  if (error) return error;
  try {
    const { id } = params;
    const url = facebookUrl(`${id}/insights`, {
      fields: 'impressions,clicks,spend,ctr,cpc,cpp,reach,frequency',
      date_preset: 'last_30d'
    });
    const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
    const data = await res.json();

    if (!data.data?.[0]) {
      return NextResponse.json({
        data: { impressions: 0, clicks: 0, spend: 0, ctr: 0, cpc: 0, reach: 0, frequency: 0 },
      });
    }

    const i = data.data[0];
    return NextResponse.json({
      data: {
        impressions: parseInt(i.impressions || '0'),
        clicks: parseInt(i.clicks || '0'),
        spend: parseFloat(i.spend || '0'),
        ctr: parseFloat(i.ctr || '0'),
        cpc: parseFloat(i.cpc || '0'),
        reach: parseInt(i.reach || '0'),
        frequency: parseFloat(i.frequency || '0'),
      },
    });
  } catch {
    return NextResponse.json({ error: 'فشل جلب التحليلات' }, { status: 500 });
  }
}
