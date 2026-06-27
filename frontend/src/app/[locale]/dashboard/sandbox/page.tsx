'use client';

import React from 'react';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { SandboxPage } from '@/features/sandbox/SandboxPage';

export default function Sandbox() {
  return (
    <DashboardShell>
      <SandboxPage />
    </DashboardShell>
  );
}
