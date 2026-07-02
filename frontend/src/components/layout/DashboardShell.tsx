import React from 'react';
import Link from 'next/link';
import { useLocalization } from '@/contexts/LocalizationContext';
import { Sidebar } from '@/components/layout/Sidebar';
import { useSettingsStore } from '@/store/settingsStore';
import { Menu, X, AlertTriangle, RefreshCw } from 'lucide-react';
import Header from '@/components/layout/Header';
import { Logo } from '@/components/ui/Logo';
import { Button } from '@/components/ui/button';
import { ParticlesBackground } from '@/components/ui/ParticlesBackground';

class PageErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean; error: Error | null }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#F43F5E]/20 to-[#F43F5E]/5 flex items-center justify-center mb-6 border border-[#F43F5E]/20">
            <AlertTriangle className="w-10 h-10 text-[#F43F5E]" />
          </div>
          <h2 className="text-xl font-bold mb-2">عذراً، حدث خطأ</h2>
          <p className="text-[#A1A1C2] mb-6 max-w-md">{this.state.error?.message || 'حدث خطأ غير متوقع'}</p>
          <Button onClick={() => window.location.reload()} className="btn-gradient">
            <RefreshCw className="w-4 h-4 ml-1" /> إعادة تحميل
          </Button>
        </div>
      );
    }
    return this.props.children;
  }
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const { locale, direction } = useLocalization();
  const { sidebarOpen, mobileMenuOpen, setMobileMenuOpen } = useSettingsStore();

  return (
    <div className="min-h-screen bg-[#0B0A1A] relative" dir={direction} lang={locale}>
      <ParticlesBackground count={40} interactive={false} />

      {/* Ambient glow orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#7C3AED]/10 rounded-full blur-[120px]" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-[#06B6D4]/8 rounded-full blur-[120px]" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#EC4899]/5 rounded-full blur-[150px]" />
        <div className="bg-grid absolute inset-0 opacity-[0.02]" />
      </div>

      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 inset-x-0 h-16 bg-[#0B0A1A] border-b border-[#7C3AED]/10 z-30 flex items-center justify-between px-4">
        <Link href={`/${locale}/dashboard`} className="flex items-center gap-3">
          <Logo width={56} height={56} className="drop-shadow-[0_0_15px_rgba(124,58,237,0.4)]" />
          <span className="font-black text-lg gradient-brand-text">MARKETRON</span>
        </Link>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 hover:bg-[#1E1B3A] rounded-lg">
          {mobileMenuOpen ? <X className="w-5 h-5 text-[#A1A1C2]" /> : <Menu className="w-5 h-5 text-[#A1A1C2]" />}
        </button>
      </div>

      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden" onClick={() => setMobileMenuOpen(false)}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div onClick={(e) => e.stopPropagation()} className="relative h-full">
            <Sidebar onNavigate={() => setMobileMenuOpen(false)} />
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="relative z-10 hidden lg:block">
        <Sidebar />
      </div>

      {/* Main content area */}
      <div className={`transition-all duration-300 relative z-10 ${sidebarOpen ? 'lg:mr-[260px]' : 'lg:mr-[72px]'} pt-16 lg:pt-0`}>
        <Header onMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)} />
        <main className="p-3 sm:p-4 lg:p-6">
          <PageErrorBoundary>{children}</PageErrorBoundary>
        </main>
      </div>
    </div>
  );
}

export function AuthShell({ children }: { children: React.ReactNode }) {
  const { locale, direction } = useLocalization();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#7C3AED]/5 via-[#0B0A1A] to-[#EC4899]/5" dir={direction} lang={locale}>
      {children}
    </div>
  );
}