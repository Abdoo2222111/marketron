import { NextRequest, NextResponse } from 'next/server';
import { getFacebookPages, getFacebookPageByToken, validateFacebookPageAccessToken } from '@/lib/social/facebook';

let connectedPages: any[] = [];

export async function GET() {
  return NextResponse.json({ data: connectedPages });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { accessToken, pageId } = body;

    if (!accessToken || !accessToken.trim()) {
      return NextResponse.json({ error: 'الرجاء إدخال رمز الوصول (Page Access Token)' }, { status: 400 });
    }

    let page = null;

    if (pageId) {
      page = await validateFacebookPageAccessToken(pageId, accessToken);
    }

    if (!page) {
      page = await getFacebookPageByToken(accessToken);
    }

    if (!page) {
      const pages = await getFacebookPages(accessToken);
      page = pageId ? pages.find(p => p.id === pageId) : pages[0];
    }

    if (!page) {
      return NextResponse.json({ error: 'لا توجد صفحة فيسبوك متاحة. تأكد من صحة الـ Page Access Token.' }, { status: 400 });
    }

    const existing = connectedPages.findIndex(p => p.id === page.id);
    const entry = {
      id: page.id,
      platform: 'facebook',
      platformAccountId: page.id,
      platformAccountName: page.name,
      status: 'connected',
      accessToken: page.access_token,
      createdAt: new Date().toISOString(),
    };

    if (existing >= 0) {
      connectedPages[existing] = entry;
    } else {
      connectedPages.push(entry);
    }

    return NextResponse.json({ data: entry });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'فشل الاتصال بالفيسبوك' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const platform = req.nextUrl.searchParams.get('platform') || 'facebook';
  connectedPages = [];
  return NextResponse.json({ data: { success: true } });
}
