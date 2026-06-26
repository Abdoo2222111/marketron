import prisma from '../config/database';
import { ApiError } from '../utils/apiError';
import { Prisma } from '@prisma/client';

export class CompetitorService {
  async list(userId: string, page: number, limit: number) {
    const skip = (page - 1) * limit;
    const where: Prisma.CompetitorWhereInput = { userId };

    const [competitors, total] = await Promise.all([
      prisma.competitor.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { _count: { select: { competitorAds: true } } },
      }),
      prisma.competitor.count({ where }),
    ]);

    return { competitors, total };
  }

  async getById(userId: string, id: string) {
    const competitor = await prisma.competitor.findFirst({
      where: { id, userId },
      include: {
        competitorAds: {
          orderBy: { snapshotDate: 'desc' },
          take: 20,
        },
      },
    });

    if (!competitor) throw ApiError.notFound('المنافس غير موجود');
    return competitor;
  }

  async create(userId: string, data: any) {
    return prisma.competitor.create({
      data: { ...data, userId },
    });
  }

  async delete(userId: string, id: string) {
    const existing = await prisma.competitor.findFirst({ where: { id, userId } });
    if (!existing) throw ApiError.notFound('المنافس غير موجود');

    await prisma.competitor.delete({ where: { id } });
    return { message: 'تم حذف المنافس بنجاح' };
  }

  async getAds(userId: string, competitorId: string) {
    const competitor = await prisma.competitor.findFirst({
      where: { id: competitorId, userId },
    });
    if (!competitor) throw ApiError.notFound('المنافس غير موجود');

    return prisma.competitorAd.findMany({
      where: { competitorId },
      orderBy: { snapshotDate: 'desc' },
    });
  }

  async compare(userId: string, ids: string[]) {
    const competitors = await prisma.competitor.findMany({
      where: { id: { in: ids }, userId },
      include: {
        _count: { select: { competitorAds: true } },
      },
    });

    if (competitors.length !== ids.length) {
      throw ApiError.notFound('بعض المنافسين غير موجودين');
    }

    return competitors;
  }
}

export const competitorService = new CompetitorService();
