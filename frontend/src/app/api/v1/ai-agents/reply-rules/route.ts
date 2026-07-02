import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-utils';

export async function GET(req: NextRequest) {
  const { error } = await requireAuth(req);
  if (error) return error;
  try {
    const rules = await prisma.replyRule.findMany({ orderBy: [{ priority: 'asc' }, { createdAt: 'desc' }] });
    return NextResponse.json({ data: rules });
  } catch {
    return NextResponse.json({ data: [] });
  }
}

export async function POST(req: NextRequest) {
  const { error, user } = await requireAuth(req);
  if (error) return error;
  try {
    const body = await req.json();
    const u = user!;

    const rule = await prisma.replyRule.create({
      data: {
        name: body.name,
        description: body.description,
        platform: body.platform || 'all',
        keywords: body.keywords || [],
        response: body.response,
        isActive: body.isActive ?? true,
        priority: body.priority ?? 0,
        userId: u.userId,
      },
    });
    return NextResponse.json({ data: rule }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'فشل إنشاء القاعدة' }, { status: 500 });
  }
}
