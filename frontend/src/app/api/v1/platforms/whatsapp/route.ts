import { NextRequest, NextResponse } from 'next/server';
import { getConnectionState, createInstance, logoutInstance, connectInstance } from '@/lib/evolution-api';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-utils';

export async function GET(req: NextRequest) {
  const { error } = await requireAuth(req);
  if (error) return error;
  try {
    const state = await getConnectionState();
    return NextResponse.json({ data: { instanceName: 'marketron', status: state || 'unknown' } });
  } catch {
    return NextResponse.json({ error: 'فشل جلب حالة الاتصال' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { error, user } = await requireAuth(req);
  if (error) return error;
  const u = user!;

  try {
    const body = await req.json();
    const { instanceName, phoneNumber } = body;
    const inst = instanceName || 'marketron';

    let state = await getConnectionState(inst);
    if (!state) {
      await createInstance(inst);
    }

    if (state === 'open') {
      await logoutInstance(inst);
      await new Promise(r => setTimeout(r, 1500));
    }

    const connectRes = await connectInstance(inst);
    const qrCode = connectRes.data?.qrcode?.code || connectRes.data?.qrcode?.base64 || connectRes.data?.qrcode || null;
    const newState = qrCode ? 'connecting' : (connectRes.ok ? 'disconnected' : 'error');

    await prisma.platformConnection.upsert({
      where: { platform_userId: { platform: 'whatsapp', userId: u.userId } },
      update: { platformAccountId: inst, platformAccountName: phoneNumber || 'WhatsApp Business', accessToken: inst, status: qrCode ? 'pending' : 'connected' },
      create: {
        userId: u.userId, platform: 'whatsapp', platformAccountId: inst,
        platformAccountName: phoneNumber || 'WhatsApp Business', accessToken: inst, status: qrCode ? 'pending' : 'connected',
      },
    });

    return NextResponse.json({
      data: {
        id: 'whatsapp-1',
        platform: 'whatsapp',
        platformAccountId: inst,
        platformAccountName: phoneNumber || 'WhatsApp Business',
        status: newState,
        instanceName: inst,
        qrCode,
        createdAt: new Date().toISOString(),
      },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'فشل الاتصال بالواتساب' }, { status: 500 });
  }
}
