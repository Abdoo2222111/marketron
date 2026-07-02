import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLocalization } from '@/contexts/LocalizationContext';
import { cn } from '@/lib/utils';
import { useSettingsStore } from '@/store/settingsStore';
import { useAuth } from '@/contexts/AuthContext';
import {
  LayoutDashboard, Megaphone, Palette, BarChart3, Users, Search,
  Building2, Settings, ChevronDown, X, Globe, Moon, Sun,
  LogOut, ChevronLeft, Bell, MessageCircle, Bot, Link2, Sparkles,
  Rocket, FlaskConical, Loader2,
} from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';
import { Logo } from '@/components/ui/Logo';

const navItems = [
  { path: '/ar/dashboard', label: 'لوحة التحكم', icon: LayoutDashboard },
  { path: '/ar/dashboard/campaigns', label: 'الحملات', icon: Megaphone },
  { path: '/ar/dashboard/content', label: 'المحتوى', icon: Palette },
  { path: '/ar/dashboard/content-studio', label: 'استوديو AI', icon: Sparkles },
  { path: '/ar/dashboard/analytics', label: 'التحليلات', icon: BarChart3 },
  { path: '/ar/dashboard/channels', label: 'القنوات', icon: Link2 },
  { path: '/ar/dashboard/social', label: 'الرسائل', icon: MessageCircle },
  { path: '/ar/dashboard/ai-agents', label: 'الوكلاء الذكيين', icon: Bot },
  { path: '/ar/dashboard/workspace', label: 'مساحة العمل', icon: Building2 },
  { path: '/ar/dashboard/competitors', label: 'المنافسون', icon: Users },
  { path: '/ar/dashboard/market-research', label: 'أبحاث السوق', icon: Search },
  { path: '/ar/dashboard/onboarding', label: 'إعداد النشاط', icon: Rocket },
  { path: '/ar/dashboard/sandbox', label: 'اختبر الوكيل', icon: FlaskConical },
  { path: '/ar/dashboard/settings', label: 'الإعدادات', icon: Settings },
];

interface SidebarProps {
  onNavigate?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onNavigate }) => {
  const { t, locale } = useLocalization();
  const pathname = usePathname() || '';
  const { sidebarOpen, toggleSidebar } = useSettingsStore();
  const { user, isLoading } = useAuth();
  const isRTL = locale === 'ar';

  return (
    <>
      <aside
        className={cn(
          'fixed top-0 right-0 h-full bg-[#0B0A1A] border-l border-[#7C3AED]/10 z-30 transition-all duration-300 hidden lg:flex flex-col',
          sidebarOpen ? 'w-[260px]' : 'w-[72px]'
        )}
      >
        <div className="flex items-center h-16 px-4 border-b border-[#7C3AED]/10">
          <Link href="/ar/dashboard" className="flex items-center gap-3 min-w-0" onClick={onNavigate}>
            <Logo width={44} height={44} className="drop-shadow-[0_0_12px_rgba(124,58,237,0.4)]" />
            {sidebarOpen && (
              <span className="font-black text-lg gradient-brand-text whitespace-nowrap tracking-tight">
                MARKETRON
              </span>
            )}
          </Link>
          <button
            onClick={toggleSidebar}
            className={cn('p-1.5 hover:bg-[#1E1B3A] rounded-lg transition-colors mr-auto', !sidebarOpen && 'mr-0')}
          >
            <ChevronLeft className={cn('w-4 h-4 text-[#A1A1C2] transition-transform', !sidebarOpen && 'rotate-180')} />
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
                    ? 'bg-gradient-to-r from-[#7C3AED]/10 to-[#06B6D4]/10 text-[#7C3AED] font-semibold border-r-2 border-[#7C3AED]'
                    : 'text-[#A1A1C2] hover:bg-[#1E1B3A] hover:text-[#F5F3FF]'
                )}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {sidebarOpen && <span className="text-sm whitespace-nowrap">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className={cn('p-3 border-t border-[#7C3AED]/10', !sidebarOpen && 'text-center')}>
          {isLoading ? (
            <div className="flex items-center justify-center py-3">
              <Loader2 className="w-5 h-5 animate-spin text-[#A1A1C2]" />
            </div>
          ) : user ? (
            <Link href="/settings" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[#1E1B3A] transition-colors">
              <Avatar name={user.name} size="sm" />
              {sidebarOpen && (
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-[#F5F3FF] truncate">{user.name}</p>
                  <p className="text-xs text-[#A1A1C2] truncate">{user.email}</p>
                </div>
              )}
            </Link>
          ) : null}
        </div>
      </aside>

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
          'fixed top-0 right-0 bottom-0 w-[280px] bg-[#0B0A1A] z-50 transform transition-transform duration-300 lg:hidden shadow-2xl',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        <div className="flex items-center justify-between p-4 border-b border-[#7C3AED]/10">
          <span className="font-bold text-[#F5F3FF]">القائمة</span>
          <button onClick={onClose} className="p-2 hover:bg-[#1E1B3A] rounded-lg">
            <X className="w-5 h-5 text-[#A1A1C2]" />
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
                    ? 'bg-[#7C3AED]/10 text-[#7C3AED] font-medium'
                    : 'text-[#A1A1C2] hover:bg-[#1E1B3A]'
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
