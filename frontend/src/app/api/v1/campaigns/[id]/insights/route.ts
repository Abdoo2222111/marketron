import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, facebookUrl } from '@/lib/auth-utils';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const { error } = await requireAuth(req);
  if (error) return error;

  const fbId = params.id.replace('fb_', '');

  try {
    const url = facebookUrl(`${fbId}/insights`, {
      fields: 'impressions,clicks,spend,ctr,cpc,reach,frequency',
      date_preset: 'last_30d',
    });
    const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
    const data = await res.json();
    const i = data.data?.[0] || {};

    const impressions = parseInt(i.impressions || '0');
    const clicks = parseInt(i.clicks || '0');
    const spend = parseFloat(i.spend || '0');

    return NextResponse.json({
      data: {
        id: params.id,
        campaignId: params.id,
        impressions,
        clicks,
        spent: spend,
        ctr: parseFloat(i.ctr || '0'),
        cpc: parseFloat(i.cpc || '0'),
        cpm: impressions > 0 ? parseFloat(((spend / impressions) * 1000).toFixed(2)) : 0,
        reach: parseInt(i.reach || '0'),
        frequency: parseFloat(i.frequency || '0'),
        updatedAt: new Date().toISOString(),
      },
    });
  } catch {
    return NextResponse.json({ error: 'Failed to load campaign insights' }, { status: 500 });
  }
}