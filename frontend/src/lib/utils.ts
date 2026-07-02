import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
}

export function formatCurrency(amount: number, currency: string = 'SAR'): string {
  return new Intl.NumberFormat('ar-SA', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatPercentage(value: number): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('ar-SA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateTime(dateString: string): string {
  return new Date(dateString).toLocaleDateString('ar-SA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    active: 'bg-emerald-500',
    paused: 'bg-amber-500',
    draft: 'bg-gray-400',
    completed: 'bg-blue-500',
    archived: 'bg-slate-500',
    scheduled: 'bg-purple-500',
    published: 'bg-emerald-500',
    failed: 'bg-red-500',
    pending: 'bg-amber-500',
  };
  return colors[status] || 'bg-gray-400';
}

export function getPlatformColor(platform: string): string {
  const colors: Record<string, string> = {
    facebook: '#1877F2',
    instagram: '#E4405F',
    tiktok: '#000000',
    snapchat: '#FFFC00',
  };
  return colors[platform] || '#6B7280';
}

export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export function truncate(str: string, length: number = 100): string {
  if (str.length <= length) return str;
  return str.substring(0, length) + '...';
}

export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function getStatusTextColor(status: string): string {
  const map: Record<string, string> = {
    active: 'text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900/30',
    paused: 'text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30',
    completed: 'text-blue-700 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30',
    draft: 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800',
    paid: 'text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900/30',
    pending: 'text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30',
    overdue: 'text-red-700 dark:text-red-400 bg-red-100 dark:bg-red-900/30',
  };
  return map[status] || 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800';
}

export function getPlatformIcon(platform: string): string {
  const map: Record<string, string> = {
    facebook: 'facebook',
    instagram: 'instagram',
    tiktok: 'music',
    snapchat: 'ghost',
  };
  return map[platform] || 'globe';
}

export function getDaysBetween(start: string, end: string): number {
  const startDate = new Date(start);
  const endDate = new Date(end);
  return Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
}

export function getPercentChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

export function classNames(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}
