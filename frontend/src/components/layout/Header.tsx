'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Search,
  Bell,
  Moon,
  Sun,
  Globe,
  ChevronDown,
  LogOut,
  User,
  Settings,
  Menu,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useLocalization } from '@/contexts/LocalizationContext';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface HeaderProps {
  breadcrumbs?: BreadcrumbItem[];
  onMenuToggle?: () => void;
}

export default function Header({ breadcrumbs, onMenuToggle }: HeaderProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { locale, setLocale, t } = useLocalization();

  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    if (breadcrumbs) return breadcrumbs;

    const segments = (pathname || '').split('/').filter(Boolean);
    const items: BreadcrumbItem[] = [];
    const pathMap: Record<string, string> = {
      dashboard: 'لوحة التحكم',
      campaigns: 'الحملات',
      create: 'إنشاء جديد',
      analytics: 'التحليلات',
      content: 'المحتوى',
      competitors: 'المنافسون',
      'market-research': 'أبحاث السوق',
      settings: 'الإعدادات',
    };

    // Skip locale segment
    const relevantSegments = segments.slice(1);
    relevantSegments.forEach((segment, index) => {
      const href = '/' + segments.slice(0, index + 2).join('/');
      items.push({
        label: pathMap[segment] || segment,
        href: index < relevantSegments.length - 1 ? href : undefined,
      });
    });

    return items;
  };

  const crumbs = generateBreadcrumbs();

  return (
    <header className="sticky top-0 z-30 w-full bg-background/80 backdrop-blur-xl border-b border-border">
      <div className="flex h-16 items-center justify-between px-4 lg:px-6 gap-4">
        {/* Left side - Mobile menu + Breadcrumbs */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={onMenuToggle}
          >
            <Menu size={20} />
          </Button>

          {/* Breadcrumbs */}
          <nav className="hidden md:flex items-center gap-1.5 text-sm">
            <Link href="/ar/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">MARKETRON</Link>
            {crumbs.map((crumb, index) => (
              <React.Fragment key={index}>
                <span className="text-muted-foreground/50">/</span>
                {crumb.href ? (
                  <Link href={crumb.href} className="text-muted-foreground hover:text-foreground transition-colors">
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-foreground font-medium">{crumb.label}</span>
                )}
              </React.Fragment>
            ))}
          </nav>
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="hidden md:flex relative">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('common.search')}
              className="w-64 ps-9 h-9 bg-muted/50 border-0 focus-visible:bg-background"
            />
          </div>

          {/* Language Toggle */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Globe size={18} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-36">
              <DropdownMenuLabel>اللغة / Language</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setLocale('ar')} className={cn(locale === 'ar' && 'bg-accent')}>
                العربية
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLocale('en')} className={cn(locale === 'en' && 'bg-accent')}>
                English
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLocale('fr')} className={cn(locale === 'fr' && 'bg-accent')}>
                Français
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLocale('tr')} className={cn(locale === 'tr' && 'bg-accent')}>
                Türkçe
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Theme Toggle */}
          <Button variant="ghost" size="icon" onClick={toggleTheme}>
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </Button>

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell size={18} />
                <Badge
                  variant="destructive"
                  className="absolute -top-1 -end-1 h-4 w-4 p-0 flex items-center justify-center text-[9px]"
                >
                  3
                </Badge>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>الإشعارات</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {[1, 2, 3].map((i) => (
                <DropdownMenuItem key={i} className="flex flex-col items-start py-3">
                  <div className="flex items-center gap-2 w-full">
                    <div className="h-2 w-2 rounded-full bg-primary shrink-0" />
                    <span className="font-medium text-sm">تحديث الحملة {i}</span>
                    <span className="text-xs text-muted-foreground mr-auto">منذ {i} ساعة</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    تم تحقيق هدف الحملة اليومي بنجاح
                  </p>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Avatar */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 h-9 px-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.avatar} />
                  <AvatarFallback className="bg-gradient-to-br from-electric to-cyan text-white text-xs">
                    {user?.name?.charAt(0) || 'م'}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:flex flex-col items-start text-sm">
                  <span className="font-medium">{user?.name || 'مستخدم'}</span>
                  <span className="text-xs text-muted-foreground">{user?.email}</span>
                </div>
                <ChevronDown size={14} className="hidden md:block text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col">
                  <span>{user?.name}</span>
                  <span className="text-xs text-muted-foreground font-normal">{user?.email}</span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="ml-2 h-4 w-4" />
                الملف الشخصي
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="ml-2 h-4 w-4" />
                الإعدادات
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} className="text-red-500">
                <LogOut className="ml-2 h-4 w-4" />
                تسجيل الخروج
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

