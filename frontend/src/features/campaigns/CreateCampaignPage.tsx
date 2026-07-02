import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { ArrowLeft, Facebook, Instagram, Music, Ghost, Check, Upload, Loader2, AlertCircle } from 'lucide-react';
import { campaignsApi } from '@/services/api-modules';

const platforms = [
  { id: 'facebook', label: 'فيسبوك', icon: Instagram, color: '#1877F2' },
  { id: 'instagram', label: 'إنستجرام', icon: Instagram, color: '#E4405F' },
  { id: 'tiktok', label: 'تيك توك', icon: Music, color: '#111' },
  { id: 'snapchat', label: 'سناب شات', icon: Ghost, color: '#FFFC00' },
];

const objectives = [
  { id: 'awareness', label: 'الوعي', desc: 'زيادة الوعي بعلامتك التجارية' },
  { id: 'engagement', label: 'التفاعل', desc: 'زيادة التفاعل مع المنشورات' },
  { id: 'traffic', label: 'الزيارات', desc: 'جذب زوار للموقع' },
  { id: 'conversions', label: 'التحويلات', desc: 'زيادة التحويلات والمبيعات' },
];

const interests = ['تكنولوجيا', 'أزياء', 'سفر', 'رياضة', 'طعام', 'صحة', 'تعليم', 'سيارات', 'عقارات', 'ألعاب'];

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

  const update = (field: string, value: unknown) => setFormData((prev) => ({ ...prev, [field]: value }));

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
      router.push('/dashboard/campaigns');
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

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <button onClick={() => router.push('/dashboard/campaigns')} className="flex items-center gap-2 text-sm text-[#A1A1C2] hover:text-white mb-2">
          <ArrowLeft className="w-4 h-4" /> رجوع للحملات
        </button>
        <h1 className="text-2xl font-bold">إنشاء حملة جديدة</h1>
      </div>

      {error && (
        <div className="bg-[#F43F5E]/10 border border-[#F43F5E]/20 rounded-xl p-3 flex items-center gap-2 text-sm text-[#F43F5E]">
          <AlertCircle className="w-4 h-4" /> {error}
        </div>
      )}

      <div className="flex items-center gap-2 bg-[#14102B]/80 backdrop-blur-sm rounded-xl p-4 border border-[#2D2B55]/50">
        {['المنصة', 'الهدف', 'الجمهور', 'الميزانية', 'المحتوى'].map((label, i) => {
          const s = i + 1;
          return (
            <React.Fragment key={s}>
              <div className="flex items-center gap-2">
                <div className={cn('w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors', s <= step ? 'bg-[#7C3AED] text-white' : 'bg-[#2D2B55] text-[#6B6899]')}>
                  {s < step ? <Check className="w-4 h-4" /> : s}
                </div>
                <span className={cn('text-sm hidden sm:inline', s <= step ? 'text-white font-medium' : 'text-[#6B6899]')}>{label}</span>
              </div>
              {s < 5 && <div className={cn('flex-1 h-0.5', s < step ? 'bg-[#7C3AED]' : 'bg-[#2D2B55]')} />}
            </React.Fragment>
          );
        })}
      </div>

      <Card className="bg-[#14102B]/80 backdrop-blur-sm border border-[#2D2B55]/50">
        <CardContent className="p-6">
          {step === 1 && (
            <div>
              <h2 className="text-lg font-semibold mb-1">اختر المنصة</h2>
              <p className="text-sm text-[#A1A1C2] mb-6">اختر المنصة التي تريد إنشاء الحملة عليها</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {platforms.map((p) => {
                  const sel = selectedPlatform === p.id;
                  const Icon = p.icon;
                  return (
                    <button key={p.id} onClick={() => setSelectedPlatform(p.id)} className={cn('flex flex-col items-center gap-3 p-6 rounded-xl border-2 transition-all', sel ? 'border-[#7C3AED] bg-[#7C3AED]/10' : 'border-[#2D2B55] hover:border-[#7C3AED]/50')}>
                      <div className="w-14 h-14 rounded-xl flex items-center justify-center" style={{ backgroundColor: p.color + '20' }}>
                        <Icon className="w-7 h-7" style={{ color: p.color }} />
                      </div>
                      <span className="font-medium">{p.label}</span>
                      {sel && <Check className="w-5 h-5 text-[#7C3AED]" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="text-lg font-semibold mb-1">حدد الهدف</h2>
              <p className="text-sm text-[#A1A1C2] mb-6">اختر الهدف الأساسي لحملتك</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {objectives.map((obj) => {
                  const sel = selectedObjective === obj.id;
                  return (
                    <button key={obj.id} onClick={() => setSelectedObjective(obj.id)} className={cn('text-right p-4 rounded-xl border-2 transition-all', sel ? 'border-[#7C3AED] bg-[#7C3AED]/10' : 'border-[#2D2B55] hover:border-[#7C3AED]/50')}>
                      <p className="font-semibold">{obj.label}</p>
                      <p className="text-sm text-[#A1A1C2] mt-1">{obj.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 className="text-lg font-semibold mb-1">الجمهور المستهدف</h2>
              <p className="text-sm text-[#A1A1C2] mb-6">حدد الجمهور الذي تريد استهدافه</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs">الدول</Label>
                  <Input placeholder="مثال: السعودية، الإمارات" value={formData.countries.join(', ')} onChange={(e) => update('countries', e.target.value.split(',').map((s: string) => s.trim()))} className="mt-1" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">العمر من</Label>
                    <Input type="number" value={formData.ageMin} onChange={(e) => update('ageMin', e.target.value)} className="mt-1" />
                  </div>
                  <div>
                    <Label className="text-xs">العمر إلى</Label>
                    <Input type="number" value={formData.ageMax} onChange={(e) => update('ageMax', e.target.value)} className="mt-1" />
                  </div>
                </div>
                <div>
                  <Label className="text-xs">الجنس</Label>
                  <select value={formData.gender} onChange={(e) => update('gender', e.target.value)} className="w-full mt-1 rounded-lg border border-[#2D2B55] bg-[#1E1B3A]/50 p-2 text-xs text-white">
                    <option value="all">الكل</option>
                    <option value="male">ذكر</option>
                    <option value="female">أنثى</option>
                  </select>
                </div>
                <div>
                  <Label className="text-xs">الاهتمامات</Label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {interests.map((i) => {
                      const sel = formData.selectedInterests.includes(i);
                      return (
                        <button key={i} onClick={() => update('selectedInterests', sel ? formData.selectedInterests.filter((x: string) => x !== i) : [...formData.selectedInterests, i])} className={cn('px-3 py-1.5 rounded-full text-sm border transition-colors', sel ? 'bg-[#7C3AED] text-white border-[#7C3AED]' : 'border-[#2D2B55] text-[#A1A1C2] hover:border-[#7C3AED]/50')}>
                          {i}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div>
              <h2 className="text-lg font-semibold mb-1">الميزانية والجدول</h2>
              <p className="text-sm text-[#A1A1C2] mb-6">حدد ميزانية حملتك ومواعيدها</p>
              <div className="space-y-4">
                <div>
                  <Label className="text-xs">اسم الحملة</Label>
                  <Input placeholder="أدخل اسم الحملة" value={formData.name} onChange={(e) => update('name', e.target.value)} className="mt-1" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs">الميزانية اليومية</Label>
                    <Input type="number" placeholder="500" value={formData.dailyBudget} onChange={(e) => update('dailyBudget', e.target.value)} className="mt-1" />
                  </div>
                  <div>
                    <Label className="text-xs">الميزانية الكلية</Label>
                    <Input type="number" placeholder="10000" value={formData.totalBudget} onChange={(e) => update('totalBudget', e.target.value)} className="mt-1" />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs">تاريخ البدء</Label>
                    <Input type="date" value={formData.startDate} onChange={(e) => update('startDate', e.target.value)} className="mt-1" />
                  </div>
                  <div>
                    <Label className="text-xs">تاريخ الانتهاء</Label>
                    <Input type="date" value={formData.endDate} onChange={(e) => update('endDate', e.target.value)} className="mt-1" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 5 && (
            <div>
              <h2 className="text-lg font-semibold mb-1">المحتوى الإعلاني</h2>
              <p className="text-sm text-[#A1A1C2] mb-6">أضف المحتوى الإعلاني لحملتك</p>
              <div className="space-y-4">
                <div className="border-2 border-dashed border-[#2D2B55] rounded-xl p-8 text-center hover:border-[#7C3AED]/50 transition-colors cursor-pointer">
                  <Upload className="w-10 h-10 text-[#6B6899] mx-auto mb-2" />
                  <p className="text-sm text-[#A1A1C2]">اسحب وأفلت الصور أو الفيديو هنا</p>
                  <p className="text-xs text-[#6B6899] mt-1">أو انقر للرفع - JPG, PNG, GIF, MP4</p>
                </div>
                <div>
                  <Label className="text-xs">النص الإعلاني</Label>
                  <Input placeholder="أدخل النص الرئيسي للإعلان" value={formData.adBody} onChange={(e) => update('adBody', e.target.value)} className="mt-1" />
                </div>
                <div>
                  <Label className="text-xs">العنوان</Label>
                  <Input placeholder="عنوان الإعلان" value={formData.adTitle} onChange={(e) => update('adTitle', e.target.value)} className="mt-1" />
                </div>
                <div>
                  <Label className="text-xs">العبارة الحافزة (CTA)</Label>
                  <select value={formData.cta} onChange={(e) => update('cta', e.target.value)} className="w-full mt-1 rounded-lg border border-[#2D2B55] bg-[#1E1B3A]/50 p-2 text-xs text-white">
                    <option value="">اختر CTA</option>
                    <option value="تسوق الآن">تسوق الآن</option>
                    <option value="اشترك">اشترك</option>
                    <option value="اعرف المزيد">اعرف المزيد</option>
                    <option value="تواصل معنا">تواصل معنا</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-between mt-8 pt-6 border-t border-[#2D2B55]/50">
            {step > 1 ? <Button variant="outline" onClick={() => setStep(step - 1)}>السابق</Button> : <div />}
            {step < 5 ? (
              <Button onClick={() => setStep(step + 1)} disabled={step === 1 ? !isValidPlatform : step === 2 ? !isValidObjective : step === 4 ? !isValidBudget : false}>
                التالي
              </Button>
            ) : (
              <Button onClick={handleFinish} disabled={submitting} className="gradient-brand text-white border-0">
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {submitting ? 'جارٍ الإنشاء...' : 'إنشاء الحملة'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};