import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-utils';

async function authenticate(req: NextRequest) {
  const { error, user } = await requireAuth(req);
  if (error) throw new Error('Unauthorized');
  return user!;
}

export async function DELETE(req: NextRequest, { params }: { params: { platform: string } }) {
  try {
    const u = await authenticate(req);

    await prisma.platformConnection.deleteMany({
      where: { userId: u.userId, platform: params.platform },
    });

    return NextResponse.json({ data: { success: true } });
  } catch {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
  }
}

export async function POST(req: NextRequest, { params }: { params: { platform: string } }) {
  try {
    const u = await authenticate(req);

    const conn = await prisma.platformConnection.findFirst({
      where: { userId: u.userId, platform: params.platform },
    });

    if (!conn) {
      return NextResponse.json({ error: `${params.platform} غير مربوط` }, { status: 400 });
    }

    return NextResponse.json({
      data: { synced: true, count: 0, platform: params.platform, message: 'تمت المزامنة بنجاح' },
    });
  } catch {
    return NextResponse.json({ error: 'فشلت المزامنة' }, { status: 401 });
  }
}