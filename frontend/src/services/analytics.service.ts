import api from './api';
import type {
  DashboardStats,
  PerformanceDataPoint,
  PlatformBreakdown,
  AnalyticsFilter,
  ApiResponse,
} from '@/types';

export const analyticsService = {
  async getDashboard(): Promise<{
    stats: DashboardStats;
    performance: PerformanceDataPoint[];
    platformBreakdown: PlatformBreakdown[];
    recentCampaigns: unknown[];
    notifications: unknown[];
  }> {
    const { data } = await api.get<ApiResponse<{
      stats: DashboardStats;
      performance: PerformanceDataPoint[];
      platformBreakdown: PlatformBreakdown[];
      recentCampaigns: unknown[];
      notifications: unknown[];
    }>>('/analytics/overview');
    return data.data;
  },

  async getCampaignAnalytics(campaignId: string): Promise<{
    metrics: DashboardStats;
    dailyPerformance: PerformanceDataPoint[];
    audienceBreakdown: unknown;
    adPerformance: unknown[];
  }> {
    const { data } = await api.get<ApiResponse<{
      metrics: DashboardStats;
      dailyPerformance: PerformanceDataPoint[];
      audienceBreakdown: unknown;
      adPerformance: unknown[];
    }>>(`/campaigns/${campaignId}/insights`);
    return data.data;
  },

  async getPlatformAnalytics(filter: AnalyticsFilter): Promise<{
    metrics: DashboardStats;
    trends: PerformanceDataPoint[];
    comparison: { current: DashboardStats; previous: DashboardStats };
  }> {
    const { data } = await api.get<ApiResponse<{
      metrics: DashboardStats;
      trends: PerformanceDataPoint[];
      comparison: { current: DashboardStats; previous: DashboardStats };
    }>>('/analytics/overview', { params: filter as any });
    return data.data;
  },

  async exportData(format: 'pdf' | 'excel', filter: AnalyticsFilter): Promise<Blob> {
    const response = await api.get('/analytics/overview', {
      params: { ...filter, format },
      responseType: 'blob',
    });
    return response.data;
  },

  async getCustomReport(filters: Record<string, unknown>): Promise<unknown> {
    const { data } = await api.post('/analytics/custom', filters);
    return data;
  },
};
