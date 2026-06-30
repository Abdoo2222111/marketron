import { NextResponse } from 'next/server';
import { getCampaigns } from '@/lib/data-store';

export async function GET() {
  const campaigns = getCampaigns();
  const stats = {
    total: campaigns.length,
    active: campaigns.filter(c => c.status === 'active').length,
    paused: campaigns.filter(c => c.status === 'paused').length,
    draft: campaigns.filter(c => c.status === 'draft').length,
    totalSpend: campaigns.reduce((s, c) => s + (c.spent || 0), 0),
    totalImpressions: campaigns.reduce((s, c) => s + (c.impressions || 0), 0),
    totalClicks: campaigns.reduce((s, c) => s + (c.clicks || 0), 0),
    totalConversions: campaigns.reduce((s, c) => s + (c.conversions || 0), 0),
  };
  return NextResponse.json({ data: stats });
}
