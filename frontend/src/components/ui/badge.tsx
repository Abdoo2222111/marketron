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
    primary: 'bg-[#7C3AED] text-white shadow-[0_0_10px_rgba(124,58,237,0.3)]',
    default: 'bg-[#7C3AED]/20 text-[#7C3AED] border border-[#7C3AED]/20',
    success: 'bg-[#10D9A0]/20 text-[#10D9A0] border border-[#10D9A0]/20',
    warning: 'bg-[#FBBF24]/20 text-[#FBBF24] border border-[#FBBF24]/20',
    error: 'bg-[#F43F5E]/20 text-[#F43F5E] border border-[#F43F5E]/20',
    info: 'bg-[#06B6D4]/20 text-[#06B6D4] border border-[#06B6D4]/20',
    neutral: 'bg-[#A1A1C2]/10 text-[#A1A1C2] border border-[#A1A1C2]/20',
    outline: 'border border-[#7C3AED]/30 text-[#7C3AED] bg-transparent',
    secondary: 'bg-[#14102B] text-[#A1A1C2] border border-[#7C3AED]/15',
    destructive: 'bg-[#F43F5E]/20 text-[#F43F5E] border border-[#F43F5E]/20',
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
