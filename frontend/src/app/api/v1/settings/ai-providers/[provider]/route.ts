import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAccessToken } from '@/lib/auth-utils';

export async function PUT(req: NextRequest, { params }: { params: { provider: string } }) {
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
    const provider = params.provider;
    const record = await prisma.aiProvider.upsert({
      where: { userId_provider: { userId: payload.userId, provider } },
      update: {
        apiKey: body.apiKey,
        baseUrl: body.baseUrl,
        defaultModel: body.defaultModel,
        isActive: body.isActive ?? true,
      },
      create: {
        provider,
        apiKey: body.apiKey,
        baseUrl: body.baseUrl,
        defaultModel: body.defaultModel,
        isActive: body.isActive ?? true,
        userId: payload.userId,
      },
    });
    return NextResponse.json({ success: true, data: record });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { provider: string } }) {
  const auth = req.headers.get('authorization');
  if (!auth?.startsWith('Bearer ')) {
    return NextResponse.json({ success: false, error: 'مطلوب توثيق' }, { status: 401 });
  }
  const payload = verifyAccessToken(auth.slice(7));
  if (!payload) {
    return NextResponse.json({ success: false, error: 'توكن غير صالح' }, { status: 401 });
  }

  try {
    const provider = params.provider;
    await prisma.aiProvider.deleteMany({ where: { provider, userId: payload.userId } });
    return NextResponse.json({ success: true, message: 'تم الحذف' });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
