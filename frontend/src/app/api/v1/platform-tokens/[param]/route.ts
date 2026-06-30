import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAccessToken } from '@/lib/auth-utils';

export async function PUT(req: NextRequest, { params }: { params: { param: string } }) {
  const auth = req.headers.get('authorization');
  if (!auth?.startsWith('Bearer ')) {
    return NextResponse.json({ success: false, error: 'مطلوب توثيق' }, { status: 401 });
  }
  const payload = verifyAccessToken(auth.slice(7));
  if (!payload) {
    return NextResponse.json({ success: false, error: 'توكن غير صالح' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const platform = params.param;
    const token = await prisma.platformToken.upsert({
      where: { userId_platform: { userId: payload.userId, platform } },
      update: {
        accessToken: body.accessToken,
        refreshToken: body.refreshToken,
        label: body.label,
        status: 'active',
      },
      create: {
        platform,
        accessToken: body.accessToken,
        refreshToken: body.refreshToken,
        label: body.label,
        userId: payload.userId,
      },
    });
    return NextResponse.json({ success: true, data: token });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { param: string } }) {
  const auth = req.headers.get('authorization');
  if (!auth?.startsWith('Bearer ')) {
    return NextResponse.json({ success: false, error: 'مطلوب توثيق' }, { status: 401 });
  }
  const payload = verifyAccessToken(auth.slice(7));
  if (!payload) {
    return NextResponse.json({ success: false, error: 'توكن غير صالح' }, { status: 401 });
  }

  try {
    const id = params.param;
    await prisma.platformToken.deleteMany({ where: { id, userId: payload.userId } });
    return NextResponse.json({ success: true, message: 'تم الحذف' });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
