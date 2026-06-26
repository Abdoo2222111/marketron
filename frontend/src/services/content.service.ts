import api from './api';
import type {
  Content,
  GenerateContentParams,
  ApiResponse,
  PaginatedResponse,
} from '@/types';

export const contentService = {
  async getContent(params?: {
    page?: number;
    limit?: number;
    status?: string;
    platform?: string;
  }): Promise<PaginatedResponse<Content>> {
    const { data } = await api.get<PaginatedResponse<Content>>('/content', { params });
    return data;
  },

  async generateContent(params: GenerateContentParams): Promise<{ content: string; suggestions: string[] }> {
    const { data } = await api.post<ApiResponse<{ content: string; suggestions: string[] }>>(
      '/content/generate',
      params
    );
    return data.data;
  },

  async saveContent(content: Partial<Content>): Promise<Content> {
    if (content.id) {
      const { data } = await api.put<ApiResponse<Content>>(`/content/${content.id}`, content);
      return data.data;
    }
    const { data } = await api.post<ApiResponse<Content>>('/content', content);
    return data.data;
  },

  async scheduleContent(id: string, scheduledFor: string): Promise<Content> {
    const { data } = await api.put<ApiResponse<Content>>(`/content/${id}/schedule`, { scheduledFor });
    return data.data;
  },

  async postContent(id: string): Promise<Content> {
    const { data } = await api.post<ApiResponse<Content>>(`/content/${id}/post`);
    return data.data;
  },

  async deleteContent(id: string): Promise<void> {
    await api.delete(`/content/${id}`);
  },
};
