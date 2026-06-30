import { NextRequest, NextResponse } from 'next/server';
import { getCampaigns, updateCampaign, deleteCampaign } from '@/lib/data-store';
import { getAdAccountCampaigns, getAdAccounts } from '@/lib/social/facebook';

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  let campaign = getCampaigns().find(c => c.id === params.id);
  if (campaign) {
    return NextResponse.json({ data: campaign });
  }

  if (params.id.startsWith('fb_')) {
    const fbId = params.id.replace('fb_', '');
    try {
      const adAccounts = await getAdAccounts();
      for (const acc of adAccounts) {
        const fbCampaigns = await getAdAccountCampaigns(acc.account_id).catch(() => [] as any[]);
        const found = fbCampaigns.find((c: any) => c.id === fbId);
        if (found) {
          campaign = {
            id: params.id,
            name: found.name,
            platform: 'facebook',
            status: found.status?.toLowerCase() || 'unknown',
            budget: parseInt(found.daily_budget || found.lifetime_budget || '0') / 100,
            spent: 0,
            impressions: 0,
            clicks: 0,
            conversions: 0,
            ctr: 0,
            cpc: 0,
            startDate: found.created_time,
            createdAt: found.created_time,
          };
          return NextResponse.json({ data: campaign });
        }
      }
    } catch {}
  }

  return NextResponse.json({ error: 'الحملة غير موجودة' }, { status: 404 });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const updated = updateCampaign(params.id, body);
    if (!updated) {
      return NextResponse.json({ error: 'الحملة غير موجودة' }, { status: 404 });
    }
    return NextResponse.json({ data: updated });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'فشل تحديث الحملة' }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!deleteCampaign(params.id)) {
    return NextResponse.json({ error: 'الحملة غير موجودة' }, { status: 404 });
  }
  return NextResponse.json({ data: { success: true } });
}
