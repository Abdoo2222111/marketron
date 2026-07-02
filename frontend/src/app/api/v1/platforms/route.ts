import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-utils';

export async function GET(req: NextRequest) {
  const { error, user } = await requireAuth(req);
  if (error) return error;

  try {
    const [conns, tokens] = await Promise.all([
      prisma.platformConnection.findMany({ where: { userId: user!.userId }, orderBy: { createdAt: 'desc' } }),
      prisma.platformToken.findMany({ where: { userId: user!.userId }, orderBy: { createdAt: 'desc' } }),
    ]);

    const fromConns = conns.map(t => ({
      id: t.id,
      platform: t.platform,
      platformAccountId: t.platformAccountId || '',
      platformAccountName: t.platformAccountName || t.platform,
      status: t.status,
      createdAt: t.createdAt.toISOString(),
      tokenExpiresAt: t.tokenExpiresAt?.toISOString() || null,
    }));

    const fromTokens = tokens.map(t => ({
      id: t.id,
      platform: t.platform,
      platformAccountId: '',
      platformAccountName: t.label || t.platform,
      status: t.status,
      createdAt: t.createdAt.toISOString(),
      tokenExpiresAt: t.expiresAt?.toISOString() || null,
    }));

    const seen = new Set<string>();
    const merged = [...fromConns, ...fromTokens].filter(item => {
      if (seen.has(item.platform)) return false;
      seen.add(item.platform);
      return true;
    });

    return NextResponse.json({ data: merged });
  } catch {
    return NextResponse.json({ data: [] });
  }
}