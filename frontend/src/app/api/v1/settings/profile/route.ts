import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth, sanitizeUser } from '@/lib/auth-utils';

export async function GET(req: NextRequest) {
  const { error, user } = await requireAuth(req);
  if (error) return error;

  try {
    const u = user!;
    const dbUser = await prisma.user.findUnique({ where: { id: u.userId } });
    if (!dbUser) return NextResponse.json({ success: false, error: 'المستخدم غير موجود' }, { status: 404 });
    return NextResponse.json({ success: true, data: sanitizeUser(dbUser) });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const { error, user } = await requireAuth(req);
  if (error) return error;

  try {
    const u = user!;
    const body = await req.json();
    const dbUser = await prisma.user.update({
      where: { id: u.userId },
      data: {
        name: body.name,
        phone: body.phone,
        company: body.company,
        currency: body.currency,
      },
    });
    return NextResponse.json({ success: true, data: sanitizeUser(dbUser), message: 'تم التحديث' });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}