'use client';

import React from 'react';
import { ChevronLeft, CheckCircle, Sparkles, Target, BarChart3, MessageCircle, Search, Shield, Zap, Users, Star, Camera, Play, TrendingUp, DollarSign, Clock, ArrowLeft, Menu, X, Code } from 'lucide-react';

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

export const ServicesPage: React.FC = () => {
  const [expandedService, setExpandedService] = React.useState<number | null>(null);
  const [mobileMenu, setMobileMenu] = React.useState(false);
  const [activeFaq, setActiveFaq] = React.useState<number | null>(null);

  const faqs = [
    { q: 'كم يستغرق تنفيذ الحملة الإعلانية؟', a: 'نبدأ العمل فوراً بعد الاتفاق. أول نتائج الحملة تظهر خلال ٢٤-٤٨ ساعة من الإطلاق، والتقارير الأسبوعية تظهر التحسينات المستمرة.' },
    { q: 'هل التصاميم والفيديوهات حصرية؟', a: 'نعم، جميع التصاميم والفيديوهات حصرية ١٠٠٪ ومملوكة لك بعد التسليم.' },
    { q: 'ماذا يحدث إذا ما عجبتني النتائج؟', a: 'نظام "نصف القبل ونصف البعد" يضمن رضاك التام. تدفع ٥٠٪ فقط عند البداية، والباقي بعد استلام العمل النهائي والتأكد من رضاك.' },
    { q: 'هل تقدمون ضمان على الخدمة؟', a: 'نضمن جودة العمل واحترافيته. إذا لم تكن راضياً عن أي عمل، نعيد تنفيذه مجاناً حتى ترضى تماماً.' },
  ];

  return (
    <div dir="rtl" className="min-h-screen bg-[#0B0826] text-white font-sans overflow-x-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0B0826]/90 backdrop-blur-2xl border-b border-[#7C3AED]/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <a href="/ar/services" className="flex items-center gap-3">
            <img src={LOGO_URL} alt="MARKETRON" className="h-10 sm:h-12 w-auto" />
          </a>
          <div className="hidden md:flex items-center gap-8">
            <a href="#services" className="text-sm text-[#A1A1C2] hover:text-white transition-colors">الخدمات</a>
            <a href="#pricing" className="text-sm text-[#A1A1C2] hover:text-white transition-colors">الباقات</a>
            <a href="#how" className="text-sm text-[#A1A1C2] hover:text-white transition-colors">طريقة العمل</a>
            <a href="#faq" className="text-sm text-[#A1A1C2] hover:text-white transition-colors">الأسئلة</a>
            <a href="#contact" className="text-sm px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#06B6D4] text-white font-bold hover:shadow-lg hover:shadow-[#7C3AED]/30 transition-all">تواصل معنا</a>
          </div>
          <button onClick={() => setMobileMenu(!mobileMenu)} className="md:hidden p-2 rounded-lg hover:bg-[#7C3AED]/10 text-[#A1A1C2]">
            {mobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
        {mobileMenu && (
          <div className="md:hidden bg-[#0B0826]/95 backdrop-blur-2xl border-t border-[#7C3AED]/10 px-4 py-6 space-y-4">
            <a href="#services" onClick={() => setMobileMenu(false)} className="block text-sm text-[#A1A1C2] hover:text-white">الخدمات</a>
            <a href="#pricing" onClick={() => setMobileMenu(false)} className="block text-sm text-[#A1A1C2] hover:text-white">الباقات</a>
            <a href="#how" onClick={() => setMobileMenu(false)} className="block text-sm text-[#A1A1C2] hover:text-white">طريقة العمل</a>
            <a href="#faq" onClick={() => setMobileMenu(false)} className="block text-sm text-[#A1A1C2] hover:text-white">الأسئلة</a>
            <a href="#contact" onClick={() => setMobileMenu(false)} className="block text-center py-3 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#06B6D4] text-white font-bold text-sm">تواصل معنا</a>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section className="relative pt-36 pb-24 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#7C3AED]/15 via-transparent to-[#0B0826]" />
        <div className="absolute top-32 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-[#7C3AED]/15 rounded-full blur-[150px]" />
        <div className="absolute top-64 left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-[#06B6D4]/10 rounded-full blur-[100px]" />
        <div className="relative max-w-6xl mx-auto text-center">
          <div className="flex justify-center mb-8">
            <img src={LOGO_URL} alt="MARKETRON" className="h-16 sm:h-20 w-auto opacity-90" />
          </div>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#7C3AED]/10 border border-[#7C3AED]/30 text-sm text-[#A1A1C2] mb-6 backdrop-blur-sm">
            <Sparkles className="w-4 h-4 text-[#06B6D4]" />
            وكالتك المتكاملة للتسويق والتصميم والتطوير
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black leading-tight mb-6">
            <span className="bg-gradient-to-r from-[#7C3AED] via-[#06B6D4] to-emerald-400 bg-clip-text text-transparent">سوّق، صمّم، وانطلق</span>
            <br />
            <span className="text-white">علامتك التجارية تستحق الأفضل</span>
          </h1>
          <p className="text-lg sm:text-xl text-[#A1A1C2] max-w-3xl mx-auto mb-10 leading-relaxed">
            من الإعلانات المدفوعة والتصاميم الاحترافية إلى تطوير المواقع — نقدم لك كل ما تحتاجه
            <br className="hidden sm:block" /> في مكان واحد باحترافية عالية ونتائج مضمونة
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="#pricing" className="group px-8 py-4 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#06B6D4] text-white font-bold text-lg hover:shadow-2xl hover:shadow-[#7C3AED]/30 transition-all duration-300 flex items-center gap-2">
              اطلع على الباقات
              <ArrowLeft className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </a>
            <a href="https://wa.me/201011273472" target="_blank" rel="noopener noreferrer" className="px-8 py-4 rounded-xl border-2 border-emerald-500/50 text-emerald-400 font-bold text-lg hover:bg-emerald-500/10 hover:border-emerald-400 transition-all duration-300 flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              تواصل واتساب
            </a>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 border-y border-[#7C3AED]/10 bg-[#14102B]/30">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            {stats.map((s, i) => (
              <div key={i} className="text-center group">
                <p className="text-4xl sm:text-5xl font-black bg-gradient-to-r from-[#7C3AED] to-[#06B6D4] bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform">{s.value}</p>
                <p className="text-sm text-[#A1A1C2]">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-black mb-4">خدماتنا المتكاملة</h2>
            <p className="text-[#A1A1C2] text-lg max-w-2xl mx-auto">كل ما تحتاجه لبناء وتنمية علامتك التجارية — من التسويق إلى التصميم والتطوير</p>
          </div>
          <div className="space-y-6">
            {services.map((srv, i) => {
              const Icon = srv.icon;
              const isExpanded = expandedService === i;
              return (
                <div
                  key={i}
                  className={`group relative rounded-2xl border border-[#7C3AED]/10 hover:border-[#7C3AED]/30 bg-gradient-to-br from-[#1E1B3A] to-[#14102B] transition-all duration-500 overflow-hidden ${i === 0 ? 'ring-2 ring-[#7C3AED]/30 shadow-xl shadow-[#7C3AED]/10' : ''}`}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-[#7C3AED]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative p-6 sm:p-8 flex flex-col sm:flex-row gap-6">
                    <div className="flex-shrink-0">
                      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${srv.color} flex items-center justify-center shadow-lg`}>
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold">{srv.title}</h3>
                        <span className="text-xs text-[#A1A1C2]">/ {srv.subtitle}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          i === 0 ? 'bg-gradient-to-r from-[#7C3AED] to-[#06B6D4] text-white' : 'bg-[#7C3AED]/10 text-[#A1A1C2]'
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
                        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2 animate-in">
                          {srv.features.map((f, j) => (
                            <div key={j} className="flex items-center gap-2 text-sm text-[#A1A1C2] bg-[#0B0826]/50 rounded-lg p-2">
                              <CheckCircle className="w-4 h-4 text-[#06B6D4] flex-shrink-0" />
                              {f}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-4 bg-gradient-to-b from-[#0B0826] via-[#14102B] to-[#0B0826]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#7C3AED]/10 border border-[#7C3AED]/30 text-sm text-[#A1A1C2] mb-4 backdrop-blur-sm">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              نظام دفع مرن — ادفع ٥٠٪ عند البداية و ٥٠٪ عند التسليم
            </div>
            <h2 className="text-4xl sm:text-5xl font-black mb-4">باقاتنا المصممة لتناسبك</h2>
            <p className="text-[#A1A1C2] text-lg max-w-2xl mx-auto">اختر الباقة التي تناسب احتياجك — كل الباقات تشمل ضمان الجودة والدعم الفني</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
            {packages.map((pkg, i) => (
              <div
                key={i}
                className={`relative rounded-2xl border transition-all duration-500 ${
                  pkg.popular
                    ? 'border-[#7C3AED]/40 bg-gradient-to-b from-[#1E1B3A] to-[#14102B] shadow-2xl shadow-[#7C3AED]/20 scale-105 z-10'
                    : 'border-[#7C3AED]/10 bg-[#1E1B3A]/30 hover:border-[#7C3AED]/30'
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
                    <span className="text-5xl sm:text-6xl font-black bg-gradient-to-r from-[#7C3AED] to-[#06B6D4] bg-clip-text text-transparent">{pkg.price.toLocaleString()}</span>
                    <span className="text-[#A1A1C2] text-sm">ريال</span>
                  </div>
                  <div className="bg-[#0B0826]/60 rounded-xl p-3 flex items-center justify-center gap-4 text-sm">
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
                      <span className="mt-0.5">✓</span>
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
                      ? 'bg-gradient-to-r from-[#7C3AED] to-[#06B6D4] text-white hover:shadow-xl hover:shadow-[#7C3AED]/30'
                      : 'border border-[#7C3AED]/30 text-white hover:bg-[#7C3AED]/10'
                  }`}
                >
                  {pkg.popular ? '🌐 اختر الباقة عبر واتساب' : 'تواصل معنا'}
                </a>
              </div>
            ))}
          </div>
          <div className="mt-12 text-center">
            <div className="inline-flex flex-col items-center gap-4 p-6 sm:p-8 rounded-2xl bg-[#1E1B3A]/30 border border-[#7C3AED]/10 max-w-2xl mx-auto">
              <p className="text-sm text-[#A1A1C2]">جميع الباقات تشمل:</p>
              <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-[#A1A1C2]">
                <span className="flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> استشارة مجانية</span>
                <span className="flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> تقارير أداء دورية</span>
                <span className="flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> دعم فني مستمر</span>
                <span className="flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> ضمان الجودة</span>
                <span className="flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> حقوق الملكية الفكرية</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Payment Model */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-sm text-emerald-400 mb-6 backdrop-blur-sm">
            <Shield className="w-4 h-4" />
            لماذا نقدم نظام الدفع المرن؟
          </div>
          <h3 className="text-3xl sm:text-4xl font-black mb-6">نصف القبل ونصف البعد — ثقة بلا مخاطر</h3>
          <p className="text-[#A1A1C2] text-lg leading-relaxed max-w-3xl mx-auto mb-12">
            في MARRTON نؤمن أن نجاحنا مرتبط بنجاحك. لذلك نقدم لك نظام دفع مرناً يضمن راحتك التامة:
            تدفع <strong className="text-white">نصف المبلغ</strong> فقط عند الاتفاق — كتأكيد لجدية المشروع،
            و <strong className="text-white">النصف المتبقي</strong> عند استلام العمل النهائي بعد التأكد من رضاك التام.
            <br /><br />
            <span className="text-[#06B6D4]">لا مخاطر — لا التزام — فقط نتائج</span>
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-right max-w-3xl mx-auto">
            {[
              { icon: Users, title: 'ثقة متبادلة', desc: 'نستثمر وقتنا وجهدنا في مشروعك لأننا نؤمن بقدراتك' },
              { icon: Star, title: 'جودة مضمونة', desc: 'لن تدفع الباقي إلا بعد رضاك التام عن العمل' },
              { icon: BarChart3, title: 'شفافية كاملة', desc: 'تقارير دورية ومتابعة مستمرة طول فترة المشروع' },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={i} className="bg-[#1E1B3A]/30 rounded-xl p-6 border border-emerald-500/10 text-center hover:border-emerald-500/30 transition-all duration-300">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="font-bold text-base mb-2">{item.title}</h4>
                  <p className="text-sm text-[#A1A1C2]">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Workflow */}
      <section id="how" className="py-24 px-4 bg-[#14102B]/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-black mb-4">كيف نعمل؟</h2>
            <p className="text-[#A1A1C2] text-lg max-w-2xl mx-auto">أربع خطوات بسيطة — من الاستشارة إلى النتائج</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {workflow.map((step, i) => {
              const Icon = step.icon;
              return (
                <div key={i} className="relative group">
                  <div className="bg-[#1E1B3A]/50 rounded-2xl p-6 border border-[#7C3AED]/10 hover:border-[#7C3AED]/30 transition-all duration-300 text-center">
                    <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-gradient-to-r from-[#7C3AED] to-[#06B6D4] flex items-center justify-center text-sm font-bold shadow-lg">
                      {i + 1}
                    </div>
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#06B6D4] flex items-center justify-center mx-auto mb-4">
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="font-bold mb-2">{step.title}</h3>
                    <p className="text-sm text-[#A1A1C2]">{step.desc}</p>
                  </div>
                  {i < workflow.length - 1 && (
                    <div className="hidden lg:block absolute top-1/2 -left-3 w-6 h-0.5 bg-gradient-to-r from-[#7C3AED]/40 to-transparent" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-black mb-4">الأسئلة الشائعة</h2>
            <p className="text-[#A1A1C2] text-lg">إجابات عن أكثر الأسئلة التي تهمك</p>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-[#1E1B3A]/50 rounded-xl border border-[#7C3AED]/10 overflow-hidden transition-all">
                <button
                  onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                  className="w-full px-6 py-4 flex items-center justify-between text-right"
                >
                  <span className="font-bold text-sm sm:text-base">{faq.q}</span>
                  <ChevronLeft className={`w-5 h-5 text-[#A1A1C2] transition-transform flex-shrink-0 ${activeFaq === i ? 'rotate-90' : ''}`} />
                </button>
                {activeFaq === i && (
                  <div className="px-6 pb-4 text-sm text-[#A1A1C2] leading-relaxed animate-in">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="contact" className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-br from-[#1E1B3A] to-[#14102B] rounded-3xl border border-[#7C3AED]/20 p-8 sm:p-16 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#7C3AED] via-[#06B6D4] to-emerald-400" />
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-[#7C3AED]/10 rounded-full blur-[60px]" />
            <div className="relative">
              <h2 className="text-3xl sm:text-5xl font-black mb-4">جاهز لتطوير أعمالك؟</h2>
              <p className="text-[#A1A1C2] text-lg mb-8 max-w-lg mx-auto">
                تواصل معنا الآن للحصول على استشارة مجانية — ونقدم لك أفضل خطة تسويقية تناسب ميزانيتك
              </p>
              <a
                href="https://wa.me/201011273472"
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-3 px-8 py-4 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold text-lg hover:shadow-2xl hover:shadow-green-500/30 transition-all duration-300"
              >
                <MessageCircle className="w-6 h-6" />
                تواصل عبر واتساب: 01011273472
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#7C3AED]/10 py-10 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3 text-sm text-[#A1A1C2]">
            <img src={LOGO_URL} alt="MARKETRON" className="h-8 w-auto" />
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
