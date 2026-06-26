import prisma from '../config/database';
import { Prisma } from '@prisma/client';

export class NotificationService {
  async list(userId: string, page: number, limit: number) {
    const skip = (page - 1) * limit;
    const where: Prisma.NotificationWhereInput = { userId };

    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.notification.count({ where }),
      prisma.notification.count({ where: { userId, isRead: false } }),
    ]);

    return { notifications, total, unreadCount };
  }

  async markAsRead(userId: string, id: string) {
    return prisma.notification.updateMany({
      where: { id, userId },
      data: { isRead: true },
    });
  }

  async markAllAsRead(userId: string) {
    return prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }

  async create(userId: string, data: { type: string; title: string; message?: string; link?: string }) {
    return prisma.notification.create({
      data: {
        userId,
        type: data.type as any,
        title: data.title,
        message: data.message,
        link: data.link,
      },
    });
  }
}

export const notificationService = new NotificationService();
