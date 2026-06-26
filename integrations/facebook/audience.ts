// ============================================================
// Facebook Audience Management
// ============================================================
// Manages Facebook Custom Audiences, Lookalike Audiences,
// Saved Audiences, and audience insights via the Marketing API.
// ============================================================

import { AxiosInstance } from 'axios';
import { makeApiCall } from '../utils/apiClient';
import { CustomAudience, LookalikeAudience } from '../common/types';

export class FacebookAudienceManager {
  private client: AxiosInstance;
  private accessToken: string;

  constructor(client: AxiosInstance, accessToken: string) {
    this.client = client;
    this.accessToken = accessToken;
  }

  // ============================================================
  // Custom Audiences
  // ============================================================

  /**
   * Get all custom audiences for an ad account
   */
  async getCustomAudiences(
    accountId: string,
    limit: number = 100
  ): Promise<CustomAudience[]> {
    const response = await makeApiCall(this.client, {
      method: 'GET',
      url: `/act_${accountId}/customaudiences`,
      params: {
        fields: 'id,name,description,approximate_count,status,subtype,time_created,time_updated,operation_status,account_id,delivery_status,permission_for_actions,rule',
        limit,
        access_token: this.accessToken,
      },
    });

    return (response.data?.data || []).map((audience: any) => ({
      id: audience.id,
      platform: 'facebook' as const,
      name: audience.name,
      description: audience.description || '',
      type: audience.subtype || 'CUSTOM',
      size: audience.approximate_count || 0,
      status: audience.operation_status?.status || audience.status || 'UNKNOWN',
      createdAt: audience.time_created || '',
      subType: audience.subtype,
    }));
  }

  /**
   * Create a Custom Audience from a customer file
   */
  async createCustomAudience(
    accountId: string,
    data: {
      name: string;
      description?: string;
      subtype?: string;
      customerFileSource?: 'USER_PROVIDED_ONLY' | 'PARTNER_PROVIDED_ONLY' | 'BOTH';
      originAudienceId?: string;
      prefill?: boolean;
      retentionDays?: number;
      rule?: string;
      lookalikeSpec?: string;
    }
  ): Promise<CustomAudience> {
    const params: any = {
      name: data.name,
      subtype: data.subtype || 'CUSTOM',
      access_token: this.accessToken,
      prefill: data.prefill !== false ? 1 : 0,
    };
    if (data.description) params.description = data.description;
    if (data.customerFileSource) params.customer_file_source = data.customerFileSource;
    if (data.originAudienceId) params.origin_audience_id = data.originAudienceId;
    if (data.retentionDays) params.retention_days = data.retentionDays;
    if (data.rule) params.rule = data.rule;
    if (data.lookalikeSpec) params.lookalike_spec = data.lookalikeSpec;

    const response = await makeApiCall(this.client, {
      method: 'POST',
      url: `/act_${accountId}/customaudiences`,
      params,
    });

    return {
      id: response.data.id,
      platform: 'facebook',
      name: data.name,
      description: data.description,
      type: data.subtype || 'CUSTOM',
      size: 0,
      status: 'CREATED',
      createdAt: new Date().toISOString(),
      subType: data.subtype,
    };
  }

  /**
   * Add users to a Custom Audience
   */
  async addUsersToAudience(
    audienceId: string,
    users: Array<{
      email?: string;
      phone?: string;
      firstName?: string;
      lastName?: string;
      country?: string;
      zip?: string;
      age?: number;
      birthday?: string;
      externalId?: string;
    }>,
    schema: string[] = ['EMAIL', 'PHONE']
  ): Promise<any> {
    const formattedUsers = users.map((u) => {
      const entry: string[] = [];
      schema.forEach((field) => {
        switch (field) {
          case 'EMAIL': entry.push(u.email || ''); break;
          case 'PHONE': entry.push(u.phone || ''); break;
          case 'FN': entry.push(u.firstName || ''); break;
          case 'LN': entry.push(u.lastName || ''); break;
          case 'CT': entry.push(u.country || ''); break;
          case 'ZIP': entry.push(u.zip || ''); break;
          case 'AGE': entry.push(u.age?.toString() || ''); break;
          case 'EXTERN_ID': entry.push(u.externalId || ''); break;
          default: entry.push('');
        }
      });
      return entry;
    });

    const response = await makeApiCall(this.client, {
      method: 'POST',
      url: `/${audienceId}/users`,
      params: {
        payload: JSON.stringify({
          schema,
          data: formattedUsers,
        }),
        access_token: this.accessToken,
      },
    });
    return response.data;
  }

