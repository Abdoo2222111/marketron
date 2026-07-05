import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Lang = 'ar' | 'en';

interface SettingsState {
  theme: 'dark' | 'light';
  lang: Lang;
  sidebarOpen: boolean;
  mobileMenuOpen: boolean;
  setTheme: (theme: 'dark' | 'light') => void;
  setLang: (lang: Lang) => void;
  toggleSidebar: () => void;
  setMobileMenuOpen: (open: boolean) => void;
}

const applyTheme = (theme: 'dark' | 'light') => {
  const root = document.documentElement;
  if (theme === 'dark') {
    root.classList.add('dark');
    root.style.colorScheme = 'dark';
  } else {
    root.classList.remove('dark');
    root.style.colorScheme = 'light';
  }
  localStorage.setItem('theme', theme);
};

const applyLang = (lang: Lang) => {
  const root = document.documentElement;
  root.dir = lang === 'ar' ? 'rtl' : 'ltr';
  root.lang = lang;
  document.title = lang === 'ar' ? 'MARKETRON' : 'Marketing Platform';
};

const getInitialTheme = (): 'dark' | 'light' => {
  if (typeof window === 'undefined') return 'dark';
  const saved = localStorage.getItem('theme');
  if (saved === 'light' || saved === 'dark') return saved;
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
};

const getInitialLang = (): Lang => {
  if (typeof window === 'undefined') return 'ar';
  const saved = localStorage.getItem('settings-store');
  if (saved) {
    try { const parsed = JSON.parse(saved); if (parsed?.state?.lang) return parsed.state.lang; }
    catch { /* ignore */ }
  }
  const i18n = localStorage.getItem('i18nextLng');
  return i18n?.startsWith('ar') ? 'ar' : 'en';
};

if (typeof window !== 'undefined') {
  const initialTheme = getInitialTheme();
  applyTheme(initialTheme);
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      theme: getInitialTheme(),
      lang: getInitialLang(),
      sidebarOpen: true,
      mobileMenuOpen: false,
      setTheme: (theme) => {
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
