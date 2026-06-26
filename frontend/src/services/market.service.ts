import api from './api';
import type { MarketResearch, ApiResponse } from '@/types';

export const marketService = {
  async researchMarket(product: string, market: string): Promise<MarketResearch> {
    const { data } = await api.post<ApiResponse<MarketResearch>>('/market/research', {
      product,
      market,
    });
    return data.data;
  },

  async getTrends(platform?: string): Promise<{
    trends: Array<{ topic: string; volume: number; growth: number }>;
    hashtags: string[];
  }> {
    const { data } = await api.get<ApiResponse<{
      trends: Array<{ topic: string; volume: number; growth: number }>;
      hashtags: string[];
    }>>('/market/trends', { params: { platform } });
    return data.data;
  },

  async getAudienceInsights(product: string, market: string): Promise<{
    demographics: Record<string, number>;
    psychographics: string[];
    behaviors: string[];
    recommendations: string[];
  }> {
    const { data } = await api.post<ApiResponse<{
      demographics: Record<string, number>;
      psychographics: string[];
      behaviors: string[];
      recommendations: string[];
    }>>('/market/audience-insights', { product, market });
    return data.data;
  },

  async getSavedResearch(): Promise<MarketResearch[]> {
    const { data } = await api.get<ApiResponse<MarketResearch[]>>('/market/research');
    return data.data;
  },

  async saveResearch(researchId: string): Promise<void> {
    await api.post(`/market/research/${researchId}/save`);
  },

  async exportResearch(researchId: string): Promise<Blob> {
    const response = await api.get(`/market/research/${researchId}/export`, {
      responseType: 'blob',
    });
    return response.data;
  },
};
