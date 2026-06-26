'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Phone, Eye, EyeOff, Sparkles, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AuthShell } from '@/components/layout/DashboardShell';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

const plans = [
  { id: 'free', label: 'مجاني', price: '0 ريال', desc: 'للأفراد والمبتدئين' },
  { id: 'starter', label: 'مبتدئ', price: '99 ريال/شهر', desc: 'للشركات الصغيرة' },
  { id: 'professional', label: 'محترف', price: '299 ريال/شهر', desc: 'للشركات المتوسطة' },
];

export default function RegisterPage({ params: { locale } }: { params: { locale: string } }) {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    plan: 'free',
    agreeToTerms: false,
  });
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.name) errs.name = 'الاسم مطلوب';
    if (!formData.email) errs.email = 'البريد الإلكتروني مطلوب';
    if (!formData.password) errs.password = 'كلمة المرور مطلوبة';
    if (formData.password.length < 8) errs.password = 'كلمة المرور يجب أن تكون 8 أحرف على الأقل';
    if (formData.password !== formData.confirmPassword) errs.confirmPassword = 'كلمة المرور غير متطابقة';
    if (!formData.agreeToTerms) errs.agreeToTerms = 'يجب الموافقة على الشروط';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setApiError('');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phone: formData.phone || undefined,
        }),
      });
      const data = await res.json();
      if (data.success && data.data?.accessToken) {
        localStorage.setItem('auth_token', data.data.accessToken);
        localStorage.setItem('refresh_token', data.data.refreshToken);
        router.push(`/${locale}/dashboard`);
      } else {
        setApiError(data.error || 'فشل إنشاء الحساب');
      }
    } catch {
      setApiError('فشل الاتصال بالخادم');
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return (
    <AuthShell>
      <div className="min-h-screen flex items-center justify-center p-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-lg"
        >
          {/* Logo */}
          <div className="text-center mb-8">
            <Link href={`/${locale}`} className="inline-flex items-center gap-3 mb-4">
              <img src="/logo.svg" alt="MARKETRON" className="h-14 w-14 object-contain" />
              <span className="text-2xl font-black bg-gradient-to-r from-electric via-cyan to-purple bg-clip-text text-transparent tracking-tight">
                MARKETRON
              </span>
            </Link>
            <h1 className="text-2xl font-bold mb-1">إنشاء حساب جديد</h1>
            <p className="text-muted-foreground">انضم إلى MARKETRON وابدأ رحلتك</p>
          </div>

          <Card className="border-0 shadow-xl">
            <CardContent className="p-6 space-y-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                {apiError && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-3 text-sm text-red-600 dark:text-red-300">
                    {apiError}
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>الاسم الكامل</Label>
                    <div className="relative">
                      <User className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="محمد أحمد"
                        value={formData.name}
                        onChange={(e) => updateField('name', e.target.value)}
                        className="ps-3 pe-10"
                        error={errors.name}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>رقم الجوال</Label>
                    <div className="relative">
                      <Phone className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="tel"
                        placeholder="+966 5X XXX XXXX"
                        value={formData.phone}
                        onChange={(e) => updateField('phone', e.target.value)}
                        className="ps-3 pe-10"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>البريد الإلكتروني</Label>
                  <div className="relative">
                    <Mail className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="email"
                      placeholder="name@example.com"
                      value={formData.email}
                      onChange={(e) => updateField('email', e.target.value)}
                      className="ps-3 pe-10"
                      error={errors.email}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>كلمة المرور</Label>
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
                        value={formData.password}
                        onChange={(e) => updateField('password', e.target.value)}
                        className="ps-3 pe-10"
                        error={errors.password}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>تأكيد كلمة المرور</Label>
                    <div className="relative">
                      <Lock className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="password"
                        placeholder="••••••••"
                        value={formData.confirmPassword}
                        onChange={(e) => updateField('confirmPassword', e.target.value)}
                        className="ps-3 pe-10"
                        error={errors.confirmPassword}
                      />
                    </div>
                  </div>
                </div>

                {/* Plan Selection */}
                <div className="space-y-2">
                  <Label>اختر الباقة</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {plans.map((plan) => (
                      <button
                        key={plan.id}
                        type="button"
                        onClick={() => updateField('plan', plan.id)}
                        className={cn(
                          'p-3 rounded-xl border-2 text-center transition-all',
                          formData.plan === plan.id
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                        )}
                      >
                        <p className="font-semibold text-sm">{plan.label}</p>
                        <p className="text-xs text-muted-foreground">{plan.price}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Terms */}
                <div className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={formData.agreeToTerms}
                    onChange={(e) => updateField('agreeToTerms', e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <label htmlFor="terms" className="text-sm text-muted-foreground">
                    أوافق على{' '}
                    <Link href="#" className="text-primary hover:underline">شروط الخدمة</Link>
                    {' '}و{' '}
                    <Link href="#" className="text-primary hover:underline">سياسة الخصوصية</Link>
                  </label>
                </div>
                {errors.agreeToTerms && (
                  <p className="text-xs text-destructive">{errors.agreeToTerms}</p>
                )}

                <Button type="submit" className="w-full bg-gradient-to-r from-electric via-cyan to-purple hover:opacity-90 shadow-lg shadow-electric/20" size="lg" loading={loading}>
                  إنشاء الحساب
                </Button>
              </form>

              <div className="relative">
                <Separator />
                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
                  أو
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" className="w-full">
                  <svg className="ml-2 h-5 w-5" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  Google
                </Button>
                <Button variant="outline" className="w-full">
                  <svg className="ml-2 h-5 w-5" viewBox="0 0 24 24" fill="#0A66C2">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                  LinkedIn
                </Button>
              </div>

              <p className="text-center text-sm text-muted-foreground">
                لديك حساب بالفعل؟{' '}
                <Link href={`/${locale}/auth/login`} className="text-primary font-semibold hover:underline">
                  تسجيل الدخول
                </Link>
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </AuthShell>
  );
}


