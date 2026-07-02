'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  ChevronLeft, CheckCircle, Sparkles, Target, BarChart3, MessageCircle, Search, Shield, Zap, Users, Star, Camera, Play, TrendingUp, DollarSign, Clock, ArrowLeft, Menu, X, Code, ChevronDown,
} from 'lucide-react';
import { ParticlesBackground } from '@/components/ui/ParticlesBackground';

const LOGO_URL = '/logo.png';

const stats = [
  { value: '٥٠+', label: 'عميل نجحنا في خدمتهم' },
  { value: '٢٠٠+', label: 'حملة أطلقناها' },
  { value: '٩٨٪', label: 'نسبة رضا العملاء' },
  { value: '٣ سنوات', label: 'خبرة في المجال' },
];

const services = [
  {
    icon: TrendingUp,
    title: 'التسويق الإلكتروني',
    subtitle: 'الخدمة الأساسية',
    badge: 'الأقوى',
    desc: 'نصنع لك حملات إعلانية مدفوعة تحقق أعلى عائد استثمار. استهداف دقيق، إبداع لا محدود، ونتائج فورية على فيسبوك، إنستجرام، جوجل، تيك توك.',
    features: [
      'إدارة متكاملة لحملات فيسبوك وإنستجرام',
      'استهداف الجمهور المثالي بدقة متناهية',
      'إعلانات جوجل (بحث، عرض، تسوق)',
      'تحليل أداء فوري وتقارير أسبوعية',
      'تحسين مستمر لزيادة العائد (ROAS)',
    ],
    color: 'from-[#7C3AED] to-[#06B6D4]',
    glow: 'glow-purple',
  },
  {
    icon: Camera,
    title: 'التصميم الإعلاني',
    subtitle: 'هوية بصرية',
    badge: 'إبداعي',
    desc: 'تصاميم احترافية تنقل علامتك التجارية لمستوى جديد. بوستات، بنرات، فيديوهات، وهويات كاملة تأسر انتباه جمهورك.',
    features: [
      'تصاميم بوستات سوشيال ميديا',
      'بنرات إعلانية متجاوبة',
      'فيديوهات تسويقية وموشن جرافيك',
      'هوية بصرية متكاملة',
      'تصاميم متوافقة مع جميع المنصات',
    ],
    color: 'from-pink-500 to-rose-500',
    glow: 'glow-pink',
  },
  {
    icon: Code,
    title: 'تطوير وبناء المواقع',
    subtitle: 'حلول رقمية',
    badge: 'متقدم',
    desc: 'نبني لك موقعاً إلكترونياً عصرياً بأحدث التقنيات. سريع، آمن، ومتوافق مع جميع الأجهزة — يعكس احترافية علامتك التجارية.',
    features: [
      'مواقع شركات وهوية رقمية',
      'متاجر إلكترونية متكاملة',
      'لوحات تحكم وتحليلات',
      'تحسين محركات البحث (SEO)',
      'سرعة أداء فائقة وتجربة مستخدم',
    ],
    color: 'from-emerald-500 to-teal-500',
    glow: 'glow-emerald',
  },
  {
    icon: Users,
    title: 'استشارات تسويقية',
    subtitle: 'خطط مخصصة',
    badge: 'استراتيجي',
    desc: 'نقدم استشارات تسويقية متخصصة بناءً على تحليل دقيق لسوقك ومنافسيك. خطط مخصصة تناسب ميزانيتك وتحقق أهدافك.',
    features: [
      'تحليل السوق والمنافسين',
      'استراتيجية تسويقية متكاملة',
      'خطط محتوى شهرية',
      'تحليل بيانات وتقارير معمقة',
      'إدارة حسابات التواصل الاجتماعي',
    ],
    color: 'from-amber-500 to-orange-500',
    glow: 'glow-amber',
  },
];

