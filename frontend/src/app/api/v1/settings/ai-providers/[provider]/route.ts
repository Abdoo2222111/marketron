import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-utils';

export async function PUT(req: NextRequest, { params }: { params: { provider: string } }) {
  const { error, user } = await requireAuth(req);
  if (error) return error;
  const u = user!;

  try {
    const body = await req.json();
    const record = await prisma.aiProvider.upsert({
      where: { userId_provider: { userId: u.userId, provider: params.provider } },
      update: {
        apiKey: body.apiKey,
        baseUrl: body.baseUrl,
        defaultModel: body.defaultModel,
        isActive: body.isActive ?? true,
      },
      create: {
        provider: params.provider,
        apiKey: body.apiKey,
        baseUrl: body.baseUrl,
        defaultModel: body.defaultModel,
        isActive: body.isActive ?? true,
        userId: u.userId,
      },
      select: { id: true, provider: true, isActive: true, defaultModel: true, createdAt: true },
    });
    return NextResponse.json({ success: true, data: record });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { provider: string } }) {
  const { error, user } = await requireAuth(req);
  if (error) return error;
  const u = user!;

  try {
    await prisma.aiProvider.deleteMany({ where: { provider: params.provider, userId: u.userId } });
    return NextResponse.json({ success: true, message: 'تم الحذف' });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}