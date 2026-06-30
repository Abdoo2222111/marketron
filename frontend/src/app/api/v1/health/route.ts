import { NextResponse } from 'next/server';
import { DEFAULT_ENGINE } from '@/lib/ai-engine';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    provider: DEFAULT_ENGINE,
    environment: process.env.VERCEL_ENV || 'production',
  });
}
