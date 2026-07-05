'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Menu, X, Sun, Moon } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { useLocalization } from '@/hooks/useLocalization';
import dynamic from 'next/dynamic';
const ParticlesBackground = dynamic(() => import('@/components/ui/ParticlesBackground'), { ssr: false });
import { LOGO_URL, CUBES, platforms, LANGUAGES } from './landing-data';
import { HeroSection } from './HeroSection';
import { FeaturesSection } from './FeaturesSection';
import { StepsSection } from './StepsSection';
import { PricingSection } from './PricingSection';
import { TestimonialsSection } from './TestimonialsSection';
import { CTASection } from './CTASection';
import { Footer } from './Footer';

function FloatingCube({ x, y, size, delay }: { x: number; y: number; size: string; delay: number }) {
  return (
    <div
      className="cube-3d"
      style={{
        left: `${x}%`, top: `${y}%`,
        width: size, height: size,
        animationDelay: `${delay}s`,
      }}
    />
  );
}

function ScrollProgress() {
  const [width, setWidth] = useState('0%');
  useEffect(() => {
    const handle = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setWidth(`${docHeight > 0 ? (scrollTop / docHeight) * 100 : 0}%`);
    };
    window.addEventListener('scroll', handle, { passive: true });
    return () => window.removeEventListener('scroll', handle);
  }, []);
  return <div className="scroll-progress" style={{ width }} />;
}

export const LandingPage: React.FC = () => {
  const { i18n } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const { setLocale } = useLocalization();
  const [mobileMenu, setMobileMenu] = useState(false);
  const locale = i18n.language || 'ar';

  return (
    <div dir="rtl" className="min-h-screen bg-[#0B0A1A] text-white overflow-x-hidden">
      <ParticlesBackground />
      <ScrollProgress />
      {/* ===== Floating Cubes Background ===== */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] rounded-full bg-gradient-radial from-purple-600/15 via-purple-900/5 to-transparent blur-3xl" />
        <div className="bg-grid absolute inset-0 opacity-[0.03]" />
        <div className="hidden md:block">{CUBES.map((c, i) => <FloatingCube key={i} {...c} />)}</div>
      </div>

      {/* ===== HEADER ===== */}
      <header className="fixed top-0 left-0 right-0 z-50 glass">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
          <a href="/ar/services" className="flex items-center gap-3">
            <img src={LOGO_URL} alt="MARKETRON" className="h-16 sm:h-20 w-auto drop-shadow-[0_0_20px_rgba(124,58,237,0.4)]" />
          </a>
          <nav className="hidden md:flex items-center gap-8">
            <a href="/ar/services" className="text-sm text-[#A1A1C2] hover:text-white transition-colors">خدماتنا</a>
            <a href="#features" className="text-sm text-[#A1A1C2] hover:text-white transition-colors">المميزات</a>
            <a href="#pricing" className="text-sm text-[#A1A1C2] hover:text-white transition-colors">الأسعار</a>
            <a href="https://wa.me/201011273472" target="_blank" rel="noopener noreferrer" className="text-sm px-4 py-2 rounded-lg bg-emerald-500/20 text-emerald-400 font-semibold hover:bg-emerald-500/30 transition-all flex items-center gap-1">
              01011273472
            </a>
            {LANGUAGES.map(l => (
              <button key={l.code} onClick={() => setLocale(l.code)}
                className={`px-2 py-1 text-xs rounded transition-all ${locale === l.code ? 'bg-purple-500/20 text-purple-400' : 'text-[#A1A1C2] hover:text-white'}`}>
                {l.label.slice(0, 2)}
              </button>
            ))}
            <button onClick={toggleTheme} className="p-2 rounded-lg text-[#A1A1C2] hover:text-white hover:bg-white/5 transition-all">
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </nav>
          <div className="flex items-center gap-3">
            <a href={`/${locale}/auth/login`} className="text-sm text-[#A1A1C2] hover:text-white hidden sm:inline transition-colors">تسجيل الدخول</a>
            <a href={`/${locale}/auth/register`} className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-bold text-sm hover:shadow-[0_0_30px_rgba(124,58,237,0.5)] transition-all">ابدأ مجاناً</a>
            <button className="md:hidden p-2 text-[#A1A1C2]" onClick={() => setMobileMenu(!mobileMenu)}>
              {mobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {mobileMenu && (
          <motion.div initial={{ opacity: 0, x: locale === 'ar' ? 80 : -80 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: locale === 'ar' ? 80 : -80 }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="fixed inset-0 z-40 bg-[#0B0A1A]/95 backdrop-blur-2xl pt-24">
            <div className="flex flex-col items-center gap-6 p-8">
              <a href="/ar/services" onClick={() => setMobileMenu(false)} className="text-xl text-white font-bold">خدماتنا</a>
              <a href="#features" onClick={() => setMobileMenu(false)} className="text-lg text-[#A1A1C2]">المميزات</a>
              <a href="#pricing" onClick={() => setMobileMenu(false)} className="text-lg text-[#A1A1C2]">الأسعار</a>
              <a href="https://wa.me/201011273472" target="_blank" rel="noopener noreferrer" className="text-lg text-emerald-400">واتساب: 01011273472</a>
              <a href={`/${locale}/auth/login`} className="text-lg text-[#A1A1C2]">تسجيل الدخول</a>
              <a href={`/${locale}/auth/register`} className="mt-4 px-8 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-bold">ابدأ مجاناً</a>
              {LANGUAGES.map(l => (
                <button key={l.code} onClick={() => { setLocale(l.code); setMobileMenu(false); }}
                  className={`px-3 py-1.5 text-sm rounded transition-all ${locale === l.code ? 'bg-purple-500/20 text-purple-400 border border-purple-500/40' : 'text-[#A1A1C2] border border-transparent'}`}>
                  {l.label}
                </button>
              ))}
              <button onClick={toggleTheme} className="flex items-center gap-2 text-[#A1A1C2] hover:text-white transition-colors">
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                <span>{theme === 'dark' ? 'الوضع النهاري' : 'الوضع الليلي'}</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== HERO ===== */}
      <HeroSection locale={locale} />

      {/* ===== TRUST BAR ===== */}
      <section className="py-12 border-y border-purple-900/20 bg-gradient-to-r from-transparent via-purple-900/5 to-transparent">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <p className="text-gray-500 text-sm mb-6">يتكامل مع المنصات الإعلانية الكبرى</p>
          <div className="flex items-center justify-center gap-6 sm:gap-8 flex-wrap">
            {platforms.map(({ name, emoji }) => (
              <div key={name} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#14102B] border border-purple-900/20 hover:border-purple-500/30 transition-all group">
                <span className="text-lg">{emoji}</span>
                <span className="text-gray-400 text-sm font-medium group-hover:text-white transition-colors">{name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <FeaturesSection />
      <StepsSection />
      <PricingSection locale={locale} />
      <TestimonialsSection />
      <CTASection locale={locale} />
      <Footer />
    </div>
  );
};
