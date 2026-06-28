// @ts-nocheck
import prisma from '../config/database';
import { ApiError } from '../utils/apiError';

export class SettingsService {
  async getBilling(userId: string) {
    const invoices = await prisma.invoice.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 12,
    });

    const totalPaid = invoices
      .filter((i) => i.status === 'paid')
      .reduce((sum, i) => sum + i.amount, 0);

    const pendingAmount = invoices
      .filter((i) => i.status === 'pending')
      .reduce((sum, i) => sum + i.amount, 0);

    return {
      currentPlan: 'professional',
      totalPaid,
      pendingAmount,
      invoices,
      paymentMethods: [
        { id: '1', type: 'card', last4: '4242', brand: 'Visa', isDefault: true },
      ],
    };
  }

  async getInvoices(userId: string, page: number, limit: number) {
    const skip = (page - 1) * limit;
    const where = { userId };

    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.invoice.count({ where }),
    ]);

    return { invoices, total };
  }

  async getTeamSettings(userId: string) {
    const team = await prisma.team.findFirst({
      where: { ownerId: userId },
      include: {
        members: {
          include: {
            user: { select: { id: true, name: true, email: true, avatar: true, role: true } },
          },
        },
      },
    });

    return team || { message: 'لم يتم إنشاء فريق بعد' };
  }

  async updateProfile(userId: string, data: any) {
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        name: data.name,
        phone: data.phone,
        company: data.company,
        avatar: data.avatar,
      },
    });

    const { password, ...safeUser } = user;
    return safeUser;
  }
}

export const settingsService = new SettingsService();

