'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';

type Locale = 'ar' | 'en';
type Direction = 'rtl' | 'ltr';

interface LocalizationContextType {
  locale: Locale;
  direction: Direction;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
}

const translations: Record<Locale, Record<string, string>> = {
  ar: {
    'app.name': 'ماركترون',
    'app.tagline': 'التسويق والأتمتة الذكية',
    'nav.dashboard': 'لوحة التحكم',
    'nav.campaigns': 'الحملات',
    'nav.content': 'المحتوى',
    'nav.analytics': 'التحليلات',
    'nav.competitors': 'المنافسون',
    'nav.market': 'أبحاث السوق',
    'nav.settings': 'الإعدادات',
    'common.search': 'بحث...',
    'common.notifications': 'الإشعارات',
    'common.profile': 'الملف الشخصي',
    'common.logout': 'تسجيل الخروج',
    'common.save': 'حفظ',
    'common.cancel': 'إلغاء',
    'common.delete': 'حذف',
    'common.edit': 'تعديل',
    'common.create': 'إنشاء',
    'common.loading': 'جاري التحميل...',
    'common.noData': 'لا توجد بيانات',
    'common.error': 'حدث خطأ',
    'common.success': 'تم بنجاح',
    'common.confirm': 'تأكيد',
    'auth.login': 'تسجيل الدخول',
    'auth.register': 'إنشاء حساب',
    'auth.email': 'البريد الإلكتروني',
    'auth.password': 'كلمة المرور',
    'auth.forgotPassword': 'نسيت كلمة المرور؟',
    'auth.googleLogin': 'تسجيل الدخول بحساب Google',
    'auth.linkedinLogin': 'تسجيل الدخول بحساب LinkedIn',
  },
  en: {
    'app.name': 'MARKETRON',
    'app.tagline': 'Marketing + Automation',
    'nav.dashboard': 'Dashboard',
    'nav.campaigns': 'Campaigns',
    'nav.content': 'Content',
    'nav.analytics': 'Analytics',
    'nav.competitors': 'Competitors',
    'nav.market': 'Market Research',
    'nav.settings': 'Settings',
    'common.search': 'Search...',
    'common.notifications': 'Notifications',
    'common.profile': 'Profile',
    'common.logout': 'Logout',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.create': 'Create',
    'common.loading': 'Loading...',
    'common.noData': 'No data available',
    'common.error': 'An error occurred',
    'common.success': 'Success',
    'common.confirm': 'Confirm',
    'auth.login': 'Login',
    'auth.register': 'Create Account',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.forgotPassword': 'Forgot Password?',
    'auth.googleLogin': 'Login with Google',
    'auth.linkedinLogin': 'Login with LinkedIn',
  },
};

const LocalizationContext = createContext<LocalizationContextType | undefined>(undefined);

export function LocalizationProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('ar');

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    const direction = newLocale === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.dir = direction;
    document.documentElement.lang = newLocale;
    localStorage.setItem('locale', newLocale);
  }, []);

  const t = useCallback(
    (key: string): string => {
      return translations[locale]?.[key] || translations['en']?.[key] || key;
    },
    [locale]
  );

  const direction: Direction = locale === 'ar' ? 'rtl' : 'ltr';

  return (
    <LocalizationContext.Provider value={{ locale, direction, setLocale, t }}>
      {children}
    </LocalizationContext.Provider>
  );
}

export function useLocalization(): LocalizationContextType {
  const context = useContext(LocalizationContext);
  if (!context) {
    throw new Error('useLocalization must be used within a LocalizationProvider');
  }
  return context;
}
