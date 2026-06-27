'use client';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ContentStudioPage } from '@/features/content';

export default function ContentStudioRoute() {
  return (
    <DashboardShell>
      <ContentStudioPage />
    </DashboardShell>
  );
}
