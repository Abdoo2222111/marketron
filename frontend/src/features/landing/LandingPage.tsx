'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  Bot, BarChart3, Sparkles, TrendingUp, MessageSquare, Shield,
  ChevronLeft, Star, Check, Menu, X, ArrowLeft, Play,
  Building2, Share2, CheckCircle, ChevronDown,
  Sun, Moon, Globe,
} from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { useLocalization } from '@/hooks/useLocalization';
import { ParticlesBackground } from '@/components/ui/ParticlesBackground';

const LOGO_URL = '/logo.png';

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

const CUBES = [
  { x: 3,  y: 8,  size: '110px', delay: 0 },
  { x: 88, y: 12, size: '70px',  delay: 1.2 },
  { x: 12, y: 72, size: '55px',  delay: 2.5 },
  { x: 82, y: 68, size: '90px',  delay: 0.8 },
  { x: 50, y: 4,  size: '65px',  delay: 1.8 },
  { x: 92, y: 42, size: '45px',  delay: 3.2 },
  { x: 25, y: 42, size: '40px',  delay: 0.5 },
  { x: 70, y: 55, size: '50px',  delay: 2.0 },
  { x: 45, y: 85, size: '35px',  delay: 1.5 },
];

const features = [
  { icon: Bot,        title: 'وكيل مبيعات ذكي 24/7',      desc: 'يرد على عملائك بشكل طبيعي، يفهم نشاطك، ويحول الاستفسارات لمبيعات',             color: '#7C3AED' },
  { icon: BarChart3,  title: 'لوحة تحكم موحدة',            desc: 'كل حملاتك على Meta وGoogle وTikTok في مكان واحد مع تقارير لحظية',               color: '#06B6D4' },
  { icon: Sparkles,   title: 'توليد محتوى بالذكاء الاصطناعي', desc: 'نصوص إعلانية وصور بأسلوبك بالعربية — جاهزة للنشر في ثوانٍ',                    color: '#EC4899' },
  { icon: TrendingUp, title: 'تحليل وتحسين الحملات',       desc: 'تقارير ذكية تحدد نقاط القوة والضعف وتقترح تحسينات فورية',                         color: '#7C3AED' },
  { icon: MessageSquare, title: 'صندوق وارد موحد',         desc: 'كل محادثات واتساب وعملائك في مكان واحد مع ردود AI ذكية',                         color: '#06B6D4' },
  { icon: Shield,     title: 'موافقتك أولاً',              desc: 'لا ينشر أي حملة بدون موافقتك — تحكم كامل بدون قلق',                                color: '#10D9A0' },
];

const steps = [
  { num: '01', title: 'سجّل وعرّف نشاطك',      desc: 'أخبرنا عن نشاطك التجاري ومنتجاتك وجمهورك في 5 دقائق',              icon: Building2 },
  { num: '02', title: 'اربط حساباتك الإعلانية',  desc: 'اربط Meta وGoogle وTikTok بنقرة — نجلب كل حملاتك تلقائياً',         icon: Share2 },
  { num: '03', title: 'الذكاء الاصطناعي يبدأ العمل', desc: 'يحلل أداء حملاتك، يرد على عملائك، ويولّد محتوى مخصص',         icon: Bot },
  { num: '04', title: 'أنت تتحكم، هو ينفّذ',     desc: 'تراجع كل شيء وتوافق قبل النشر — تحكم كامل مع توفير 80% من وقتك',    icon: CheckCircle },
];

const plans = [
  { name: 'تجريبي', price: 'مجاني', period: '', desc: 'للتجربة والاستكشاف', features: ['وكيل ذكي (50 رسالة/شهر)', 'لوحة تحكم أساسية', 'منصة واحدة'], cta: 'ابدأ مجاناً', highlight: false },
  { name: 'احترافي', price: '299', period: 'ريال / شهر', desc: 'للأعمال النشطة', features: ['وكيل ذكي غير محدود', '3 منصات إعلانية', 'توليد محتوى AI', 'تحليل متقدم', 'دعم واتساب'], cta: 'ابدأ الآن', highlight: true, badge: 'الأكثر طلباً' },
  { name: 'مؤسسي', price: '799', period: 'ريال / شهر', desc: 'للشركات الكبيرة', features: ['كل مميزات الاحترافي', 'مستخدمين غير محدودين', 'API مخصص', 'مدير حساب مخصص', 'SLA مضمون'], cta: 'تواصل معنا', highlight: false },
];

