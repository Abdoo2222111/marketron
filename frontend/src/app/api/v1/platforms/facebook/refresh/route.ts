import { NextRequest, NextResponse } from 'next/server';
import { getFacebookPages } from '@/lib/social/facebook';
import { requireAuth } from '@/lib/auth-utils';

export async function POST(req: NextRequest) {
  const { error } = await requireAuth(req);
  if (error) return error;
  try {
    const appId = process.env.FACEBOOK_APP_ID;
    const appSecret = process.env.FACEBOOK_APP_SECRET;
    const currentToken = process.env.FACEBOOK_PAGE_ACCESS_TOKEN || process.env.NEXT_PUBLIC_FACEBOOK_TOKEN;

    if (!appId || !appSecret) {
      return NextResponse.json({
        error: 'FACEBOOK_APP_ID و FACEBOOK_APP_SECRET غير مُهيئين. استخدم رمز الوصول (Page Access Token) يدوياً.',
        useTokenInstead: true,
      }, { status: 400 });
    }

    if (!currentToken) {
      return NextResponse.json({ error: 'لا يوجد رمز فيسبوك للتحديث. اربط الحساب أولاً.' }, { status: 400 });
    }

    const res = await fetch(
      `https://graph.facebook.com/v22.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${appId}&client_secret=${appSecret}&fb_exchange_token=${currentToken}`,
      { signal: AbortSignal.timeout(15000) }
    );

    const data = await res.json();

    if (!res.ok || data.error) {
      return NextResponse.json({
        error: data.error?.message || 'فشل تحديث رمز فيسبوك. اربط الحساب مجدداً.',
      }, { status: 400 });
    }

    const pages = await getFacebookPages(data.access_token);

    return NextResponse.json({
      data: {
        expiresIn: data.expires_in,
        pages: pages.map(p => ({ id: p.id, name: p.name })),
        message: 'تم تحديث رمز فيسبوك بنجاح',
      },
    });
  } catch (e: any) {
    return NextResponse.json({
      error: e.message || 'فشل تحديث رمز فيسبوك. اربط الحساب مجدداً.',
    }, { status: 500 });
  }
}
