import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-utils';

export async function POST(req: NextRequest) {
  const { error } = await requireAuth(req);
  if (error) return error;

  return NextResponse.json({
    success: true,
    message: 'تم تسجيل الخروج',
  }, {
    headers: {
      'Set-Cookie': 'accessToken=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0',
    },
  });
}