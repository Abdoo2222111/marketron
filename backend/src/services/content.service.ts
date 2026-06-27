// @ts-nocheck
import prisma from '../config/database';
import { ApiError } from '../utils/apiError';
import { Prisma } from '@prisma/client';

export class ContentService {
  async list(params: {
    userId: string;
    page: number;
    limit: number;
    type?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    const { userId, page, limit, type, search, sortBy = 'createdAt', sortOrder = 'desc' } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.ContentWhereInput = { userId };

    if (type) {
      where.type = type as any;
    }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
      ];
    }

    const orderBy: Prisma.ContentOrderByWithRelationInput = {};
    const allowedSortFields = ['title', 'createdAt', 'type', 'fileSize'];
    if (allowedSortFields.includes(sortBy)) {
      (orderBy as any)[sortBy] = sortOrder;
    } else {
      orderBy.createdAt = sortOrder;
    }

    const [contents, total] = await Promise.all([
      prisma.content.findMany({ where, orderBy, skip, take: limit }),
      prisma.content.count({ where }),
    ]);

    return { contents, total };
  }

  async getById(userId: string, id: string) {
    const content = await prisma.content.findFirst({ where: { id, userId } });
    if (!content) throw ApiError.notFound('المحتوى غير موجود');
    return content;
  }

  async create(userId: string, data: any) {
    return prisma.content.create({
      data: { ...data, userId },
    });
  }

  async delete(userId: string, id: string) {
    const existing = await prisma.content.findFirst({ where: { id, userId } });
    if (!existing) throw ApiError.notFound('المحتوى غير موجود');

    await prisma.content.delete({ where: { id } });
    return { message: 'تم حذف المحتوى بنجاح' };
  }

  // AI content generation placeholder
  async generateAiContent(userId: string, data: {
    type: string;
    prompt: string;
    platform?: string;
  }) {
    // This would call an AI service in production
    // For now, return a placeholder
    return {
      id: 'ai-generated',
      type: data.type,
      platform: data.platform,
      content: `محتوى تم توليده بالذكاء الاصطناعي بناءً على: "${data.prompt}"`,
      userId,
    };
  }
}

export const contentService = new ContentService();

