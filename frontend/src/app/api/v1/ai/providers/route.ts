import { NextRequest, NextResponse } from 'next/server';
import { getAvailableEngines, DEFAULT_ENGINE } from '@/lib/ai-engine';
import { requireAuth } from '@/lib/auth-utils';

export async function GET(req: NextRequest) {
  const { error } = await requireAuth(req);
  if (error) return error;
  const providers = getAvailableEngines();
  return NextResponse.json({
    data: {
      providers,
      default: DEFAULT_ENGINE,
    },
  });
}
