import { NextRequest, NextResponse } from 'next/server';
import { getAdAccounts, getAdAccountCampaigns } from '@/lib/social/facebook';
import { requireAuth, facebookUrl } from '@/lib/auth-utils';

async function fetchInsights(fbId: string) {
  try {
    const url = facebookUrl(`${fbId}/insights`, {
      fields: 'impressions,clicks,spend,ctr,cpc',
      date_preset: 'last_30d'
    });
    const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
    const data = await res.json();
    return data.data?.[0] || null;
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest, { params }: { params: { platform: string } }) {
  const { error } = await requireAuth(req);
  if (error) return error;
  try {
    const { platform } = params;

    if (platform === 'facebook' || platform === 'instagram') {
      const adAccounts = await getAdAccounts();
      let totalImpressions = 0;
      let totalClicks = 0;
      let totalSpend = 0;
      let count = 0;

      for (const acc of adAccounts) {
        const campaigns = await getAdAccountCampaigns(acc.account_id).catch(() => [] as any[]);
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

      return NextResponse.json({
        data: {
          platform,
          totalImpressions,
          totalClicks,
          totalSpend,
          ctr: totalImpressions > 0 ? parseFloat(((totalClicks / totalImpressions) * 100).toFixed(2)) : 0,
          cpc: totalClicks > 0 ? parseFloat((totalSpend / totalClicks).toFixed(2)) : 0,
          campaignCount: count,
        },
      });
    }

    return NextResponse.json({
      data: { platform, totalImpressions: 0, totalClicks: 0, totalSpend: 0, ctr: 0, cpc: 0, campaignCount: 0 },
    });
  } catch {
    return NextResponse.json({ error: 'فشل جلب تحليلات المنصة' }, { status: 500 });
  }
}
