'use client';

import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface PerformanceChartProps {
  data: Array<{
    date: string;
    impressions?: number;
    clicks?: number;
    conversions?: number;
    spent?: number;
    revenue?: number;
  }>;
  metrics?: Array<{
    key: string;
    label: string;
    color: string;
  }>;
  title?: string;
  className?: string;
  height?: number;
}

const defaultMetrics = [
  { key: 'impressions', label: 'مرات الظهور', color: '#7C3AED' },
  { key: 'clicks', label: 'النقرات', color: '#3B82F6' },
  { key: 'conversions', label: 'التحويلات', color: '#10B981' },
];

export default function PerformanceChart({
  data,
  metrics = defaultMetrics,
  title = 'أداء الحملات',
  className,
  height = 350,
}: PerformanceChartProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <LineChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              className="text-muted-foreground text-xs"
            />
            <YAxis
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              className="text-muted-foreground text-xs"
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--popover))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
              }}
              labelStyle={{ fontWeight: 'bold', marginBottom: 4 }}
            />
            <Legend />
            {metrics.map((metric) => (
              <Line
                key={metric.key}
                type="monotone"
                dataKey={metric.key}
                stroke={metric.color}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, strokeWidth: 0 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
