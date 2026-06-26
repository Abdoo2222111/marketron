'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { AuthShell } from '@/components/layout/DashboardShell';

export default function GoogleCallbackPage({ params: { locale } }: { params: { locale: string } }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const code = searchParams.get('code');
    if (!code) {
      setStatus('error');
      setErrorMsg('رمز التفعيل مفقود');
      return;
    }

    (async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/google/callback`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code }),
        });
        const data = await res.json();
        if (data.success) {
          localStorage.setItem('auth_token', data.data.accessToken);
          localStorage.setItem('refresh_token', data.data.refreshToken);
          setStatus('success');
          setTimeout(() => router.push(`/${locale}/dashboard`), 1500);
        } else {
          setStatus('error');
          setErrorMsg(data.error || 'فشل تسجيل الدخول عبر Google');
        }
      } catch {
        setStatus('error');
        setErrorMsg('فشل الاتصال بالخادم');
      }
    })();
  }, []);

  return (
    <AuthShell>
      <div className="flex items-center justify-center min-h-screen" dir="rtl">
        <Card className="border-0 shadow-xl w-full max-w-md">
          <CardContent className="p-8 text-center space-y-4">
            {status === 'loading' && (
              <>
                <Loader2 className="h-12 w-12 animate-spin text-electric mx-auto" />
                <h2 className="text-xl font-bold">جاري تسجيل الدخول...</h2>
              </>
            )}
            {status === 'success' && (
              <>
                <div className="h-16 w-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                </div>
                <h2 className="text-xl font-bold">تم تسجيل الدخول بنجاح</h2>
                <p className="text-sm text-muted-foreground">جاري تحويلك إلى لوحة التحكم...</p>
              </>
            )}
            {status === 'error' && (
              <>
                <div className="h-16 w-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto">
                  <AlertCircle className="h-8 w-8 text-red-500" />
                </div>
                <h2 className="text-xl font-bold">فشل تسجيل الدخول</h2>
                <p className="text-sm text-red-500">{errorMsg}</p>
                <button onClick={() => router.push(`/${locale}/auth/login`)} className="text-sm text-electric hover:underline">
                  العودة لتسجيل الدخول
                </button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </AuthShell>
  );
}
