export const theme = {
  colors: {
    primary: {
      DEFAULT: '#7C3AED',
      light: '#A78BFA',
      dark: '#5B21B6',
      foreground: '#FAFAFA',
    },
    secondary: {
      DEFAULT: '#3B82F6',
      light: '#60A5FA',
      dark: '#2563EB',
      foreground: '#FAFAFA',
    },
    gradient: {
      primary: 'linear-gradient(135deg, #7C3AED, #3B82F6)',
      warm: 'linear-gradient(135deg, #F59E0B, #EF4444)',
      cool: 'linear-gradient(135deg, #06B6D4, #3B82F6)',
      premium: 'linear-gradient(135deg, #7C3AED, #EC4899)',
    },
    platforms: {
      facebook: '#1877F2',
      instagram: '#E4405F',
      tiktok: '#000000',
      snapchat: '#FFFC00',
    } as const,
  },
  fonts: {
    arabic: ['Cairo', 'Tajawal', 'sans-serif'],
    english: ['Inter', 'system-ui', 'sans-serif'],
  },
  shadows: {
    card: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    elevated: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    modal: '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  },
  animations: {
    duration: {
      fast: '150ms',
      normal: '300ms',
      slow: '500ms',
    },
    easing: {
      easeOut: 'cubic-bezier(0.16, 1, 0.3, 1)',
      spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    },
  },
  borderRadius: {
    sm: '0.375rem',
    md: '0.5rem',
    lg: '0.75rem',
    xl: '1rem',
    '2xl': '1.5rem',
    full: '9999px',
  },
} as const;

export const platformLabels: Record<string, { en: string; ar: string }> = {
  facebook: { en: 'Facebook', ar: 'فيسبوك' },
  instagram: { en: 'Instagram', ar: 'انستجرام' },
  tiktok: { en: 'TikTok', ar: 'تيك توك' },
  snapchat: { en: 'Snapchat', ar: 'سناب شات' },
};

export const campaignStatusLabels: Record<string, { en: string; ar: string }> = {
  active: { en: 'Active', ar: 'نشط' },
  paused: { en: 'Paused', ar: 'متوقف' },
  draft: { en: 'Draft', ar: 'مسودة' },
  completed: { en: 'Completed', ar: 'مكتمل' },
  archived: { en: 'Archived', ar: 'مؤرشف' },
};

export const contentStatusLabels: Record<string, { en: string; ar: string }> = {
  draft: { en: 'Draft', ar: 'مسودة' },
  scheduled: { en: 'Scheduled', ar: 'مجدول' },
  published: { en: 'Published', ar: 'منشور' },
  failed: { en: 'Failed', ar: 'فشل' },
};
