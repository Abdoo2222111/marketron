import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAccessToken } from '@/lib/auth-utils';

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
    const providers = await prisma.aiProvider.findMany({ where: { userId: payload.userId } });
    return NextResponse.json({ success: true, data: providers });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
