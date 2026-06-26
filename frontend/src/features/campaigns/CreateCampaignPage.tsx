import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { cn } from '@/utils/helpers';
import { ArrowLeft, Facebook, Instagram, Music, Ghost, Check, Upload, X, Plus } from 'lucide-react';

const platforms = [
  { id: 'facebook', label: 'فيسبوك', icon: Facebook, color: '#1877F2' },
  { id: 'instagram', label: 'إنستجرام', icon: Instagram, color: '#E4405F' },
  { id: 'tiktok', label: 'تيك توك', icon: Music, color: '#111' },
  { id: 'snapchat', label: 'سناب شات', icon: Ghost, color: '#FFFC00' },
];

const objectives = [
  { id: 'awareness', label: 'الوعي', desc: 'زيادة الوعي بعلامتك التجارية' },
  { id: 'engagement', label: 'التفاعل', desc: 'زيادة التفاعل مع المنشورات' },
  { id: 'traffic', label: 'الزيارات', desc: 'جذب زوار للموقع' },
  { id: 'conversions', label: 'التحويلات', desc: 'زيادة التحويلات والمبيعات' },
  { id: 'sales', label: 'المبيعات', desc: 'تحقيق مبيعات مباشرة' },
];

const interests = ['تكنولوجيا', 'أزياء', 'سفر', 'رياضة', 'طعام', 'صحة', 'تعليم', 'سيارات', 'عقارات', 'ألعاب'];

