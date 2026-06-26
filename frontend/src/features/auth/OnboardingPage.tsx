import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Megaphone, Check, Facebook, Instagram, Music, Ghost, Target, BarChart3, Link2 } from 'lucide-react';
import { cn } from '@/utils/helpers';

const platforms = [
  { id: 'facebook', label: 'فيسبوك', icon: Facebook, color: '#1877F2' },
  { id: 'instagram', label: 'إنستجرام', icon: Instagram, color: '#E4405F' },
  { id: 'tiktok', label: 'تيك توك', icon: Music, color: '#000' },
  { id: 'snapchat', label: 'سناب شات', icon: Ghost, color: '#FFFC00' },
];

const goals = [
  { id: 'awareness', label: 'زيادة الوعي بالعلامة', icon: Target },
  { id: 'engagement', label: 'زيادة التفاعل', icon: BarChart3 },
  { id: 'conversions', label: 'زيادة التحويلات', icon: Target },
  { id: 'sales', label: 'زيادة المبيعات', icon: BarChart3 },
];

export const OnboardingPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);

  const togglePlatform = (id: string) => {
    setSelectedPlatforms((prev) => prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]);
  };

  const toggleGoal = (id: string) => {
    setSelectedGoals((prev) => prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]);
  };

  const handleFinish = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-dark-bg dark:via-dark-card dark:to-dark-bg flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl p-8">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Megaphone className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-dark-text">{t('auth.onboarding')}</h1>
          <p className="text-gray-500 mt-1">{t('auth.step')} {step} من 3</p>
        </div>

        {/* Steps indicator */}
        <div className="flex justify-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className={cn('w-3 h-3 rounded-full transition-colors', s <= step ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-700')} />
          ))}
        </div>

        {step === 1 && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-dark-text mb-4">{t('auth.selectPlatforms')}</h2>
            <div className="grid grid-cols-2 gap-4">
              {platforms.map((p) => {
                const selected = selectedPlatforms.includes(p.id);
                const Icon = p.icon;
                return (
                  <button key={p.id} onClick={() => togglePlatform(p.id)} className={cn('flex items-center gap-3 p-4 rounded-xl border-2 transition-all', selected ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20' : 'border-gray-200 dark:border-dark-border hover:border-primary-300')}>
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: p.color + '20' }}>
                      <Icon className="w-5 h-5" style={{ color: p.color }} />
                    </div>
                    <span className="font-medium text-gray-900 dark:text-dark-text">{p.label}</span>
                    {selected && <Check className="w-5 h-5 text-primary-600 mr-auto" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-dark-text mb-4">{t('auth.setGoals')}</h2>
            <div className="grid grid-cols-2 gap-4">
              {goals.map((g) => {
                const selected = selectedGoals.includes(g.id);
                const Icon = g.icon;
                return (
                  <button key={g.id} onClick={() => toggleGoal(g.id)} className={cn('flex items-center gap-3 p-4 rounded-xl border-2 transition-all', selected ? 'border-secondary-600 bg-secondary-50 dark:bg-secondary-900/20' : 'border-gray-200 dark:border-dark-border hover:border-secondary-300')}>
                    <Icon className={cn('w-6 h-6', selected ? 'text-secondary-600' : 'text-gray-400')} />
                    <span className="font-medium text-gray-900 dark:text-dark-text">{g.label}</span>
                    {selected && <Check className="w-5 h-5 text-secondary-600 mr-auto" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-dark-text mb-4">{t('auth.connectAccounts')}</h2>
            <div className="space-y-3">
              {platforms.filter((p) => selectedPlatforms.includes(p.id)).map((p) => {
                const Icon = p.icon;
                return (
                  <div key={p.id} className="flex items-center justify-between p-4 rounded-xl border border-gray-200 dark:border-dark-border">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: p.color + '20' }}>
                        <Icon className="w-5 h-5" style={{ color: p.color }} />
                      </div>
                      <span className="font-medium text-gray-900 dark:text-dark-text">{p.label}</span>
                    </div>
                    <Button variant="outline" size="sm" icon={<Link2 className="w-4 h-4" />}>ربط الحساب</Button>
                  </div>
                );
              })}
              {selectedPlatforms.length === 0 && (
                <p className="text-center text-gray-500 py-8">يرجى اختيار منصة أولاً</p>
              )}
            </div>
          </div>
        )}

        <div className="flex justify-between mt-8">
          {step > 1 ? (
            <Button variant="outline" onClick={() => setStep(step - 1)}>السابق</Button>
          ) : <div />}
          {step < 3 ? (
            <Button onClick={() => setStep(step + 1)}>التالي</Button>
          ) : (
            <Button onClick={handleFinish}>ابدأ الآن</Button>
          )}
        </div>
      </Card>
    </div>
  );
};


