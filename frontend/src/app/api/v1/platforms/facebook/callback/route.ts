import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const errorReason = searchParams.get('error_reason');

  if (error || errorReason) {
    const redirectUrl = new URL('/dashboard/settings', req.url);
    redirectUrl.searchParams.set('fb_error', errorReason || error || 'رفض الإذن');
    return NextResponse.redirect(redirectUrl);
  }

  if (!code) {
    const redirectUrl = new URL('/dashboard/settings', req.url);
    redirectUrl.searchParams.set('fb_error', 'لم يتم استلام رمز التفعيل');
    return NextResponse.redirect(redirectUrl);
  }

  const appId = process.env.FACEBOOK_APP_ID;
  const appSecret = process.env.FACEBOOK_APP_SECRET;

  if (!appId || !appSecret) {
    const redirectUrl = new URL('/dashboard/settings', req.url);
    redirectUrl.searchParams.set('fb_error', 'FACEBOOK_APP_ID أو FACEBOOK_APP_SECRET غير مُهيئين');
    return NextResponse.redirect(redirectUrl);
  }

  try {
    const redirectUri = process.env.FACEBOOK_REDIRECT_URI || `${req.nextUrl.origin}/api/v1/platforms/facebook/callback`;

    const res = await fetch(
      `https://graph.facebook.com/v22.0/oauth/access_token?client_id=${appId}&redirect_uri=${encodeURIComponent(redirectUri)}&client_secret=${appSecret}&code=${code}`,
      { signal: AbortSignal.timeout(15000) }
    );

    const data = await res.json();

    if (!res.ok || data.error) {
      const redirectUrl = new URL('/dashboard/settings', req.url);
      redirectUrl.searchParams.set('fb_error', data.error?.message || 'فشل تبادل رمز التفعيل');
      return NextResponse.redirect(redirectUrl);
    }

    const redirectUrl = new URL('/dashboard/settings', req.url);
    redirectUrl.searchParams.set('fb_success', 'true');
    redirectUrl.searchParams.set('fb_token', data.access_token);
    redirectUrl.searchParams.set('fb_expires', String(data.expires_in || 0));
    return NextResponse.redirect(redirectUrl);
  } catch (e: any) {
    const redirectUrl = new URL('/dashboard/settings', req.url);
    redirectUrl.searchParams.set('fb_error', e.message || 'خطأ في الاتصال بفيسبوك');
    return NextResponse.redirect(redirectUrl);
  }
}