const testimonials = [
  { name: 'أحمد السيد', role: 'مدير تسويق', company: 'شركة التقنية المتقدمة', text: 'منذ استخدام MARKETRON، زادت كفاءة حملاتنا بنسبة ٤٠٪. الوكيل الذكي وفر علينا ساعات من الرد على العملاء.', rating: 5 },
  { name: 'سارة العنزي', role: 'صاحبة متجر إلكتروني', company: 'متجر روز للتجميل', text: 'لم أتوقع أن أجد منصة عربية متكاملة بهذا المستوى. توليد المحتوى بالعربية دقيق جداً وأوفر ٧٠٪ من وقتي.', rating: 5 },
  { name: 'فيصل المطيري', role: 'مستشار تسويق رقمي', company: 'مكتب فيصل للاستشارات', text: 'أرشح MARKETRON لكل عملاي. لوحة التحكم الموحدة تغنيك عن ٣ أدوات مختلفة. منصة مذهلة.', rating: 5 },
  { name: 'نورة الدوسري', role: 'مديرة علامة تجارية', company: 'مجموعة الضيافة العربية', text: 'تقارير التحليل الذكية ساعدتنا نحدد نقاط الضعف في حملاتنا بسرعة. التوصيات دائماً دقيقة ومفيدة.', rating: 5 },
  { name: 'عبدالله الزهراني', role: 'رائد أعمال', company: 'منصة زاد للتجارة', text: 'بدأت بالخطة التجريبية وبعد أسبوع انتقلت للاحترافية. الفرق واضح — وكيل ذكي وتقارير وتوليد محتوى بجودة احترافية.', rating: 5 },
  { name: 'هند الشمري', role: 'أخصائية تسويق', company: 'وكالة براند للإعلان', text: 'أفضل ما في MARKETRON أنه ينشر بإذنك — تحكم كامل بدون مفاجآت. عملاي يثقون فيّ أكثر.', rating: 5 },
];

