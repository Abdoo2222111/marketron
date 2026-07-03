'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Mail, Lock, User, Phone, Eye, EyeOff, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { googleAuthApi } from '@/services/api-modules';
import { Logo } from '@/components/ui/Logo';
import { ParticlesBackground } from '@/components/ui/ParticlesBackground';

const plans = [
  { id: 'free', labelKey: 'landing.pricingFree', priceKey: 'landing.pricingFreePrice', descKey: 'landing.pricingFreeDesc' },
  { id: 'starter', labelKey: 'landing.pricingBasic', priceKey: 'landing.pricingBasicPrice', descKey: 'landing.pricingBasicDesc' },
  { id: 'professional', labelKey: 'landing.pricingPro', priceKey: 'landing.pricingProPrice', descKey: 'landing.pricingProDesc' },
];

export default function RegisterPage({ params: { locale } }: { params: { locale: string } }) {
  const { t } = useTranslation();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', password: '', confirmPassword: '', plan: 'free', agreeToTerms: false,
  });
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.name) errs.name = t('common.required');
    if (!formData.email) errs.email = t('common.required');
    if (!formData.password) errs.password = t('common.required');
    if (formData.password.length < 8) errs.password = t('auth.passwordRequirements');
    if (formData.password !== formData.confirmPassword) errs.confirmPassword = t('auth.passwordMismatch');
    if (!formData.agreeToTerms) errs.agreeToTerms = t('common.required');
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
          name: formData.name, email: formData.email, password: formData.password, phone: formData.phone || undefined,
        }),
      });
      const data = await res.json();
      if (data.success && data.data?.accessToken) {
        localStorage.setItem('auth_token', data.data.accessToken);
        localStorage.setItem('refresh_token', data.data.refreshToken);
        router.push(`/${locale}/dashboard`);
      } else {
        setApiError(data.error || t('auth.registrationFailed'));
      }
    } catch {
      setApiError(t('auth.connectionFailed'));
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => { const n = { ...prev }; delete n[field]; return n; });
  };

  return (
    <div className="min-h-screen bg-[#0B0A1A] flex relative overflow-hidden">
      <ParticlesBackground count={60} interactive />
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="bg-grid absolute inset-0 opacity-[0.03]" />
      </div>

      <div className="hidden lg:flex lg:w-[55%] xl:w-[60%] bg-[#14102B] relative overflow-hidden items-center justify-center order-1">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#7C3AED]/10 blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-[#06B6D4]/5 blur-[80px]" />
        <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] rounded-full bg-[#EC4899]/5 blur-[80px]" />
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }} className="text-center relative z-10 px-12">
          <motion.div
            className="w-24 h-24 rounded-3xl gradient-primary flex items-center justify-center mx-auto mb-8 glow-purple-lg"
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Sparkles className="w-12 h-12 text-white" />
          </motion.div>
          <p className="text-5xl sm:text-6xl font-black gradient-brand-text leading-tight mb-4">
            {t('auth.getStartedForFree')}
          </p>
          <p className="text-xl text-[#A1A1C2]">{t('auth.joinUsers')}</p>
        </motion.div>
      </div>

      <div className="w-full lg:w-[45%] xl:w-[40%] flex items-center justify-center p-6 relative z-10 order-2">
        <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }} className="w-full max-w-sm">
          <Link href={`/${locale}`} className="inline-flex items-center gap-2 mb-8 text-[#A1A1C2] hover:text-[#F5F3FF] transition-colors text-sm group">
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> {t('common.back')}
          </Link>

          <div className="mb-8">
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5, delay: 0.1 }}>
              <Logo size="xl" className="mb-6 drop-shadow-[0_0_30px_rgba(124,58,237,0.4)]" />
            </motion.div>
            <h1 className="text-2xl font-bold mb-1">{t('auth.createAccount')}</h1>
            <p className="text-[#A1A1C2] text-sm">{t('auth.register')}</p>
          </div>

          <Card className="p-6 space-y-5 glass-strong">
            {apiError && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-3 rounded-xl bg-[#F43F5E]/10 border border-[#F43F5E]/20 text-[#F43F5E] text-sm">{apiError}</motion.div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-[#A1A1C2] mb-1.5">{t('common.name')}</label>
                  <div className="relative">
                    <User className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A1A1C2]" />
                    <Input placeholder={t('common.name')} value={formData.name}
                      onChange={e => updateField('name', e.target.value)} className="pr-10 input-neon" />
                  </div>
                  {errors.name && <p className="text-[#F43F5E] text-xs mt-1">{errors.name}</p>}
                </div>
                <div>
                  <label className="block text-sm text-[#A1A1C2] mb-1.5">{t('common.phone')}</label>
                  <div className="relative">
                    <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A1A1C2]" />
                    <Input type="tel" placeholder="+966 5X XXX XXXX"
                      value={formData.phone} onChange={e => updateField('phone', e.target.value)} className="pr-10 input-neon" />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm text-[#A1A1C2] mb-1.5">{t('common.email')}</label>
                <div className="relative">
                  <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A1A1C2]" />
                  <Input type="email" placeholder="name@example.com" value={formData.email}
                    onChange={e => updateField('email', e.target.value)} className="pr-10 input-neon" />
                </div>
                {errors.email && <p className="text-[#F43F5E] text-xs mt-1">{errors.email}</p>}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-[#A1A1C2] mb-1.5">{t('common.password')}</label>
                  <div className="relative">
                    <Input type={showPassword ? 'text' : 'password'} placeholder="••••••••"
                      value={formData.password} onChange={e => updateField('password', e.target.value)} className="pl-9 input-neon" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A1A1C2] hover:text-[#F5F3FF]">
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {errors.password && <p className="text-[#F43F5E] text-xs mt-1">{errors.password}</p>}
                </div>
                <div>
                  <label className="block text-sm text-[#A1A1C2] mb-1.5">{t('auth.confirmPassword')}</label>
                  <Input type="password" placeholder="••••••••"
                    value={formData.confirmPassword} onChange={e => updateField('confirmPassword', e.target.value)} className="input-neon" />
                  {errors.confirmPassword && <p className="text-[#F43F5E] text-xs mt-1">{errors.confirmPassword}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm text-[#A1A1C2] mb-1.5">{t('auth.selectPlan')}</label>
                <div className="grid grid-cols-3 gap-2">
                  {plans.map(plan => (
                    <button key={plan.id} type="button"
                      onClick={() => updateField('plan', plan.id)}
                      className={`p-3 rounded-xl border-2 text-center transition-all ${
                        formData.plan === plan.id
                          ? 'border-[#7C3AED] bg-[#7C3AED]/10 glow-purple'
                          : 'border-[#7C3AED]/20 hover:border-[#7C3AED]/50'
                      }`}>
                      <p className="font-semibold text-sm">{t(plan.labelKey)}</p>
                      <p className="text-xs text-[#A1A1C2]">{t(plan.priceKey)} {t('landing.perMonth')}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-start gap-2">
                <input type="checkbox" id="terms" checked={formData.agreeToTerms}
                  onChange={e => updateField('agreeToTerms', e.target.checked)}
                  className="mt-1 h-4 w-4 rounded accent-[#7C3AED]" />
                <label htmlFor="terms" className="text-sm text-[#A1A1C2]">
                  {t('auth.agreeToTerms')}
                </label>
              </div>
              {errors.agreeToTerms && <p className="text-[#F43F5E] text-xs">{errors.agreeToTerms}</p>}

              <Button type="submit" className="w-full rounded-xl btn-gradient text-white font-bold" size="lg" loading={loading}>
                {loading ? '' : t('auth.createAccount')}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[#7C3AED]/10" /></div>
              <div className="relative flex justify-center"><span className="px-3 text-xs text-[#A1A1C2] bg-[#14102B]">{t('common.or')}</span></div>
            </div>

            <Button variant="outline" className="w-full rounded-xl border-[#7C3AED]/20 hover:bg-[#7C3AED]/10" size="lg" onClick={async () => {
              try { const res = await googleAuthApi.getAuthUrl(); if (res.data?.data?.url) window.location.href = res.data.data.url; }
              catch { setApiError(t('auth.googleInitFailed')); }
            }}>
              <svg className="w-5 h-5 ml-2" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              {t('common.continueWithGoogle')}
            </Button>

            <p className="text-center text-sm text-[#A1A1C2]">
              {t('auth.haveAccount')}{' '}
              <Link href={`/${locale}/auth/login`} className="text-[#06B6D4] font-semibold hover:underline">{t('auth.login')}</Link>
            </p>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

function Sparkles(props: any) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
      <path d="M5 3v4" /><path d="M19 17v4" /><path d="M3 5h4" /><path d="M17 19h4" />
    </svg>
  );
}