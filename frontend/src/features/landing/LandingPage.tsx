import React from 'react';
import Link from 'next/link';
import { useLocalization } from '@/contexts/LocalizationContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ChevronLeft, Star, CheckCircle, BarChart3, Target, TrendingUp, Users, Zap, Shield, MessageCircle, Bot, Megaphone, Search } from 'lucide-react';
import { cn } from '@/utils/helpers';

export const LandingPage: React.FC = () => {
  const { t } = useLocalization();

  const features = [
    { icon: BarChart3, title: t('landing.manageCampaigns'), desc: t('landing.manageCampaignsDesc') },
    { icon: Target, title: t('landing.smartAnalytics'), desc: t('landing.smartAnalyticsDesc') },
    { icon: Zap, title: t('landing.aiContent'), desc: t('landing.aiContentDesc') },
    { icon: Search, title: t('landing.competitorAnalysis'), desc: t('landing.competitorAnalysisDesc') },
    { icon: TrendingUp, title: t('landing.marketResearch'), desc: t('landing.marketResearchDesc') },
    { icon: MessageCircle, title: 'صندوق الرسائل الموحد', desc: 'إدارة محادثات واتساب، ماسنجر وإنستجرام من مكان واحد' },
    { icon: Bot, title: 'الوكلاء الأذكياء', desc: 'وكلاء AI متخصصون لإدارة الحملات، المحتوى، التحليلات والدعم' },
    { icon: Shield, title: 'أمان وخصوصية', desc: 'تشفير متقدم، حماية البيانات، والامتثال لمعايير PDPL' },
  ];

  const steps = [
    { num: '01', title: t('landing.step1'), desc: t('landing.step1Desc') },
    { num: '02', title: t('landing.step2'), desc: t('landing.step2Desc') },
    { num: '03', title: t('landing.step3'), desc: t('landing.step3Desc') },
  ];

  const plans = [
    {
      name: t('landing.starterPlan'),
      price: t('landing.starterPrice'),
      features: ['5 حملات', 'ربط منصتين', 'تقارير أسبوعية', 'دعم فني', 'وكيل ذكي واحد'],
    },
    {
      name: t('landing.professionalPlan'),
      price: t('landing.professionalPrice'),
      featured: true,
      features: ['50 حملة', 'ربط 4 منصات', 'تقارير يومية', 'دعم فني 24/7', 'وكلاء أذكياء غير محدودين', 'صندوق رسائل موحد', 'ردود تلقائية بالذكاء الاصطناعي'],
    },
    {
      name: t('landing.enterprisePlan'),
      price: t('landing.enterprisePrice'),
      features: ['حملات غير محدودة', 'جميع المنصات', 'لوحة تحكم مخصصة', 'مدير حساب مخصص', 'تكامل API', 'SLA 99.9%', 'تدريب فريق'],
    },
  ];

  const testimonials = [
    { name: 'أحمد السعدي', company: 'شركة الأفق', text: 'منصة رائعة! ساعدتنا في زيادة مبيعاتنا بنسبة 40% خلال شهرين', rating: 5 },
    { name: 'سارة الفيصل', company: 'متجر النخبة', text: 'الوكلاء الأذكياء وفّروا علينا وقتاً كبيراً في إدارة الحملات', rating: 5 },
    { name: 'خالد الراشد', company: 'مؤسسة البركة', text: 'أفضل منصة إدارة حملات في السوق السعودي، أنصح بها بشدة', rating: 5 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/ar" className="flex items-center gap-3">
              <img src="/logo.svg" alt="MARKETRON" className="w-10 h-10 object-contain" />
              <span className="font-black text-2xl bg-gradient-to-r from-electric via-cyan to-purple bg-clip-text text-transparent tracking-tight">MARKETRON</span>
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/ar/auth/login" className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900">تسجيل الدخول</Link>
              <Link href="/ar/auth/register"><Button className="bg-gradient-to-r from-electric to-cyan hover:opacity-90">ابدأ مجاناً</Button></Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-electric/5 via-transparent to-transparent pointer-events-none" />
        <Badge variant="primary" className="mb-6 bg-gradient-to-r from-electric/10 to-cyan/10 text-electric border-electric/20">
          🚀 MARKETRON — MARKETING + AUTOMATION
        </Badge>
        <h1 className="text-4xl sm:text-6xl font-black text-gray-900 dark:text-white mb-6 leading-tight">
          {t('landing.heroTitle')}
        </h1>
        <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mb-10 leading-relaxed">
          {t('landing.heroSubtitle')}
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/ar/auth/register"><Button size="lg" className="text-lg px-8 bg-gradient-to-r from-electric via-cyan to-purple hover:opacity-90 shadow-lg shadow-electric/25">{t('landing.heroCta')} <ChevronLeft className="w-5 h-5 mr-2" /></Button></Link>
          <Link href="/ar/dashboard"><Button variant="outline" size="lg" className="text-lg px-8">{t('landing.heroSecondary')}</Button></Link>
        </div>
        <div className="mt-12 flex items-center justify-center gap-8 text-sm text-gray-500">
          <span className="flex items-center gap-1"><CheckCircle className="w-4 h-4 text-green-500" /> لا يحتاج بطاقة ائتمان</span>
          <span className="flex items-center gap-1"><CheckCircle className="w-4 h-4 text-green-500" /> تجربة 14 يوم مجاناً</span>
          <span className="flex items-center gap-1"><CheckCircle className="w-4 h-4 text-green-500" /> إلغاء في أي وقت</span>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white mb-4">{t('landing.features')}</h2>
          <p className="text-gray-500">كل ما تحتاجه لإدارة حملاتك الإعلانية بنجاح</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <Card key={i} className="p-6 hover:shadow-xl transition-all hover:-translate-y-2 border-0 shadow-md">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-electric/10 to-cyan/10 flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 bg-gradient-to-r from-electric to-cyan bg-clip-text text-transparent" />
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{feature.desc}</p>
              </Card>
            );
          })}
        </div>
      </section>

      {/* How it Works */}
      <section className="bg-gradient-to-b from-electric/5 to-transparent dark:from-electric/10 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white mb-4">{t('landing.howItWorks')}</h2>
            <p className="text-gray-500">ثلاث خطوات بسيطة لبدء رحلتك</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <div key={i} className="text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-electric to-cyan text-white text-2xl font-black flex items-center justify-center mx-auto mb-4 shadow-lg shadow-electric/30">{step.num}</div>
                <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">{step.title}</h3>
                <p className="text-gray-500 dark:text-gray-400">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white mb-4">{t('landing.pricing')}</h2>
          <p className="text-gray-500">اختر الخطة المناسبة لعملك</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan, i) => (
            <Card key={i} className={cn('p-8 relative', plan.featured ? 'border-2 border-electric shadow-2xl scale-105 bg-gradient-to-b from-electric/5 to-transparent' : 'shadow-md')}>
              {plan.featured && (
                <div className="absolute -top-3 right-1/2 translate-x-1/2">
                  <Badge variant="primary" className="bg-gradient-to-r from-electric to-cyan">الأكثر طلباً</Badge>
                </div>
              )}
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{plan.name}</h3>
              <div className="mb-6">
                <span className="text-4xl font-black bg-gradient-to-r from-electric to-cyan bg-clip-text text-transparent">{plan.price}</span>
                {plan.price !== 'مخصص' && <span className="text-gray-500">{t('landing.perMonth')}</span>}
              </div>
              <ul className="space-y-3 mb-8">
                {plan.features.map((feat, j) => (
                  <li key={j} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    {feat}
                  </li>
                ))}
              </ul>
              <Button className={cn('w-full', plan.featured ? 'bg-gradient-to-r from-electric to-cyan hover:opacity-90' : '')} variant={plan.featured ? 'default' : 'outline'}>{t('landing.getStarted')}</Button>
            </Card>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-gradient-to-b from-purple/5 to-transparent dark:from-purple/10 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white mb-4">{t('landing.testimonials')}</h2>
            <p className="text-gray-500">ماذا يقول عملاؤنا عن المنصة</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <Card key={i} className="p-6 hover:shadow-xl transition-all border-0 shadow-md">
                <div className="flex gap-1 mb-4">
                  {[...Array(t.rating)].map((_, j) => <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-4">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-electric to-cyan flex items-center justify-center text-white font-bold">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-gray-900 dark:text-white">{t.name}</p>
                    <p className="text-xs text-gray-500">{t.company}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <Card className="p-12 text-center bg-gradient-to-r from-electric via-cyan to-purple border-0 overflow-hidden relative">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIwOS0xLjc5MS00LTQtNHMtNCAxLjc5MS00IDQgMS43OTEgNCA0IDQgNC0xLjc5MSA0LTR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-50" />
          <h2 className="text-3xl font-black text-white mb-4 relative z-10">ابدأ رحلة نجاحك اليوم</h2>
          <p className="text-white/80 mb-8 max-w-2xl mx-auto relative z-10">انضم إلى آلاف المسوقين الذين يثقون بـ MARKETRON لإدارة حملاتهم الإعلانية</p>
          <Link href="/ar/auth/register"><Button className="bg-white text-electric hover:bg-gray-100 text-lg px-8 shadow-xl relative z-10">{t('landing.getStarted')}</Button></Link>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t dark:border-gray-800 py-8 bg-gradient-to-b from-transparent to-electric/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <Link href="/ar" className="flex items-center gap-3">
              <img src="/logo.svg" alt="MARKETRON" className="w-8 h-8 object-contain" />
              <span className="font-black text-lg bg-gradient-to-r from-electric to-cyan bg-clip-text text-transparent">MARKETRON</span>
            </Link>
            <p className="text-sm text-gray-500">© 2026 MARKETRON — MARKETING + AUTOMATION. جميع الحقوق محفوظة.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};




