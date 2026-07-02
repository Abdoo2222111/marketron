import { NextRequest, NextResponse } from 'next/server';
import { pollinationsListModels, POLLINATIONS_MODELS } from '@/lib/ai-engine/pollinations';
import { requireAuth } from '@/lib/auth-utils';

export async function GET(req: NextRequest) {
  const { error } = await requireAuth(req);
  if (error) return error;
  try {
    const apiModels = await pollinationsListModels();
    if (apiModels.length > 0) {
      return NextResponse.json({ data: apiModels });
    }
  } catch {}
  return NextResponse.json({
    data: POLLINATIONS_MODELS.map(id => ({ id, name: id, provider: 'pollinations' })),
  });
}
