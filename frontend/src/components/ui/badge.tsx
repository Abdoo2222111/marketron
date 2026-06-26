import React from 'react';
import { cn } from '@/utils/helpers';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'outline' | 'secondary' | 'destructive';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'neutral', size = 'sm', className }) => {
  const variants = {
    primary: 'bg-primary-600 text-white',
    default: 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400',
    success: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
    warning: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
    error: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
    info: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
    neutral: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400',
    outline: 'border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 bg-transparent',
    secondary: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300',
    destructive: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
  };

  const sizes = {
    sm: 'px-2.5 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
  };

  return (
    <span className={cn('inline-flex items-center font-medium rounded-full', variants[variant], sizes[size], className)}>
      {children}
    </span>
  );
};
