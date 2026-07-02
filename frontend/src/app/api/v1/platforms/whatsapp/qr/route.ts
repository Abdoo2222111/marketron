import { NextRequest, NextResponse } from 'next/server';
import { getConnectionState, connectInstance, BASE_URL } from '@/lib/evolution-api';
import { requireAuth } from '@/lib/auth-utils';

export async function GET(req: NextRequest) {
  const { error } = await requireAuth(req);
  if (error) return error;
  const checkOnly = req.nextUrl.searchParams.get('checkonly') === 'true';

  if (!BASE_URL) {
    return NextResponse.json({
      data: { qrCode: null, instanceStatus: 'disconnected', message: 'WhatsApp Evolution API غير مهيأ' },
    });
  }

  try {
    const currentState = await getConnectionState();

    if (checkOnly) {
      return NextResponse.json({ data: { qrCode: null, instanceStatus: currentState || 'unknown' } });
    }

    if (currentState === 'open') {
      return NextResponse.json({ data: { qrCode: null, instanceStatus: 'connected', message: 'الواتساب متصل بالفعل' } });
    }

    const connectRes = await connectInstance();

    if (!connectRes.ok) {
      return NextResponse.json({
        data: { qrCode: null, instanceStatus: 'error', message: `Evolution API connect: ${connectRes.status}` },
      });
    }

    const qrCode = connectRes.data?.qrcode?.code || connectRes.data?.qrcode?.base64 || connectRes.data?.qrcode || connectRes.data?.base64 || null;
    return NextResponse.json({ data: { qrCode, instanceStatus: qrCode ? 'connecting' : 'disconnected' } });
  } catch {
    return NextResponse.json({ data: { qrCode: null, instanceStatus: 'unreachable', message: 'ماقدرتش أوصل لـ Evolution API' } });
  }
}
