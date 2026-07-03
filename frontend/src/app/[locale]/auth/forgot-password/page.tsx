'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { AuthShell } from '@/components/layout/DashboardShell';
import { Logo } from '@/components/ui/Logo';

export default function ForgotPasswordPage({ params: { locale } }: { params: { locale: string } }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.success) {
        setSent(true);
      } else {
        setError(data.error || 'فشل إرسال البريد');
      }
    } catch {
      setError('فشل الاتصال بالخادم');
    } finally {
      setLoading(false);
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
              <Logo size="md" />
              <span className="text-2xl font-black bg-gradient-to-r from-electric via-cyan to-purple bg-clip-text text-transparent tracking-tight">
                MARKETRON
              </span>
            </Link>
            <h1 className="text-2xl font-bold mb-1">نسيت كلمة المرور</h1>
            <p className="text-muted-foreground">أدخل بريدك الإلكتروني وسنرسل لك رابط إعادة تعيين كلمة المرور</p>
          </div>

          <Card className="border-0 shadow-xl">
            <CardContent className="p-6">
              {sent ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center space-y-4"
                >
                  <div className="h-16 w-16 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center mx-auto shadow-lg">
                    <CheckCircle2 className="h-8 w-8 text-white" />
                  </div>
                  <h2 className="text-xl font-bold">تم إرسال الرابط</h2>
                  <p className="text-sm text-muted-foreground">
                    تم إرسال رابط إعادة تعيين كلمة المرور إلى <strong>{email}</strong>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    إذا لم تستلم البريد، تحقق من مجلد البريد المزعج أو حاول مرة أخرى
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => setSent(false)}
                    className="mt-4"
                  >
                    إعادة المحاولة
                  </Button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-3 flex items-center gap-2 text-sm text-amber-700 dark:text-amber-300">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      {error}
                    </div>
                  )}
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

                  <Button type="submit" className="w-full bg-gradient-to-r from-electric via-cyan to-purple hover:opacity-90 shadow-lg shadow-electric/20" size="lg" loading={loading}>
                    إرسال رابط إعادة التعيين
                  </Button>
                </form>
              )}

              <div className="text-center mt-6">
                <Link
                  href={`/${locale}/auth/login`}
                  className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ArrowLeft size={14} />
                  العودة إلى تسجيل الدخول
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </AuthShell>
  );
}


