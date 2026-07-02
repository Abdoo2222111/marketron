import { NextRequest, NextResponse } from 'next/server';
import { getAdAccounts, getAdAccountCampaigns } from '@/lib/social/facebook';
import { requireAuth } from '@/lib/auth-utils';

export async function GET(req: NextRequest) {
  const { error } = await requireAuth(req);
  if (error) return error;

  const { searchParams } = req.nextUrl;
  const status = searchParams.get('status');
  const platform = searchParams.get('platform');

  try {
    const adAccounts = await getAdAccounts();
    let campaigns: any[] = [];

    for (const acc of adAccounts) {
      const fbCampaigns = await getAdAccountCampaigns(acc.account_id).catch(() => [] as any[]);
      for (const c of fbCampaigns) {
        campaigns.push({
          id: `fb_${c.id}`,
          name: c.name,
          platform: 'facebook',
          status: c.status?.toLowerCase() || 'unknown',
          budget: parseInt(c.daily_budget || c.lifetime_budget || '0') / 100,
          startDate: c.created_time,
          objective: c.objective,
          fbId: c.id,
          createdAt: c.created_time,
        });
      }
    }

    if (status) campaigns = campaigns.filter(c => c.status === status);
    if (platform) campaigns = campaigns.filter(c => c.platform === platform);

    return NextResponse.json({ data: campaigns });
  } catch {
    return NextResponse.json({ error: 'Failed to load campaigns' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { error } = await requireAuth(req);
  if (error) return error;

  try {
    const body = await req.json();

    const id = `draft_${Date.now()}`;
    const campaign = {
      id,
      name: body.name || 'حملة جديدة',
      platform: body.platform || 'facebook',
      status: 'draft',
      budget: parseFloat(body.budget) || 0,
      spent: 0,
      impressions: 0,
      clicks: 0,
      conversions: 0,
      ctr: 0,
      cpc: 0,
      objective: body.objective || '',
      dailyBudget: parseFloat(body.dailyBudget) || 0,
      startDate: body.startDate || null,
      endDate: body.endDate || null,
      targetCountry: body.targetCountry || '',
      targetAgeMin: parseInt(body.targetAgeMin) || 0,
      targetAgeMax: parseInt(body.targetAgeMax) || 0,
      targetGender: body.targetGender || 'all',
      interests: body.interests || [],
      adCreative: body.adCreative || null,
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json({ data: campaign, message: 'تم إنشاء الحملة كمسودة. سيتم تفعيل النشر على فيسبوك قريباً.' });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'فشل إنشاء الحملة' }, { status: 500 });
  }
}