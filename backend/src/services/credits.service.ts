import prisma from '../config/database';
import { ApiError } from '../utils/apiError';
import { config } from '../config';
import logger from '../utils/logger';

// ============================================================
// Credits & Tokens Service
// نظام الرصيد والتوكينز للتحكم في استخدام الذكاء الاصطناعي
// ============================================================

export class CreditsService {
  async getBalance(userId: string): Promise<number> {
    const credits = await prisma.userCredits.findUnique({ where: { userId } });
    return credits?.balance || 0;
  }

  async ensureCredits(userId: string): Promise<void> {
    const existing = await prisma.userCredits.findUnique({ where: { userId } });
    if (!existing) {
      try {
        await prisma.userCredits.create({
          data: {
            userId,
            balance: config.credits.freeTierCredits,
            totalPurchased: config.credits.freeTierCredits,
          },
        });
      } catch (e: any) {
        if (e?.code === 'P2002') {
          return;
        }
        throw e;
      }
      await this.logTransaction(userId, config.credits.freeTierCredits, 'bonus', 'رصيد ترحيبي مجاني', config.credits.freeTierCredits);
      logger.info(`Initialized credits for user ${userId}: ${config.credits.freeTierCredits}`);
    }
  }

  async spend(userId: string, amount: number, description: string): Promise<number> {
    await this.ensureCredits(userId);
    const credits = await prisma.userCredits.findUnique({ where: { userId } });
    if (!credits || credits.balance < amount) {
      throw ApiError.forbidden('رصيدك غير كافٍ. يرجى شحن رصيدك للمتابعة.');
    }

    const newBalance = credits.balance - amount;
    await prisma.userCredits.update({
      where: { userId },
      data: {
        balance: newBalance,
        totalSpent: { increment: amount },
      },
    });

    await this.logTransaction(userId, -amount, 'spend', description, newBalance);
    logger.info(`User ${userId} spent ${amount} credits. Balance: ${newBalance}`);
    return newBalance;
  }

  async addCredits(userId: string, amount: number, type: string, description: string): Promise<number> {
    await this.ensureCredits(userId);
    const credits = await prisma.userCredits.findUnique({ where: { userId } });
    if (!credits) throw ApiError.notFound('الرصيد غير موجود');

    const newBalance = credits.balance + amount;
    await prisma.userCredits.update({
      where: { userId },
      data: {
        balance: newBalance,
        ...(type === 'purchase' || type === 'bonus') && { totalPurchased: { increment: amount } },
      },
    });

    await this.logTransaction(userId, amount, type, description, newBalance);
    logger.info(`User ${userId} added ${amount} credits (${type}). Balance: ${newBalance}`);
    return newBalance;
  }

  async getTransactions(userId: string, limit = 50) {
    return prisma.creditTransaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async getStats(userId: string) {
    const credits = await prisma.userCredits.findUnique({ where: { userId } });
    if (!credits) {
      await this.ensureCredits(userId);
      return { balance: config.credits.freeTierCredits, totalSpent: 0, totalPurchased: config.credits.freeTierCredits };
    }
    return {
      balance: credits.balance,
      totalSpent: credits.totalSpent,
      totalPurchased: credits.totalPurchased,
    };
  }

  private async logTransaction(
    userId: string,
    amount: number,
    type: string,
    description: string,
    balanceAfter: number
  ) {
    await prisma.creditTransaction.create({
      data: { userId, amount, type, description, balanceAfter },
    });
  }

  async spendForAi(userId: string, description: string): Promise<number> {
    return this.spend(userId, config.credits.aiCreditCost, description);
  }
}

export const creditsService = new CreditsService();
