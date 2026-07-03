'use client';

import React, { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  textClassName?: string;
  animated?: boolean;
  variant?: 'default' | 'gradient' | 'neon';
}

const sizeMap = {
  sm: { img: 40, text: 'text-base' },
  md: { img: 64, text: 'text-xl' },
  lg: { img: 96, text: 'text-3xl' },
  xl: { img: 128, text: 'text-4xl' },
};

export const Logo = forwardRef<HTMLDivElement, LogoProps>(({
  className,
  size = 'md',
  showText = false,
  textClassName,
  animated = true,
  variant = 'gradient',
}, ref) => {
  const dims = sizeMap[size];

  return (
    <motion.div
      ref={ref}
      className={cn('flex items-center gap-3', className)}
      whileHover={animated ? { scale: 1.05 } : undefined}
      transition={{ type: 'spring', stiffness: 300, damping: 10 }}
    >
      <div className="relative flex-shrink-0">
        {/* Animated glow ring */}
        <motion.div
          className={cn(
            'absolute inset-0 rounded-full blur-xl',
            variant === 'neon' ? 'bg-[#7C3AED]' :
            variant === 'gradient' ? 'bg-gradient-to-r from-[#7C3AED] via-[#06B6D4] to-[#EC4899]' :
            'bg-[#7C3AED]/50'
          )}
          animate={animated ? {
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
          } : undefined}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.img
          src="/logo.png"
          alt="MARKETRON"
          className="object-contain relative z-10"
          style={{ width: dims.img, height: dims.img }}
          whileHover={animated ? { rotate: [0, -5, 5, 0], transition: { duration: 0.5 } } : undefined}
        />
      </div>
      {showText && (
        <motion.span
          className={cn(
            'font-black whitespace-nowrap tracking-tight gradient-brand-text',
            dims.text,
            variant === 'neon' && 'drop-shadow-[0_0_10px_rgba(124,58,237,0.6)]',
            variant === 'gradient' && 'drop-shadow-[0_0_8px_rgba(124,58,237,0.3)]',
            textClassName
          )}
          initial={animated ? { opacity: 0, x: -10 } : undefined}
          animate={animated ? { opacity: 1, x: 0 } : undefined}
          transition={{ delay: 0.1 }}
        >
          MARKETRON
        </motion.span>
      )}
    </motion.div>
  );
});

Logo.displayName = 'Logo';
export default Logo;
