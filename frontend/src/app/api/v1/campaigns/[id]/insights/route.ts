import { NextRequest, NextResponse } from 'next/server';
import { getCampaigns } from '@/lib/data-store';

interface FBInsight {
  impressions?: string;
  clicks?: string;
  spend?: string;
  ctr?: string;
  cpc?: string;
  date_start?: string;
  date_stop?: string;
}

async function fetchFBInsights(fbId: string): Promise<FBInsight[] | null> {
  const token = process.env.FACEBOOK_PAGE_ACCESS_TOKEN || process.env.NEXT_PUBLIC_FACEBOOK_TOKEN || '';
  if (!token) return null;
  try {
    const url = `https://graph.facebook.com/v22.0/${fbId}/insights?fields=impressions,clicks,spend,ctr,cpc&date_preset=last_30d&access_token=${token}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
    const data = await res.json();
    return data.data || null;
  } catch {
    return null;
  }
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const campaign = getCampaigns().find(c => c.id === params.id);
  if (!campaign) {
    return NextResponse.json({ error: 'الحملة غير موجودة' }, { status: 404 });
  }

  let impressions = campaign.impressions || 0;
  let clicks = campaign.clicks || 0;
  let conversions = campaign.conversions || 0;
  let spent = campaign.spent || 0;
  let ctr = campaign.ctr || 0;
  let cpc = campaign.cpc || 0;

  if ((campaign as any).fbId) {
    const fbData = await fetchFBInsights((campaign as any).fbId);
    if (fbData && fbData.length > 0) {
      impressions = parseInt(fbData[0].impressions || '0');
      clicks = parseInt(fbData[0].clicks || '0');
      spent = parseFloat(fbData[0].spend || '0');
      ctr = parseFloat(fbData[0].ctr || '0');
      cpc = parseFloat(fbData[0].cpc || '0');
    }
  }

  const insights = {
    id: params.id,
    campaignId: params.id,
    impressions,
    clicks,
    conversions,
    spent,
    ctr,
    cpc,
    cpm: spent > 0 && impressions > 0 ? ((spent / impressions) * 1000).toFixed(2) : 0,
    frequency: impressions > 0 ? Math.max(1, +(impressions / Math.max(1, impressions / 1.5)).toFixed(1)) : 1.5,
    reach: Math.floor(impressions / 1.5),
    costPerConversion: conversions > 0 ? (spent / conversions).toFixed(2) : 0,
    dailyBreakdown: [],
    platformBreakdown: [],
    updatedAt: new Date().toISOString(),
  };

  return NextResponse.json({ data: insights });
}
