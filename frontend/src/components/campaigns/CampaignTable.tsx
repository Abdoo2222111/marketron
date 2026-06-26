'use client';

import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, ArrowUpDown, Play, Pause, Archive, Trash2 } from 'lucide-react';
import { cn, formatCurrency, formatDate, getPlatformColor, formatNumber } from '@/lib/utils';
import type { Campaign } from '@/types';

const platformLabels: Record<string, string> = {
  facebook: 'فيسبوك',
  instagram: 'انستجرام',
  tiktok: 'تيك توك',
  snapchat: 'سناب شات',
};

const statusStyles: Record<string, string> = {
  active: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800',
  paused: 'text-amber-600 bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800',
  draft: 'text-gray-600 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700',
  completed: 'text-blue-600 bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800',
  archived: 'text-slate-600 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700',
};

interface CampaignTableProps {
  campaigns: Campaign[];
  selectedIds: string[];
  onSelectChange: (ids: string[]) => void;
  onRowClick?: (id: string) => void;
  sortField?: string;
  sortDirection?: 'asc' | 'desc';
  onSort?: (field: string) => void;
}

export default function CampaignTable({
  campaigns,
  selectedIds,
  onSelectChange,
  onRowClick,
  sortField,
  sortDirection,
  onSort,
}: CampaignTableProps) {
  const toggleSelectAll = () => {
    if (selectedIds.length === campaigns.length) {
      onSelectChange([]);
    } else {
      onSelectChange(campaigns.map((c) => c.id));
    }
  };

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      onSelectChange(selectedIds.filter((sid) => sid !== id));
    } else {
      onSelectChange([...selectedIds, id]);
    }
  };

  const SortHeader = ({ field, label }: { field: string; label: string }) => (
    <button
      className="flex items-center gap-1 hover:text-foreground transition-colors"
      onClick={() => onSort?.(field)}
    >
      {label}
      <ArrowUpDown size={14} className={cn(sortField === field ? 'text-primary' : 'opacity-50')} />
    </button>
  );

  return (
    <div className="rounded-lg border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox
                checked={selectedIds.length === campaigns.length && campaigns.length > 0}
                onCheckedChange={toggleSelectAll}
              />
            </TableHead>
            <TableHead><SortHeader field="name" label="اسم الحملة" /></TableHead>
            <TableHead><SortHeader field="platform" label="المنصة" /></TableHead>
            <TableHead><SortHeader field="status" label="الحالة" /></TableHead>
            <TableHead className="text-end"><SortHeader field="budget" label="الميزانية" /></TableHead>
            <TableHead className="text-end"><SortHeader field="spent" label="المنصرف" /></TableHead>
            <TableHead className="text-end"><SortHeader field="impressions" label="مرات الظهور" /></TableHead>
            <TableHead className="text-end"><SortHeader field="ctr" label="CTR" /></TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {campaigns.map((campaign) => (
            <TableRow
              key={campaign.id}
              className="cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => onRowClick?.(campaign.id)}
            >
              <TableCell onClick={(e) => e.stopPropagation()}>
                <Checkbox
                  checked={selectedIds.includes(campaign.id)}
                  onCheckedChange={() => toggleSelect(campaign.id)}
                />
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <div
                    className="h-2 w-2 rounded-full shrink-0"
                    style={{ backgroundColor: getPlatformColor(campaign.platform) }}
                  />
                  <span className="font-medium">{campaign.name}</span>
                </div>
              </TableCell>
              <TableCell>
                <span className="text-sm">{platformLabels[campaign.platform]}</span>
              </TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className={cn('text-xs', statusStyles[campaign.status])}
                >
                  {campaign.status === 'active' && 'نشط'}
                  {campaign.status === 'paused' && 'متوقف'}
                  {campaign.status === 'draft' && 'مسودة'}
                  {campaign.status === 'completed' && 'مكتمل'}
                  {campaign.status === 'archived' && 'مؤرشف'}
                </Badge>
              </TableCell>
              <TableCell className="text-end font-medium">{formatCurrency(campaign.budget)}</TableCell>
              <TableCell className="text-end">{formatCurrency(campaign.spent)}</TableCell>
              <TableCell className="text-end">{formatNumber(campaign.metrics?.impressions || 0)}</TableCell>
              <TableCell className="text-end">{(campaign.metrics?.ctr || 0).toFixed(2)}%</TableCell>
              <TableCell onClick={(e) => e.stopPropagation()}>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal size={16} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-44">
                    <DropdownMenuItem>
                      <Play className="ml-2 h-4 w-4" />
                      تشغيل
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Pause className="ml-2 h-4 w-4" />
                      إيقاف
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Archive className="ml-2 h-4 w-4" />
                      أرشفة
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-red-500">
                      <Trash2 className="ml-2 h-4 w-4" />
                      حذف
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

