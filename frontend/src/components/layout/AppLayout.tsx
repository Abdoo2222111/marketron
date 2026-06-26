import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar, MobileNav } from './Sidebar';
import { Navbar } from './Navbar';
import { useSettingsStore } from '@/store/settingsStore';

export const AppLayout: React.FC = () => {
  const { sidebarOpen, mobileMenuOpen, setMobileMenuOpen } = useSettingsStore();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg">
      <Sidebar onNavigate={() => setMobileMenuOpen(false)} />
      <MobileNav isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

      <div
        className={`transition-all duration-300 ${
          sidebarOpen ? 'lg:mr-[260px]' : 'lg:mr-[72px]'
        }`}
      >
        <Navbar />
        <main className="p-4 lg:p-6 mt-16 lg:mt-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export const LandingLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-dark-bg">
      <Outlet />
    </div>
  );
};

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode; fallback?: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
              <span className="text-2xl">⚠️</span>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-dark-text mb-2">حدث خطأ</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-4">{this.state.error?.message}</p>
            <button
              onClick={() => window.location.reload()}
              className="btn-primary"
            >
              إعادة تحميل
            </button>
          </div>
        )
      );
    }
    return this.props.children;
  }
}
