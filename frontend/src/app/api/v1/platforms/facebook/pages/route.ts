import { NextResponse } from 'next/server';
import { getFacebookPages, getFacebookPageByToken } from '@/lib/social/facebook';

export async function GET() {
  try {
    let pages = await getFacebookPages();

    if (pages.length === 0) {
      const page = await getFacebookPageByToken();
      if (page) pages = [page];
    }

    return NextResponse.json({
      data: pages.map(p => ({
        id: p.id,
        name: p.name,
        accessToken: p.access_token,
        category: p.category,
        picture: p.picture,
        followersCount: p.followers_count,
      })),
    });
  } catch (e: any) {
    const msg = e.message || '';
    if (msg.includes('expired') || msg.includes('Session has expired')) {
      return NextResponse.json({
        data: [],
        error: 'رمز فيسبوك منتهي الصلاحية. الرجاء الحصول على رمز جديد من Facebook Graph API Explorer أو ربط الحساب مجدداً.',
        expired: true,
      });
    }
    return NextResponse.json({ data: [], error: msg });
  }
}
