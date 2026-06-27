'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Bot, BarChart3, PenTool, TrendingUp, MessageCircle, Shield,
  ChevronLeft, Star, Check, Menu, X, Sparkles,
} from 'lucide-react';

const FEATURES = [
  { icon: Bot, title: 'وكيل مبيعات ذكي يرد 24/7', desc: 'يفهم نشاطك ويتكلم بلسانك — يبيع ويجيب على استفسارات عملائك تلقائياً' },
  { icon: BarChart3, title: 'لوحة تحكم موحدة', desc: 'كل حملاتك على Meta وGoogle وTikTok في مكان واحد مع رسوم بيانية فورية' },
  { icon: PenTool, title: 'استوديو محتوى بالذكاء الاصطناعي', desc: 'نصوص وصور إعلانية بالعربي والإنجليزي بضغطة زر' },
  { icon: TrendingUp, title: 'تحليل أداء فوري', desc: 'نقاط قوة وضعف وتوصيات تحسين قابلة للتنفيذ لكل حملة' },
  { icon: MessageCircle, title: 'صندوق وارد موحد', desc: 'كل محادثات واتساب وعملائك في مكان واحد مع ردود ذكية' },
  { icon: Shield, title: 'موافقتك مطلوبة دايماً', desc: 'نشرين تأكيد قبل نشر أي حملة — تحكم كامل بدون قلق' },
];

const PRICING = [
  { name: 'مجاني', price: '0', features: ['حملة واحدة', 'وكيل ذكي', 'تحليلات أساسية', 'دعم المجتمع'], cta: 'ابدأ مجاناً', popular: false },
  { name: 'أساسي', price: '99', features: ['5 حملات', 'وكيل ذكي متقدم', 'تحليلات كاملة', 'ربط واتساب', 'دعم فني'], cta: 'جرب 14 يوم مجاناً', popular: true },
  { name: 'متقدم', price: '199', features: ['حملات غير محدودة', 'وكيل ذكي مخصص', 'API كامل', 'ربط متعدد المنصات', 'أولوية الدعم'], cta: 'تواصل معنا', popular: false },
];

const PLATFORMS = [
  { name: 'Meta Ads', color: '#1877F2' },
  { name: 'Google Ads', color: '#4285F4' },
  { name: 'TikTok Ads', color: '#000' },
  { name: 'WhatsApp', color: '#25D366' },
];

