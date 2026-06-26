import api from './api';
import type {
  Campaign,
  CreateCampaignData,
  ApiResponse,
  PaginatedResponse,
} from '@/types';

export const campaignService = {
  async getCampaigns(params?: {
    page?: number;
    limit?: number;
    search?: string;
    platform?: string;
    status?: string;
  }): Promise<PaginatedResponse<Campaign>> {
    const { data } = await api.get<PaginatedResponse<Campaign>>('/campaigns', { params });
    return data;
  },

  async getCampaign(id: string): Promise<Campaign> {
    const { data } = await api.get<ApiResponse<Campaign>>(`/campaigns/${id}`);
    return data.data;
  },

  async createCampaign(campaignData: CreateCampaignData): Promise<Campaign> {
    const { data } = await api.post<ApiResponse<Campaign>>('/campaigns', campaignData);
    return data.data;
  },

  async updateCampaign(id: string, campaignData: Partial<CreateCampaignData>): Promise<Campaign> {
    const { data } = await api.put<ApiResponse<Campaign>>(`/campaigns/${id}`, campaignData);
    return data.data;
  },

  async deleteCampaign(id: string): Promise<void> {
    await api.delete(`/campaigns/${id}`);
  },

  async duplicateCampaign(id: string): Promise<Campaign> {
    const { data } = await api.post<ApiResponse<Campaign>>(`/campaigns/${id}/duplicate`);
    return data.data;
  },

  async bulkAction(ids: string[], action: 'activate' | 'pause' | 'archive' | 'delete'): Promise<void> {
    await api.post('/campaigns/bulk', { ids, action });
  },

  async getAISuggestions(campaignData: Partial<CreateCampaignData>): Promise<{
    suggestions: string[];
    predictedPerformance: {
      ctr: number;
      cpc: number;
      conversions: number;
    };
  }> {
    const { data } = await api.post<ApiResponse<{
      suggestions: string[];
      predictedPerformance: { ctr: number; cpc: number; conversions: number };
    }>>('/campaigns/ai-suggestions', campaignData);
    return data.data;
  },
};
