import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-utils';

export async function PUT(req: NextRequest, { params }: { params: { param: string } }) {
  const { error, user } = await requireAuth(req);
  if (error) return error;
  const u = user!;

  try {
    const body = await req.json();
    const platform = params.param;
    const token = await prisma.platformToken.upsert({
      where: { userId_platform: { userId: u.userId, platform } },
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
        userId: u.userId,
      },
    });
    const { accessToken, ...sanitized } = token;
    return NextResponse.json({ success: true, data: sanitized });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { param: string } }) {
  const { error, user } = await requireAuth(req);
  if (error) return error;
  const u = user!;

  try {
    const id = params.param;
    await prisma.platformToken.deleteMany({ where: { id, userId: u.userId } });
    return NextResponse.json({ success: true, message: 'تم الحذف' });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
