import prisma from '../config/database';
import { ApiError } from '../utils/apiError';
import { Prisma } from '@prisma/client';

export class CampaignService {
  /**
   * List campaigns with search, filter, sort, pagination
   */
  async list(params: {
    userId: string;
    page: number;
    limit: number;
    search?: string;
    status?: string;
    platform?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    const { userId, page, limit, search, status, platform, sortBy = 'createdAt', sortOrder = 'desc' } = params;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: Prisma.CampaignWhereInput = { userId };

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { creativeText: { contains: search } },
        { creativeHeadline: { contains: search } },
      ];
    }

    if (status) {
      where.status = status as any;
    }

    if (platform) {
      where.platform = platform as any;
    }

    // Build orderBy
    const orderBy: Prisma.CampaignOrderByWithRelationInput = {};
    const allowedSortFields = ['name', 'createdAt', 'updatedAt', 'status', 'spend', 'impressions', 'clicks', 'conversions', 'ctr', 'cpc', 'cpm', 'cpa', 'roas', 'revenue'];
    
    if (allowedSortFields.includes(sortBy)) {
      (orderBy as any)[sortBy] = sortOrder;
    } else {
      orderBy.createdAt = sortOrder;
    }

    const [campaigns, total] = await Promise.all([
      prisma.campaign.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          _count: { select: { ads: true } },
        },
      }),
      prisma.campaign.count({ where }),
    ]);

    return { campaigns, total };
  }

  /**
   * Get campaign by ID
   */
  async getById(userId: string, id: string) {
    const campaign = await prisma.campaign.findFirst({
      where: { id, userId },
      include: {
        ads: {
          orderBy: { createdAt: 'desc' },
        },
        adSnapshots: {
          orderBy: { date: 'desc' },
          take: 30,
        },
      },
    });

    if (!campaign) {
      throw ApiError.notFound('الحملة غير موجودة');
    }

    return campaign;
  }

  /**
   * Create a new campaign
   */
  async create(userId: string, data: any) {
    const { budget, targetAudience, content, ...rest } = data;

    const createData: any = {
      ...rest,
      userId,
      budgetAmount: budget ?? rest.budgetAmount,
    };

    if (targetAudience) {
      createData.targetCountry = targetAudience.country ?? targetAudience.targetCountry;
      createData.targetAgeMin = targetAudience.ageMin ?? targetAudience.targetAgeMin;
      createData.targetAgeMax = targetAudience.ageMax ?? targetAudience.targetAgeMax;
      createData.targetGender = targetAudience.gender ?? targetAudience.targetGender;
      createData.targetInterests = targetAudience.interests
        ? JSON.stringify(targetAudience.interests)
        : targetAudience.targetInterests;
    }

    if (content) {
      createData.creativeText = content.primaryText ?? content.creativeText;
      createData.creativeHeadline = content.headline ?? content.creativeHeadline;
      createData.creativeCta = content.cta ?? content.creativeCta;
      createData.creativeImageUrl = content.imageUrl ?? content.creativeImageUrl;
      createData.creativeVideoUrl = content.videoUrl ?? content.creativeVideoUrl;
    }

    const campaign = await prisma.campaign.create({
      data: createData,
      include: {
        _count: { select: { ads: true } },
      },
    });

    return campaign;
  }

  /**
   * Update a campaign
   */
  async update(userId: string, id: string, data: any) {
    const existing = await prisma.campaign.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      throw ApiError.notFound('الحملة غير موجودة');
    }

    const campaign = await prisma.campaign.update({
      where: { id },
      data,
    });

    return campaign;
  }

  /**
   * Delete a campaign
   */
  async delete(userId: string, id: string) {
    const existing = await prisma.campaign.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      throw ApiError.notFound('الحملة غير موجودة');
    }

    await prisma.campaign.delete({ where: { id } });

    return { message: 'تم حذف الحملة بنجاح' };
  }

  /**
   * Duplicate a campaign
   */
  async duplicate(userId: string, id: string) {
    const original = await prisma.campaign.findFirst({
      where: { id, userId },
      include: { ads: true },
    });

    if (!original) {
      throw ApiError.notFound('الحملة غير موجودة');
    }

    // Create duplicate campaign
    const { id: _id, createdAt, updatedAt, lastSyncedAt, platformCampaignId, impressions, clicks, conversions, spend, ctr, cpc, cpm, cpa, roas, revenue, ads, ...campaignData } = original;
    
    const duplicate = await prisma.campaign.create({
      data: {
        ...campaignData,
        name: `${campaignData.name} (نسخة)`,
        status: 'draft',
        userId,
      },
    });

    return duplicate;
  }

  /**
   * Pause a campaign
   */
  async pause(userId: string, id: string) {
    const existing = await prisma.campaign.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      throw ApiError.notFound('الحملة غير موجودة');
    }

    return prisma.campaign.update({
      where: { id },
      data: { status: 'paused' },
    });
  }

  /**
   * Activate a campaign
   */
  async activate(userId: string, id: string) {
    const existing = await prisma.campaign.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      throw ApiError.notFound('الحملة غير موجودة');
    }

    return prisma.campaign.update({
      where: { id },
      data: { status: 'active' },
    });
  }

  /**
   * Get campaign insights / analytics
   */
  async getInsights(userId: string, id: string) {
    const campaign = await prisma.campaign.findFirst({
      where: { id, userId },
      include: {
        adSnapshots: {
          orderBy: { date: 'asc' },
        },
      },
    });

    if (!campaign) {
      throw ApiError.notFound('الحملة غير موجودة');
    }

    // Calculate insights
    const totalImpressions = Number(campaign.impressions);
    const totalClicks = Number(campaign.clicks);
    const totalConversions = Number(campaign.conversions);
    const totalSpend = campaign.spend;
    const totalRevenue = campaign.revenue;

    const insights = {
      overview: {
        impressions: totalImpressions,
        clicks: totalClicks,
        conversions: totalConversions,
        spend: totalSpend,
        revenue: totalRevenue,
        ctr: campaign.ctr,
        cpc: campaign.cpc,
        cpm: campaign.cpm,
        cpa: campaign.cpa,
        roas: campaign.roas,
      },
      daily: campaign.adSnapshots.map((s) => ({
        date: s.date,
        impressions: Number(s.impressions),
        clicks: Number(s.clicks),
        conversions: Number(s.conversions),
        spend: s.spend,
        ctr: s.ctr,
        cpc: s.cpc,
        cpm: s.cpm,
      })),
      totalDays: campaign.adSnapshots.length,
    };

    return insights;
  }

  /**
   * Get stats for all campaigns (dashboard)
   */
  async getStats(userId: string) {
    const campaigns = await prisma.campaign.findMany({
      where: { userId },
      select: {
        id: true,
        name: true,
        status: true,
        platform: true,
        budgetAmount: true,
        spend: true,
        impressions: true,
        clicks: true,
        conversions: true,
        ctr: true,
        cpc: true,
        createdAt: true,
      },
    });

    const totalCampaigns = campaigns.length;
    const activeCampaigns = campaigns.filter((c) => c.status === 'active').length;
    const totalImpressions = campaigns.reduce((sum, c) => sum + Number(c.impressions), 0);
    const totalClicks = campaigns.reduce((sum, c) => sum + Number(c.clicks), 0);
    const totalConversions = campaigns.reduce((sum, c) => sum + Number(c.conversions), 0);
    const totalSpend = campaigns.reduce((sum, c) => sum + (c.spend ?? 0), 0);

    const platformBreakdown = this.groupByPlatform(campaigns);
    const statusBreakdown = this.groupByStatus(campaigns);

    return {
      totals: {
        totalCampaigns,
        activeCampaigns,
        totalImpressions,
        totalClicks,
        totalConversions,
        totalSpend,
        averageCtr: totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0,
        averageCpc: totalClicks > 0 ? totalSpend / totalClicks : 0,
        averageCpm: totalImpressions > 0 ? (totalSpend / totalImpressions) * 1000 : 0,
      },
      platformBreakdown,
      statusBreakdown,
      campaigns,
    };
  }

  private groupByPlatform(campaigns: any[]) {
    const groups: Record<string, any> = {};
    for (const c of campaigns) {
      const platform = c.platform || 'unknown';
      if (!groups[platform]) {
        groups[platform] = {
          platform,
          count: 0,
          spend: 0,
          impressions: 0,
          clicks: 0,
          conversions: 0,
        };
      }
      groups[platform].count++;
      groups[platform].spend += (c.spend ?? 0);
      groups[platform].impressions += Number(c.impressions);
      groups[platform].clicks += Number(c.clicks);
      groups[platform].conversions += Number(c.conversions);
    }
    return Object.values(groups);
  }

  private groupByStatus(campaigns: any[]) {
    const groups: Record<string, any> = {};
    for (const c of campaigns) {
      const status = c.status || 'unknown';
      if (!groups[status]) {
        groups[status] = { status, count: 0, spend: 0 };
      }
      groups[status].count++;
      groups[status].spend += (c.spend ?? 0);
    }
    return Object.values(groups);
  }
}

export const campaignService = new CampaignService();