function TestimonialsSection() {
  return (
    <section className="py-24 px-4 overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-purple-400 text-sm font-bold tracking-widest mb-4 block">شهادات العملاء</span>
          <h2 className="text-4xl sm:text-5xl font-black mb-4">
            ماذا يقول <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">عملاؤنا</span>
          </h2>
          <p className="text-gray-400 text-lg">آلاف المسوقين يثقون في MARKETRON — اكتشف لماذا</p>
        </div>
        <div className="relative">
          <div className="testimonial-track">
            {[...testimonials, ...testimonials].map((t, i) => (
              <div key={i} className="testimonial-card">
                <div className="flex items-center gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} size={14} className="text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-gray-300 text-sm leading-relaxed mb-6">&ldquo;{t.text}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-cyan-400 flex items-center justify-center text-white font-bold text-sm shadow-[0_0_15px_rgba(124,58,237,0.3)]">
                    {t.name[0]}
                  </div>
                  <div>
                    <div className="text-white font-semibold text-sm">{t.name}</div>
                    <div className="text-gray-500 text-xs">{t.role} &middot; {t.company}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="absolute top-0 left-0 bottom-0 w-32 bg-gradient-to-r from-[#0B0A1A] to-transparent pointer-events-none z-10" />
          <div className="absolute top-0 right-0 bottom-0 w-32 bg-gradient-to-l from-[#0B0A1A] to-transparent pointer-events-none z-10" />
        </div>
      </div>
    </section>
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
  const { t, i18n } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const { setLocale } = useLocalization();
  const [mobileMenu, setMobileMenu] = useState(false);
  const locale = i18n.language || 'ar';
  const LANGUAGES = [
    { code: 'ar', label: 'العربية', dir: 'rtl' },
    { code: 'en', label: 'English', dir: 'ltr' },
    { code: 'fr', label: 'Français', dir: 'ltr' },
    { code: 'tr', label: 'Türkçe', dir: 'ltr' },
  ] as const;
  const currentLang = LANGUAGES.find(l => l.code === locale) || LANGUAGES[0];

  return (
    <div dir="rtl" className="min-h-screen bg-[#0B0A1A] text-white overflow-x-hidden">
      <ParticlesBackground />
      <ScrollProgress />
      {/* ===== Floating Cubes Background ===== */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] rounded-full bg-gradient-radial from-purple-600/15 via-purple-900/5 to-transparent blur-3xl" />
        <div className="bg-grid absolute inset-0 opacity-[0.03]" />
        {CUBES.map((c, i) => <FloatingCube key={i} {...c} />)}
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
            {/* Language Switcher */}
            <div className="flex items-center gap-1 text-[#A1A1C2]">
              {LANGUAGES.map(l => (
                <button
                  key={l.code}
                  onClick={() => setLocale(l.code)}
                  className={`px-2 py-1 text-xs rounded transition-all ${
                    locale === l.code ? 'bg-purple-500/20 text-purple-400' : 'hover:text-white'
                  }`}
                >
                  {l.label.slice(0, 2)}
                </button>
              ))}
            </div>
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-[#A1A1C2] hover:text-white hover:bg-white/5 transition-all"
            >
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

      {mobileMenu && (
        <div className="fixed inset-0 z-40 bg-[#0B0A1A]/95 backdrop-blur-2xl pt-24">
          <div className="flex flex-col items-center gap-6 p-8">
            <a href="/ar/services" onClick={() => setMobileMenu(false)} className="text-xl text-white font-bold">خدماتنا</a>
            <a href="#features" onClick={() => setMobileMenu(false)} className="text-lg text-[#A1A1C2]">المميزات</a>
            <a href="#pricing" onClick={() => setMobileMenu(false)} className="text-lg text-[#A1A1C2]">الأسعار</a>
            <a href="https://wa.me/201011273472" target="_blank" rel="noopener noreferrer" className="text-lg text-emerald-400">واتساب: 01011273472</a>
            <a href={`/${locale}/auth/login`} className="text-lg text-[#A1A1C2]">تسجيل الدخول</a>
            <a href={`/${locale}/auth/register`} className="mt-4 px-8 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-bold">ابدأ مجاناً</a>
            {/* Language Switcher - Mobile */}
            <div className="flex items-center gap-3 mt-4">
              {LANGUAGES.map(l => (
                <button
                  key={l.code}
                  onClick={() => { setLocale(l.code); setMobileMenu(false); }}
                  className={`px-3 py-1.5 text-sm rounded transition-all ${
                    locale === l.code ? 'bg-purple-500/20 text-purple-400 border border-purple-500/40' : 'text-[#A1A1C2] border border-transparent'
                  }`}
                >
                  {l.label}
                </button>
              ))}
            </div>
            {/* Theme Toggle - Mobile */}
            <button
              onClick={toggleTheme}
              className="flex items-center gap-2 text-[#A1A1C2] hover:text-white transition-colors"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              <span>{theme === 'dark' ? 'الوضع النهاري' : 'الوضع الليلي'}</span>
            </button>
          </div>
        </div>
      )}

      {/* ===== HERO SECTION ===== */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20 hero-grid hero-grid-cyan">
        <div className="gradient-orb w-[500px] h-[500px] bg-purple-600/20" style={{ top: '0%', left: '0%', animationDelay: '0s' }} />
        <div className="gradient-orb w-[400px] h-[400px] bg-cyan-500/15" style={{ top: '50%', right: '0%', animationDelay: '-3s' }} />
        <div className="gradient-orb w-[300px] h-[300px] bg-pink-500/10" style={{ top: '30%', left: '50%', animationDelay: '-6s' }} />
        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <div className="flex justify-center mb-10">
              <motion.img src={LOGO_URL} alt="MARKETRON" className="h-24 sm:h-32 w-auto opacity-95 drop-shadow-[0_0_20px_rgba(124,58,237,0.4)]" initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.6 }} />
            </div>
            <div className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-purple-900/40 border border-purple-500/40 text-purple-200 text-sm font-bold mb-8 animate-fade-in-down shadow-[0_0_20px_rgba(124,58,237,0.2)]">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
              منصة الذكاء الاصطناعي للتسويق الرقمي
            </div>
            <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black leading-tight mb-8 animate-fade-in-up [text-shadow:_0_0_30px_rgba(6,182,212,0.3)]">
              حملاتك الإعلانية
              <br />
              <span className="bg-gradient-to-r from-cyan-300 via-purple-300 to-cyan-300 bg-clip-text text-transparent animate-gradient-x">
                بعقل ذكي يفهمك
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in-up animation-delay-200">
              أدر حملاتك على Meta وGoogle وTikTok من مكان واحد،
              <br />مع وكيل ذكاء اصطناعي يرد على عملائك 24/7 ويولّد محتوى تسويقي احترافي
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up animation-delay-400">
              <a href={`/${locale}/auth/register`}
                className="group px-8 py-4 rounded-2xl font-bold text-white text-lg bg-gradient-to-r from-purple-600 to-cyan-500 shadow-[0_0_30px_rgba(124,58,237,0.5)] hover:shadow-[0_0_50px_rgba(124,58,237,0.8)] hover:scale-105 transition-all duration-300 flex items-center gap-3">
                ابدأ مجاناً الآن <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              </a>
              <a href="#features"
                className="px-8 py-4 rounded-2xl font-semibold text-purple-300 text-lg border border-purple-500/40 bg-purple-900/20 hover:bg-purple-900/40 hover:border-purple-400 transition-all duration-300 flex items-center gap-3">
                <Play className="w-5 h-5 text-cyan-400" /> شاهد كيف يعمل
              </a>
            </div>
            <div className="mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto animate-fade-in-up animation-delay-600">
              {[
                { num: '٥٠٠+', label: 'حملة مُدارة' },
                { num: '٩٨٪',   label: 'رضا العملاء' },
                { num: '24/7',  label: 'وكيل ذكي نشط' },
              ].map(({ num, label }) => (
                <div key={label} className="text-center">
                  <div className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">{num}</div>
                  <div className="text-gray-500 text-sm mt-1">{label}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce text-gray-600">
          <ChevronDown size={28} />
        </div>
      </section>

      {/* ===== TRUST BAR ===== */}
      <section className="py-12 border-y border-purple-900/20 bg-gradient-to-r from-transparent via-purple-900/5 to-transparent">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <p className="text-gray-500 text-sm mb-6">يتكامل مع المنصات الإعلانية الكبرى</p>
          <div className="flex items-center justify-center gap-6 sm:gap-8 flex-wrap">
            {[
              { name: 'Meta Ads',   emoji: '📘' },
              { name: 'Google Ads', emoji: '🎯' },
              { name: 'TikTok Ads', emoji: '🎵' },
              { name: 'WhatsApp',   emoji: '💬' },
              { name: 'Snapchat',   emoji: '👻' },
              { name: 'Instagram',  emoji: '📸' },
            ].map(({ name, emoji }) => (
              <div key={name} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#14102B] border border-purple-900/20 hover:border-purple-500/30 transition-all group">
                <span className="text-lg">{emoji}</span>
                <span className="text-gray-400 text-sm font-medium group-hover:text-white transition-colors">{name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section id="features" className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-purple-400 text-sm font-bold tracking-widest mb-4 block">المميزات</span>
            <h2 className="text-4xl sm:text-5xl font-black mb-4">
              كل ما تحتاجه في
              <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent"> مكان واحد</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">منصة متكاملة تجمع بين الذكاء الاصطناعي وأدوات التسويق الرقمي</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <motion.div key={i}
                  initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="group relative p-8 rounded-3xl bg-gradient-to-br from-[#14102B] to-[#1A1238] border border-purple-900/20 hover:border-purple-500/40 hover:-translate-y-3 transition-all duration-500 cursor-pointer hover:shadow-[0_0_50px_rgba(124,58,237,0.25)] before:absolute before:inset-0 before:rounded-3xl before:opacity-0 before:transition-opacity before:duration-500 hover:before:opacity-100 before:bg-gradient-to-br before:from-purple-600/10 before:to-transparent">
                  <div className="relative z-10">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-5 shadow-[0_0_25px_rgba(124,58,237,0.3)] group-hover:scale-110 transition-transform duration-300`}
                      style={{ background: `linear-gradient(135deg, ${f.color}50, ${f.color}20)` }}>
                      <Icon size={26} style={{ color: f.color }} />
                    </div>
                    <h3 className="text-white font-bold text-xl mb-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-cyan-300 group-hover:to-purple-300 transition-all duration-300">{f.title}</h3>
                    <p className="text-gray-400 text-sm leading-relaxed group-hover:text-gray-300 transition-colors duration-300">{f.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section className="py-32 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-900/5 to-transparent pointer-events-none" />
        <div className="absolute top-1/3 left-1/4 w-72 h-72 bg-purple-600/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-1/3 right-1/4 w-72 h-72 bg-cyan-600/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="max-w-5xl mx-auto relative">
          <div className="text-center mb-16">
            <span className="text-purple-400 text-sm font-bold tracking-widest mb-4 block">كيف يعمل</span>
            <h2 className="text-4xl sm:text-5xl font-black mb-4">
              ابدأ رحلة <span className="bg-gradient-to-r from-cyan-300 to-purple-300 bg-clip-text text-transparent">النجاح</span> في
              <br />
              <span className="text-white">أربع خطوات بسيطة</span>
            </h2>
            <p className="text-gray-400 text-lg">من التسجيل إلى الانطلاق — كل شيء جاهز في دقائق</p>
          </div>
          <div className="relative">
            <div className="hidden lg:block absolute top-8 left-[12%] right-[12%] h-px bg-gradient-to-r from-purple-600/0 via-purple-400/60 to-purple-600/0 shadow-[0_0_8px_rgba(124,58,237,0.3)]" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {steps.map((s, i) => {
                const Icon = s.icon;
                return (
                  <motion.div key={i} initial={{ opacity: 0, y: 30, scale: 0.95 }} whileInView={{ opacity: 1, y: 0, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.15, duration: 0.5 }} className="flex flex-col items-center text-center group">
                    <div className="relative mb-7">
                      <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-cyan-500/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500" />
                      <div className="relative w-20 h-20 rounded-2xl flex items-center justify-center bg-gradient-to-br from-purple-600/40 to-cyan-500/20 border border-purple-500/40 group-hover:border-purple-400/60 shadow-[0_0_30px_rgba(124,58,237,0.3)] group-hover:shadow-[0_0_50px_rgba(124,58,237,0.5)] group-hover:scale-110 transition-all duration-500">
                        <Icon size={30} className="text-purple-300 group-hover:text-white transition-colors duration-300" />
                      </div>
                      <span className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-purple-500 text-white text-sm font-bold flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.5)] group-hover:scale-110 transition-transform duration-300">{i + 1}</span>
                    </div>
                    <h3 className="text-white font-bold text-xl mb-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-cyan-300 group-hover:to-purple-300 transition-all duration-300">{s.title}</h3>
                    <p className="text-gray-400 text-sm leading-relaxed max-w-[220px] group-hover:text-gray-300 transition-colors duration-300">{s.desc}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ===== PRICING ===== */}
      <section id="pricing" className="py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-purple-400 text-sm font-bold tracking-widest mb-4 block">الأسعار</span>
            <h2 className="text-4xl sm:text-5xl font-black mb-4">خطط بسيطة وشفافة</h2>
            <p className="text-gray-400 text-lg">بدون رسوم خفية، بدون التزامات طويلة</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
            {plans.map((p, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className={`relative rounded-3xl p-8 transition-all duration-300 ${
                  p.highlight
                    ? 'bg-gradient-to-br from-purple-900/60 to-cyan-900/30 border border-purple-500/40 scale-105 pricing-card-highlight'
                    : 'bg-[#14102B] border border-purple-900/20 hover:border-purple-500/30'
                }`}>
                {p.badge && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-sm font-bold text-white bg-gradient-to-r from-purple-600 to-cyan-500">{p.badge}</div>
                )}
                <h3 className="text-white font-bold text-xl mb-1">{p.name}</h3>
                <p className="text-gray-400 text-sm mb-6">{p.desc}</p>
                <div className="mb-8">
                  <span className={`text-5xl font-black ${p.highlight ? 'text-white' : 'text-gray-200'}`}>{p.price}</span>
                  {p.period && <span className="text-gray-400 text-sm mr-2">{p.period}</span>}
                </div>
                <ul className="space-y-3 mb-8">
                  {p.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-3 text-gray-300 text-sm">
                      <Check size={16} className="text-cyan-400 flex-shrink-0" />{f}
                    </li>
                  ))}
                </ul>
                <a href={`/${locale}/auth/register`}
                  className={`block w-full py-3 rounded-xl font-bold text-center transition-all duration-200 ${
                    p.highlight
                      ? 'bg-gradient-to-r from-purple-600 to-cyan-500 text-white hover:opacity-90'
                      : 'border border-purple-500/40 text-purple-300 hover:bg-purple-900/30'
                  }`}>{p.cta}</a>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== TESTIMONIALS ===== */}
      <TestimonialsSection />

      {/* ===== CTA ===== */}
      <section className="py-32 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/30 via-[#0B0A1A] to-cyan-900/20" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-gradient-radial from-purple-600/10 via-cyan-500/5 to-transparent blur-3xl pointer-events-none" />
        <div className="absolute inset-0 bg-grid opacity-[0.02] pointer-events-none" />
        <div className="relative max-w-3xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-cyan-900/30 border border-cyan-500/30 text-cyan-300 text-sm font-bold mb-8">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              ابدأ رحلتك الآن
            </div>
            <h2 className="text-5xl sm:text-6xl font-black mb-6">
              <span className="bg-gradient-to-r from-cyan-300 via-purple-300 to-cyan-300 bg-clip-text text-transparent">جاهز لتطوير أعمالك</span>
              <span className="block text-white mt-2">باستخدام MARKETRON؟</span>
            </h2>
            <p className="text-lg text-gray-400 mb-10 max-w-xl mx-auto">ابدأ مجاناً اليوم — بدون بطاقة ائتمان، بدون التزامات. وانضم لأكثر من 500 مسوّق يستخدمون المنصة</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
              <a href={`/${locale}/auth/register`}
                className="group px-12 py-5 rounded-2xl font-bold text-white text-lg bg-gradient-to-r from-purple-600 to-cyan-500 shadow-[0_0_50px_rgba(124,58,237,0.5)] hover:shadow-[0_0_80px_rgba(124,58,237,0.8)] hover:scale-105 transition-all duration-300 flex items-center gap-3">
                ابدأ مجاناً الآن <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              </a>
              <a href="https://wa.me/201011273472" target="_blank" rel="noopener noreferrer"
                className="px-10 py-5 rounded-2xl font-semibold text-emerald-300 text-lg border border-emerald-500/50 bg-emerald-900/20 hover:bg-emerald-900/40 hover:scale-105 transition-all duration-300 flex items-center gap-2">
                <MessageSquare size={20} /> تواصل واتساب
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="border-t border-purple-900/20 py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <img src={LOGO_URL} alt="MARKETRON" className="h-14 w-auto drop-shadow-[0_0_15px_rgba(124,58,237,0.3)]" />
                <span className="text-white font-black text-xl bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">MARKETRON</span>
              </div>
              <p className="text-gray-500 text-sm leading-relaxed max-w-sm">
                منصة متكاملة للذكاء الاصطناعي والتسويق الرقمي — تساعدك على إدارة حملاتك وتنمية أعمالك بكفاءة أعلى
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">المنصة</h4>
              <ul className="space-y-2">
                {['المميزات', 'الأسعار', 'الحملات', 'الوكيل الذكي'].map(l => (
                  <li key={l}><a href="#" className="text-gray-500 text-sm hover:text-purple-400 transition-colors">{l}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">تواصل معنا</h4>
              <ul className="space-y-2">
                <li><a href="https://wa.me/201011273472" target="_blank" rel="noopener noreferrer" className="text-gray-500 text-sm hover:text-emerald-400 transition-colors">واتساب: 01011273472</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-purple-900/20 pt-8 flex items-center justify-between flex-wrap gap-4">
            <p className="text-gray-600 text-sm">© 2026 MARKETRON. جميع الحقوق محفوظة</p>
            <div className="flex items-center gap-6">
              <a href="#" className="text-gray-600 text-sm hover:text-purple-400 transition-colors">سياسة الخصوصية</a>
              <a href="#" className="text-gray-600 text-sm hover:text-purple-400 transition-colors">شروط الاستخدام</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
