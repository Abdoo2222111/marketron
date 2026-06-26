import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Megaphone, Mail, ArrowLeft, CheckCircle } from 'lucide-react';

export const ForgotPasswordPage: React.FC = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-dark-bg dark:via-dark-card dark:to-dark-bg flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Megaphone className="w-7 h-7 text-white" />
          </div>
          {sent ? (
            <>
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-dark-text">{t('auth.checkEmail')}</h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">{t('auth.resetLinkSent')}</p>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-dark-text">{t('auth.forgotPassword')}</h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">أدخل بريدك الإلكتروني وسنرسل لك رابط إعادة التعيين</p>
            </>
          )}
        </div>

        {!sent ? (
          <>
            <Input
              label={t('common.email')}
              placeholder="admin@example.com"
              icon={<Mail className="w-4 h-4" />}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Button className="w-full mt-4" size="lg" onClick={() => setSent(true)}>{t('auth.sendResetLink')}</Button>
          </>
        ) : (
          <Button className="w-full" size="lg" onClick={() => setSent(false)}>إرسال مرة أخرى</Button>
        )}

        <Link to="/login" className="flex items-center justify-center gap-2 mt-6 text-sm text-gray-500 hover:text-primary-600">
          <ArrowLeft className="w-4 h-4" />
          {t('common.back')} إلى تسجيل الدخول
        </Link>
      </Card>
    </div>
  );
};

export const ResetPasswordPage: React.FC = () => {
  const { t } = useTranslation();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [done, setDone] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-dark-bg dark:via-dark-card dark:to-dark-bg flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Megaphone className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-dark-text">{t('auth.resetPassword')}</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">{t('auth.passwordRequirements')}</p>
        </div>

        {done ? (
          <div className="text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400 mb-4">تم إعادة تعيين كلمة المرور بنجاح</p>
            <Link to="/login">
              <Button className="w-full">{t('auth.login')}</Button>
            </Link>
          </div>
        ) : (
          <>
            <Input label={t('auth.newPassword')} type="password" placeholder="••••••••" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
            <Input label={t('auth.confirmPassword')} type="password" placeholder="••••••••" className="mt-4" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
            <Button className="w-full mt-6" size="lg" onClick={() => setDone(true)}>{t('auth.resetPassword')}</Button>
          </>
        )}
      </Card>
    </div>
  );
};



