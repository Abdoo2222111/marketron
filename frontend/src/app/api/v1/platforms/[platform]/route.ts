import { NextRequest, NextResponse } from 'next/server';

const connected: Record<string, any> = {};

export async function DELETE(
  req: NextRequest,
  { params }: { params: { platform: string } }
) {
  delete connected[params.platform];
  return NextResponse.json({ data: { success: true } });
}

export async function POST(
  req: NextRequest,
  { params }: { params: { platform: string } }
) {
  const body = await req.json().catch(() => ({}));
  const syncResult = { synced: true, count: 0, platform: params.platform };
  return NextResponse.json({ data: syncResult });
}
