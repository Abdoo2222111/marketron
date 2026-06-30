import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAccessToken, sanitizeUser } from '@/lib/auth-utils';

export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization');
  if (!auth?.startsWith('Bearer ')) {
    return NextResponse.json({ success: false, error: 'مطلوب توثيق' }, { status: 401 });
  }
  const payload = verifyAccessToken(auth.slice(7));
  if (!payload) {
    return NextResponse.json({ success: false, error: 'توكن غير صالح' }, { status: 401 });
  }
  try {
    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user) return NextResponse.json({ success: false, error: 'المستخدم غير موجود' }, { status: 404 });
    return NextResponse.json({ success: true, data: sanitizeUser(user) });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
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
    const user = await prisma.user.update({
      where: { id: payload.userId },
      data: {
        name: body.name,
        phone: body.phone,
        company: body.company,
        currency: body.currency,
      },
    });
    return NextResponse.json({ success: true, data: sanitizeUser(user), message: 'تم التحديث' });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
