import { NextRequest, NextResponse } from 'next/server';
import { updateCampaign } from '@/lib/data-store';

export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const updated = updateCampaign(params.id, { status: 'active' });
  if (!updated) {
    return NextResponse.json({ error: 'الحملة غير موجودة' }, { status: 404 });
  }
  return NextResponse.json({ data: updated });
}
