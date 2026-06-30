import { NextResponse } from 'next/server';

export async function GET() {
  const evolutionUrl = process.env.WHATSAPP_EVOLUTION_API_URL || '';
  if (!evolutionUrl) {
    return NextResponse.json({
      data: {
        qrCode: null,
        message: 'WhatsApp Evolution API غير مهيأ. تحتاج تشغل Docker حقت Evolution API.',
        instanceStatus: 'disconnected',
      },
    });
  }
  try {
    const res = await fetch(`${evolutionUrl}/instance/connect/marketron`, {
      signal: AbortSignal.timeout(10000),
    });
    const data = await res.json();
    return NextResponse.json({ data: { qrCode: data.qrcode?.code || null, instanceStatus: 'connecting' } });
  } catch {
    return NextResponse.json({ data: { qrCode: null, instanceStatus: 'unreachable', message: 'ماقدرتش أوصل لـ Evolution API' } });
  }
}
