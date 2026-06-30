import { NextResponse } from 'next/server';

export async function GET() {
  const appId = process.env.FACEBOOK_APP_ID || '936327389917393';
  const redirectUri = process.env.FACEBOOK_REDIRECT_URI || 'https://azizmedia.site/api/v1/platforms/facebook/callback';
  const url = `https://www.facebook.com/v22.0/dialog/oauth?client_id=${appId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=pages_messaging,pages_manage_metadata,pages_read_engagement,pages_show_list,ads_management,ads_read,business_management`;

  return NextResponse.json({ data: { url } });
}
