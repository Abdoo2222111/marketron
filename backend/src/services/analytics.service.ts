import prisma from '../config/database';
import { ApiError } from '../utils/apiError';
import { Prisma } from '@prisma/client';

export class AnalyticsService {
  async getOverview(userId: string) {
    const campaigns = await prisma.campaign.findMany({
      where: { userId },
      select: {
        impressions: true,
        clicks: true,
        conversions: true,
        spend: true,
        revenue: true,
        ctr: true,
        cpc: true,
        cpm: true,
        cpa: true,
        roas: true,
        status: true,
        createdAt: true,
        platform: true,
      },
    });

    const totalImpressions = campaigns.reduce((s, c) => s + Number(c.impressions), 0);
    const totalClicks = campaigns.reduce((s, c) => s + Number(c.clicks), 0);
    const totalConversions = campaigns.reduce((s, c) => s + Number(c.conversions), 0);
    const totalSpend = campaigns.reduce((s, c) => s + c.spend, 0);
    const totalRevenue = campaigns.reduce((s, c) => s + c.revenue, 0);

    // Daily performance (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const snapshots = await prisma.adSnapshot.groupBy({
      by: ['date'],
      where: {
        campaign: { userId },
        date: { gte: thirtyDaysAgo },
      },
      _sum: {
        impressions: true,
        clicks: true,
        conversions: true,
        spend: true,
        revenue: true,
      },
      orderBy: { date: 'asc' },
    });

    // Platform breakdown
    const platformData = campaigns.reduce((acc: any, c) => {
      const p = c.platform;
      if (!acc[p]) acc[p] = { platform: p, spend: 0, impressions: 0, clicks: 0, conversions: 0, revenue: 0 };
      acc[p].spend += c.spend;
      acc[p].impressions += Number(c.impressions);
      acc[p].clicks += Number(c.clicks);
      acc[p].conversions += Number(c.conversions);
      acc[p].revenue += c.revenue;
      return acc;
    }, {});

    return {
      totals: {
        impressions: totalImpressions,
        clicks: totalClicks,
        conversions: totalConversions,
        spend: totalSpend,
        revenue: totalRevenue,
        ctr: totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0,
        cpc: totalClicks > 0 ? totalSpend / totalClicks : 0,
        cpm: totalImpressions > 0 ? (totalSpend / totalImpressions) * 1000 : 0,
        cpa: totalConversions > 0 ? totalSpend / totalConversions : 0,
        roas: totalSpend > 0 ? totalRevenue / totalSpend : 0,
      },
      dailyPerformance: snapshots.map((s) => ({
        date: s.date,
        impressions: Number(s._sum.impressions || 0),
        clicks: Number(s._sum.clicks || 0),
        conversions: Number(s._sum.conversions || 0),
        spend: s._sum.spend || 0,
        revenue: s._sum.revenue || 0,
      })),
      platformBreakdown: Object.values(platformData),
      campaignCount: campaigns.length,
      activeCampaigns: campaigns.filter((c) => c.status === 'active').length,
    };
  }

  async getAudience(userId: string) {
    const campaigns = await prisma.campaign.findMany({
      where: { userId },
      select: {
        targetCountry: true,
        targetAgeMin: true,
        targetAgeMax: true,
        targetGender: true,
        targetInterests: true,
      },
    });

    // Aggregate audience data
    const countries: Record<string, number> = {};
    const ageGroups: Record<string, number> = {};
    const genders: Record<string, number> = {};

    campaigns.forEach((c) => {
      if (c.targetCountry) countries[c.targetCountry] = (countries[c.targetCountry] || 0) + 1;
      
      const ageRange = c.targetAgeMin && c.targetAgeMax
        ? `${c.targetAgeMin}-${c.targetAgeMax}`
        : 'غير محدد';
      ageGroups[ageRange] = (ageGroups[ageRange] || 0) + 1;

      if (c.targetGender) genders[c.targetGender] = (genders[c.targetGender] || 0) + 1;
    });

    return { countries, ageGroups, genders };
  }

  async getTiming(userId: string) {
    const campaigns = await prisma.campaign.findMany({
      where: { userId },
      select: { createdAt: true, startDate: true, endDate: true },
    });

    return {
      createdByMonth: this.groupByMonth(campaigns.map((c) => c.createdAt)),
      activeByMonth: campaigns
        .filter((c) => c.startDate)
        .map((c) => ({ start: c.startDate!, end: c.endDate })),
    };
  }

  async getCost(userId: string) {
    const campaigns = await prisma.campaign.findMany({
      where: { userId },
      select: {
        budgetAmount: true,
        budgetCurrency: true,
        budgetType: true,
        spend: true,
        revenue: true,
        platform: true,
      },
    });

    const totalBudget = campaigns.reduce((s, c) => s + (c.budgetAmount || 0), 0);
    const totalSpend = campaigns.reduce((s, c) => s + c.spend, 0);
    const totalRevenue = campaigns.reduce((s, c) => s + c.revenue, 0);

    return {
      totalBudget,
      totalSpend,
      totalRevenue,
      remainingBudget: totalBudget - totalSpend,
      spendRate: totalBudget > 0 ? (totalSpend / totalBudget) * 100 : 0,
      roas: totalSpend > 0 ? totalRevenue / totalSpend : 0,
      costByPlatform: campaigns.reduce((acc: any, c) => {
        const p = c.platform;
        if (!acc[p]) acc[p] = { platform: p, spend: 0, budget: 0, revenue: 0 };
        acc[p].spend += c.spend;
        acc[p].budget += c.budgetAmount || 0;
        acc[p].revenue += c.revenue;
        return acc;
      }, {}),
    };
  }

  async getCustom(userId: string, filters: any) {
    // Build custom query based on filters
    const where: Prisma.CampaignWhereInput = { userId };

    if (filters.startDate) {
      where.createdAt = { gte: new Date(filters.startDate) };
    }
    if (filters.endDate) {
      where.createdAt = { ...(where.createdAt as any), lte: new Date(filters.endDate) };
    }
    if (filters.platform) {
      where.platform = filters.platform as any;
    }
    if (filters.status) {
      where.status = filters.status as any;
    }

    const campaigns = await prisma.campaign.findMany({
      where,
      select: {
        name: true,
        platform: true,
        status: true,
        impressions: true,
        clicks: true,
        conversions: true,
        spend: true,
        revenue: true,
        ctr: true,
        cpc: true,
        cpm: true,
        cpa: true,
        roas: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return campaigns;
  }

  async saveReport(userId: string, data: { name: string; type: string; filters?: any; chartData?: any }) {
    return prisma.analyticsReport.create({
      data: {
        userId,
        name: data.name,
        type: data.type as any,
        filters: data.filters || {},
        chartData: data.chartData || {},
      },
    });
  }

  async deleteReport(userId: string, id: string) {
    const existing = await prisma.analyticsReport.findFirst({ where: { id, userId } });
    if (!existing) throw ApiError.notFound('التقرير غير موجود');

    await prisma.analyticsReport.delete({ where: { id } });
    return { message: 'تم حذف التقرير بنجاح' };
  }

  async exportReport(userId: string, id: string, format: string) {
    const report = await prisma.analyticsReport.findFirst({ where: { id, userId } });
    if (!report) throw ApiError.notFound('التقرير غير موجود');

    // In production, generate PDF/Excel/CSV
    return {
      message: `تم تصدير التقرير بصيغة ${format}`,
      report,
      downloadUrl: `/api/analytics/download/${id}?format=${format}`,
    };
  }

  private groupByMonth(dates: Date[]) {
    const groups: Record<string, number> = {};
    dates.forEach((d) => {
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      groups[key] = (groups[key] || 0) + 1;
    });
    return groups;
  }
}

export const analyticsService = new AnalyticsService();

