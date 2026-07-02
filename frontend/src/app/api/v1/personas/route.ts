import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-utils';
import { getDefaultPersonas } from '@/lib/personas-config';

export async function GET(req: NextRequest) {
  const { error, user } = await requireAuth(req);
  if (error) return error;

  try {
    const u = user!;
    const defaults = getDefaultPersonas();
    const customizations = await prisma.personaCustomization.findMany({
      where: { userId: u.userId },
    });

    const customMap = new Map(customizations.map(c => [c.section, c.customPrompt]));

    const personas = defaults.map(p => ({
      section: p.section,
      name: p.name,
      emoji: p.emoji,
      category: p.category,
      systemPrompt: p.systemPrompt,
      customPrompt: customMap.get(p.section) || '',
      defaultTemperature: p.defaultTemperature,
      isCustomized: customMap.has(p.section),
    }));

    return NextResponse.json({ success: true, data: personas });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}