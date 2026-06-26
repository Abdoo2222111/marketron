'use client';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { AiAgentsPage } from '@/features/ai-agents';

export default function AiAgentsRoute() {
  return (
    <DashboardShell>
      <AiAgentsPage />
    </DashboardShell>
  );
}

