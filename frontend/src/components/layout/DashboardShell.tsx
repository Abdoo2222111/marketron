import React, { useState } from 'react';
import { useLocalization } from '@/contexts/LocalizationContext';
import { Sidebar } from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { locale, direction } = useLocalization();

  return (
    <div className="min-h-screen bg-background" dir={direction} lang={locale}>
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)}>
          <div onClick={(e) => e.stopPropagation()}>
            <Sidebar />
          </div>
        </div>
      )}

      <div className="lg:mr-[280px] transition-all duration-200">
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
