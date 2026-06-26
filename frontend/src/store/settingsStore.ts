import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'light' | 'dark' | 'system';
type Lang = 'ar' | 'en';

interface SettingsState {
  theme: Theme;
  lang: Lang;
  sidebarOpen: boolean;
  mobileMenuOpen: boolean;
  setTheme: (theme: Theme) => void;
  setLang: (lang: Lang) => void;
  toggleSidebar: () => void;
  setMobileMenuOpen: (open: boolean) => void;
}

const applyTheme = (theme: Theme) => {
  const root = document.documentElement;
  if (theme === 'dark') {
    root.classList.add('dark');
  } else if (theme === 'light') {
    root.classList.remove('dark');
  } else {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (prefersDark) root.classList.add('dark');
    else root.classList.remove('dark');
  }
};

const applyLang = (lang: Lang) => {
  const root = document.documentElement;
  root.dir = lang === 'ar' ? 'rtl' : 'ltr';
  root.lang = lang;
  document.title = lang === 'ar' ? 'MARKETRON' : 'Marketing Platform';
};

const getInitialTheme = (): Theme => {
  if (typeof window === 'undefined') return 'system';
  const saved = localStorage.getItem('settings-theme');
  if (saved === 'dark' || saved === 'light' || saved === 'system') return saved;
  return 'system';
};

if (typeof window !== 'undefined') {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    const savedTheme = localStorage.getItem('settings-theme') || 'system';
    if (savedTheme === 'system') applyTheme('system');
  });
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      theme: getInitialTheme(),
      lang: (typeof window !== 'undefined' && localStorage.getItem('i18nextLng')?.startsWith('ar') ? 'ar' : 'en') as Lang,
      sidebarOpen: true,
      mobileMenuOpen: false,
      setTheme: (theme) => {
        localStorage.setItem('settings-theme', theme);
        applyTheme(theme);
        set({ theme });
      },
      setLang: (lang) => {
        localStorage.setItem('i18nextLng', lang);
        applyLang(lang);
        set({ lang });
      },
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
      setMobileMenuOpen: (open) => set({ mobileMenuOpen: open }),
    }),
    {
      name: 'settings-store',
      partialize: (state) => ({ theme: state.theme, lang: state.lang }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          applyTheme(state.theme);
          applyLang(state.lang);
        }
      },
    }
  )
);
