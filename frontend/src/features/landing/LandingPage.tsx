'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Bot, BarChart3, PenTool, TrendingUp, MessageCircle, Shield,
  ChevronLeft, Star, Check, Menu, X, Sparkles,
} from 'lucide-react';

const FEATURES_CONFIG = [
  { icon: Bot, titleKey: 'landing.smartAgent', descKey: 'landing.smartAgentDesc' },
  { icon: BarChart3, titleKey: 'landing.manageCampaigns', descKey: 'landing.manageCampaignsDesc' },
  { icon: PenTool, titleKey: 'landing.aiContent', descKey: 'landing.aiContentDesc' },
  { icon: TrendingUp, titleKey: 'landing.smartAnalytics', descKey: 'landing.smartAnalyticsDesc' },
  { icon: MessageCircle, titleKey: 'nav.social', descKey: 'social.title' },
  { icon: Shield, titleKey: 'landing.reviewRequired', descKey: 'landing.reviewRequiredDesc' },
];

const STEPS_CONFIG = [
  { step: '1', titleKey: 'landing.step1', descKey: 'landing.step1Desc' },
  { step: '2', titleKey: 'landing.step2', descKey: 'landing.step2Desc' },
  { step: '3', titleKey: 'landing.step3', descKey: 'landing.step3Desc' },
];

const TESTIMONIALS_CONFIG = [
  { nameKey: 'landing.testimonial1Name', roleKey: 'landing.testimonial1Role', textKey: 'landing.testimonial1Text' },
  { nameKey: 'landing.testimonial2Name', roleKey: 'landing.testimonial2Role', textKey: 'landing.testimonial2Text' },
];

const PRICING_CONFIG = [
  { nameKey: 'landing.pricingFree', priceKey: 'landing.pricingFreePrice', features: ['landing.featCampaign1', 'landing.featAgent', 'landing.featAnalytics', 'landing.featCommunity'], ctaKey: 'landing.ctaFree', popular: false },
  { nameKey: 'landing.pricingBasic', priceKey: 'landing.pricingBasicPrice', features: ['landing.featCampaigns5', 'landing.featAgentAdvanced', 'landing.featAnalyticsFull', 'landing.featWhatsapp', 'landing.featSupport'], ctaKey: 'landing.ctaBasic', popular: true },
  { nameKey: 'landing.pricingPro', priceKey: 'landing.pricingProPrice', features: ['landing.featCampaignsUnlimited', 'landing.featAgentCustom', 'landing.featApi', 'landing.featMultiPlatform', 'landing.featPriority'], ctaKey: 'landing.ctaPro', popular: false },
];

const PLATFORMS = [
  { name: 'Meta Ads', color: '#1877F2' },
  { name: 'Google Ads', color: '#4285F4' },
  { name: 'TikTok Ads', color: '#000' },
  { name: 'WhatsApp', color: '#25D366' },
];

