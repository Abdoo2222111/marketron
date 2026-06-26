'use client';

import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  className?: string;
  children?: React.ReactNode;
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
  className,
  children,
}: EmptyStateProps) {
  return (
    <div className={cn(
      'text-center py-16 px-4 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800',
      className
    )}>
      <div className="w-20 h-20 rounded-2xl gradient-brand mx-auto mb-4 flex items-center justify-center shadow-lg shadow-electric/20">
        <div className="text-white">{icon}</div>
      </div>
      <h3 className="text-xl font-bold mb-2 gradient-brand-text">{title}</h3>
      {description && (
        <p className="text-muted-foreground mb-6 max-w-md mx-auto text-sm">
          {description}
        </p>
      )}
      {actionLabel && (
        actionHref ? (
          <Link href={actionHref}>
            <Button className="gradient-brand text-white border-0">
              {actionLabel}
            </Button>
          </Link>
        ) : (
          <Button onClick={onAction} className="gradient-brand text-white border-0">
            {actionLabel}
          </Button>
        )
      )}
      {children}
    </div>
  );
}

export default EmptyState;