const packages = [
  {
    name: 'باقة التسويق المتكامل',
    price: 3000,
    half: 1500,
    popular: true,
    desc: 'انطلاقة قوية لحملتك الإعلانية — أفضل قيمة لبداية احترافية',
    features: [
      '📊 إدارة حملة إعلانية على ميتا (فيسبوك + إنستجرام) لمدة شهر كامل',
      '🎨 ١٠ تصاميم احترافية لبوستات السوشيال ميديا',
      '🎬 فيديوهين تسويقيين احترافيين (Reels / TikTok)',
      '🎯 استهداف دقيق للجمهور المثالي لمنتجك',
      '📈 تقارير أداء أسبوعية مفصلة',
      '💡 تحسين مستمر للحملة (A/B Testing)',
      '📞 دعم فني واستشاري على مدار الشهر',
    ],
  },
  {
    name: 'الباقة المتقدمة',
    price: 8000,
    half: 4000,
    popular: false,
    desc: 'حل متكامل للشركات المتوسطة — تسويق + تصميم + فيديو',
    features: [
      '📊 إدارة حملات على ٣ منصات (ميتا + جوجل + تيك توك)',
      '🎨 ٢٥ تصميماً احترافياً لجميع المنصات',
      '🎬 ٥ فيديوهات تسويقية احترافية',
      '🌐 تصميم وتطوير موقع بسيط (صفحة هبوط)',
      '🎯 استهداف دقيق + إعادة استهداف',
      '📈 تقارير أداء يومية',
      '💡 تحسين متقدم + استراتيجية محتوى',
      '📞 دعم فني واستشاري لمدة ٣ أشهر',
    ],
  },
  {
    name: 'الباقة الاحترافية',
    price: 15000,
    half: 7500,
    popular: false,
    desc: 'حل شامل للمؤسسات — تواجد رقمي متكامل وإدارة كاملة',
    features: [
      '📊 إدارة حملات على جميع المنصات',
      '🎨 ٥٠ تصميماً احترافياً + هوية بصرية كاملة',
      '🎬 ١٠ فيديوهات تسويقية + موشن جرافيك',
      '🌐 تطوير موقع متكامل (متعدد الصفحات)',
      '🎯 استراتيجية تسويق متكاملة',
      '📈 تقارير أداء يومية + تحليلات متقدمة',
      '🔍 تحليل سوق ومنافسين شامل',
      '💡 دعم استشاري واستراتيجي مستمر',
      '📞 دعم فني ودعم تسويقي لمدة ٦ أشهر',
    ],
  },
];

const workflow = [
  { icon: MessageCircle, title: 'استشارة مجانية', desc: 'نتواصل معك نفهم احتياجك ونقدم لك أفضل خطة' },
  { icon: Target, title: 'إعداد الاستراتيجية', desc: 'نضع خطة تسويقية مخصصة بناءً على هدفك وميزانيتك' },
  { icon: Sparkles, title: 'التنفيذ والإبداع', desc: 'ننفذ الحملات والتصاميم بأعلى جودة واحترافية' },
  { icon: BarChart3, title: 'تحليل وتحسين', desc: 'نتابع الأداء ونحسن باستمرار لنحقق أفضل نتائج' },
];

const faqs = [
  { q: 'كم يستغرق تنفيذ الحملة الإعلانية؟', a: 'نبدأ العمل فوراً بعد الاتفاق. أول نتائج الحملة تظهر خلال ٢٤-٤٨ ساعة من الإطلاق، والتقارير الأسبوعية تظهر التحسينات المستمرة.' },
  { q: 'هل التصاميم والفيديوهات حصرية؟', a: 'نعم، جميع التصاميم والفيديوهات حصرية ١٠٠٪ ومملوكة لك بعد التسليم.' },
  { q: 'ماذا يحدث إذا ما عجبتني النتائج؟', a: 'نظام "نصف القبل ونصف البعد" يضمن رضاك التام. تدفع ٥٠٪ فقط عند البداية، والباقي بعد استلام العمل النهائي والتأكد من رضاك.' },
  { q: 'هل تقدمون ضمان على الخدمة؟', a: 'نضمن جودة العمل واحترافيته. إذا لم تكن راضياً عن أي عمل، نعيد تنفيذه مجاناً حتى ترضى تماماً.' },
];

