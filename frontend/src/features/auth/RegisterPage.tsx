import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Megaphone, Mail, Lock, User, Phone, Eye, EyeOff } from 'lucide-react';

const registerSchema = z.object({
  name: z.string().min(2, 'الاسم مطلوب'),
  email: z.string().email('البريد الإلكتروني غير صالح'),
  phone: z.string().min(10, 'رقم الجوال غير صالح'),
  password: z.string().min(8, 'كلمة المرور يجب أن تكون 8 أحرف على الأقل'),
  confirmPassword: z.string(),
  accountType: z.enum(['individual', 'company']),
}).refine((d) => d.password === d.confirmPassword, { message: 'كلمة المرور غير متطابقة', path: ['confirmPassword'] });

type RegisterForm = z.infer<typeof registerSchema>;

export const RegisterPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { accountType: 'individual' },
  });

  const onSubmit = (data: RegisterForm) => {
    console.log('Register', data);
    navigate('/onboarding');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-dark-bg dark:via-dark-card dark:to-dark-bg flex items-center justify-center p-4">
      <Card className="w-full max-w-lg p-8">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Megaphone className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-dark-text">{t('auth.register')}</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">أنشئ حسابك مجاناً وابدأ رحلتك</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label={t('common.name')} placeholder="أحمد محمد" icon={<User className="w-4 h-4" />} error={errors.name?.message} {...register('name')} />
            <Input label={t('common.email')} placeholder="admin@example.com" icon={<Mail className="w-4 h-4" />} error={errors.email?.message} {...register('email')} />
          </div>
          <Input label={t('common.phone')} placeholder="+966 55 123 4567" icon={<Phone className="w-4 h-4" />} error={errors.phone?.message} {...register('phone')} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Input label={t('common.password')} type={showPassword ? 'text' : 'password'} placeholder="••••••••" icon={<Lock className="w-4 h-4" />} error={errors.password?.message} {...register('password')} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute left-3 top-[38px] text-gray-400 hover:text-gray-600">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <Input label={t('auth.confirmPassword')} type="password" placeholder="••••••••" error={errors.confirmPassword?.message} {...register('confirmPassword')} />
          </div>

          <Select label={t('auth.accountType')} options={[
            { value: 'individual', label: t('auth.individual') },
            { value: 'company', label: t('auth.company') },
          ]} {...register('accountType')} />

          <label className="flex items-start gap-2 cursor-pointer">
            <input type="checkbox" checked={agreeTerms} onChange={(e) => setAgreeTerms(e.target.checked)} className="mt-1 rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
            <span className="text-sm text-gray-600 dark:text-gray-400">{t('auth.agreeToTerms')}</span>
          </label>

          <Button type="submit" className="w-full" size="lg" disabled={!agreeTerms}>{t('auth.createAccount')}</Button>

          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
            {t('auth.haveAccount')}{' '}
            <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">{t('auth.login')}</Link>
          </p>
        </form>
      </Card>
    </div>
  );
};



