import prisma from '../config/database';
import logger from '../utils/logger';

export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export interface CreateNotificationInput {
  userId: string;
  title: string;
  message?: string;
  type?: NotificationType;
  link?: string;
}

export class NotificationService {
  async create(input: CreateNotificationInput): Promise<any> {
    const notification = await prisma.notification.create({
      data: {
        title: input.title,
        message: input.message,
        type: input.type || 'info',
        link: input.link,
        userId: input.userId,
      },
    });
    logger.info(`[notifications] Created for user=${input.userId} type=${input.type}`);
    return notification;
  }

  async list(userId: string, page = 1, limit = 20): Promise<{ notifications: any[]; total: number; unreadCount: number }> {
    const skip = (page - 1) * limit;
    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip,
      }),
      prisma.notification.count({ where: { userId } }),
      prisma.notification.count({ where: { userId, isRead: false } }),
    ]);
    return { notifications, total, unreadCount };
  }

  async markAsRead(userId: string, id: string): Promise<any> {
    return prisma.notification.updateMany({
      where: { id, userId },
      data: { isRead: true },
    });
  }

  async markAllAsRead(userId: string): Promise<number> {
    const result = await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
    return result.count;
  }

  async deleteAll(userId: string): Promise<number> {
    const result = await prisma.notification.deleteMany({ where: { userId } });
    return result.count;
  }

  // ── Event-based notification creators ─────────────
  async budgetAlert(userId: string, campaignName: string, percentage: number, campaignId: string): Promise<any> {
    return this.create({
      userId,
      type: 'warning',
      title: `تنبيه ميزانية: ${campaignName}`,
      message: `الحملة "${campaignName}" استهلكت ${percentage}% من ميزانيتها`,
      link: `/campaigns/${campaignId}`,
    });
  }

  async newMessage(userId: string, customerName: string, platform: string, conversationId: string): Promise<any> {
    return this.create({
      userId,
      type: 'info',
      title: `رسالة جديدة من ${customerName}`,
      message: `رسالة جديدة عبر ${platform}`,
      link: `/conversations/${conversationId}`,
    });
  }

  async keyExpiring(userId: string, provider: string): Promise<any> {
    return this.create({
      userId,
      type: 'warning',
      title: `مفتاح ${provider} يحتاج تحديثاً`,
      message: `مفتاح ${provider} API الخاص بك يحتاج إلى تحديث قريباً`,
      link: '/settings/ai-keys',
    });
  }

  async aiSuggestion(userId: string, suggestion: string, campaignId?: string): Promise<any> {
    return this.create({
      userId,
      type: 'success',
      title: 'اقتراح ذكي جديد',
      message: suggestion,
      link: campaignId ? `/campaigns/${campaignId}` : '/ai-studio',
    });
  }
}

export const notificationService = new NotificationService();
