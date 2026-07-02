import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-utils';

export async function GET(req: NextRequest) {
  const { error, user } = await requireAuth(req);
  if (error) return error;
  const u = user!;
  try {
    const tokens = await prisma.platformToken.findMany({ where: { userId: u.userId } });
    const sanitized = tokens.map(({ accessToken, ...rest }) => rest);
    return NextResponse.json({ success: true, data: sanitized });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
