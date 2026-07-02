'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { DashboardShell } from '@/components/layout/DashboardShell';

export default function DashboardLayout({ children, params }: { children: React.ReactNode; params: { locale: string } }) {
  const pathname = usePathname();
  const router = useRouter();
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    if (!token) {
      router.replace(`/${params.locale}/auth/login`);
    } else {
      setAuthed(true);
    }
  }, [pathname, params.locale, router]);

  if (!authed) {
    return (
      <div className="min-h-screen bg-[#0B0A1A] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#7C3AED] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return <DashboardShell>{children}</DashboardShell>;
}