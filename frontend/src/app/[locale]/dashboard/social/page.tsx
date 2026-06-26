'use client';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { SocialInboxPage } from '@/features/social';

export default function SocialPage() {
  return (
    <DashboardShell>
      <SocialInboxPage />
    </DashboardShell>
  );
}

