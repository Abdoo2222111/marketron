import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { hashPassword, generateTokens, sanitizeUser } from '@/lib/auth-utils';

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, phone, company } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ success: false, error: 'الاسم والبريد الإلكتروني وكلمة المرور مطلوبة' }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ success: false, error: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ success: false, error: 'البريد الإلكتروني مستخدم بالفعل' }, { status: 409 });
    }

    const hashed = await hashPassword(password);
    const user = await prisma.user.create({
      data: { name, email, password: hashed, phone, company },
    });

    const tokens = generateTokens({ userId: user.id, email: user.email, role: user.role });

    return NextResponse.json({
      success: true,
      data: { user: sanitizeUser(user), ...tokens },
      message: 'تم إنشاء الحساب بنجاح',
    }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message || 'فشل التسجيل' }, { status: 500 });
  }
}
