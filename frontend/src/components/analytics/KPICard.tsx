'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { cn, formatNumber, formatCurrency } from '@/lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string | number;
  format?: 'number' | 'currency' | 'percentage';
  icon: React.ReactNode;
  trend?: {
    value: number;
    positive?: boolean;
  };
  subtitle?: string;
  className?: string;
}

export default function KPICard({
  title,
  value,
  format = 'number',
  icon,
  trend,
  subtitle,
  className,
}: KPICardProps) {
  const formatValue = (val: string | number): string => {
    if (typeof val === 'string') return val;
    switch (format) {
      case 'currency':
        return formatCurrency(val);
      case 'percentage':
        return `${val.toFixed(1)}%`;
      default:
        return formatNumber(val);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={cn('card-hover', className)}>
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-muted-foreground font-medium">{title}</span>
            <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-purple-600/10 to-blue-500/10 flex items-center justify-center text-primary">
              {icon}
            </div>
          </div>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-2xl font-bold">{formatValue(value)}</p>
              {subtitle && (
                <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
              )}
            </div>
            {trend && (
              <div className={cn(
                'flex items-center gap-1 text-xs font-medium',
                trend.positive ? 'text-emerald-500' : 'text-red-500'
              )}>
                {trend.positive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                <span>{Math.abs(trend.value)}%</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
