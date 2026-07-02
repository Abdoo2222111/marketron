import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-utils';

export async function GET(req: NextRequest) {
  const { error, user } = await requireAuth(req);
  if (error) return error;

  try {
    let agents = await prisma.aiAgent.findMany({ where: { userId: user!.userId } });
    return NextResponse.json({ data: agents });
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
    const agent = await prisma.aiAgent.create({
      data: {
        userId: u.userId,
        name: body.name || 'وكيل ذكي',
        type: body.type || 'general_agent',
        provider: body.provider || 'pollinations',
        model: body.model || 'openai',
        systemPrompt: body.systemPrompt || '',
      },
    });
    return NextResponse.json({ data: agent });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}