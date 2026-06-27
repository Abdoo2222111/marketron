'use client';

import React from 'react';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { OnboardingWizard } from '@/features/onboarding/OnboardingWizard';

export default function OnboardingPage() {
  return (
    <DashboardShell>
      <OnboardingWizard />
    </DashboardShell>
  );
}
