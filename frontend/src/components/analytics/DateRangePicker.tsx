'use client';

import React, { useState } from 'react';
import { format, startOfMonth, endOfMonth, subMonths, startOfWeek, endOfWeek } from 'date-fns';
import { ar } from 'date-fns/locale';
import { Calendar, ChevronDown } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@radix-ui/react-popover';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useLocalization } from '@/contexts/LocalizationContext';

interface DateRangePickerProps {
  startDate: Date;
  endDate: Date;
  onChange: (start: Date, end: Date) => void;
  className?: string;
}

const presets = [
  { label: 'آخر 7 أيام', getValue: () => ({ start: startOfWeek(new Date(), { weekStartsOn: 1 }), end: new Date() }) },
  { label: 'آخر 30 يوم', getValue: () => ({ start: subMonths(new Date(), 1), end: new Date() }) },
  { label: 'آخر 3 أشهر', getValue: () => ({ start: subMonths(new Date(), 3), end: new Date() }) },
  { label: 'هذا الشهر', getValue: () => ({ start: startOfMonth(new Date()), end: new Date() }) },
  { label: 'الشهر الماضي', getValue: () => ({ start: startOfMonth(subMonths(new Date(), 1)), end: endOfMonth(subMonths(new Date(), 1)) }) },
];

export default function DateRangePicker({
  startDate,
  endDate,
  onChange,
  className,
}: DateRangePickerProps) {
  const [open, setOpen] = useState(false);
  const { locale } = useLocalization();

  const formatDateRange = () => {
    const fmt = (date: Date) =>
      format(date, 'dd MMM yyyy', { locale: locale === 'ar' ? ar : undefined });
    return `${fmt(startDate)} - ${fmt(endDate)}`;
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn('justify-start text-start font-normal gap-2', className)}
        >
          <Calendar size={16} className="shrink-0" />
          <span className="truncate">{formatDateRange()}</span>
          <ChevronDown size={14} className="opacity-50 mr-auto" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align={locale === 'ar' ? 'end' : 'start'} sideOffset={8}>
        <div
          className="bg-popover border rounded-xl shadow-lg p-2 w-56"
          dir={locale === 'ar' ? 'rtl' : 'ltr'}
        >
          <div className="flex flex-col gap-1">
            {presets.map((preset) => (
              <button
                key={preset.label}
                className="text-sm px-3 py-2 rounded-lg hover:bg-accent text-start transition-colors"
                onClick={() => {
                  const { start, end } = preset.getValue();
                  onChange(start, end);
                  setOpen(false);
                }}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

