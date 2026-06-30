import { NextRequest, NextResponse } from 'next/server';
import { verifyRefreshToken, generateTokens } from '@/lib/auth-utils';

export async function POST(req: NextRequest) {
  try {
    const { refreshToken } = await req.json();
    if (!refreshToken) {
      return NextResponse.json({ success: false, error: 'رمز التحديث مطلوب' }, { status: 401 });
    }

    const payload = verifyRefreshToken(refreshToken);
    if (!payload) {
      return NextResponse.json({ success: false, error: 'رمز التحديث غير صالح' }, { status: 401 });
    }

    const tokens = generateTokens({ userId: payload.userId, email: payload.email, role: payload.role });

    return NextResponse.json({
      success: true,
      data: { accessToken: tokens.accessToken },
    });
  } catch {
    return NextResponse.json({ success: false, error: 'فشل تجديد التوكن' }, { status: 500 });
  }
}
