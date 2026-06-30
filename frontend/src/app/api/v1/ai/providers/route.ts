import { NextResponse } from 'next/server';
import { getAvailableEngines, DEFAULT_ENGINE } from '@/lib/ai-engine';

export async function GET() {
  const providers = getAvailableEngines();
  return NextResponse.json({
    data: {
      providers,
      default: DEFAULT_ENGINE,
    },
  });
}
