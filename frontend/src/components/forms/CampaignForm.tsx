'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Facebook,
  Instagram,
  Music,
  Camera,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Target,
  Users,
  Wallet,
  Image,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import type { CreateCampaignData, PlatformType, CampaignObjective } from '@/types';

const platforms: Array<{ id: PlatformType; label: string; icon: React.ReactNode; color: string }> = [
  { id: 'facebook', label: 'فيسبوك', icon: <Facebook />, color: '#1877F2' },
  { id: 'instagram', label: 'انستجرام', icon: <Instagram />, color: '#E4405F' },
  { id: 'tiktok', label: 'تيك توك', icon: <Music />, color: '#000000' },
  { id: 'snapchat', label: 'سناب شات', icon: <Camera />, color: '#FFFC00' },
];

const objectives: Array<{ id: CampaignObjective; label: string; desc: string }> = [
  { id: 'awareness', label: 'الوعي بالعلامة التجارية', desc: 'زيادة الوصول والانطباعات' },
  { id: 'engagement', label: 'التفاعل', desc: 'زيادة الإعجابات والتعليقات والمشاركات' },
  { id: 'conversions', label: 'التحويلات', desc: 'زيادة التسجيلات والمبيعات' },
  { id: 'sales', label: 'المبيعات', desc: 'تحقيق مبيعات مباشرة' },
];

const stepLabels = ['المنصة', 'الهدف', 'الجمهور', 'الميزانية', 'المحتوى'];

interface CampaignFormProps {
  onSubmit: (data: CreateCampaignData) => void;
  initialData?: Partial<CreateCampaignData>;
  onAISuggestions?: (data: Partial<CreateCampaignData>) => void;
}

