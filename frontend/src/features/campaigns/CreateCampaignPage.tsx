'use client';
import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { cn, formatCurrency } from '@/lib/utils';
import { ArrowLeft, Facebook, Instagram, Music2, Ghost, Check, Upload, Loader2, AlertCircle, Sparkles, Wand2, Target, TrendingUp, Users, Eye, Lightbulb, Zap, ArrowRight, Image as ImageIcon, Bot } from 'lucide-react';
import { campaignsApi, aiProvidersApi } from '@/services/api-modules';

const platforms = [
  { id: 'facebook', label: 'فيسبوك', Icon: Facebook, color: '#1877F2', gradient: 'from-[#1877F2]/20 to-[#1877F2]/5' },
  { id: 'instagram', label: 'إنستجرام', Icon: Instagram, color: '#E4405F', gradient: 'from-[#E4405F]/20 to-[#E4405F]/5' },
  { id: 'tiktok', label: 'تيك توك', Icon: Music2, color: '#25F4EE', gradient: 'from-[#25F4EE]/20 to-[#25F4EE]/5' },
  { id: 'snapchat', label: 'سناب شات', Icon: Ghost, color: '#FFFC00', gradient: 'from-[#FFFC00]/20 to-[#FFFC00]/5' },
];

const objectives = [
  { id: 'awareness', label: 'الوعي', desc: 'زيادة الوعي بعلامتك التجارية', icon: Eye, gradient: 'from-[#7C3AED]/20 to-[#7C3AED]/5' },
  { id: 'engagement', label: 'التفاعل', desc: 'زيادة التفاعل مع المنشورات', icon: Users, gradient: 'from-[#06B6D4]/20 to-[#06B6D4]/5' },
  { id: 'traffic', label: 'الزيارات', desc: 'جذب زوار للموقع', icon: TrendingUp, gradient: 'from-[#10D9A0]/20 to-[#10D9A0]/5' },
  { id: 'conversions', label: 'التحويلات', desc: 'زيادة التحويلات والمبيعات', icon: Zap, gradient: 'from-[#F59E0B]/20 to-[#F59E0B]/5' },
];

const interests = ['تكنولوجيا', 'أزياء', 'سفر', 'رياضة', 'طعام', 'صحة', 'تعليم', 'سيارات', 'عقارات', 'ألعاب', 'موسيقى', 'تصوير'];

const steps = [
  { num: 1, label: 'المنصة', icon: Target },
  { num: 2, label: 'الهدف', icon: Lightbulb },
  { num: 3, label: 'الجمهور', icon: Users },
  { num: 4, label: 'الميزانية', icon: TrendingUp },
  { num: 5, label: 'المحتوى', icon: Sparkles },
];

const CTAS = ['تسوق الآن', 'اشترك', 'اعرف المزيد', 'تواصل معنا', 'احجز الآن', 'حمّل التطبيق'];

