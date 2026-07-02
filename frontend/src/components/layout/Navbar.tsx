import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { useSettingsStore } from '@/store/settingsStore';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import {
  Bell, Moon, Sun, Globe, LogOut, Settings, User, ChevronDown, Search, Megaphone, Loader2
} from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';

export const Navbar: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { isDark } = useTheme();
  const { lang, setLang } = useSettingsStore();
  const { user, isLoading, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [notifLoading, setNotifLoading] = useState(false);
  const isRTL = i18n.language === 'ar';

  const toggleLang = () => {
    const newLang = lang === 'ar' ? 'en' : 'ar';
    setLang(newLang);
    i18n.changeLanguage(newLang);
  };

  useEffect(() => {
    (async () => {
      if (!showNotifications) return;
      setNotifLoading(true);
      try {
        const { notificationsApi } = await import('@/services/api-modules');
        const res = await notificationsApi.list();
        setNotifications(res.data?.data || []);
      } catch {
        setNotifications([]);
      } finally {
        setNotifLoading(false);
      }
    })();
  }, [showNotifications]);

  return (
    <header className="h-16 bg-white dark:bg-dark-card border-b border-gray-100 dark:border-dark-border flex items-center justify-between px-4 lg:px-6 sticky top-0 z-20">
      {/* Search */}  
      <div className="hidden md:flex relative max-w-md flex-1">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder={t('common.search') + '...'}
          className="w-full pr-10 pl-4 py-2 border border-gray-200 dark:border-dark-border rounded-lg bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-dark-text placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
      </div>

      <div className="flex items-center gap-2 mr-auto md:mr-0">
        {/* Language Toggle */}
        <button
          onClick={toggleLang}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-500 dark:text-gray-400 transition-colors"
          title={isRTL ? 'English' : 'العربية'}
        >
          <Globe className="w-5 h-5" />
          <span className="text-xs mr-1 font-medium">{isRTL ? 'EN' : 'AR'}</span>
        </button>

        {/* Theme Indicator */}
        <button className="p-2 rounded-lg text-gray-500 dark:text-gray-400 cursor-default">
          <Moon className="w-5 h-5" />
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-500 dark:text-gray-400 transition-colors relative"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
          </button>
          {showNotifications && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
              <div className="absolute left-0 mt-2 w-80 bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-xl shadow-xl z-50 animate-fade-in">
                <div className="p-3 border-b border-gray-100 dark:border-dark-border flex items-center justify-between">
                  <span className="font-medium text-sm text-gray-900 dark:text-dark-text">{t('notifications.markAllRead')}</span>
                  <span className="text-xs text-primary-600 cursor-pointer">{t('notifications.markAllRead')}</span>
                </div>
                <div className="max-h-72 overflow-y-auto">
                  {notifLoading ? (
                    <div className="flex items-center justify-center py-6">
                      <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="p-6 text-center text-sm text-gray-400">
                      لا توجد إشعارات
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div key={n.id} className={cn('p-3 border-b border-gray-50 dark:border-dark-border hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer', !n.isRead && 'bg-primary-50/50 dark:bg-primary-900/10')}>
                        <p className="text-sm font-medium text-gray-900 dark:text-dark-text">{n.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{n.message}</p>
                        <p className="text-xs text-gray-400 mt-1">{n.createdAt ? new Date(n.createdAt).toLocaleDateString('ar-SA') : ''}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
            ) : (
              <>
                <Avatar name={user?.name} size="sm" />
                <div className="hidden md:block text-right">
                  <p className="text-sm font-medium text-gray-900 dark:text-dark-text">{user?.name || 'مستخدم'}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
              </>
            )}
            <ChevronDown className="w-4 h-4 text-gray-400 hidden md:block" />
          </button>
          {showUserMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
              <div className="absolute left-0 mt-2 w-56 bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-xl shadow-xl z-50 animate-fade-in py-1">
                <Link href="/settings" onClick={() => setShowUserMenu(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">
                  <User className="w-4 h-4" /> {t('nav.profile')}
                </Link>
                <Link href="/settings" onClick={() => setShowUserMenu(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">
                  <Settings className="w-4 h-4" /> {t('nav.settings')}
                </Link>
                <hr className="my-1 border-gray-100 dark:border-dark-border" />
                <button onClick={logout} className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 w-full">
                  <LogOut className="w-4 h-4" /> {t('nav.logout')}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

