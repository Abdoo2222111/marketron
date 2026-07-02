import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-utils';

export async function POST(req: NextRequest, { params }: { params: { platform: string } }) {
  const { error, user } = await requireAuth(req);
  if (error) return error;

  try {
    const conn = await prisma.platformConnection.findFirst({
      where: { userId: user!.userId, platform: params.platform },
    });

    if (!conn) {
      return NextResponse.json({ error: `${params.platform} غير مربوط` }, { status: 400 });
    }

    if (params.platform === 'whatsapp') {
      const evolutionUrl = process.env.WHATSAPP_EVOLUTION_API_URL;
      const apiKey = process.env.WHATSAPP_EVOLUTION_API_KEY;
      if (!evolutionUrl || !apiKey) {
        return NextResponse.json({ error: 'WhatsApp API not configured' }, { status: 500 });
      }

      const res = await fetch(`${evolutionUrl}/instance/connectionState/${conn.platformAccountId}`, {
        headers: { apikey: apiKey },
        signal: AbortSignal.timeout(5000),
      });
      const data = await res.json();
      const state = data?.instance?.state || null;
      const connected = state === 'open';

      await prisma.platformConnection.update({
        where: { id: conn.id },
        data: {
          status: connected ? 'connected' : 'disconnected',
        },
      });

      return NextResponse.json({
        data: {
          synced: connected,
          platform: 'whatsapp',
          status: state || 'disconnected',
          message: connected ? 'واتساب متصل' : 'واتساب غير متصل',
        },
      });
    }

    return NextResponse.json({
      data: { synced: true, platform: params.platform, message: 'تمت المزامنة' },
    });
  } catch (e) {
    return NextResponse.json({ error: 'فشلت المزامنة' }, { status: 500 });
  }
}