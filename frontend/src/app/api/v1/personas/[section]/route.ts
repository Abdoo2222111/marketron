import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-utils';
import { getDefaultPersona } from '@/lib/personas-config';

export async function GET(req: NextRequest, { params }: { params: { section: string } }) {
  const { error, user } = await requireAuth(req);
  if (error) return error;

  try {
    const u = user!;
    const def = getDefaultPersona(params.section);
    if (!def) {
      return NextResponse.json({ success: false, error: 'هذه الشخصية غير موجودة' }, { status: 404 });
    }

    const customization = await prisma.personaCustomization.findUnique({
      where: { userId_section: { userId: u.userId, section: params.section } },
    });

    return NextResponse.json({
      success: true,
      data: {
        section: def.section,
        name: def.name,
        emoji: def.emoji,
        category: def.category,
        systemPrompt: def.systemPrompt,
        customPrompt: customization?.customPrompt || '',
        defaultTemperature: def.defaultTemperature,
        isCustomized: !!customization,
      },
    });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { section: string } }) {
  const { error, user } = await requireAuth(req);
  if (error) return error;

  try {
    const u = user!;
    const def = getDefaultPersona(params.section);
    if (!def) {
      return NextResponse.json({ success: false, error: 'هذه الشخصية غير موجودة' }, { status: 404 });
    }

    const body = await req.json();
    const customPrompt = body.customPrompt || '';

    await prisma.personaCustomization.upsert({
      where: { userId_section: { userId: u.userId, section: params.section } },
      update: { customPrompt },
      create: { userId: u.userId, section: params.section, customPrompt },
    });

    return NextResponse.json({
      success: true,
      data: {
        section: def.section,
        name: def.name,
        emoji: def.emoji,
        systemPrompt: def.systemPrompt,
        customPrompt,
        isCustomized: true,
      },
      message: 'تم تخصيص الشخصية بنجاح',
    });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { section: string } }) {
  const { error, user } = await requireAuth(req);
  if (error) return error;

  try {
    const u = user!;
    const def = getDefaultPersona(params.section);
    if (!def) {
      return NextResponse.json({ success: false, error: 'هذه الشخصية غير موجودة' }, { status: 404 });
    }

    await prisma.personaCustomization.deleteMany({
      where: { userId: u.userId, section: params.section },
    });

    return NextResponse.json({
      success: true,
      data: {
        section: def.section,
        name: def.name,
        emoji: def.emoji,
        systemPrompt: def.systemPrompt,
        customPrompt: '',
        isCustomized: false,
      },
      message: 'تم إعادة تعيين الشخصية للإعدادات الافتراضية',
    });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}