export const CreateCampaignPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [selectedPlatform, setSelectedPlatform] = useState('');
  const [selectedObjective, setSelectedObjective] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    dailyBudget: '',
    totalBudget: '',
    startDate: '',
    endDate: '',
    countries: [] as string[],
    ageMin: '18',
    ageMax: '65',
    gender: 'all',
    selectedInterests: [] as string[],
    adTitle: '',
    adBody: '',
    cta: '',
  });

  const update = (field: string, value: unknown) => setFormData((prev) => ({ ...prev, [field]: value }));
  const isValidPlatform = step === 1 && selectedPlatform;
  const isValidObjective = step === 2 && selectedObjective;
  const isValidAudience = step === 3;
  const isValidBudget = step === 4 && formData.name && formData.totalBudget;

  const handleFinish = () => {
    navigate('/campaigns');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in">
      {/* Header */}
      <div>
        <button onClick={() => navigate('/campaigns')} className="flex items-center gap-2 text-sm text-gray-500 hover:text-primary-600 mb-2">
          <ArrowLeft className="w-4 h-4" /> رجوع للحملات
        </button>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-dark-text">{t('campaigns.createCampaign')}</h1>
      </div>

      {/* Steps Progress */}
      <div className="flex items-center gap-2 bg-white dark:bg-dark-card rounded-xl p-4 border border-gray-100 dark:border-dark-border">
        {[1, 2, 3, 4, 5].map((s) => (
          <React.Fragment key={s}>
            <div className="flex items-center gap-2">
              <div className={cn('w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors', s <= step ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-500')}>
                {s < step ? <Check className="w-4 h-4" /> : s}
              </div>
              <span className={cn('text-sm hidden sm:inline', s <= step ? 'text-primary-600 font-medium' : 'text-gray-500')}>
                {['المنصة', 'الهدف', 'الجمهور', 'الميزانية', 'المحتوى'][s - 1]}
              </span>
            </div>
            {s < 5 && <div className={cn('flex-1 h-0.5', s < step ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-700')} />}
          </React.Fragment>
        ))}
      </div>

      <Card className="p-6">
        {/* Step 1: Platform */}
        {step === 1 && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-dark-text mb-1">اختر المنصة</h2>
            <p className="text-sm text-gray-500 mb-6">اختر المنصة التي تريد إنشاء الحملة عليها</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {platforms.map((p) => {
                const selected = selectedPlatform === p.id;
                const Icon = p.icon;
                return (
                  <button key={p.id} onClick={() => setSelectedPlatform(p.id)} className={cn('flex flex-col items-center gap-3 p-6 rounded-xl border-2 transition-all', selected ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20' : 'border-gray-200 dark:border-dark-border hover:border-primary-300')}>
                    <div className="w-14 h-14 rounded-xl flex items-center justify-center" style={{ backgroundColor: p.color + '20' }}>
                      <Icon className="w-7 h-7" style={{ color: p.color }} />
                    </div>
                    <span className="font-medium text-gray-900 dark:text-dark-text">{p.label}</span>
                    {selected && <Check className="w-5 h-5 text-primary-600" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 2: Objective */}
        {step === 2 && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-dark-text mb-1">حدد الهدف</h2>
            <p className="text-sm text-gray-500 mb-6">اختر الهدف الأساسي لحملتك</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {objectives.map((obj) => {
                const selected = selectedObjective === obj.id;
                return (
                  <button key={obj.id} onClick={() => setSelectedObjective(obj.id)} className={cn('text-right p-4 rounded-xl border-2 transition-all', selected ? 'border-secondary-600 bg-secondary-50 dark:bg-secondary-900/20' : 'border-gray-200 dark:border-dark-border hover:border-secondary-300')}>
                    <p className="font-semibold text-gray-900 dark:text-dark-text">{obj.label}</p>
                    <p className="text-sm text-gray-500 mt-1">{obj.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 3: Target Audience */}
        {step === 3 && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-dark-text mb-1">الجمهور المستهدف</h2>
            <p className="text-sm text-gray-500 mb-6">حدد الجمهور الذي تريد استهدافه</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="الدول" placeholder="مثال: السعودية، الإمارات" value={formData.countries.join(', ')} onChange={(e) => update('countries', e.target.value.split(',').map((s) => s.trim()))} />
              <div className="grid grid-cols-2 gap-2">
                <Input label="العمر من" type="number" value={formData.ageMin} onChange={(e) => update('ageMin', e.target.value)} />
                <Input label="العمر إلى" type="number" value={formData.ageMax} onChange={(e) => update('ageMax', e.target.value)} />
              </div>
              <Select label="الجنس" value={formData.gender} onChange={(e) => update('gender', e.target.value)} options={[{ value: 'all', label: 'الكل' }, { value: 'male', label: 'ذكر' }, { value: 'female', label: 'أنثى' }]} />
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">الاهتمامات</label>
                <div className="flex flex-wrap gap-2">
                  {interests.map((i) => {
                    const selected = formData.selectedInterests.includes(i);
                    return (
                      <button key={i} onClick={() => update('selectedInterests', selected ? formData.selectedInterests.filter((x) => x !== i) : [...formData.selectedInterests, i])} className={cn('px-3 py-1.5 rounded-full text-sm border transition-colors', selected ? 'bg-primary-600 text-white border-primary-600' : 'border-gray-300 dark:border-dark-border text-gray-600 dark:text-gray-400 hover:border-primary-300')}>
                        {i}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Budget & Schedule */}
        {step === 4 && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-dark-text mb-1">الميزانية والجدول</h2>
            <p className="text-sm text-gray-500 mb-6">حدد ميزانية حملتك ومواعيدها</p>
            <div className="space-y-4">
              <Input label="اسم الحملة" placeholder="أدخل اسم الحملة" value={formData.name} onChange={(e) => update('name', e.target.value)} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="الميزانية اليومية" type="number" placeholder="500" value={formData.dailyBudget} onChange={(e) => update('dailyBudget', e.target.value)} />
                <Input label="الميزانية الكلية" type="number" placeholder="10000" value={formData.totalBudget} onChange={(e) => update('totalBudget', e.target.value)} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="تاريخ البدء" type="date" value={formData.startDate} onChange={(e) => update('startDate', e.target.value)} />
                <Input label="تاريخ الانتهاء" type="date" value={formData.endDate} onChange={(e) => update('endDate', e.target.value)} />
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Creative Content */}
        {step === 5 && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-dark-text mb-1">المحتوى الإعلاني</h2>
            <p className="text-sm text-gray-500 mb-6">أضف المحتوى الإعلاني لحملتك</p>
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 dark:border-dark-border rounded-xl p-8 text-center hover:border-primary-400 transition-colors cursor-pointer">
                <Upload className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">اسحب وأفلت الصور أو الفيديو هنا</p>
                <p className="text-xs text-gray-400 mt-1">أو انقر للرفع - JPG, PNG, GIF, MP4</p>
              </div>
              <Input label="النص الإعلاني" placeholder="أدخل النص الرئيسي للإعلان" value={formData.adBody} onChange={(e) => update('adBody', e.target.value)} />
              <Input label="العنوان" placeholder="عنوان الإعلان" value={formData.adTitle} onChange={(e) => update('adTitle', e.target.value)} />
              <Select label="العبارة الحافزة (CTA)" value={formData.cta} onChange={(e) => update('cta', e.target.value)} options={[{ value: '', label: 'اختر CTA' }, { value: 'تسوق الآن', label: 'تسوق الآن' }, { value: 'اشترك', label: 'اشترك' }, { value: 'اعرف المزيد', label: 'اعرف المزيد' }, { value: 'تواصل معنا', label: 'تواصل معنا' }, { value: 'حمل التطبيق', label: 'حمل التطبيق' }]} />
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8 pt-6 border-t border-gray-100 dark:border-dark-border">
          {step > 1 ? <Button variant="outline" onClick={() => setStep(step - 1)}>السابق</Button> : <div />}
          {step < 5 ? (
            <Button onClick={() => setStep(step + 1)} disabled={step === 1 ? !isValidPlatform : step === 2 ? !isValidObjective : step === 4 ? !isValidBudget : false}>
              التالي
            </Button>
          ) : (
            <Button onClick={handleFinish}>إنشاء الحملة</Button>
          )}
        </div>
      </Card>
    </div>
  );
};