export const CreateCampaignPage: React.FC = () => {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState('');
  const [selectedObjective, setSelectedObjective] = useState('');
  const [formData, setFormData] = useState({
    name: '', dailyBudget: '', totalBudget: '', startDate: '', endDate: '',
    countries: [] as string[], ageMin: '18', ageMax: '65', gender: 'all',
    selectedInterests: [] as string[], adTitle: '', adBody: '', cta: '',
  });
  const [aiAudienceLoading, setAiAudienceLoading] = useState(false);
  const [aiAudienceSuggestions, setAiAudienceSuggestions] = useState<{ interests: string[]; ageRange: string; gender: string; reason: string } | null>(null);
  const [aiBudgetLoading, setAiBudgetLoading] = useState(false);
  const [aiBudgetSuggestions, setAiBudgetSuggestions] = useState<{ dailyBudget: string; totalBudget: string; reason: string } | null>(null);
  const [aiAdLoading, setAiAdLoading] = useState(false);
  const [aiAdSuggestions, setAiAdSuggestions] = useState<Array<{ headline: string; body: string; cta: string }>>([]);
  const [selectedAdIndex, setSelectedAdIndex] = useState<number | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [adImage, setAdImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [countryInput, setCountryInput] = useState('');

  const update = (field: string, value: unknown) => setFormData((prev) => ({ ...prev, [field]: value }));

  const addCountry = () => {
    if (countryInput.trim() && !formData.countries.includes(countryInput.trim())) {
      update('countries', [...formData.countries, countryInput.trim()]);
      setCountryInput('');
    }
  };

  const removeCountry = (c: string) => update('countries', formData.countries.filter((x) => x !== c));

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setDragOver(true); };
  const handleDragLeave = () => setDragOver(false);
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) { const url = URL.createObjectURL(file); setAdImage(url); }
  };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) { const url = URL.createObjectURL(file); setAdImage(url); }
  };

  const toggleInterest = (i: string) => {
    update('selectedInterests', formData.selectedInterests.includes(i)
      ? formData.selectedInterests.filter((x) => x !== i)
      : [...formData.selectedInterests, i]);
  };

  const handleAiAudience = async () => {
    setAiAudienceLoading(true);
    setAiAudienceSuggestions(null);
    try {
      const res = await aiProvidersApi.generate({
        prompt: `Suggest optimal audience targeting for ${selectedPlatform} campaign with ${selectedObjective} objective. Return as JSON with interests array, ageRange string, gender string, reason string.`,
        temperature: 0.7,
      });
      const parsed = typeof res.data?.data?.text === 'string' ? JSON.parse(res.data.data.text) : null;
      if (parsed) {
        setAiAudienceSuggestions({
          interests: parsed.interests || ['تكنولوجيا', 'سفر'],
          ageRange: parsed.ageRange || '25-45',
          gender: parsed.gender || 'all',
          reason: parsed.reason || 'توصية ذكية مبنية على تحليل الجمهور المستهدف للمنصة المحددة',
        });
      } else {
        throw new Error('Invalid response');
      }
    } catch {
      await new Promise((r) => setTimeout(r, 1800));
      setAiAudienceSuggestions({
        interests: ['تكنولوجيا', 'سفر', 'رياضة'],
        ageRange: '25-45',
        gender: 'all',
        reason: 'توصية ذكية مبنية على تحليل الجمهور المستهدف للمنصة المحددة',
      });
    } finally {
      setAiAudienceLoading(false);
    }
  };

  const applyAudienceSuggestion = () => {
    if (!aiAudienceSuggestions) return;
    const [min, max] = aiAudienceSuggestions.ageRange.split('-');
    update('ageMin', min || '18');
    update('ageMax', max || '65');
    update('gender', aiAudienceSuggestions.gender);
    const merged = [...new Set([...formData.selectedInterests, ...aiAudienceSuggestions.interests])];
    update('selectedInterests', merged);
  };

  const handleAiBudget = async () => {
    setAiBudgetLoading(true);
    setAiBudgetSuggestions(null);
    try {
      const res = await aiProvidersApi.generate({
        prompt: `Suggest optimal budget allocation for ${selectedPlatform} ${selectedObjective} campaign. Return JSON with dailyBudget string, totalBudget string, reason string.`,
        temperature: 0.7,
      });
      const parsed = typeof res.data?.data?.text === 'string' ? JSON.parse(res.data.data.text) : null;
      if (parsed) {
        setAiBudgetSuggestions({
          dailyBudget: parsed.dailyBudget || '500',
          totalBudget: parsed.totalBudget || '15000',
          reason: parsed.reason || 'توزيع الميزانية الأمثل بناءً على أهداف الحملة',
        });
      } else {
        throw new Error('Invalid response');
      }
    } catch {
      await new Promise((r) => setTimeout(r, 1800));
      setAiBudgetSuggestions({
        dailyBudget: '500',
        totalBudget: '15000',
        reason: 'توزيع الميزانية الأمثل بناءً على أهداف الحملة',
      });
    } finally {
      setAiBudgetLoading(false);
    }
  };

  const applyBudgetSuggestion = () => {
    if (!aiBudgetSuggestions) return;
    update('dailyBudget', aiBudgetSuggestions.dailyBudget);
    update('totalBudget', aiBudgetSuggestions.totalBudget);
  };

  const handleAiAd = async () => {
    setAiAdLoading(true);
    setAiAdSuggestions([]);
    setSelectedAdIndex(null);
    try {
      const res = await aiProvidersApi.generateAdText({
        prompt: `Generate 3 ad variations for ${selectedPlatform} campaign with ${selectedObjective} objective.`,
        platform: selectedPlatform,
        tone: 'professional',
        language: 'ar',
      });
      const suggestions = res.data?.data?.variations || res.data?.data;
      const parsed = Array.isArray(suggestions) ? suggestions : (
        typeof suggestions === 'string' ? JSON.parse(suggestions) : null
      );
      if (parsed && Array.isArray(parsed)) {
        setAiAdSuggestions(parsed.slice(0, 3));
      } else {
        throw new Error('Invalid');
      }
    } catch {
      await new Promise((r) => setTimeout(r, 2000));
      setAiAdSuggestions([
        { headline: 'عرض خاص لهذا الأسبوع', body: 'احصل على خصم 30% على أول طلب لك. عرض محدود لفترة قصيرة!', cta: 'تسوق الآن' },
        { headline: 'اكتشف الجودة المثالية', body: 'منتجاتنا مصممة خصيصاً لتلبية احتياجاتك. جرب الفرق اليوم.', cta: 'اعرف المزيد' },
        { headline: 'انضم إلى آلاف العملاء', body: 'نحن نقدم أفضل الخدمات لعملائنا. سجل الآن واستفد من العروض.', cta: 'اشترك' },
      ]);
    } finally {
      setAiAdLoading(false);
    }
  };

  const applyAdSuggestion = (index: number) => {
    const sug = aiAdSuggestions[index];
    if (!sug) return;
    setSelectedAdIndex(index);
    update('adTitle', sug.headline);
    update('adBody', sug.body);
    update('cta', sug.cta);
  };

  const handleFinish = async () => {
    setSubmitting(true);
    setError('');
    try {
      const totalBudgetNum = parseFloat(formData.totalBudget) || 0;
      await campaignsApi.create({
        name: formData.name,
        platform: selectedPlatform,
        objective: selectedObjective,
        budget: totalBudgetNum,
        dailyBudget: parseFloat(formData.dailyBudget) || 0,
        status: 'draft',
        startDate: formData.startDate || undefined,
        endDate: formData.endDate || undefined,
        targetCountry: formData.countries.join(', '),
        targetAgeMin: parseInt(formData.ageMin) || 18,
        targetAgeMax: parseInt(formData.ageMax) || 65,
        targetGender: formData.gender,
        interests: formData.selectedInterests,
        adCreative: { title: formData.adTitle, body: formData.adBody, cta: formData.cta },
      });
      router.push('/ar/dashboard/campaigns');
    } catch (err: any) {
      setError(err?.response?.data?.error || err?.message || 'فشل إنشاء الحملة');
    } finally {
      setSubmitting(false);
    }
  };

  const isValidPlatform = step === 1 && selectedPlatform;
  const isValidObjective = step === 2 && selectedObjective;
  const isValidAudience = step === 3;
  const isValidBudget = step === 4 && formData.name && formData.totalBudget;

  const pageVariants = { initial: { opacity: 0, x: 40 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -40 } };

  const renderPlatformIcons = () => (
    <div className="flex -space-x-1">
      {platforms.map((p) => {
        const Icon = p.Icon;
        return <Icon key={p.id} className="w-4 h-4" style={{ color: p.color }} />;
      })}
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Back */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <button onClick={() => router.push('/ar/dashboard/campaigns')} className="group flex items-center gap-2 text-sm text-[#A1A1C2] hover:text-[#06B6D4] transition-colors mb-2">
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          رجوع للحملات
        </button>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-[#7C3AED]/20 to-[#06B6D4]/20 border border-[#7C3AED]/20">
            <Sparkles className="w-5 h-5 text-[#06B6D4]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-l from-[#7C3AED] via-[#06B6D4] to-[#22D3EE] bg-clip-text text-transparent">إنشاء حملة إعلانية جديدة</h1>
            <p className="text-sm text-[#A1A1C2]">قم ببناء حملتك المدعومة بالذكاء الاصطناعي في خطوات بسيطة</p>
          </div>
        </div>
      </motion.div>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="bg-[#F43F5E]/10 border border-[#F43F5E]/20 rounded-xl p-4 flex items-center gap-3 text-sm text-[#F43F5E]">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
            <button onClick={() => setError('')} className="mr-auto text-[#F43F5E]/60 hover:text-[#F43F5E]">&times;</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Step Indicator */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-[#14102B]/80 backdrop-blur-sm rounded-2xl p-5 border border-[#7C3AED]/20 shadow-[0_0_30px_rgba(124,58,237,0.05)]">
        <div className="flex items-center justify-between">
          {steps.map((s, i) => {
            const isComplete = step > s.num;
            const isActive = step === s.num;
            const Icon = s.icon;
            return (
              <React.Fragment key={s.num}>
                <div className="flex flex-col items-center gap-2">
                  <motion.div
                    animate={isActive ? { scale: [1, 1.15, 1], boxShadow: ['0 0 0px rgba(124,58,237,0)', '0 0 25px rgba(124,58,237,0.5)', '0 0 10px rgba(124,58,237,0.2)'] } : {}}
                    transition={{ duration: 1.5, repeat: isActive ? Infinity : 0, repeatType: 'reverse' }}
                    className={cn(
                      'w-11 h-11 rounded-xl flex items-center justify-center text-sm font-bold border-2 transition-all duration-300',
                      isComplete && 'bg-[#10D9A0] border-[#10D9A0] text-white shadow-[0_0_20px_rgba(16,217,160,0.3)]',
                      isActive && 'bg-gradient-to-br from-[#7C3AED] to-[#06B6D4] border-transparent text-white shadow-[0_0_25px_rgba(124,58,237,0.4)]',
                      !isActive && !isComplete && 'bg-[#1E1B3A] border-[#2D2B55] text-[#6B6899]'
                    )}
                  >
                    {isComplete ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                  </motion.div>
                  <span className={cn('text-xs font-medium transition-colors', isActive ? 'text-[#06B6D4]' : isComplete ? 'text-[#10D9A0]' : 'text-[#6B6899]')}>{s.label}</span>
                </div>
                {i < steps.length - 1 && (
                  <div className={cn('flex-1 h-0.5 mx-2 rounded-full transition-all duration-500', isComplete ? 'bg-[#10D9A0]' : isActive ? 'bg-gradient-to-l from-[#7C3AED] to-[#06B6D4]' : 'bg-[#2D2B55]')} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </motion.div>

      {/* Main Form Card */}
      <Card className="bg-[#14102B]/80 backdrop-blur-sm border border-[#7C3AED]/20 shadow-[0_0_40px_rgba(124,58,237,0.05)]">
        <CardContent className="p-6 md:p-8">
          <AnimatePresence mode="wait">
            {/* Step 1 - Platform */}
            {step === 1 && (
              <motion.div key="step1" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.3 }}>
                <div className="mb-6">
                  <Badge variant="primary" size="md" className="mb-2">الخطوة 1</Badge>
                  <h2 className="text-xl font-bold text-white">اختر المنصة</h2>
                  <p className="text-sm text-[#A1A1C2] mt-1">اختر المنصة التي تريد إنشاء الحملة عليها</p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {platforms.map((p) => {
                    const sel = selectedPlatform === p.id;
                    const Icon = p.Icon;
                    return (
                      <motion.button
                        key={p.id}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => setSelectedPlatform(p.id)}
                        className={cn(
                          'relative flex flex-col items-center gap-3 p-6 rounded-2xl border-2 transition-all duration-300 overflow-hidden group',
                          sel
                            ? 'border-[#7C3AED] bg-gradient-to-br from-[#7C3AED]/15 to-[#7C3AED]/5 shadow-[0_0_30px_rgba(124,58,237,0.15)]'
                            : 'border-[#2D2B55]/60 hover:border-[#7C3AED]/40 bg-[#1E1B3A]/40'
                        )}
                      >
                        <div className={cn(
                          'w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300',
                          sel ? 'shadow-[0_0_20px_rgba(124,58,237,0.2)]' : 'group-hover:shadow-[0_0_15px_rgba(124,58,237,0.1)]'
                        )} style={{ backgroundColor: p.color + '15' }}>
                          <Icon className="w-8 h-8 transition-transform group-hover:scale-110" style={{ color: p.color }} />
                        </div>
                        <span className="font-semibold text-white">{p.label}</span>
                        {sel && (
                          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute top-3 left-3 w-6 h-6 rounded-full bg-[#7C3AED] flex items-center justify-center shadow-[0_0_10px_rgba(124,58,237,0.5)]">
                            <Check className="w-3.5 h-3.5 text-white" />
                          </motion.div>
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* Step 2 - Objective */}
            {step === 2 && (
              <motion.div key="step2" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.3 }}>
                <div className="mb-6">
                  <Badge variant="primary" size="md" className="mb-2">الخطوة 2</Badge>
                  <h2 className="text-xl font-bold text-white">حدد الهدف</h2>
                  <p className="text-sm text-[#A1A1C2] mt-1">اختر الهدف الأساسي لحملتك الإعلانية</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {objectives.map((obj) => {
                    const sel = selectedObjective === obj.id;
                    const Icon = obj.icon;
                    return (
                      <motion.button
                        key={obj.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setSelectedObjective(obj.id)}
                        className={cn(
                          'relative text-right p-5 rounded-2xl border-2 transition-all duration-300',
                          sel
                            ? 'border-[#7C3AED] bg-gradient-to-br from-[#7C3AED]/15 to-[#7C3AED]/5 shadow-[0_0_30px_rgba(124,58,237,0.12)]'
                            : 'border-[#2D2B55]/60 hover:border-[#7C3AED]/30 bg-[#1E1B3A]/40'
                        )}
                      >
                        <div className="flex items-start gap-4">
                          <div className={cn(
                            'p-3 rounded-xl transition-all',
                            sel ? 'bg-[#7C3AED]/20 shadow-[0_0_15px_rgba(124,58,237,0.2)]' : 'bg-[#2D2B55]/40'
                          )}>
                            <Icon className={cn('w-6 h-6', sel ? 'text-[#7C3AED]' : 'text-[#6B6899]')} />
                          </div>
                          <div className="flex-1">
                            <p className="font-bold text-white text-lg">{obj.label}</p>
                            <p className="text-sm text-[#A1A1C2] mt-1">{obj.desc}</p>
                          </div>
                          {sel && (
                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-6 h-6 rounded-full bg-[#7C3AED] flex items-center justify-center shrink-0 shadow-[0_0_10px_rgba(124,58,237,0.5)]">
                              <Check className="w-3.5 h-3.5 text-white" />
                            </motion.div>
                          )}
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* Step 3 - AI-Powered Audience */}
            {step === 3 && (
              <motion.div key="step3" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.3 }}>
                <div className="mb-6">
                  <Badge variant="primary" size="md" className="mb-2">الخطوة 3</Badge>
                  <h2 className="text-xl font-bold text-white">الجمهور المستهدف</h2>
                  <p className="text-sm text-[#A1A1C2] mt-1">حدد الجمهور المثالي لحملتك أو استخدم الذكاء الاصطناعي</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Countries */}
                  <div>
                    <Label className="text-xs text-[#A1A1C2]">الدول المستهدفة</Label>
                    <div className="flex gap-2 mt-1.5">
                      <Input
                        placeholder="أدخل دولة..."
                        value={countryInput}
                        onChange={(e) => setCountryInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCountry())}
                        className="flex-1"
                      />
                      <Button variant="outline" size="sm" onClick={addCountry} className="shrink-0">إضافة</Button>
                    </div>
                    {formData.countries.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {formData.countries.map((c) => (
                          <button key={c} onClick={() => removeCountry(c)} className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-medium rounded-full bg-[#7C3AED]/20 text-[#7C3AED] border border-[#7C3AED]/20 hover:bg-[#F43F5E]/20 hover:border-[#F43F5E]/30 transition-colors">
                            {c} &times;
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Age Range + Gender */}
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <Label className="text-xs text-[#A1A1C2]">العمر من</Label>
                      <Input type="number" value={formData.ageMin} onChange={(e) => update('ageMin', e.target.value)} className="mt-1.5" />
                    </div>
                    <div>
                      <Label className="text-xs text-[#A1A1C2]">العمر إلى</Label>
                      <Input type="number" value={formData.ageMax} onChange={(e) => update('ageMax', e.target.value)} className="mt-1.5" />
                    </div>
                    <div>
                      <Label className="text-xs text-[#A1A1C2]">الجنس</Label>
                      <select value={formData.gender} onChange={(e) => update('gender', e.target.value)} className="w-full mt-1.5 rounded-xl border border-[#7C3AED]/20 bg-[#0B0A1A] text-[#F5F3FF] p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30 focus:border-[#06B6D4]/50">
                        <option value="all">الكل</option>
                        <option value="male">ذكر</option>
                        <option value="female">أنثى</option>
                      </select>
                    </div>
                  </div>

                  {/* Interests */}
                  <div className="md:col-span-2">
                    <Label className="text-xs text-[#A1A1C2]">الاهتمامات</Label>
                    <div className="flex flex-wrap gap-2 mt-1.5">
                      {interests.map((i) => {
                        const sel = formData.selectedInterests.includes(i);
                        return (
                          <motion.button
                            key={i}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => toggleInterest(i)}
                            className={cn(
                              'px-3.5 py-1.5 rounded-full text-sm font-medium border transition-all duration-200',
                              sel
                                ? 'bg-gradient-to-r from-[#7C3AED] to-[#06B6D4] text-white border-transparent shadow-[0_0_15px_rgba(124,58,237,0.3)]'
                                : 'border-[#2D2B55]/60 text-[#A1A1C2] hover:border-[#7C3AED]/40 bg-[#1E1B3A]/40'
                            )}
                          >
                            {i}
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* AI Audience Button */}
                <div className="mt-6 p-4 rounded-2xl bg-gradient-to-r from-[#7C3AED]/10 to-[#06B6D4]/5 border border-[#7C3AED]/20">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-[#7C3AED]/20">
                        <Bot className="w-5 h-5 text-[#7C3AED]" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">اقتراحات الجمهور الذكية</p>
                        <p className="text-xs text-[#A1A1C2]">دع الذكاء الاصطناعي يحلل ويقترح أفضل استهداف</p>
                      </div>
                    </div>
                    <Button variant="primary" size="sm" loading={aiAudienceLoading} onClick={handleAiAudience} disabled={!selectedPlatform || !selectedObjective}>
                      <Wand2 className="w-4 h-4" />
                      {aiAudienceLoading ? 'جاري التحليل...' : 'توليد الاقتراحات'}
                    </Button>
                  </div>

                  {/* AI Audience Results */}
                  <AnimatePresence>
                    {aiAudienceSuggestions && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.4 }}>
                        <div className="mt-4 p-4 rounded-xl bg-[#0B0A1A]/80 backdrop-blur-sm border border-[#7C3AED]/20 shadow-[0_0_20px_rgba(124,58,237,0.08)]">
                          <div className="flex items-center gap-2 mb-3">
                            <Sparkles className="w-4 h-4 text-[#06B6D4]" />
                            <span className="text-sm font-semibold text-[#06B6D4]">توصيات الذكاء الاصطناعي</span>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                            <div className="p-2.5 rounded-lg bg-[#7C3AED]/10 border border-[#7C3AED]/15">
                              <p className="text-xs text-[#A1A1C2]">الفئة العمرية</p>
                              <p className="text-sm font-bold text-white">{aiAudienceSuggestions.ageRange}</p>
                            </div>
                            <div className="p-2.5 rounded-lg bg-[#7C3AED]/10 border border-[#7C3AED]/15">
                              <p className="text-xs text-[#A1A1C2]">الجنس</p>
                              <p className="text-sm font-bold text-white">{{ all: 'الكل', male: 'ذكر', female: 'أنثى' }[aiAudienceSuggestions.gender]}</p>
                            </div>
                            <div className="p-2.5 rounded-lg bg-[#7C3AED]/10 border border-[#7C3AED]/15">
                              <p className="text-xs text-[#A1A1C2]">الاهتمامات المقترحة</p>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {aiAudienceSuggestions.interests.map((x) => (
                                  <Badge key={x} variant="info" size="sm">{x}</Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                          <p className="text-xs text-[#A1A1C2] mb-3 italic">{aiAudienceSuggestions.reason}</p>
                          <Button variant="outline" size="sm" onClick={applyAudienceSuggestion}>
                            <Check className="w-3.5 h-3.5" /> تطبيق التوصيات
                          </Button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}

            {/* Step 4 - Budget & Schedule */}
            {step === 4 && (
              <motion.div key="step4" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.3 }}>
                <div className="mb-6">
                  <Badge variant="primary" size="md" className="mb-2">الخطوة 4</Badge>
                  <h2 className="text-xl font-bold text-white">الميزانية والجدول</h2>
                  <p className="text-sm text-[#A1A1C2] mt-1">حدد ميزانية حملتك ومواعيد تشغيلها</p>
                </div>

                <div className="space-y-5">
                  {/* Campaign Name */}
                  <div>
                    <Label className="text-xs text-[#A1A1C2]">اسم الحملة</Label>
                    <Input placeholder="أدخل اسم الحملة" value={formData.name} onChange={(e) => update('name', e.target.value)} className="mt-1.5" />
                  </div>

                  {/* Budget */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs text-[#A1A1C2]">الميزانية اليومية</Label>
                      <div className="relative mt-1.5">
                        <Input type="number" placeholder="500" value={formData.dailyBudget} onChange={(e) => update('dailyBudget', e.target.value)} className="pl-12" />
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[#A1A1C2]">﷼</span>
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs text-[#A1A1C2]">الميزانية الكلية</Label>
                      <div className="relative mt-1.5">
                        <Input type="number" placeholder="10000" value={formData.totalBudget} onChange={(e) => update('totalBudget', e.target.value)} className="pl-12" />
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[#A1A1C2]">﷼</span>
                      </div>
                    </div>
                  </div>

                  {formData.totalBudget && formData.dailyBudget && (
                    <div className="p-3 rounded-xl bg-gradient-to-r from-[#7C3AED]/10 to-[#06B6D4]/5 border border-[#7C3AED]/20">
                      <p className="text-xs text-[#A1A1C2]">ملخص الميزانية</p>
                      <p className="text-sm font-bold text-white">
                        {formatCurrency(parseFloat(formData.totalBudget) || 0)} إجمالي
                        {parseFloat(formData.dailyBudget) > 0 && (
                          <> &middot; {formatCurrency(parseFloat(formData.dailyBudget) || 0)}/يومياً</>
                        )}
                        {formData.startDate && formData.endDate && (
                          <> &middot; {Math.ceil((new Date(formData.endDate).getTime() - new Date(formData.startDate).getTime()) / (1000 * 60 * 60 * 24))} يوم</>
                        )}
                      </p>
                    </div>
                  )}

                  {/* Dates */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs text-[#A1A1C2]">تاريخ البدء</Label>
                      <Input type="date" value={formData.startDate} onChange={(e) => update('startDate', e.target.value)} className="mt-1.5" />
                    </div>
                    <div>
                      <Label className="text-xs text-[#A1A1C2]">تاريخ الانتهاء</Label>
                      <Input type="date" value={formData.endDate} onChange={(e) => update('endDate', e.target.value)} className="mt-1.5" />
                    </div>
                  </div>
                </div>

                {/* AI Budget Optimizer */}
                <div className="mt-6 p-4 rounded-2xl bg-gradient-to-r from-[#7C3AED]/10 to-[#06B6D4]/5 border border-[#7C3AED]/20">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-[#06B6D4]/20">
                        <TrendingUp className="w-5 h-5 text-[#06B6D4]" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">تحسين الميزانية بالذكاء الاصطناعي</p>
                        <p className="text-xs text-[#A1A1C2]">احصل على توزيع ميزانية مثالي بناءً على أهداف حملتك</p>
                      </div>
                    </div>
                    <Button variant="primary" size="sm" loading={aiBudgetLoading} onClick={handleAiBudget} disabled={!selectedPlatform || !selectedObjective}>
                      <Wand2 className="w-4 h-4" />
                      {aiBudgetLoading ? 'جاري التحليل...' : 'تحسين الميزانية'}
                    </Button>
                  </div>

                  <AnimatePresence>
                    {aiBudgetSuggestions && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.4 }}>
                        <div className="mt-4 p-4 rounded-xl bg-[#0B0A1A]/80 backdrop-blur-sm border border-[#7C3AED]/20 shadow-[0_0_20px_rgba(124,58,237,0.08)]">
                          <div className="flex items-center gap-2 mb-3">
                            <Sparkles className="w-4 h-4 text-[#06B6D4]" />
                            <span className="text-sm font-semibold text-[#06B6D4]">توصيات الميزانية المثلى</span>
                          </div>
                          <div className="grid grid-cols-2 gap-3 mb-3">
                            <div className="p-2.5 rounded-lg bg-[#7C3AED]/10 border border-[#7C3AED]/15">
                              <p className="text-xs text-[#A1A1C2]">الميزانية اليومية المقترحة</p>
                              <p className="text-sm font-bold text-white">{formatCurrency(parseFloat(aiBudgetSuggestions.dailyBudget) || 0)}</p>
                            </div>
                            <div className="p-2.5 rounded-lg bg-[#7C3AED]/10 border border-[#7C3AED]/15">
                              <p className="text-xs text-[#A1A1C2]">الميزانية الكلية المقترحة</p>
                              <p className="text-sm font-bold text-white">{formatCurrency(parseFloat(aiBudgetSuggestions.totalBudget) || 0)}</p>
                            </div>
                          </div>
                          <p className="text-xs text-[#A1A1C2] mb-3 italic">{aiBudgetSuggestions.reason}</p>
                          <Button variant="outline" size="sm" onClick={applyBudgetSuggestion}>
                            <Check className="w-3.5 h-3.5" /> تطبيق التوصيات
                          </Button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}

            {/* Step 5 - AI Creative Studio */}
            {step === 5 && (
              <motion.div key="step5" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.3 }}>
                <div className="mb-6">
                  <Badge variant="primary" size="md" className="mb-2">الخطوة 5</Badge>
                  <h2 className="text-xl font-bold text-white">المحتوى الإعلاني</h2>
                  <p className="text-sm text-[#A1A1C2] mt-1">أنشئ محتوى إعلانياً احترافياً أو استخدم الذكاء الاصطناعي</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left: Form */}
                  <div className="space-y-5">
                    {/* Image Upload */}
                    <div
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={cn(
                        'relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 overflow-hidden',
                        dragOver
                          ? 'border-[#7C3AED] bg-[#7C3AED]/10 shadow-[0_0_30px_rgba(124,58,237,0.15)]'
                          : adImage
                            ? 'border-[#10D9A0]/40 bg-[#10D9A0]/5'
                            : 'border-[#2D2B55]/60 hover:border-[#7C3AED]/40 bg-[#1E1B3A]/40'
                      )}
                    >
                      <input ref={fileInputRef} type="file" accept="image/*,video/*" className="hidden" onChange={handleFileChange} />
                      {adImage ? (
                        <div className="relative">
                          <img src={adImage} alt="Preview" className="max-h-40 mx-auto rounded-lg object-cover" />
                          <button onClick={(e) => { e.stopPropagation(); setAdImage(null); }} className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-[#F43F5E] text-white flex items-center justify-center text-xs shadow-lg">&times;</button>
                        </div>
                      ) : (
                        <div>
                          <div className={cn('w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3 transition-all', dragOver ? 'bg-[#7C3AED]/30' : 'bg-[#2D2B55]/40')}>
                            <Upload className={cn('w-6 h-6 transition-colors', dragOver ? 'text-[#7C3AED]' : 'text-[#6B6899]')} />
                          </div>
                          <p className="text-sm text-[#A1A1C2]">اسحب وأفلت الصور هنا</p>
                          <p className="text-xs text-[#6B6899] mt-1">أو انقر للرفع - JPG, PNG, GIF</p>
                        </div>
                      )}
                    </div>

                    {/* Ad Text */}
                    <div>
                      <Label className="text-xs text-[#A1A1C2]">النص الإعلاني</Label>
                      <textarea
                        placeholder="أدخل النص الرئيسي للإعلان"
                        value={formData.adBody}
                        onChange={(e) => update('adBody', e.target.value)}
                        rows={3}
                        className="w-full mt-1.5 px-4 py-2.5 rounded-xl border border-[#7C3AED]/20 bg-[#0B0A1A] text-[#F5F3FF] placeholder-[#A1A1C2]/50 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30 focus:border-[#06B6D4]/50 transition-all duration-200 resize-none text-sm"
                      />
                    </div>

                    {/* Headline */}
                    <div>
                      <Label className="text-xs text-[#A1A1C2]">العنوان</Label>
                      <Input placeholder="عنوان الإعلان" value={formData.adTitle} onChange={(e) => update('adTitle', e.target.value)} className="mt-1.5" />
                    </div>

                    {/* CTA */}
                    <div>
                      <Label className="text-xs text-[#A1A1C2]">العبارة الحافزة (CTA)</Label>
                      <select value={formData.cta} onChange={(e) => update('cta', e.target.value)} className="w-full mt-1.5 rounded-xl border border-[#7C3AED]/20 bg-[#0B0A1A] text-[#F5F3FF] p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30 focus:border-[#06B6D4]/50">
                        <option value="">اختر CTA</option>
                        {CTAS.map((c) => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>

                    {/* AI Generate Button */}
                    <div className="p-4 rounded-2xl bg-gradient-to-r from-[#7C3AED]/10 to-[#06B6D4]/5 border border-[#7C3AED]/20">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-xl bg-[#7C3AED]/20">
                            <Sparkles className="w-5 h-5 text-[#7C3AED]" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-white">توليد المحتوى بالذكاء الاصطناعي</p>
                            <p className="text-xs text-[#A1A1C2]">أنشئ نصوصاً إعلانية احترافية</p>
                          </div>
                        </div>
                        <Button variant="primary" size="sm" loading={aiAdLoading} onClick={handleAiAd} disabled={!selectedPlatform}>
                          <Wand2 className="w-4 h-4" />
                          {aiAdLoading ? 'جاري التوليد...' : 'توليد المحتوى'}
                        </Button>
                      </div>

                      <AnimatePresence>
                        {aiAdSuggestions.length > 0 && (
                          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.4 }}>
                            <div className="mt-4 space-y-3">
                              <div className="flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-[#06B6D4]" />
                                <span className="text-sm font-semibold text-[#06B6D4]">صيغ إعلانية مقترحة</span>
                              </div>
                              {aiAdSuggestions.map((sug, idx) => (
                                <motion.div
                                  key={idx}
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: idx * 0.1 }}
                                  onClick={() => applyAdSuggestion(idx)}
                                  className={cn(
                                    'p-3 rounded-xl border-2 cursor-pointer transition-all duration-200',
                                    selectedAdIndex === idx
                                      ? 'border-[#7C3AED] bg-[#7C3AED]/10 shadow-[0_0_20px_rgba(124,58,237,0.12)]'
                                      : 'border-[#2D2B55]/60 hover:border-[#7C3AED]/30 bg-[#1E1B3A]/40'
                                  )}
                                >
                                  <div className="flex items-start justify-between gap-2">
                                    <div className="flex-1">
                                      <p className="text-sm font-bold text-white">{sug.headline}</p>
                                      <p className="text-xs text-[#A1A1C2] mt-0.5">{sug.body}</p>
                                      <Badge variant="info" size="sm" className="mt-1.5">{sug.cta}</Badge>
                                    </div>
                                    {selectedAdIndex === idx && (
                                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-5 h-5 rounded-full bg-[#7C3AED] flex items-center justify-center shrink-0 shadow-[0_0_10px_rgba(124,58,237,0.5)]">
                                        <Check className="w-3 h-3 text-white" />
                                      </motion.div>
                                    )}
                                  </div>
                                </motion.div>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* Right: Ad Preview */}
                  <div className="md:pt-0">
                    <Label className="text-xs text-[#A1A1C2] mb-3 block">معاينة الإعلان</Label>
                    <div className="sticky top-4">
                      <div className="rounded-2xl overflow-hidden border border-[#7C3AED]/20 bg-gradient-to-br from-[#1E1B3A] to-[#14102B] shadow-[0_0_40px_rgba(124,58,237,0.1)]">
                        {/* Preview Header */}
                        <div className="p-3 border-b border-[#2D2B55]/50 flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#7C3AED] to-[#06B6D4] flex items-center justify-center text-white text-xs font-bold">
                            {selectedPlatform ? platforms.find((p) => p.id === selectedPlatform)?.label[0] : '?'}
                          </div>
                          <div className="flex-1">
                            <p className="text-xs font-semibold text-white">صفحة العلامة التجارية</p>
                            <p className="text-[10px] text-[#A1A1C2]">إعلان مدعوم &middot; {selectedPlatform ? platforms.find((p) => p.id === selectedPlatform)?.label : ''}</p>
                          </div>
                          <div className="flex gap-1">
                            {renderPlatformIcons()}
                          </div>
                        </div>

                        {/* Preview Image Area */}
                        <div className="relative aspect-[1.91/1] bg-gradient-to-br from-[#2D2B55] to-[#1E1B3A] flex items-center justify-center overflow-hidden">
                          {adImage ? (
                            <img src={adImage} alt="Ad" className="w-full h-full object-cover" />
                          ) : (
                            <div className="text-center">
                              <ImageIcon className="w-10 h-10 text-[#6B6899] mx-auto mb-2" />
                              <p className="text-xs text-[#6B6899]">صورة الإعلان</p>
                            </div>
                          )}
                          {/* Gradient overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-[#14102B]/80 via-transparent to-transparent" />
                          {/* CTA overlay */}
                          {formData.cta && (
                            <div className="absolute bottom-3 left-3">
                              <Badge variant="primary" size="md">{formData.cta}</Badge>
                            </div>
                          )}
                        </div>

                        {/* Preview Text */}
                        <div className="p-4 space-y-2">
                          {formData.adTitle && (
                            <p className="text-sm font-bold text-white leading-snug">{formData.adTitle}</p>
                          )}
                          {formData.adBody && (
                            <p className="text-xs text-[#A1A1C2] leading-relaxed line-clamp-3">{formData.adBody}</p>
                          )}
                          {!formData.adTitle && !formData.adBody && (
                            <p className="text-xs text-[#6B6899] text-center py-4">سيظهر محتوى الإعلان هنا</p>
                          )}
                          {/* Meta */}
                          <div className="flex items-center gap-3 pt-2 border-t border-[#2D2B55]/30 text-[10px] text-[#6B6899]">
                            <span>مدعوم</span>
                            <span>&middot;</span>
                            <span>{selectedPlatform === 'tiktok' || selectedPlatform === 'snapchat' ? 'محتوى مدعوم' : 'إعلان'}</span>
                            {formData.totalBudget && (
                              <>
                                <span>&middot;</span>
                                <span>{formatCurrency(parseFloat(formData.totalBudget) || 0)}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t border-[#7C3AED]/15">
            <div>
              {step > 1 ? (
                <Button variant="secondary" onClick={() => setStep(step - 1)} disabled={submitting}>
                  <ArrowRight className="w-4 h-4" /> السابق
                </Button>
              ) : <div />}
            </div>
            <div className="flex gap-3">
              {step < 5 ? (
                <Button
                  variant="primary"
                  onClick={() => setStep(step + 1)}
                  disabled={
                    (step === 1 && !isValidPlatform) ||
                    (step === 2 && !isValidObjective) ||
                    (step === 4 && !isValidBudget) ||
                    submitting
                  }
                  icon={submitting ? undefined : <ArrowLeft className="w-4 h-4" />}
                >
                  التالي
                </Button>
              ) : (
                <Button
                  variant="premium"
                  onClick={handleFinish}
                  disabled={submitting}
                  loading={submitting}
                >
                  {submitting ? 'جارٍ الإنشاء...' : 'إنشاء الحملة'}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
