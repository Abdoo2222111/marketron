import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth, sanitizeUser } from '@/lib/auth-utils';

export async function GET(req: NextRequest) {
  const { error, user } = await requireAuth(req);
  if (error) return error;

  try {
    const u = user!;
    const dbUser = await prisma.user.findUnique({ where: { id: u.userId } });
    if (!dbUser) {
      return NextResponse.json({ success: false, error: 'المستخدم غير موجود' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: sanitizeUser(dbUser) });
  } catch {
    return NextResponse.json({ success: false, error: 'فشل جلب الملف الشخصي' }, { status: 500 });
  }
}