const CUBES = [
  { x: 5, y: 10, size: '120px', delay: 0, className: '' },
  { x: 85, y: 15, size: '80px', delay: 1.5, className: 'cube-3d-cyan' },
  { x: 15, y: 70, size: '60px', delay: 2.5, className: 'cube-3d-pink' },
  { x: 80, y: 65, size: '100px', delay: 0.8, className: 'cube-3d-emerald' },
  { x: 48, y: 5, size: '70px', delay: 2.0, className: '' },
  { x: 90, y: 40, size: '50px', delay: 3.2, className: 'cube-3d-cyan' },
  { x: 22, y: 45, size: '45px', delay: 0.5, className: 'cube-3d-pink' },
  { x: 68, y: 52, size: '55px', delay: 2.2, className: '' },
  { x: 42, y: 82, size: '40px', delay: 1.8, className: 'cube-3d-emerald' },
];

function FloatingCube({ x, y, size, delay, className = '' }: { x: number; y: number; size: string; delay: number; className?: string }) {
  return (
    <div
      className={`cube-3d ${className}`}
      style={{
        left: `${x}%`, top: `${y}%`,
        width: size, height: size,
        animationDelay: `${delay}s`,
      }}
    />
  );
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const staggerItem = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

export const ServicesPage: React.FC = () => {
  const [expandedService, setExpandedService] = React.useState<number | null>(null);
  const [mobileMenu, setMobileMenu] = React.useState(false);
  const [activeFaq, setActiveFaq] = React.useState<number | null>(null);

  return (
    <div dir="rtl" className="min-h-screen bg-[#0B0826] text-white font-sans overflow-x-hidden">
      <ParticlesBackground count={100} interactive />

      {/* Floating Cubes */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] radial-glow radial-glow-purple" />
        <div className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] radial-glow radial-glow-cyan" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-gradient-radial from-[#7C3AED]/8 via-transparent to-transparent blur-3xl" />
        <div className="bg-grid absolute inset-0 opacity-[0.03]" />
        {CUBES.map((c, i) => <FloatingCube key={i} {...c} />)}
      </div>

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <motion.a href="/ar/services" className="flex items-center gap-3" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
            <img src={LOGO_URL} alt="MARKETRON" className="h-16 sm:h-20 w-auto drop-shadow-[0_0_15px_rgba(124,58,237,0.3)]" />
          </motion.a>
          <motion.div className="hidden md:flex items-center gap-8" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
            <a href="#services" className="text-sm text-[#A1A1C2] hover:text-white transition-colors relative group">
              الخدمات
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-[#7C3AED] to-[#06B6D4] group-hover:w-full transition-all duration-300" />
            </a>
            <a href="#pricing" className="text-sm text-[#A1A1C2] hover:text-white transition-colors relative group">
              الباقات
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-[#7C3AED] to-[#06B6D4] group-hover:w-full transition-all duration-300" />
            </a>
            <a href="#how" className="text-sm text-[#A1A1C2] hover:text-white transition-colors relative group">
              طريقة العمل
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-[#7C3AED] to-[#06B6D4] group-hover:w-full transition-all duration-300" />
            </a>
            <a href="#faq" className="text-sm text-[#A1A1C2] hover:text-white transition-colors relative group">
              الأسئلة
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-[#7C3AED] to-[#06B6D4] group-hover:w-full transition-all duration-300" />
            </a>
            <a href="#contact" className="btn-gradient px-5 py-2.5 rounded-xl text-white font-bold text-sm hover:shadow-2xl hover:shadow-[#7C3AED]/40 transition-all duration-300">
              تواصل معنا
            </a>
          </motion.div>
          <motion.button onClick={() => setMobileMenu(!mobileMenu)} className="md:hidden p-2 rounded-lg hover:bg-[#7C3AED]/10 text-[#A1A1C2]" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {mobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </motion.button>
        </div>
        {mobileMenu && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="md:hidden glass-strong border-t border-[#7C3AED]/10 px-4 py-6 space-y-4">
            <a href="#services" onClick={() => setMobileMenu(false)} className="block text-sm text-[#A1A1C2] hover:text-white">الخدمات</a>
            <a href="#pricing" onClick={() => setMobileMenu(false)} className="block text-sm text-[#A1A1C2] hover:text-white">الباقات</a>
            <a href="#how" onClick={() => setMobileMenu(false)} className="block text-sm text-[#A1A1C2] hover:text-white">طريقة العمل</a>
            <a href="#faq" onClick={() => setMobileMenu(false)} className="block text-sm text-[#A1A1C2] hover:text-white">الأسئلة</a>
            <a href="#contact" onClick={() => setMobileMenu(false)} className="block text-center py-3 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#06B6D4] text-white font-bold text-sm">تواصل معنا</a>
          </motion.div>
        )}
      </nav>

      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-24">
        <div className="relative z-10 text-center px-4 max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <motion.div className="flex justify-center mb-10" initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.6 }}>
              <img src={LOGO_URL} alt="MARKETRON" className="h-28 sm:h-36 w-auto opacity-95 drop-shadow-[0_0_30px_rgba(124,58,237,0.5)]" />
            </motion.div>
            <motion.div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full badge-glow text-sm text-[#A1A1C2] mb-8" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <Sparkles className="w-4 h-4 text-[#06B6D4]" />
              وكالتك المتكاملة للتسويق والتصميم والتطوير
            </motion.div>
            <motion.h1 className="text-4xl sm:text-6xl lg:text-8xl font-black leading-tight mb-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <span className="bg-gradient-to-r from-[#7C3AED] via-[#06B6D4] to-emerald-400 bg-clip-text text-transparent animate-gradient-x" style={{ backgroundSize: '200% auto' }}>
                سوّق، صمّم، وانطلق
              </span>
              <br />
              <span className="text-white" style={{ textShadow: '0 0 30px rgba(6,182,212,0.3)' }}>
                علامتك التجارية تستحق الأفضل
              </span>
            </motion.h1>
            <motion.p className="text-lg sm:text-xl text-[#A1A1C2] max-w-3xl mx-auto mb-10 leading-relaxed" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
              من الإعلانات المدفوعة والتصاميم الاحترافية إلى تطوير المواقع — نقدم لك كل ما تحتاجه
              <br className="hidden sm:block" /> في مكان واحد باحترافية عالية ونتائج مضمونة
            </motion.p>
            <motion.div className="flex flex-col sm:flex-row items-center justify-center gap-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
              <a href="#pricing" className="group px-8 py-4 rounded-xl btn-gradient text-white font-bold text-lg hover:glow-purple-lg transition-all duration-300 flex items-center gap-2">
                اطلع على الباقات
                <ArrowLeft className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </a>
              <a href="https://wa.me/201011273472" target="_blank" rel="noopener noreferrer" className="px-8 py-4 rounded-xl border-2 border-emerald-500/50 text-emerald-400 font-bold text-lg hover:bg-emerald-500/10 hover:border-emerald-400 hover:glow-emerald transition-all duration-300 flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                تواصل واتساب
              </a>
            </motion.div>
          </motion.div>
        </div>
        <motion.div className="absolute bottom-8 left-1/2 -translate-x-1/2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }}>
          <ChevronDown size={32} className="text-[#7C3AED] animate-bounce" />
        </motion.div>
      </section>

      {/* Stats */}
      <section className="py-16 border-y border-[#7C3AED]/10 bg-[#14102B]/30 relative">
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <motion.div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12" variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            {stats.map((s, i) => (
              <motion.div key={i} className="text-center group" variants={staggerItem}>
                <p className="text-4xl sm:text-5xl font-black bg-gradient-to-r from-[#7C3AED] to-[#06B6D4] bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform">{s.value}</p>
                <p className="text-sm text-[#A1A1C2]">{s.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="py-24 px-4 relative">
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div className="text-center mb-16" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <span className="text-[#06B6D4] text-sm font-bold tracking-widest mb-4 block">الخدمات</span>
            <h2 className="text-4xl sm:text-5xl font-black mb-4">خدماتنا المتكاملة</h2>
            <p className="text-[#A1A1C2] text-lg max-w-2xl mx-auto">كل ما تحتاجه لبناء وتنمية علامتك التجارية — من التسويق إلى التصميم والتطوير</p>
          </motion.div>
          <motion.div className="space-y-6" variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            {services.map((srv, i) => {
              const Icon = srv.icon;
              const isExpanded = expandedService === i;
              return (
                <motion.div key={i} variants={staggerItem}>
                  <div
                    className={`group relative rounded-2xl border transition-all duration-500 overflow-hidden hover-lift-3d ${
                      i === 0
                        ? 'card-neon-strong ring-2 ring-[#7C3AED]/30'
                        : 'card-neon'
                    }`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-[#7C3AED]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative p-6 sm:p-8 flex flex-col sm:flex-row gap-6">
                      <div className="flex-shrink-0">
                        <motion.div
                          className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${srv.color} flex items-center justify-center shadow-lg ${srv.glow}`}
                          whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.1 }}
                          transition={{ duration: 0.5 }}
                        >
                          <Icon className="w-8 h-8 text-white" />
                        </motion.div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <h3 className="text-xl font-bold group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-[#7C3AED] group-hover:to-[#06B6D4] transition-all duration-300">{srv.title}</h3>
                          <span className="text-xs text-[#A1A1C2]">/ {srv.subtitle}</span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            i === 0 ? 'badge-glow text-white' : 'bg-[#7C3AED]/10 text-[#A1A1C2]'
                          }`}>{srv.badge}</span>
                        </div>
                        <p className="text-sm text-[#A1A1C2] leading-relaxed mb-3">{srv.desc}</p>
                        <button
                          onClick={() => setExpandedService(isExpanded ? null : i)}
                          className="flex items-center gap-1 text-sm text-[#06B6D4] hover:text-[#7C3AED] transition-colors"
                        >
                          {isExpanded ? 'عرض أقل' : 'عرض التفاصيل'}
                          <ChevronLeft className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                        </button>
                        {isExpanded && (
                          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {srv.features.map((f, j) => (
                              <div key={j} className="flex items-center gap-2 text-sm text-[#A1A1C2] bg-[#0B0826]/50 rounded-lg p-2 hover:bg-[#0B0826]/70 transition-colors">
                                <CheckCircle className="w-4 h-4 text-[#06B6D4] flex-shrink-0" />
                                {f}
                              </div>
                            ))}
                          </motion.div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#7C3AED]/5 to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div className="text-center mb-16" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full badge-emerald text-sm mb-4">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              نظام دفع مرن — ادفع ٥٠٪ عند البداية و ٥٠٪ عند التسليم
            </div>
            <h2 className="text-4xl sm:text-5xl font-black mb-4">باقاتنا المصممة لتناسبك</h2>
            <p className="text-[#A1A1C2] text-lg max-w-2xl mx-auto">اختر الباقة التي تناسب احتياجك — كل الباقات تشمل ضمان الجودة والدعم الفني</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
            {packages.map((pkg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.6 }}
                className={`relative rounded-2xl transition-all duration-500 ${
                  pkg.popular
                    ? 'card-neon-strong ring-2 ring-[#7C3AED]/40 scale-105 z-10'
                    : 'card-neon'
                } p-8`}
              >
                {pkg.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-5 py-1.5 rounded-full bg-gradient-to-r from-[#7C3AED] to-[#06B6D4] text-xs font-bold text-white shadow-lg shadow-[#7C3AED]/30 whitespace-nowrap">
                    🏆 الأكثر طلباً
                  </div>
                )}
                <div className="text-center mb-8">
                  <h3 className="text-xl font-bold mb-2">{pkg.name}</h3>
                  <p className="text-[#A1A1C2] text-sm mb-6 leading-relaxed">{pkg.desc}</p>
                  <div className="flex items-baseline justify-center gap-1 mb-2">
                    <span className="text-5xl sm:text-6xl font-black gradient-brand-text">{pkg.price.toLocaleString()}</span>
                    <span className="text-[#A1A1C2] text-sm">ريال</span>
                  </div>
                  <div className="glass rounded-xl p-3 flex items-center justify-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-400" />
                      <span className="text-[#A1A1C2]">قبل:</span>
                      <span className="text-white font-bold">{pkg.half.toLocaleString()} ريال</span>
                    </div>
                    <span className="text-[#7C3AED]/30">|</span>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-[#06B6D4]" />
                      <span className="text-[#A1A1C2]">بعد:</span>
                      <span className="text-white font-bold">{pkg.half.toLocaleString()} ريال</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-3 mb-8">
                  {pkg.features.map((f, j) => (
                    <div key={j} className="flex items-start gap-2 text-sm text-[#A1A1C2]">
                      <span className="mt-0.5 text-emerald-400">✓</span>
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
                <a
                  href="https://wa.me/201011273472"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`block w-full text-center py-3.5 rounded-xl font-bold text-sm transition-all duration-300 ${
                    pkg.popular
                      ? 'btn-gradient text-white hover:glow-purple-lg'
                      : 'btn-glass text-white'
                  }`}
                >
                  {pkg.popular ? '🌐 اختر الباقة عبر واتساب' : 'تواصل معنا'}
                </a>
              </motion.div>
            ))}
          </div>
          <motion.div className="mt-12 text-center" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
            <div className="inline-flex flex-col items-center gap-4 p-6 sm:p-8 rounded-2xl glass-panel max-w-2xl mx-auto">
              <p className="text-sm text-[#A1A1C2]">جميع الباقات تشمل:</p>
              <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-[#A1A1C2]">
                <span className="flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> استشارة مجانية</span>
                <span className="flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> تقارير أداء دورية</span>
                <span className="flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> دعم فني مستمر</span>
                <span className="flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> ضمان الجودة</span>
                <span className="flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> حقوق الملكية الفكرية</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Payment Model */}
      <section className="py-20 px-4 relative">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full badge-emerald text-sm mb-6">
              <Shield className="w-4 h-4" />
              لماذا نقدم نظام الدفع المرن؟
            </div>
            <h3 className="text-3xl sm:text-4xl font-black mb-6">نصف القبل ونصف البعد — ثقة بلا مخاطر</h3>
            <p className="text-[#A1A1C2] text-lg leading-relaxed max-w-3xl mx-auto mb-12">
              في MARKETRON نؤمن أن نجاحنا مرتبط بنجاحك. لذلك نقدم لك نظام دفع مرناً يضمن راحتك التامة:
              تدفع <strong className="text-white">نصف المبلغ</strong> فقط عند الاتفاق — كتأكيد لجدية المشروع،
              و <strong className="text-white">النصف المتبقي</strong> عند استلام العمل النهائي بعد التأكد من رضاك التام.
              <br /><br />
              <span className="text-[#06B6D4] font-bold">لا مخاطر — لا التزام — فقط نتائج</span>
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-right max-w-3xl mx-auto">
              {[
                { icon: Users, title: 'ثقة متبادلة', desc: 'نستثمر وقتنا وجهدنا في مشروعك لأننا نؤمن بقدراتك', color: 'from-emerald-500 to-teal-500', glow: 'glow-emerald' },
                { icon: Star, title: 'جودة مضمونة', desc: 'لن تدفع الباقي إلا بعد رضاك التام عن العمل', color: 'from-[#7C3AED] to-[#06B6D4]', glow: 'glow-purple' },
                { icon: BarChart3, title: 'شفافية كاملة', desc: 'تقارير دورية ومتابعة مستمرة طول فترة المشروع', color: 'from-pink-500 to-rose-500', glow: 'glow-pink' },
              ].map((item, i) => {
                const Icon = item.icon;
                return (
                  <motion.div key={i} className="card-neon p-6 text-center" whileHover={{ y: -8, scale: 1.02 }} transition={{ duration: 0.3 }}>
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center mx-auto mb-4 ${item.glow}`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="font-bold text-base mb-2">{item.title}</h4>
                    <p className="text-sm text-[#A1A1C2]">{item.desc}</p>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Workflow */}
      <section id="how" className="py-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[#14102B]/30 pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#7C3AED]/5 blur-[120px] pointer-events-none" />
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div className="text-center mb-16" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <span className="text-[#06B6D4] text-sm font-bold tracking-widest mb-4 block">طريقة العمل</span>
            <h2 className="text-4xl sm:text-5xl font-black mb-4">كيف نعمل؟</h2>
            <p className="text-[#A1A1C2] text-lg max-w-2xl mx-auto">أربع خطوات بسيطة — من الاستشارة إلى النتائج</p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {workflow.map((step, i) => {
              const Icon = step.icon;
              return (
                <motion.div key={i} className="relative group" initial={{ opacity: 0, y: 30, scale: 0.95 }} whileInView={{ opacity: 1, y: 0, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }}>
                  <motion.div className="card-neon p-6 text-center" whileHover={{ y: -8, scale: 1.02 }}>
                    <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-gradient-to-r from-[#7C3AED] to-[#06B6D4] flex items-center justify-center text-sm font-bold shadow-lg glow-purple">
                      {i + 1}
                    </div>
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#06B6D4] flex items-center justify-center mx-auto mb-4 glow-purple group-hover:scale-110 transition-transform duration-300">
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="font-bold mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-[#7C3AED] group-hover:to-[#06B6D4] transition-all duration-300">{step.title}</h3>
                    <p className="text-sm text-[#A1A1C2]">{step.desc}</p>
                  </motion.div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24 px-4 relative">
        <div className="max-w-3xl mx-auto relative z-10">
          <motion.div className="text-center mb-16" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <span className="text-[#06B6D4] text-sm font-bold tracking-widest mb-4 block">الأسئلة الشائعة</span>
            <h2 className="text-4xl sm:text-5xl font-black mb-4">الأسئلة الشائعة</h2>
            <p className="text-[#A1A1C2] text-lg">إجابات عن أكثر الأسئلة التي تهمك</p>
          </motion.div>
          <motion.div className="space-y-4" variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            {faqs.map((faq, i) => (
              <motion.div key={i} variants={staggerItem} className="card-neon overflow-hidden">
                <button
                  onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                  className="w-full px-6 py-4 flex items-center justify-between text-right"
                >
                  <span className="font-bold text-sm sm:text-base">{faq.q}</span>
                  <ChevronLeft className={`w-5 h-5 text-[#A1A1C2] transition-transform flex-shrink-0 ${activeFaq === i ? 'rotate-90' : ''}`} />
                </button>
                {activeFaq === i && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="px-6 pb-4 text-sm text-[#A1A1C2] leading-relaxed">
                    {faq.a}
                  </motion.div>
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section id="contact" className="py-20 px-4 relative">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}>
            <div className="card-neon-strong p-8 sm:p-16 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#7C3AED] via-[#06B6D4] to-emerald-400" />
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-[#7C3AED]/15 rounded-full blur-[60px]" />
              <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-[#06B6D4]/10 rounded-full blur-[60px]" />
              <div className="relative">
                <h2 className="text-3xl sm:text-5xl font-black mb-4">جاهز لتطوير أعمالك؟</h2>
                <p className="text-[#A1A1C2] text-lg mb-8 max-w-lg mx-auto">
                  تواصل معنا الآن للحصول على استشارة مجانية — ونقدم لك أفضل خطة تسويقية تناسب ميزانيتك
                </p>
                <a
                  href="https://wa.me/201011273472"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-3 px-8 py-4 rounded-xl btn-gradient-emerald text-white font-bold text-lg hover:glow-emerald transition-all duration-300"
                >
                  <MessageCircle className="w-6 h-6" />
                  تواصل عبر واتساب: 01011273472
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#7C3AED]/10 py-10 px-4 relative">
        <div className="max-w-7xl mx-auto relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3 text-sm text-[#A1A1C2]">
            <img src={LOGO_URL} alt="MARKETRON" className="h-10 w-auto drop-shadow-[0_0_10px_rgba(124,58,237,0.2)]" />
            <span>© {new Date().getFullYear()} MARKETRON — جميع الحقوق محفوظة</span>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <a href="https://wa.me/201011273472" target="_blank" rel="noopener noreferrer" className="text-[#A1A1C2] hover:text-emerald-400 transition-colors flex items-center gap-1">
              <MessageCircle className="w-4 h-4" /> 01011273472
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ServicesPage;