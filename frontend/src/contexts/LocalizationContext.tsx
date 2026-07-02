'use client';

import React, { createContext, useContext } from 'react';
import { useTranslation } from 'react-i18next';

type Locale = 'ar' | 'en' | 'fr' | 'tr';
type Direction = 'rtl' | 'ltr';

interface LocalizationContextType {
  locale: Locale;
  direction: Direction;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
}

const LocalizationContext = createContext<LocalizationContextType | undefined>(undefined);

export function LocalizationProvider({ children }: { children: React.ReactNode }) {
  const { t: i18nT, i18n } = useTranslation();

  const locale = (i18n.language || 'ar') as Locale;
  const direction: Direction = locale === 'ar' ? 'rtl' : 'ltr';

  const setLocale = (newLocale: Locale) => {
    i18n.changeLanguage(newLocale);
    document.documentElement.dir = newLocale === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = newLocale;
  };

  const t = (key: string): string => i18nT(key);

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
