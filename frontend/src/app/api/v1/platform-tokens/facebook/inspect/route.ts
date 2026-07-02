import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-utils';

export async function POST(req: NextRequest) {
  const { error } = await requireAuth(req);
  if (error) return error;
  try {
    const { accessToken } = await req.json();
    if (!accessToken) {
      return NextResponse.json({ success: false, error: 'Access token مطلوب' }, { status: 400 });
    }

    const res = await fetch(
      `https://graph.facebook.com/v22.0/me?access_token=${accessToken}&fields=id,name,accounts{id,name,category},adaccounts{id,name,account_status}`,
    );

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return NextResponse.json({
        success: true,
        data: { valid: false, error: err.error?.message || 'توكن غير صالح', scopes: [] },
      });
    }

    const data = await res.json();
    return NextResponse.json({
      success: true,
      data: {
        valid: true,
        userId: data.id,
        userName: data.name,
        scopes: data.granted_scopes || [],
        pages: (data.accounts?.data || []).map((p: any) => ({
          id: p.id, name: p.name, category: p.category,
        })),
        adAccounts: (data.adaccounts?.data || []).map((a: any) => ({
          id: a.id, name: a.name, accountStatus: a.account_status,
        })),
      },
    });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
