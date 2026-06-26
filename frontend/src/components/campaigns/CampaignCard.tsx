'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit3, Copy, MoreHorizontal, BarChart3 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn, formatCurrency, formatNumber, getPlatformColor } from '@/lib/utils';
import type { Campaign, PlatformType } from '@/types';

const platformLabels: Record<string, string> = {
  facebook: 'فيسبوك',
  instagram: 'انستجرام',
  tiktok: 'تيك توك',
  snapchat: 'سناب شات',
};

const statusLabels: Record<string, { label: string; variant: 'success' | 'warning' | 'secondary' | 'default' }> = {
  active: { label: 'نشط', variant: 'success' },
  paused: { label: 'متوقف', variant: 'warning' },
  draft: { label: 'مسودة', variant: 'secondary' },
  completed: { label: 'مكتمل', variant: 'default' },
  archived: { label: 'مؤرشف', variant: 'secondary' },
};

interface CampaignCardProps {
  campaign: Campaign;
  onEdit?: (id: string) => void;
  onDuplicate?: (id: string) => void;
  onView?: (id: string) => void;
}

export default function CampaignCard({ campaign, onEdit, onDuplicate, onView }: CampaignCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="card-hover cursor-pointer group relative overflow-hidden">
        {/* Platform color indicator */}
        <div
          className="absolute top-0 start-0 w-1.5 h-full"
          style={{ backgroundColor: getPlatformColor(campaign.platform) }}
        />

        <CardContent className="p-5">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <div
                  className="h-3 w-3 rounded-full shrink-0"
                  style={{ backgroundColor: getPlatformColor(campaign.platform) }}
                />
                <span className="text-xs text-muted-foreground">
                  {platformLabels[campaign.platform]}
                </span>
              </div>
              <h3 className="font-semibold text-base truncate">{campaign.name}</h3>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="shrink-0">
                  <MoreHorizontal size={16} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onView?.(campaign.id)}>
                  <BarChart3 className="ml-2 h-4 w-4" />
                  عرض التفاصيل
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onEdit?.(campaign.id)}>
                  <Edit3 className="ml-2 h-4 w-4" />
                  تعديل
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDuplicate?.(campaign.id)}>
                  <Copy className="ml-2 h-4 w-4" />
                  نسخ
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-500">حذف</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <Badge variant={statusLabels[campaign.status]?.variant || 'secondary'} className="mb-3">
            {statusLabels[campaign.status]?.label || campaign.status}
          </Badge>

          <div className="grid grid-cols-2 gap-3 mt-3">
            <div>
              <p className="text-xs text-muted-foreground">الميزانية</p>
              <p className="text-sm font-semibold">{formatCurrency(campaign.budget)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">المنصرف</p>
              <p className="text-sm font-semibold">{formatCurrency(campaign.spent)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">مرات الظهور</p>
              <p className="text-sm font-semibold">{formatNumber(campaign.metrics?.impressions || 0)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">نسبة النقر</p>
              <p className="text-sm font-semibold">{(campaign.metrics?.ctr || 0).toFixed(2)}%</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

