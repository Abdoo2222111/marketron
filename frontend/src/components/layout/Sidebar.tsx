import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLocalization } from '@/contexts/LocalizationContext';
import { cn } from '@/utils/helpers';
import { useSettingsStore } from '@/store/settingsStore';
import {
  LayoutDashboard, Megaphone, Palette, BarChart3, Users, Search,
  Building2, Settings, ChevronDown, Menu, X, Globe, Moon, Sun,
  LogOut, ChevronLeft, Bell, MessageCircle, Bot
} from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';

const navItems = [
  { path: '/ar/dashboard', label: 'لوحة التحكم', icon: LayoutDashboard },
  { path: '/ar/dashboard/campaigns', label: 'الحملات', icon: Megaphone },
  { path: '/ar/dashboard/content', label: 'المحتوى', icon: Palette },
  { path: '/ar/dashboard/analytics', label: 'التحليلات', icon: BarChart3 },
  { path: '/ar/dashboard/social', label: 'الرسائل', icon: MessageCircle },
  { path: '/ar/dashboard/ai-agents', label: 'الوكلاء الذكيين', icon: Bot },
  { path: '/ar/dashboard/workspace', label: 'مساحة العمل', icon: Building2 },
  { path: '/ar/dashboard/competitors', label: 'المنافسون', icon: Users },
  { path: '/ar/dashboard/market-research', label: 'أبحاث السوق', icon: Search },
  { path: '/ar/dashboard/settings', label: 'الإعدادات', icon: Settings },
];

interface SidebarProps {
  onNavigate?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onNavigate }) => {
  const { t, locale } = useLocalization();
  const pathname = usePathname() || '';
  const { sidebarOpen, toggleSidebar } = useSettingsStore();
  const isRTL = locale === 'ar';

  return (
    <>
      <aside
        className={cn(
          'fixed top-0 right-0 h-full bg-white dark:bg-dark-card border-l border-gray-200 dark:border-dark-border z-30 transition-all duration-300 hidden lg:flex flex-col',
          sidebarOpen ? 'w-[260px]' : 'w-[72px]'
        )}
      >
        <div className="flex items-center h-16 px-4 border-b border-gray-100 dark:border-dark-border">
          <Link href="/ar/dashboard" className="flex items-center gap-3 min-w-0" onClick={onNavigate}>
            <img src="/logo.svg" alt="MARKETRON" className="w-9 h-9 object-contain flex-shrink-0" />
            {sidebarOpen && (
              <span className="font-black text-lg bg-gradient-to-r from-electric to-purple bg-clip-text text-transparent whitespace-nowrap tracking-tight">
                MARKETRON
              </span>
            )}
          </Link>
          <button
            onClick={toggleSidebar}
            className={cn('p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors mr-auto', !sidebarOpen && 'mr-0')}
          >
            <ChevronLeft className={cn('w-4 h-4 text-gray-400 transition-transform', !sidebarOpen && 'rotate-180')} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname.includes(item.path);
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                href={item.path}
                onClick={onNavigate}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200',
                  isActive
                    ? 'bg-gradient-to-r from-electric/10 to-cyan/10 text-electric dark:text-cyan font-semibold border-r-2 border-electric'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-dark-text'
                )}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {sidebarOpen && <span className="text-sm whitespace-nowrap">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className={cn('p-3 border-t border-gray-100 dark:border-dark-border', !sidebarOpen && 'text-center')}>
          <Link href="/settings" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <Avatar name="أحمد محمد" size="sm" />
            {sidebarOpen && (
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-dark-text truncate">أحمد محمد</p>
                <p className="text-xs text-gray-500 truncate">a@example.com</p>
              </div>
            )}
          </Link>
        </div>
      </aside>

      <div className="lg:hidden fixed top-0 inset-x-0 h-16 bg-white dark:bg-dark-card border-b border-gray-200 dark:border-dark-border z-30 flex items-center justify-between px-4">
        <Link href="/ar/dashboard" className="flex items-center gap-3">
          <img src="/logo.svg" alt="MARKETRON" className="w-8 h-8 object-contain" />
          <span className="font-black text-lg bg-gradient-to-r from-electric to-cyan bg-clip-text text-transparent">MARKETRON</span>
        </Link>
        <button
          onClick={() => useSettingsStore.getState().setMobileMenuOpen(true)}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
        >
          <Menu className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
      </div>
    </>
  );
};

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ isOpen, onClose }) => {
  const { t } = useLocalization();
  const pathname = usePathname() || '';

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onClose} />
      )}
      <div
        className={cn(
          'fixed top-0 right-0 bottom-0 w-[280px] bg-white dark:bg-dark-card z-50 transform transition-transform duration-300 lg:hidden shadow-2xl',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-dark-border">
          <span className="font-bold text-gray-900 dark:text-dark-text">القائمة</span>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname.includes(item.path);
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                href={item.path}
                onClick={onClose}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors',
                  isActive
                    ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 font-medium'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                )}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
};
