'use client';

import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { getPlatformColor } from '@/lib/utils';

interface PlatformDistributionProps {
  data: Array<{
    platform: string;
    value: number;
    percentage?: number;
  }>;
  title?: string;
  className?: string;
  height?: number;
}

const platformLabels: Record<string, string> = {
  facebook: 'فيسبوك',
  instagram: 'انستجرام',
  tiktok: 'تيك توك',
  snapchat: 'سناب شات',
};

export default function PlatformDistribution({
  data,
  title = 'توزيع الإنفاق على المنصات',
  className,
  height = 300,
}: PlatformDistributionProps) {
  const enrichedData = data.map((item) => ({
    ...item,
    label: platformLabels[item.platform] || item.platform,
    color: getPlatformColor(item.platform),
    percentage: item.percentage || ((item.value / data.reduce((sum, d) => sum + d.value, 0)) * 100).toFixed(1),
  }));

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <PieChart>
            <Pie
              data={enrichedData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={5}
              dataKey="value"
              animationBegin={0}
              animationDuration={1000}
            >
              {enrichedData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--popover))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
              formatter={(value: number, name: string) => [value.toLocaleString(), name]}
            />
            <Legend
              formatter={(value: string) => (
                <span className="text-sm text-foreground">{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Summary */}
        <div className="grid grid-cols-2 gap-4 mt-4">
          {enrichedData.map((item) => (
            <div key={item.platform} className="flex items-center gap-3">
              <div
                className="h-3 w-3 rounded-full shrink-0"
                style={{ backgroundColor: item.color }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground truncate">{item.label}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold">{item.value.toLocaleString()} ر.س</span>
                  <span className="text-xs text-muted-foreground">{item.percentage}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