export default function CampaignForm({ onSubmit, initialData, onAISuggestions }: CampaignFormProps) {
  const [step, setStep] = useState(0);
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformType | null>(null);
  const [selectedObjective, setSelectedObjective] = useState<CampaignObjective | null>(null);
  const [fbPages, setFbPages] = useState<any[]>([]);
  const [selectedPage, setSelectedPage] = useState<string>('');
  const [loadingPages, setLoadingPages] = useState(false);

  useEffect(() => {
    if (selectedPlatform === 'facebook') {
      setLoadingPages(true);
      fetch('/api/v1/platforms/facebook/pages')
        .then(res => res.json())
        .then(data => { setFbPages(data.data || []); if (data.data?.length === 1) setSelectedPage(data.data[0].id); })
        .catch(() => setFbPages([]))
        .finally(() => setLoadingPages(false));
    } else {
      setFbPages([]);
      setSelectedPage('');
    }
  }, [selectedPlatform]);

  const [audience, setAudience] = useState({
    country: '',
    ageMin: 18,
    ageMax: 65,
    gender: 'all' as 'male' | 'female' | 'all',
    interests: [] as string[],
  });
  const [budget, setBudget] = useState(1000);
  const [content, setContent] = useState({
    primaryText: '',
    headline: '',
    description: '',
    cta: '',
  });

  const canProceed = () => {
    switch (step) {
      case 0: return !!selectedPlatform && (selectedPlatform !== 'facebook' || !!selectedPage);
      case 1: return !!selectedObjective;
      case 2: return true;
      case 3: return budget >= 10;
      case 4: return content.primaryText.length > 0;
      default: return false;
    }
  };

  const handleSubmit = () => {
    if (!selectedPlatform || !selectedObjective) return;
    if (selectedPlatform === 'facebook' && !selectedPage) return;
    onSubmit({
      name: content.headline || 'حملة جديدة',
      description: content.description,
      platform: selectedPlatform,
      pageId: selectedPage || undefined,
      objective: selectedObjective,
      budget,
      startDate: new Date().toISOString(),
      targetAudience: {
        country: audience.country,
        ageMin: audience.ageMin,
        ageMax: audience.ageMax,
        gender: audience.gender === 'all' ? undefined : audience.gender,
        interests: audience.interests.length > 0 ? audience.interests : undefined,
      },
      content: {
        primaryText: content.primaryText,
        headline: content.headline,
        description: content.description,
        cta: content.cta,
      },
    });
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">اختر المنصة الإعلانية</h3>
            <p className="text-sm text-muted-foreground">اختر المنصة التي تريد إنشاء الحملة عليها</p>
            <div className="grid grid-cols-2 gap-3">
              {platforms.map((platform) => (
                <button
                  key={platform.id}
                  onClick={() => setSelectedPlatform(platform.id)}
                  className={cn(
                    'flex flex-col items-center gap-3 p-6 rounded-xl border-2 transition-all duration-200',
                    selectedPlatform === platform.id
                      ? 'border-primary bg-primary/5 shadow-md'
                      : 'border-border hover:border-primary/50 hover:bg-accent'
                  )}
                >
                  <div
                    className="h-12 w-12 rounded-xl flex items-center justify-center text-white"
                    style={{ backgroundColor: platform.color }}
                  >
                    {platform.icon}
                  </div>
                  <span className="font-medium">{platform.label}</span>
                </button>
              ))}
            </div>
            {selectedPlatform === 'facebook' && (
              <div className="space-y-2">
                <Label>الصفحة على فيسبوك</Label>
                {loadingPages ? (
                  <div className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm text-muted-foreground">
                    جاري تحميل الصفحات...
                  </div>
                ) : fbPages.length === 0 ? (
                  <div className="h-10 rounded-md border border-dashed border-input bg-background px-3 py-2 text-sm text-muted-foreground">
                    لا توجد صفحات متصلة — اذهب إلى قنوات الاتصال لربط صفحة فيسبوك
                  </div>
                ) : (
                  <select
                    value={selectedPage}
                    onChange={(e) => setSelectedPage(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="">اختر الصفحة...</option>
                    {fbPages.map((p: any) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                )}
              </div>
            )}
          </div>
        );

      case 1:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">هدف الحملة</h3>
            <p className="text-sm text-muted-foreground">ما هو الهدف الرئيسي من هذه الحملة؟</p>
            <div className="grid gap-3">
              {objectives.map((obj) => (
                <button
                  key={obj.id}
                  onClick={() => setSelectedObjective(obj.id)}
                  className={cn(
                    'flex items-center gap-4 p-4 rounded-xl border-2 text-start transition-all duration-200',
                    selectedObjective === obj.id
                      ? 'border-primary bg-primary/5 shadow-md'
                      : 'border-border hover:border-primary/50 hover:bg-accent'
                  )}
                >
                  <div className={cn(
                    'h-10 w-10 rounded-lg flex items-center justify-center',
                    selectedObjective === obj.id ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'
                  )}>
                    <Target size={20} />
                  </div>
                  <div>
                    <p className="font-medium">{obj.label}</p>
                    <p className="text-xs text-muted-foreground">{obj.desc}</p>
                  </div>
                  {selectedObjective === obj.id && (
                    <Check size={20} className="mr-auto text-primary" />
                  )}
                </button>
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">الجمهور المستهدف</h3>
            <p className="text-sm text-muted-foreground">حدد الجمهور الذي تريد استهدافه</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>الدولة</Label>
                <Input
                  placeholder="مثال: السعودية"
                  value={audience.country}
                  onChange={(e) => setAudience({ ...audience, country: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>الجنس</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={audience.gender}
                  onChange={(e) => setAudience({ ...audience, gender: e.target.value as any })}
                >
                  <option value="all">الكل</option>
                  <option value="male">ذكور</option>
                  <option value="female">إناث</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>الحد الأدنى للعمر</Label>
                <Input
                  type="number"
                  value={audience.ageMin}
                  onChange={(e) => setAudience({ ...audience, ageMin: parseInt(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label>الحد الأقصى للعمر</Label>
                <Input
                  type="number"
                  value={audience.ageMax}
                  onChange={(e) => setAudience({ ...audience, ageMax: parseInt(e.target.value) })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>الاهتمامات (مجموعة من الكلمات المفتاحية)</Label>
              <Input
                placeholder="تسويق، تقنية، سيارات..."
                value={audience.interests.join('، ')}
                onChange={(e) => setAudience({ ...audience, interests: e.target.value.split('،').map(s => s.trim()).filter(Boolean) })}
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">الميزانية والجدول الزمني</h3>
            <p className="text-sm text-muted-foreground">حدد ميزانية حملتك</p>
            <div className="space-y-2">
              <Label>الميزانية اليومية (بالريال)</Label>
              <div className="flex items-center gap-4">
                <Input
                  type="number"
                  value={budget}
                  onChange={(e) => setBudget(parseInt(e.target.value) || 0)}
                  className="text-lg font-bold"
                />
                <span className="text-muted-foreground">ريال</span>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>10 ريال</span>
                <span>100,000 ريال</span>
              </div>
              <input
                type="range"
                min={10}
                max={100000}
                step={10}
                value={budget}
                onChange={(e) => setBudget(parseInt(e.target.value))}
                className="w-full"
              />
            </div>
            <Card className="bg-muted/50">
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">الميزانية الشهرية المقدرة:</span>
                  <span className="text-lg font-bold text-primary">
                    {(budget * 30).toLocaleString()} ريال
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">محتوى الإعلان</h3>
                <p className="text-sm text-muted-foreground">أضف النص والوسائط لإعلانك</p>
              </div>
              {onAISuggestions && (
                <Button
                  variant="premium"
                  size="sm"
                  onClick={() => onAISuggestions({
                    platform: selectedPlatform || undefined,
                    objective: selectedObjective || undefined,
                    targetAudience: audience,
                  })}
                >
                  <Sparkles size={16} />
                  اقتراحات ذكية
                </Button>
              )}
            </div>
            <div className="space-y-2">
              <Label>النص الرئيسي</Label>
              <textarea
                className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-y"
                placeholder="أكتب النص الرئيسي للإعلان..."
                value={content.primaryText}
                onChange={(e) => setContent({ ...content, primaryText: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>العنوان</Label>
                <Input
                  placeholder="عنوان الإعلان"
                  value={content.headline}
                  onChange={(e) => setContent({ ...content, headline: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>زر الدعوة للإجراء</Label>
                <Input
                  placeholder="مثال: تسوق الآن"
                  value={content.cta}
                  onChange={(e) => setContent({ ...content, cta: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>الوصف</Label>
              <textarea
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-y"
                placeholder="وصف الإعلان..."
                value={content.description}
                onChange={(e) => setContent({ ...content, description: e.target.value })}
              />
            </div>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Progress Steps */}
      <div className="flex items-center justify-between">
        {stepLabels.map((label, index) => (
          <React.Fragment key={label}>
            <button
              onClick={() => index < step && setStep(index)}
              className={cn(
                'flex flex-col items-center gap-1 transition-all duration-200',
                index <= step ? 'text-primary' : 'text-muted-foreground',
                index < step && 'cursor-pointer hover:text-primary/80'
              )}
            >
              <div className={cn(
                'h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all',
                index < step ? 'bg-primary border-primary text-white' :
                index === step ? 'border-primary text-primary' :
                'border-muted-foreground'
              )}>
                {index < step ? <Check size={16} /> : index + 1}
              </div>
              <span className="text-xs hidden md:block">{label}</span>
            </button>
            {index < stepLabels.length - 1 && (
              <div className={cn(
                'flex-1 h-0.5 mx-2',
                index < step ? 'bg-primary' : 'bg-muted'
              )} />
            )}
          </React.Fragment>
        ))}
      </div>

      <Separator />

      {/* Step Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          {renderStep()}
        </motion.div>
      </AnimatePresence>

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-4">
        <Button
          variant="outline"
          onClick={() => setStep(Math.max(0, step - 1))}
          disabled={step === 0}
        >
          <ArrowRight size={16} />
          السابق
        </Button>
        {step < stepLabels.length - 1 ? (
          <Button onClick={() => setStep(step + 1)} disabled={!canProceed()}>
            التالي
            <ArrowLeft size={16} />
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={!canProceed()}>
            <Check size={16} />
            إنشاء الحملة
          </Button>
        )}
      </div>
    </div>
  );
}