  /**
   * Remove users from a Custom Audience
   */
  async removeUsersFromAudience(
    audienceId: string,
    users: Array<{
      email?: string;
      phone?: string;
      externalId?: string;
    }>,
    schema: string[] = ['EMAIL', 'PHONE']
  ): Promise<any> {
    const formattedUsers = users.map((u) => {
      const entry: string[] = [];
      schema.forEach((field) => {
        switch (field) {
          case 'EMAIL': entry.push(u.email || ''); break;
          case 'PHONE': entry.push(u.phone || ''); break;
          case 'EXTERN_ID': entry.push(u.externalId || ''); break;
          default: entry.push('');
        }
      });
      return entry;
    });

    const response = await makeApiCall(this.client, {
      method: 'DELETE',
      url: `/${audienceId}/users`,
      params: {
        payload: JSON.stringify({
          schema,
          data: formattedUsers,
        }),
        access_token: this.accessToken,
      },
    });
    return response.data;
  }

  /**
   * Delete a Custom Audience
   */
  async deleteCustomAudience(audienceId: string): Promise<any> {
    const response = await makeApiCall(this.client, {
      method: 'DELETE',
      url: `/${audienceId}`,
    });
    return response.data;
  }

  // ============================================================
  // Lookalike Audiences
  // ============================================================

  /**
   * Create a Lookalike Audience from a source audience
   */
  async createLookalikeAudience(
    accountId: string,
    data: {
      name: string;
      sourceAudienceId: string;
      percentage?: number;
      country?: string;
    }
  ): Promise<LookalikeAudience> {
    const params: any = {
      name: data.name,
      origin_audience_id: data.sourceAudienceId,
      subtype: 'LOOKALIKE',
      lookalike_spec: JSON.stringify({
        type: 'custom_ratio',
        ratio: (data.percentage || 1) / 100,
        country: data.country || 'US',
      }),
      access_token: this.accessToken,
    };

    const response = await makeApiCall(this.client, {
      method: 'POST',
      url: `/act_${accountId}/customaudiences`,
      params,
    });

    return {
      id: response.data.id,
      platform: 'facebook',
      name: data.name,
      sourceAudienceId: data.sourceAudienceId,
      percentage: data.percentage || 1,
      country: data.country || 'US',
      size: 0,
      status: 'CREATING',
    };
  }

  /**
   * Get Lookalike Audiences
   */
  async getLookalikeAudiences(
    accountId: string,
    limit: number = 100
  ): Promise<LookalikeAudience[]> {
    const response = await makeApiCall(this.client, {
      method: 'GET',
      url: `/act_${accountId}/customaudiences`,
      params: {
        fields: 'id,name,approximate_count,status,subtype,time_created,lookalike_spec,origin_audience_id,account_id',
        limit,
        filtering: JSON.stringify([{ field: 'subtype', operator: 'IN', value: ['LOOKALIKE'] }]),
        access_token: this.accessToken,
      },
    });

    return (response.data?.data || []).map((audience: any) => {
      const spec = audience.lookalike_spec;
      return {
        id: audience.id,
        platform: 'facebook' as const,
        name: audience.name,
        sourceAudienceId: audience.origin_audience_id || '',
        percentage: spec?.ratio ? spec.ratio * 100 : 1,
        country: spec?.country || 'US',
        size: audience.approximate_count || 0,
        status: audience.status || 'UNKNOWN',
      };
    });
  }

  // ============================================================
  // Saved Audiences
  // ============================================================

  /**
   * Get saved audiences (targeting specs)
   */
  async getSavedAudiences(accountId: string): Promise<any[]> {
    const response = await makeApiCall(this.client, {
      method: 'GET',
      url: `/act_${accountId}/savedaudiences`,
      params: {
        fields: 'id,name,description,targeting,time_created,time_updated,approximate_count',
        access_token: this.accessToken,
      },
    });
    return response.data?.data || [];
  }

  // ============================================================
  // Audience Insights
  // ============================================================

  /**
   * Get audience insights for an ad account
   */
  async getAudienceInsights(
    accountId: string,
    audienceId?: string
  ): Promise<any> {
    const params: any = {
      fields: 'age,gender,interests,behaviors,locations,family_statuses,education_statuses,college_years,relationship_statuses,industries,politics,ethnic_affinity,generation,household_composition,moms,device,market_segment,income',
      access_token: this.accessToken,
    };
    if (audienceId) params.audience_id = audienceId;

    const response = await makeApiCall(this.client, {
      method: 'GET',
      url: `/act_${accountId}/audience_insights`,
      params,
    });
    return response.data;
  }
}
