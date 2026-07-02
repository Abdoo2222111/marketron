import { NextRequest, NextResponse } from 'next/server';
import { getFacebookPages, getFacebookPageByToken, validateFacebookPageAccessToken } from '@/lib/social/facebook';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-utils';

export async function POST(req: NextRequest) {
  const { error, user } = await requireAuth(req);
  if (error) return error;
  const u = user!;

  try {
    const body = await req.json();
    const { accessToken, pageId } = body;

    if (!accessToken || !accessToken.trim()) {
      return NextResponse.json({ error: 'الرجاء إدخال رمز الوصول' }, { status: 400 });
    }

    let page = null;
    if (pageId) page = await validateFacebookPageAccessToken(pageId, accessToken);
    if (!page) page = await getFacebookPageByToken(accessToken);
    if (!page) {
      const pages = await getFacebookPages(accessToken);
      page = pageId ? pages.find(p => p.id === pageId) : pages[0];
    }
    if (!page) {
      return NextResponse.json({ error: 'لا توجد صفحة فيسبوك متاحة' }, { status: 400 });
    }

    await prisma.platformConnection.upsert({
      where: { platform_userId: { platform: 'facebook', userId: u.userId } },
      update: { platformAccountId: page.id, platformAccountName: page.name, accessToken: page.access_token, status: 'active' },
      create: { userId: u.userId, platform: 'facebook', platformAccountId: page.id, platformAccountName: page.name, accessToken: page.access_token, status: 'active' },
    });

    return NextResponse.json({
      data: { id: page.id, platform: 'facebook', platformAccountId: page.id, platformAccountName: page.name, status: 'active', createdAt: new Date().toISOString() },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'فشل الاتصال بالفيسبوك' }, { status: 500 });
  }
}
