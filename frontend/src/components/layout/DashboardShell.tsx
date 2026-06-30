import React, { useState } from 'react';
import { useLocalization } from '@/contexts/LocalizationContext';
import { Sidebar } from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { locale, direction } = useLocalization();

  return (
    <div className="min-h-screen bg-background relative" dir={direction} lang={locale}>
      {/* Animated gradient orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#7C3AED]/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-[#06B6D4]/8 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#EC4899]/5 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: '4s' }} />
      </div>

      <div className="relative z-10 hidden lg:block">
        <Sidebar />
      </div>

      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)}>
          <div onClick={(e) => e.stopPropagation()}>
            <Sidebar />
          </div>
        </div>
      )}

      <div className="lg:mr-[280px] transition-all duration-200 relative z-10">
        <Header onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
        <main className="p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}

export function AuthShell({ children }: { children: React.ReactNode }) {
  const { locale, direction } = useLocalization();

  return (
    <div className="min-h-screen bg-gradient-to-br from-electric/5 via-background to-purple/5" dir={direction} lang={locale}>
      {children}
    </div>
  );
}
