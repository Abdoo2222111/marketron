'use client';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { WorkspacePage } from '@/features/workspace';

export default function WorkspaceRoute() {
  return (
    <DashboardShell>
      <WorkspacePage />
    </DashboardShell>
  );
}

