import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-utils';

export async function GET(req: NextRequest) {
  const { error, user } = await requireAuth(req);
  if (error) return error;

  try {
    const providers = await prisma.aiProvider.findMany({
      where: { userId: user!.userId },
      select: { id: true, provider: true, defaultModel: true, isActive: true, createdAt: true },
    });
    return NextResponse.json({ success: true, data: providers });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}