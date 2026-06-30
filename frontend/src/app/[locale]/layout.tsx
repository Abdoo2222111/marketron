'use client';

import React, { useEffect } from 'react';
import i18n from '@/i18n';

const dirMap: Record<string, 'rtl' | 'ltr'> = {
  ar: 'rtl',
  en: 'ltr',
  fr: 'ltr',
  tr: 'ltr',
};

export default function LocaleLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  useEffect(() => {
    const lang = locale || 'ar';
    i18n.changeLanguage(lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = dirMap[lang] || 'rtl';
  }, [locale]);

  return <>{children}</>;
}
