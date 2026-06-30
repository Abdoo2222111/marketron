import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAccessToken } from '@/lib/auth-utils';

export async function POST(req: NextRequest, { params }: { params: { param: string } }) {
  const auth = req.headers.get('authorization');
  if (!auth?.startsWith('Bearer ')) {
    return NextResponse.json({ success: false, error: 'مطلوب توثيق' }, { status: 401 });
  }
  const payload = verifyAccessToken(auth.slice(7));
  if (!payload) {
    return NextResponse.json({ success: false, error: 'توكن غير صالح' }, { status: 401 });
  }

  try {
    const platform = params.param;
    const token = await prisma.platformToken.findUnique({
      where: { userId_platform: { userId: payload.userId, platform } },
    });

    if (!token) {
      return NextResponse.json({ success: false, error: 'التوكن غير موجود' }, { status: 404 });
    }

    if (platform === 'facebook') {
      const res = await fetch(`https://graph.facebook.com/v18.0/me?access_token=${token.accessToken}&fields=id,name`);
      if (!res.ok) {
        return NextResponse.json({ success: true, data: { valid: false, error: 'التوكن غير صالح أو منتهي' } });
      }
      const data = await res.json();
      return NextResponse.json({
        success: true,
        data: { valid: true, userId: data.id, userName: data.name, permissions: [] },
      });
    }

    return NextResponse.json({ success: true, data: { valid: true } });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
