import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-utils';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const { error, user } = await requireAuth(req);
  if (error) return error;

  try {
    const agent = await prisma.aiAgent.findFirst({ where: { id: params.id, userId: user!.userId } });
    if (!agent) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ data: agent });
  } catch {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const { error, user } = await requireAuth(req);
  if (error) return error;

  try {
    const body = await req.json();
    const agent = await prisma.aiAgent.updateMany({
      where: { id: params.id, userId: user!.userId },
      data: body,
    });
    if (agent.count === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const { error, user } = await requireAuth(req);
  if (error) return error;

  try {
    const agent = await prisma.aiAgent.deleteMany({ where: { id: params.id, userId: user!.userId } });
    if (agent.count === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
  }
}