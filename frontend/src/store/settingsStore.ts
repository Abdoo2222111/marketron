import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Lang = 'ar' | 'en';

interface SettingsState {
  theme: 'dark';
  lang: Lang;
  sidebarOpen: boolean;
  mobileMenuOpen: boolean;
  setTheme: (theme: 'dark') => void;
  setLang: (lang: Lang) => void;
  toggleSidebar: () => void;
  setMobileMenuOpen: (open: boolean) => void;
}

const applyLang = (lang: Lang) => {
  const root = document.documentElement;
  root.dir = lang === 'ar' ? 'rtl' : 'ltr';
  root.lang = lang;
  document.title = lang === 'ar' ? 'MARKETRON' : 'Marketing Platform';
};

if (typeof window !== 'undefined') {
  document.documentElement.classList.add('dark');
  document.documentElement.style.colorScheme = 'dark';
  localStorage.setItem('theme', 'dark');
}

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

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      theme: 'dark',
      lang: getInitialLang(),
      sidebarOpen: true,
      mobileMenuOpen: false,
      setTheme: () => {
        document.documentElement.classList.add('dark');
        document.documentElement.style.colorScheme = 'dark';
        set({ theme: 'dark' });
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
          document.documentElement.classList.add('dark');
          document.documentElement.style.colorScheme = 'dark';
          applyLang(state.lang);
        }
      },
    }
  )
);
