import React from 'react';
import { cn } from '@/utils/helpers';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, className, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-[#A1A1C2] mb-1.5">
            {label}
            {props.required && <span className="text-[#F43F5E] mr-1">*</span>}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-[#A1A1C2]">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={cn(
              'w-full px-4 py-2.5 rounded-xl border border-[#7C3AED]/20 bg-[#0B0A1A] text-[#F5F3FF] placeholder-[#A1A1C2]/50 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30 focus:border-[#06B6D4]/50 transition-all duration-200',
              icon && 'pr-10',
              error && 'border-[#F43F5E] focus:ring-[#F43F5E]/30',
              className
            )}
            {...props}
          />
        </div>
        {error && <p className="mt-1 text-sm text-[#F43F5E]">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
