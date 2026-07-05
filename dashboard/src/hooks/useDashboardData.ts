import { useState, useEffect } from 'react';
import type { PerformanceData, PlatformType } from '@/types';
import { generateMockPerformanceData, generateMockCompetitors } from '@utils/dataTransformers';
import { fetchOverview, fetchCompetitors, type OverviewData } from '@services/api';

interface DashboardState {
  performanceData: PerformanceData[];
  competitors: any[];
  loading: boolean;
  error: string | null;
  overview: OverviewData | null;
}

export function useDashboardData() {
  const [state, setState] = useState<DashboardState>({
    performanceData: [],
    competitors: [],
    loading: true,
    error: null,
    overview: null,
  });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [overview, competitors] = await Promise.all([
          fetchOverview(),
          fetchCompetitors().catch(() => null),
        ]);

        if (cancelled) return;

        const perfData = buildPerformanceData(overview);
        const compData = competitors && competitors.length > 0
          ? competitors
          : generateMockCompetitors();

        setState({
          performanceData: perfData,
          competitors: compData,
          loading: false,
          error: null,
          overview,
        });
      } catch {
        if (cancelled) return;
        setState({
          performanceData: generateMockPerformanceData(30),
          competitors: generateMockCompetitors(),
          loading: false,
          error: null,
          overview: null,
        });
      }
    }

    load();
    return () => { cancelled = true; };
  }, []);

  return state;
}

function buildPerformanceData(overview: OverviewData): PerformanceData[] {
  const records: PerformanceData[] = [];
  const platforms: PlatformType[] = ['facebook', 'instagram', 'google', 'tiktok', 'snapchat'];

  for (const day of overview.dailyPerformance) {
    for (const platform of platforms) {
      records.push({
        date: day.date,
        platform,
        spend: day.spend / platforms.length,
        impressions: Math.round(day.impressions / platforms.length),
        clicks: Math.round(day.clicks / platforms.length),
        conversions: Math.round(day.conversions / platforms.length),
        revenue: day.revenue / platforms.length,
        reach: Math.round(day.impressions / platforms.length * 0.7),
        frequency: 1.4 + Math.random() * 0.5,
      });
    }
  }

  if (records.length === 0) {
    return generateMockPerformanceData(30);
  }

  return records;
}