export const LandingPage: React.FC = () => {
  const [mobileMenu, setMobileMenu] = useState(false);

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
            <div className="w-9 h-9 rounded-lg gradient-primary flex items-center justify-center font-black text-white text-lg">M</div>
            <span className="font-black text-lg gradient-brand-text hidden sm:inline">MARKETRON</span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            {['المميزات', 'الأسعار', 'تواصل'].map(item => (
              <a key={item} href={`#${item}`} className="text-[#A1A1C2] hover:text-[#F5F3FF] transition-colors text-sm font-medium">{item}</a>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <a href="/ar/auth/login" className="text-sm text-[#A1A1C2] hover:text-[#F5F3FF] hidden sm:inline">تسجيل دخول</a>
            <Button size="sm" className="rounded-full" onClick={() => window.location.href = '/ar/auth/register'}>جرّب مجاناً</Button>
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
            {['المميزات', 'الأسعار', 'تواصل'].map(item => (
              <a key={item} href={`#${item}`} onClick={() => setMobileMenu(false)} className="text-xl text-[#F5F3FF]">{item}</a>
            ))}
            <a href="/ar/auth/login" className="text-lg text-[#A1A1C2]">تسجيل دخول</a>
            <Button className="mt-4" onClick={() => window.location.href = '/ar/auth/register'}>ابدأ مجاناً</Button>
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
              <Sparkles className="w-3.5 h-3.5 ml-1 inline" /> الذكاء الاصطناعي للتسويق والأتمتة
            </Badge>
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black leading-tight mb-6">
              حملاتك الإعلانية<br />
              <span className="gradient-brand-text">بعقل ذكي يفهم نشاطك</span>
            </h1>
            <p className="text-lg sm:text-xl text-[#A1A1C2] max-w-2xl mx-auto mb-10 leading-relaxed">
              منصة واحدة تدير، تحلل، وتُنشئ محتوى وحملات السوشيال ميديا — مع وكيل ذكي يرد على عملائك 24/7
            </p>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <Button size="lg" className="rounded-full px-8 shadow-[0_0_30px_rgba(124,58,237,0.4)]"
                onClick={() => window.location.href = '/ar/auth/register'}>
                ابدأ مجاناً الآن <ChevronLeft className="w-5 h-5" />
              </Button>
              <Button variant="outline" size="lg" className="rounded-full px-8">
                <Sparkles className="w-5 h-5 ml-2" /> شاهد العرض
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* TRUST BAR */}
      <section className="py-12 border-y border-[#7C3AED]/10">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <p className="text-sm text-[#A1A1C2] mb-6">بيستخدمه أصحاب الأعمال في</p>
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
      <section id="المميزات" className="py-20 sm:py-32">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-black mb-4">كل ما تحتاجه في مكان واحد</h2>
            <p className="text-[#A1A1C2] text-lg">أدوات ذكية لتسويق نشاطك التجاري</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} viewport={{ once: true }}>
                <Card className="p-6 h-full">
                  <div className="w-12 h-12 rounded-xl gradient-primary/20 flex items-center justify-center mb-4">
                    <f.icon className="w-6 h-6 text-[#06B6D4]" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">{f.title}</h3>
                  <p className="text-[#A1A1C2] text-sm leading-relaxed">{f.desc}</p>
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
            <h2 className="text-3xl sm:text-4xl font-black mb-4">إزاي يشتغل؟</h2>
            <p className="text-[#A1A1C2] text-lg">3 خطوات بس وتبدأ</p>
          </div>
          <div className="grid sm:grid-cols-3 gap-8 relative">
            {[
              { step: '1', title: 'سجّل نشاطك', desc: 'أنشئ حساب وأدخل بيانات نشاطك — أو خلينا نستخرجها من موقعك' },
              { step: '2', title: 'فعّل الوكيل الذكي', desc: 'اختر شخصية الوكيل وجربها في Sandbox قبل التفعيل الفعلي' },
              { step: '3', title: 'اربح عملاء', desc: 'الوكيل يرد على عملائك وانت ركّز على تطوير نشاطك' },
            ].map((s, i) => (
              <div key={i} className="text-center relative">
                <div className="w-14 h-14 rounded-full gradient-primary flex items-center justify-center text-white font-black text-xl mx-auto mb-4 shadow-[0_0_20px_rgba(124,58,237,0.4)]">
                  {s.step}
                </div>
                {i < 2 && <div className="hidden sm:block absolute top-7 left-[60%] w-[80%] h-px bg-gradient-to-r from-[#7C3AED] to-[#06B6D4] opacity-40" />}
                <h3 className="font-bold text-lg mb-2">{s.title}</h3>
                <p className="text-[#A1A1C2] text-sm">{s.desc}</p>
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
                <p className="text-[#A1A1C2] text-lg">لوحة تحكم متكاملة</p>
                <p className="text-[#A1A1C2]/60 text-sm">مع رسوم بيانية فورية وتقارير أداء</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-20 bg-[#14102B]/30">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-black mb-4">ماذا يقول عملاؤنا</h2>
          <div className="grid sm:grid-cols-2 gap-6 mt-12">
            {[
              { name: 'أحمد السيد', role: 'صاحب متجر إلكتروني', text: 'منذ ما استخدمت Marketron، مبيعاتي زادت 40% والرد على العملاء صار تلقائي' },
              { name: 'سارة العلي', role: 'مديرة تسويق', text: 'الوكيل الذكي وفّر عليا وقت كبير. بقدر أركز على الاستراتيجية بدل الردود المتكررة' },
            ].map((t, i) => (
              <Card key={i} className="p-6 text-right">
                <div className="flex gap-1 mb-3">
                  {[1,2,3,4,5].map(s => <Star key={s} className="w-4 h-4 fill-[#FBBF24] text-[#FBBF24]" />)}
                </div>
                <p className="text-[#A1A1C2] mb-4 leading-relaxed">{t.text}</p>
                <div>
                  <p className="font-bold">{t.name}</p>
                  <p className="text-sm text-[#A1A1C2]/60">{t.role}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="الأسعار" className="py-20 sm:py-32">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-black mb-4">أسعار تناسب الجميع</h2>
            <p className="text-[#A1A1C2] text-lg">ابدأ مجاناً وطور من خطتك مع نمو نشاطك</p>
          </div>
          <div className="grid sm:grid-cols-3 gap-6">
            {PRICING.map((p, i) => (
              <Card key={i} className={`p-8 text-center relative ${p.popular ? 'border-[#06B6D4]/40 shadow-[0_0_40px_rgba(6,182,212,0.15)] scale-105' : ''}`}>
                {p.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge variant="info" className="px-4 py-1 rounded-full text-xs">الأكثر طلباً</Badge>
                  </div>
                )}
                <h3 className="text-xl font-bold mb-2">{p.name}</h3>
                <div className="mb-6">
                  <span className="text-4xl font-black">${p.price}</span>
                  <span className="text-[#A1A1C2]">/شهر</span>
                </div>
                <ul className="space-y-3 mb-8 text-right">
                  {p.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm text-[#A1A1C2]">
                      <Check className="w-4 h-4 text-[#10D9A0]" /> {f}
                    </li>
                  ))}
                </ul>
                <Button variant={p.popular ? 'primary' : 'outline'} className="w-full rounded-full"
                  onClick={() => window.location.href = '/ar/auth/register'}>
                  {p.cta}
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 sm:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#7C3AED]/20 to-[#06B6D4]/10" />
        <div className="relative max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-5xl font-black mb-6">جهّز نشاطك للمستقبل</h2>
          <p className="text-lg text-[#A1A1C2] mb-8">أول 14 يوم مجاناً — بدون بطاقة ائتمان</p>
          <Button size="lg" className="rounded-full px-10 text-lg shadow-[0_0_40px_rgba(124,58,237,0.5)]"
            onClick={() => window.location.href = '/ar/auth/register'}>
            ابدأ مجاناً الآن <ChevronLeft className="w-5 h-5" />
          </Button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-12 border-t border-[#7C3AED]/10">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center font-black text-white text-sm">M</div>
              <span className="font-black gradient-brand-text">MARKETRON</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-[#A1A1C2]">
              <a href="#" className="hover:text-[#F5F3FF]">سياسة الخصوصية</a>
              <a href="#" className="hover:text-[#F5F3FF]">الشروط</a>
              <a href="#" className="hover:text-[#F5F3FF]">المساعدة</a>
            </div>
            <p className="text-xs text-[#A1A1C2]/60">© 2026 MARKETRON. جميع الحقوق محفوظة</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
