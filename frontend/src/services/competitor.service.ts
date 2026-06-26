import api from './api';
import type {
  Competitor,
  CompetitorComparison,
  ApiResponse,
} from '@/types';

export const competitorService = {
  async getCompetitors(): Promise<Competitor[]> {
    const { data } = await api.get<ApiResponse<Competitor[]>>('/competitors');
    return data.data;
  },

  async addCompetitor(competitor: {
    name: string;
    platform: string;
    pageUrl: string;
  }): Promise<Competitor> {
    const { data } = await api.post<ApiResponse<Competitor>>('/competitors', competitor);
    return data.data;
  },

  async removeCompetitor(id: string): Promise<void> {
    await api.delete(`/competitors/${id}`);
  },

  async compareCompetitors(): Promise<CompetitorComparison> {
    const { data } = await api.get<ApiResponse<CompetitorComparison>>('/competitors/compare');
    return data.data;
  },

  async getCompetitorAnalytics(id: string): Promise<{
    growth: { followers: number[]; engagement: number[] };
    topContent: string[];
    insights: { strengths: string[]; weaknesses: string[] };
    recommendations: string[];
  }> {
    const { data } = await api.get<ApiResponse<{
      growth: { followers: number[]; engagement: number[] };
      topContent: string[];
      insights: { strengths: string[]; weaknesses: string[] };
      recommendations: string[];
    }>>(`/competitors/${id}/analytics`);
    return data.data;
  },

  async getAIRecommendations(): Promise<{
    recommendations: string[];
    opportunities: string[];
    threats: string[];
  }> {
    const { data } = await api.get<ApiResponse<{
      recommendations: string[];
      opportunities: string[];
      threats: string[];
    }>>('/competitors/ai-recommendations');
    return data.data;
  },
};
