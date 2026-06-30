import { NextRequest, NextResponse } from 'next/server';
import { getCampaigns, addCampaign } from '@/lib/data-store';
import { getAdAccounts, getAdAccountCampaigns } from '@/lib/social/facebook';

let nextId = 4;

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const status = searchParams.get('status');
  const platform = searchParams.get('platform');
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '50');

  let campaigns = [...getCampaigns()];

  try {
    const adAccounts = await getAdAccounts();
    if (adAccounts.length > 0) {
      const fbPromises = adAccounts.map(acc => getAdAccountCampaigns(acc.account_id).catch(() => [] as any[]));
      const fbResults = await Promise.all(fbPromises);
      const fbCampaigns = fbResults.flat().map((c: any) => ({
        id: `fb_${c.id}`,
        name: c.name,
        platform: 'facebook',
        pageId: null,
        status: c.status?.toLowerCase() || 'unknown',
        budget: parseInt(c.daily_budget || c.lifetime_budget || '0') / 100,
        spent: 0,
        impressions: 0,
        clicks: 0,
        conversions: 0,
        ctr: 0,
        cpc: 0,
        startDate: c.created_time,
        endDate: null,
        description: '',
        objective: c.objective,
        fbId: c.id,
        createdAt: c.created_time,
      }));
      campaigns = [...fbCampaigns, ...campaigns];
    }
  } catch {}

  if (status) campaigns = campaigns.filter(c => c.status === status);
  if (platform) campaigns = campaigns.filter(c => c.platform === platform);

  const start = (page - 1) * limit;
  const paged = campaigns.slice(start, start + limit);

  return NextResponse.json({ data: paged });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const campaign = {
      id: String(nextId++),
      name: body.name || 'حملة جديدة',
      platform: body.platform || 'facebook',
      pageId: body.pageId || null,
      status: body.status || 'draft',
      budget: body.budget || 0,
      spent: 0,
      impressions: 0,
      clicks: 0,
      conversions: 0,
      ctr: 0,
      cpc: 0,
      startDate: body.startDate || new Date().toISOString(),
      endDate: body.endDate || null,
      description: body.description || '',
      createdAt: new Date().toISOString(),
    };
    addCampaign(campaign);
    return NextResponse.json({ data: campaign, success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'فشل إنشاء الحملة' }, { status: 500 });
  }
}
