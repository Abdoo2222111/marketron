'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2, Package, Globe, Bot, Check, ChevronRight, ChevronLeft,
  Sparkles, Loader2, Send, AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { onboardingApi, sandboxApi } from '@/services/api-modules';

const STEPS = [
  { id: 1, title: 'بيانات النشاط', icon: Building2 },
  { id: 2, title: 'استبيان متقدم', icon: Package },
  { id: 3, title: 'تحليل الموقع', icon: Globe },
  { id: 4, title: 'تفعيل الوكيل', icon: Bot },
];

interface OnboardingWizardProps {
  onComplete?: () => void;
}

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);

  // Step 1
  const [name, setName] = useState('');
  const [industry, setIndustry] = useState('');
  const [productsInput, setProductsInput] = useState('');
  const [products, setProducts] = useState<string[]>([]);

  // Step 2
  const [priceRange, setPriceRange] = useState('متوسط');
  const [tone, setTone] = useState('مهنية');
  const [targetAudience, setTargetAudience] = useState('جميع الفئات');
  const [faqQuestion, setFaqQuestion] = useState('');
  const [faqAnswer, setFaqAnswer] = useState('');
  const [faqs, setFaqs] = useState<{ q: string; a: string }[]>([]);

  // Step 3
  const [sourceUrl, setSourceUrl] = useState('');
  const [enrichResult, setEnrichResult] = useState<any>(null);
  const [enriching, setEnriching] = useState(false);

  // Step 4
  const [agentName, setAgentName] = useState('مندوب المبيعات');
  const [greeting, setGreeting] = useState('مرحباً! كيف يمكنني مساعدتك اليوم؟');
  const [mode, setMode] = useState('client_persona');
  const [sandboxMessage, setSandboxMessage] = useState('');
  const [sandboxHistory, setSandboxHistory] = useState<{ role: string; content: string }[]>([]);
  const [sandboxLoading, setSandboxLoading] = useState(false);

  useEffect(() => {
    onboardingApi.status().then((res: any) => {
      const data = res.data?.data;
      if (data?.completed) {
        setCompleted(true);
      }
    }).catch(() => {});
  }, []);

  const addProduct = () => {
    if (productsInput.trim() && !products.includes(productsInput.trim())) {
      setProducts([...products, productsInput.trim()]);
      setProductsInput('');
    }
  };

  const removeProduct = (p: string) => setProducts(products.filter(x => x !== p));

  const addFaq = () => {
    if (faqQuestion.trim() && faqAnswer.trim()) {
      setFaqs([...faqs, { q: faqQuestion.trim(), a: faqAnswer.trim() }]);
      setFaqQuestion('');
      setFaqAnswer('');
    }
  };

  const removeFaq = (idx: number) => setFaqs(faqs.filter((_, i) => i !== idx));

  const handleStep1 = async () => {
    setLoading(true);
    try {
      await onboardingApi.start({
        name,
        industry: industry || undefined,
        productsServices: products.length > 0 ? JSON.stringify(products) : undefined,
      });
      setStep(2);
    } catch (e: any) {
      alert(e.response?.data?.error || e.message);
    }
    setLoading(false);
  };

  const handleStep2 = async () => {
    setLoading(true);
    try {
      await onboardingApi.step2({
        productsServices: products,
        priceRange,
        targetAudience,
        toneOfVoice: tone,
        faqs,
      });
      setStep(3);
    } catch (e: any) {
      alert(e.response?.data?.error || e.message);
    }
    setLoading(false);
  };

  const handleStep3 = async () => {
    if (!sourceUrl.trim()) {
      setStep(4);
      return;
    }
    setEnriching(true);
    try {
      const res = await onboardingApi.step3({ sourceUrl: sourceUrl.trim() });
      setEnrichResult(res.data?.data);
    } catch {}
    setEnriching(false);
    setStep(4);
  };

  const handleStep4 = async () => {
    setLoading(true);
    try {
      await onboardingApi.step4({ agentName, greetingMessage: greeting, activeMode: mode });
      setCompleted(true);
      if (onComplete) onComplete();
    } catch (e: any) {
      alert(e.response?.data?.error || e.message);
    }
    setLoading(false);
  };

  const handleSandboxSend = async () => {
    if (!sandboxMessage.trim()) return;
    setSandboxHistory(prev => [...prev, { role: 'user', content: sandboxMessage }]);
    setSandboxLoading(true);
    try {
      const res = await sandboxApi.chat({ message: sandboxMessage, history: sandboxHistory });
      setSandboxHistory(prev => [...prev, { role: 'assistant', content: res.data?.data?.reply || '...' }]);
    } catch {
      setSandboxHistory(prev => [...prev, { role: 'assistant', content: 'عذراً، حدث خطأ.' }]);
    }
    setSandboxLoading(false);
    setSandboxMessage('');
  };

  if (completed) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold mb-2">تم إعداد نشاطك بنجاح!</h2>
          <p className="text-gray-500 mb-4">الوكيل الذكي جاهز للعمل. يمكنك الآن استخدام جميع ميزات المنصة.</p>
          <Button onClick={() => window.location.href = '/ar/dashboard'}>انتقل إلى لوحة التحكم</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">إعداد نشاطك التجاري</h1>
        <p className="text-gray-500">أخبرنا عن نشاطك ليقوم الوكيل الذكي بالرد نيابة عنك</p>
      </div>

      <div className="flex items-center gap-2 mb-8">
        {STEPS.map((s, idx) => (
          <React.Fragment key={s.id}>
            <div className={`flex items-center gap-2 ${step === s.id ? 'text-electric' : step > s.id ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 ${
                step === s.id ? 'border-electric bg-electric/10' :
                step > s.id ? 'border-green-500 bg-green-50 dark:bg-green-900/20' :
                'border-gray-300'
              }`}>
                {step > s.id ? <Check className="w-4 h-4" /> : s.id}
              </div>
              <span className="text-sm hidden sm:inline">{s.title}</span>
            </div>
            {idx < STEPS.length - 1 && <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />}
          </React.Fragment>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <Card>
              <CardHeader>
                <CardTitle>البيانات الأساسية</CardTitle>
                <CardDescription>اسم النشاط والمجال والمنتجات</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">اسم النشاط التجاري</label>
                  <Input value={name} onChange={e => setName(e.target.value)} placeholder="مثال: متجر أزياء أونلاين" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">المجال</label>
                  <Input value={industry} onChange={e => setIndustry(e.target.value)} placeholder="مثال: تجارة إلكترونية، خدمات، تعليم" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">المنتجات أو الخدمات</label>
                  <div className="flex gap-2">
                    <Input value={productsInput} onChange={(e: any) => setProductsInput(e.target.value)} placeholder="أضف منتجاً" onKeyDown={(e: any) => e.key === 'Enter' && addProduct()} />
                    <Button variant="outline" onClick={addProduct}>إضافة</Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {products.map(p => (
                      <span key={p} className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs rounded-full bg-gray-100 dark:bg-gray-800 cursor-pointer hover:bg-red-100" onClick={() => removeProduct(p)}>
                        {p} ×
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex justify-between pt-4">
                  <div />
                  <Button onClick={handleStep1} disabled={loading || !name.trim()}>
                    {loading ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : null}
                    التالي <ChevronLeft className="w-4 h-4 mr-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <Card>
              <CardHeader>
                <CardTitle>استبيان متقدم</CardTitle>
                <CardDescription>معلومات إضافية لتحسين ردود الوكيل الذكي</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">نطاق الأسعار</label>
                    <select className="w-full p-2 border rounded-lg bg-white dark:bg-gray-800" value={priceRange} onChange={e => setPriceRange(e.target.value)}>
                      <option>منخفض</option>
                      <option>متوسط</option>
                      <option>مرتفع</option>
                      <option>فاخر</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">نغمة الكلام</label>
                    <select className="w-full p-2 border rounded-lg bg-white dark:bg-gray-800" value={tone} onChange={e => setTone(e.target.value)}>
                      <option>مهنية</option>
                      <option>ودودة</option>
                      <option>شبابية</option>
                      <option>رسمية</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">الجمهور المستهدف</label>
                  <Input value={targetAudience} onChange={e => setTargetAudience(e.target.value)} placeholder="مثال: شابات 18-35 في السعودية" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">الأسئلة الشائعة</label>
                  <div className="flex gap-2 mb-2">
                    <Input value={faqQuestion} onChange={e => setFaqQuestion(e.target.value)} placeholder="السؤال" />
                    <Input value={faqAnswer} onChange={e => setFaqAnswer(e.target.value)} placeholder="الإجابة" />
                    <Button variant="outline" onClick={addFaq}>+</Button>
                  </div>
                  {faqs.map((f, i) => (
                    <div key={i} className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded mb-1 text-sm">
                      <span className="font-medium">س: {f.q}</span>
                      <span className="text-gray-500">— {f.a}</span>
                      <button onClick={() => removeFaq(i)} className="mr-auto text-red-500 text-xs">حذف</button>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between pt-4">
                  <Button variant="outline" onClick={() => setStep(1)}><ChevronRight className="w-4 h-4 ml-2" /> السابق</Button>
                  <Button onClick={handleStep2} disabled={loading}>
                    {loading ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : null}
                    التالي <ChevronLeft className="w-4 h-4 mr-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <Card>
              <CardHeader>
                <CardTitle>تحليل الموقع الإلكتروني</CardTitle>
                <CardDescription>اختياري: أدخل رابط موقعك لاستخراج البيانات تلقائياً</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">رابط الموقع أو صفحة السوشيال ميديا</label>
                  <div className="flex gap-2">
                    <Input value={sourceUrl} onChange={e => setSourceUrl(e.target.value)} placeholder="https://" dir="ltr" />
                  </div>
                </div>
                {enriching && (
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Loader2 className="w-4 h-4 animate-spin" /> جاري تحليل الموقع...
                  </div>
                )}
                {enrichResult && (
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-sm font-medium mb-1">✅ تم استخراج البيانات المقترحة:</p>
                    <p className="text-sm">المجال: {enrichResult.industry || '—'}</p>
                    <p className="text-sm">نطاق الأسعار: {enrichResult.priceRange || '—'}</p>
                    <p className="text-sm">نغمة الكلام: {enrichResult.toneOfVoice || '—'}</p>
                  </div>
                )}
                <div className="flex justify-between pt-4">
                  <Button variant="outline" onClick={() => setStep(2)}><ChevronRight className="w-4 h-4 ml-2" /> السابق</Button>
                  <Button onClick={handleStep3} disabled={enriching}>
                    {enriching ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : null}
                    {sourceUrl.trim() ? 'استخراج البيانات ثم التالي' : 'تخطي ← التالي'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {step === 4 && (
          <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <Card>
              <CardHeader>
                <CardTitle>تفعيل الوكيل الذكي</CardTitle>
                <CardDescription>خصص شخصية الوكيل وجربها قبل التفعيل</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">اسم الوكيل</label>
                    <Input value={agentName} onChange={e => setAgentName(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">الوضع</label>
                    <select className="w-full p-2 border rounded-lg bg-white dark:bg-gray-800" value={mode} onChange={e => setMode(e.target.value)}>
                      <option value="client_persona">وكيل مبيعات للنشاط</option>
                      <option value="acquire_for_marketron">مندوب مبيعات Marketron</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">رسالة الترحيب</label>
                  <Textarea value={greeting} onChange={e => setGreeting(e.target.value)} rows={2} />
                </div>

                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-2 flex items-center gap-2"><Sparkles className="w-4 h-4 text-electric" /> جرب الوكيل الذكي</h4>
                  <div className="h-48 overflow-y-auto mb-3 space-y-2 bg-gray-50 dark:bg-gray-900 p-3 rounded">
                    {sandboxHistory.length === 0 && (
                      <p className="text-gray-400 text-sm text-center py-8">اكتب سؤالاً لترى كيف سيرد الوكيل</p>
                    )}
                    {sandboxHistory.map((msg, i) => (
                      <div key={i} className={`p-2 rounded-lg text-sm max-w-[80%] ${msg.role === 'user' ? 'bg-electric text-white mr-auto' : 'bg-gray-200 dark:bg-gray-700 ml-auto'}`}>
                        {msg.content}
                      </div>
                    ))}
                    {sandboxLoading && <div className="flex items-center gap-2 text-sm text-gray-500"><Loader2 className="w-3 h-3 animate-spin" /> الوكيل يكتب...</div>}
                  </div>
                  <div className="flex gap-2">
                    <Input value={sandboxMessage} onChange={(e: any) => setSandboxMessage(e.target.value)} placeholder="اكتب سؤالاً..." onKeyDown={(e: any) => e.key === 'Enter' && handleSandboxSend()} />
                    <Button size="sm" onClick={handleSandboxSend} disabled={sandboxLoading || !sandboxMessage.trim()}><Send className="w-4 h-4" /></Button>
                  </div>
                </div>

                <div className="flex justify-between pt-4">
                  <Button variant="outline" onClick={() => setStep(3)}><ChevronRight className="w-4 h-4 ml-2" /> السابق</Button>
                  <Button onClick={handleStep4} disabled={loading}>
                    {loading ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : <Check className="w-4 h-4 ml-2" />}
                    {loading ? 'جاري التفعيل...' : 'تفعيل الوكيل الذكي'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
