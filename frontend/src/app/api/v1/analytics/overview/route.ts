import { NextRequest, NextResponse } from 'next/server';
import { getAdAccounts, getAdAccountCampaigns } from '@/lib/social/facebook';
import { requireAuth, facebookUrl } from '@/lib/auth-utils';

async function fetchInsights(fbId: string) {
  try {
    const url = facebookUrl(`${fbId}/insights`, {
      fields: 'impressions,clicks,spend,ctr,cpc,cpp',
      date_preset: 'last_30d',
    });
    const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
    const data = await res.json();
    return data.data?.[0] || null;
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const { error } = await requireAuth(req);
  if (error) return error;

  try {
    const adAccounts = await getAdAccounts();
    let totalImpressions = 0, totalClicks = 0, totalSpend = 0;
    let count = 0;

    for (const acc of adAccounts) {
      const campaigns = await getAdAccountCampaigns(acc.account_id).catch(() => []);
      for (const c of campaigns) {
        const insights = await fetchInsights(c.id);
        if (insights) {
          totalImpressions += parseInt(insights.impressions || '0');
          totalClicks += parseInt(insights.clicks || '0');
          totalSpend += parseFloat(insights.spend || '0');
          count++;
        }
      }
    }

    const ctr = count > 0 ? totalClicks / totalImpressions : 0;
    const cpc = totalClicks > 0 ? totalSpend / totalClicks : 0;

    return NextResponse.json({
      data: {
        totalImpressions,
        totalClicks,
        totalSpend,
        ctr: parseFloat(ctr.toFixed(4)),
        cpc: parseFloat(cpc.toFixed(2)),
      },
    });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to load analytics' }, { status: 500 });
  }
}