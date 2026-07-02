import { NextRequest, NextResponse } from 'next/server';
import { getAdAccounts, getAdAccountCampaigns } from '@/lib/social/facebook';
import { requireAuth } from '@/lib/auth-utils';

export async function GET(req: NextRequest) {
  const { error } = await requireAuth(req);
  if (error) return error;
  try {
    const adAccounts = await getAdAccounts();
    let total = 0, active = 0, paused = 0;

    for (const acc of adAccounts) {
      const campaigns = await getAdAccountCampaigns(acc.account_id).catch(() => [] as any[]);
      total += campaigns.length;
      active += campaigns.filter((c: any) => c.status === 'ACTIVE').length;
      paused += campaigns.filter((c: any) => c.status === 'PAUSED').length;
    }

    return NextResponse.json({ data: { total, active, paused } });
  } catch {
    return NextResponse.json({ error: 'فشل جلب إحصائيات الحملات' }, { status: 500 });
  }
}
