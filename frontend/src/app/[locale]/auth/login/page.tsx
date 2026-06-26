'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { AuthShell } from '@/components/layout/DashboardShell';
import { googleAuthApi } from '@/services/api-modules';

export default function LoginPage({ params: { locale } }: { params: { locale: string } }) {
  const router = useRouter();
  const [showPassword, setShowPassword] = React.useState(false);
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [googleLoading, setGoogleLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (data.success && data.data?.accessToken) {
        localStorage.setItem('auth_token', data.data.accessToken);
        localStorage.setItem('refresh_token', data.data.refreshToken);
        router.push(`/${locale}/dashboard`);
      } else {
        alert(data.error || 'فشل تسجيل الدخول');
      }
    } catch {
      alert('فشل الاتصال بالخادم');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    try {
      const res = await googleAuthApi.getAuthUrl();
      if (res.data?.data?.url) {
        window.location.href = res.data.data.url;
      } else {
        alert('Google OAuth غير مُفعّل. تواصل مع المسؤول.');
      }
    } catch {
      alert('فشل تهيئة Google OAuth');
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <AuthShell>
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          {/* Logo */}
          <div className="text-center mb-8">
            <Link href={`/${locale}`} className="inline-flex items-center gap-3 mb-4">
              <img src="/logo.svg" alt="MARKETRON" className="h-14 w-14 object-contain" />
              <span className="text-2xl font-black bg-gradient-to-r from-electric via-cyan to-purple bg-clip-text text-transparent tracking-tight">
                MARKETRON
              </span>
            </Link>
            <h1 className="text-2xl font-bold mb-1">تسجيل الدخول</h1>
            <p className="text-muted-foreground">أهلاً بك مرة أخرى في MARKETRON</p>
          </div>

          <Card className="border-0 shadow-xl">
            <CardContent className="p-6 space-y-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>البريد الإلكتروني</Label>
                  <div className="relative">
                    <Mail className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="ps-3 pe-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>كلمة المرور</Label>
                    <Link
                      href={`/${locale}/auth/forgot-password`}
                      className="text-xs text-primary hover:underline"
                    >
                      نسيت كلمة المرور؟
                    </Link>
                  </div>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="ps-3 pe-10"
                      required
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full bg-gradient-to-r from-electric via-cyan to-purple hover:opacity-90 shadow-lg shadow-electric/20" size="lg" loading={loading}>
                  تسجيل الدخول
                </Button>
              </form>

              <div className="relative">
                <Separator />
                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
                  أو
                </span>
              </div>

              <div className="grid gap-3">
                <Button variant="outline" className="w-full" size="lg" onClick={handleGoogleLogin} disabled={googleLoading}>
                  {googleLoading ? (
                    <Loader2 className="ml-2 h-5 w-5 animate-spin" />
                  ) : (
                    <svg className="ml-2 h-5 w-5" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                  )}
                  المتابعة باستخدام Google
                </Button>
              </div>

              <p className="text-center text-sm text-muted-foreground">
                ليس لديك حساب؟{' '}
                <Link href={`/${locale}/auth/register`} className="text-primary font-semibold hover:underline">
                  إنشاء حساب جديد
                </Link>
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </AuthShell>
  );
}