export const LandingPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [mobileMenu, setMobileMenu] = useState(false);
  const locale = i18n.language || 'ar';

  return (
    <div className="min-h-screen bg-[#0B0A1A]">
      <div className="cube-container">
        <div className="cube" /><div className="cube" /><div className="cube" />
        <div className="cube" /><div className="cube" /><div className="cube" />
      </div>

      {/* HEADER */}
      <header className="fixed top-0 left-0 right-0 z-50 glass">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/logo.svg" alt="MARKETRON" className="h-8 sm:h-9 w-auto object-contain" />
            <span className="font-black text-lg gradient-brand-text hidden sm:inline">MARKETRON</span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-[#A1A1C2] hover:text-[#F5F3FF] transition-colors text-sm font-medium">{t('landing.features')}</a>
            <a href="#pricing" className="text-[#A1A1C2] hover:text-[#F5F3FF] transition-colors text-sm font-medium">{t('landing.pricing')}</a>
            <a href="#contact" className="text-[#A1A1C2] hover:text-[#F5F3FF] transition-colors text-sm font-medium">{t('landing.contactUs')}</a>
          </nav>
          <div className="flex items-center gap-3">
            <a href={`/${locale}/auth/login`} className="text-sm text-[#A1A1C2] hover:text-[#F5F3FF] hidden sm:inline">{t('auth.login')}</a>
            <Button size="sm" className="rounded-full" onClick={() => window.location.href = `/${locale}/auth/register`}>{t('landing.heroCta')}</Button>
            <button className="md:hidden p-2" onClick={() => setMobileMenu(!mobileMenu)}>
              {mobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* MOBILE MENU */}
      {mobileMenu && (
        <div className="fixed inset-0 z-40 bg-[#0B0A1A]/95 backdrop-blur-lg pt-20">
          <div className="flex flex-col items-center gap-6 p-8">
            <a href="#features" onClick={() => setMobileMenu(false)} className="text-xl text-[#F5F3FF]">{t('landing.features')}</a>
            <a href="#pricing" onClick={() => setMobileMenu(false)} className="text-xl text-[#F5F3FF]">{t('landing.pricing')}</a>
            <a href="#contact" onClick={() => setMobileMenu(false)} className="text-xl text-[#F5F3FF]">{t('landing.contactUs')}</a>
            <a href={`/${locale}/auth/login`} className="text-lg text-[#A1A1C2]">{t('auth.login')}</a>
            <Button className="mt-4" onClick={() => window.location.href = `/${locale}/auth/register`}>{t('landing.getStarted')}</Button>
          </div>
        </div>
      )}

      {/* HERO */}
      <section className="relative pt-32 pb-20 sm:pt-44 sm:pb-32 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#7C3AED]/10 blur-[100px]" />
        <div className="absolute top-1/3 right-1/4 w-[300px] h-[300px] rounded-full bg-[#06B6D4]/5 blur-[80px]" />
        <div className="relative max-w-5xl mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <Badge variant="info" className="mb-6 px-4 py-1.5 text-sm rounded-full">
              <Sparkles className="w-3.5 h-3.5 ml-1 inline" /> {t('app.tagline')}
            </Badge>
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black leading-tight mb-6">
              {t('landing.heroTitle')}<br />
              <span className="gradient-brand-text">{t('landing.heroSubtitle')}</span>
            </h1>
            <p className="text-lg sm:text-xl text-[#A1A1C2] max-w-2xl mx-auto mb-10 leading-relaxed">
              {t('landing.heroDescription')}
            </p>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <Button size="lg" className="rounded-full px-8 shadow-[0_0_30px_rgba(124,58,237,0.4)]"
                onClick={() => window.location.href = `/${locale}/auth/register`}>
                {t('landing.getStarted')} <ChevronLeft className="w-5 h-5" />
              </Button>
              <Button variant="outline" size="lg" className="rounded-full px-8">
                <Sparkles className="w-5 h-5 ml-2" /> {t('landing.heroSecondary')}
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* TRUST BAR */}
      <section className="py-12 border-y border-[#7C3AED]/10">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <p className="text-sm text-[#A1A1C2] mb-6">{t('landing.trustedBy')}</p>
          <div className="flex items-center justify-center gap-8 sm:gap-16 flex-wrap">
            {PLATFORMS.map(p => (
              <div key={p.name} className="flex items-center gap-2 text-[#A1A1C2]">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                <span className="text-sm font-medium">{p.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES GRID */}
      <section id="features" className="py-20 sm:py-32">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-black mb-4">{t('landing.features')}</h2>
            <p className="text-[#A1A1C2] text-lg">{t('landing.featuresSubtitle')}</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES_CONFIG.map((f, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} viewport={{ once: true }}>
                <Card className="p-6 h-full">
                  <div className="w-12 h-12 rounded-xl gradient-primary/20 flex items-center justify-center mb-4">
                    <f.icon className="w-6 h-6 text-[#06B6D4]" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">{t(f.titleKey)}</h3>
                  <p className="text-[#A1A1C2] text-sm leading-relaxed">{t(f.descKey)}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-20 sm:py-32 bg-[#14102B]/50">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-black mb-4">{t('landing.howItWorks')}</h2>
            <p className="text-[#A1A1C2] text-lg">{t('landing.howItWorksDesc')}</p>
          </div>
          <div className="grid sm:grid-cols-3 gap-8 relative">
            {STEPS_CONFIG.map((s, i) => (
              <div key={i} className="text-center relative">
                <div className="w-14 h-14 rounded-full gradient-primary flex items-center justify-center text-white font-black text-xl mx-auto mb-4 shadow-[0_0_20px_rgba(124,58,237,0.4)]">
                  {s.step}
                </div>
                {i < 2 && <div className="hidden sm:block absolute top-7 left-[60%] w-[80%] h-px bg-gradient-to-r from-[#7C3AED] to-[#06B6D4] opacity-40" />}
                <h3 className="font-bold text-lg mb-2">{t(s.titleKey)}</h3>
                <p className="text-[#A1A1C2] text-sm">{t(s.descKey)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRODUCT SCREENSHOT */}
      <section className="py-20 sm:py-32">
        <div className="max-w-5xl mx-auto px-4">
          <div className="relative rounded-2xl overflow-hidden border border-[#7C3AED]/20 shadow-[0_0_60px_rgba(124,58,237,0.1)]">
            <div className="aspect-video bg-gradient-to-br from-[#14102B] to-[#0B0A1A] flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-4 shadow-[0_0_30px_rgba(124,58,237,0.5)]">
                  <BarChart3 className="w-8 h-8 text-white" />
                </div>
                <p className="text-[#A1A1C2] text-lg">{t('nav.dashboard')}</p>
                <p className="text-[#A1A1C2]/60 text-sm">{t('landing.productDesc')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-20 bg-[#14102B]/30">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-black mb-4">{t('landing.testimonials')}</h2>
          <div className="grid sm:grid-cols-2 gap-6 mt-12">
            {TESTIMONIALS_CONFIG.map((test, i) => (
              <Card key={i} className="p-6 text-right">
                <div className="flex gap-1 mb-3">
                  {[1,2,3,4,5].map(s => <Star key={s} className="w-4 h-4 fill-[#FBBF24] text-[#FBBF24]" />)}
                </div>
                <p className="text-[#A1A1C2] mb-4 leading-relaxed">{t(test.textKey)}</p>
                <div>
                  <p className="font-bold">{t(test.nameKey)}</p>
                  <p className="text-sm text-[#A1A1C2]/60">{t(test.roleKey)}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="py-20 sm:py-32">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-black mb-4">{t('landing.pricing')}</h2>
            <p className="text-[#A1A1C2] text-lg">{t('landing.pricingSubtitle')}</p>
          </div>
          <div className="grid sm:grid-cols-3 gap-6">
            {PRICING_CONFIG.map((p, i) => (
              <Card key={i} className={`p-8 text-center relative ${p.popular ? 'border-[#06B6D4]/40 shadow-[0_0_40px_rgba(6,182,212,0.15)] scale-105' : ''}`}>
                {p.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge variant="info" className="px-4 py-1 rounded-full text-xs">{t('landing.mostPopular')}</Badge>
                  </div>
                )}
                <h3 className="text-xl font-bold mb-2">{t(p.nameKey)}</h3>
                <div className="mb-6">
                  <span className="text-4xl font-black">${t(p.priceKey)}</span>
                  <span className="text-[#A1A1C2]">{t('landing.perMonth')}</span>
                </div>
                <ul className="space-y-3 mb-8 text-right">
                  {p.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm text-[#A1A1C2]">
                      <Check className="w-4 h-4 text-[#10D9A0]" /> {t(f)}
                    </li>
                  ))}
                </ul>
                <Button variant={p.popular ? 'primary' : 'outline'} className="w-full rounded-full"
                  onClick={() => window.location.href = `/${locale}/auth/register`}>
                  {t(p.ctaKey)}
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="contact" className="py-20 sm:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#7C3AED]/20 to-[#06B6D4]/10" />
        <div className="relative max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-5xl font-black mb-6">{t('landing.ctaTitle')}</h2>
          <p className="text-lg text-[#A1A1C2] mb-8">{t('landing.ctaDesc')}</p>
          <Button size="lg" className="rounded-full px-10 text-lg shadow-[0_0_40px_rgba(124,58,237,0.5)]"
            onClick={() => window.location.href = `/${locale}/auth/register`}>
            {t('landing.getStarted')} <ChevronLeft className="w-5 h-5" />
          </Button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-12 border-t border-[#7C3AED]/10">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <img src="/logo.svg" alt="MARKETRON" className="h-8 w-auto object-contain" />
              <span className="font-black gradient-brand-text">MARKETRON</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-[#A1A1C2]">
              <a href="#" className="hover:text-[#F5F3FF]">{t('landing.privacy')}</a>
              <a href="#" className="hover:text-[#F5F3FF]">{t('landing.terms')}</a>
              <a href="#" className="hover:text-[#F5F3FF]">{t('landing.help')}</a>
            </div>
            <p className="text-xs text-[#A1A1C2]/60">{t('landing.copyright', { year: '2026' })}</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
