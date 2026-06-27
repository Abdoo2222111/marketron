// @ts-nocheck
import prisma from '../config/database';
import { ApiError } from '../utils/apiError';
import { aiBrainService } from './aiBrain.service';

export class ConversationService {
  async list(orgId: string, status?: string) {
    const where: any = { organizationId: orgId };
    if (status) where.status = status;
    return prisma.conversation.findMany({
      where,
      include: { _count: { select: { messages: true } } },
      orderBy: { lastMessageAt: 'desc' },
    });
  }

  async getById(id: string, orgId: string) {
    const conv = await prisma.conversation.findFirst({
      where: { id, organizationId: orgId },
      include: { messages: { orderBy: { createdAt: 'asc' } } },
    });
    if (!conv) throw ApiError.notFound('المحادثة غير موجودة');
    return conv;
  }

  async createMessage(orgId: string, data: {
    conversationId?: string;
    customerIdentifier?: string;
    customerName?: string;
    customerPhone?: string;
    content: string;
    direction?: string;
  }) {
    let conversationId = data.conversationId;

    if (!conversationId) {
      const existing = await prisma.conversation.findFirst({
        where: {
          organizationId: orgId,
          customerPhone: data.customerPhone,
          status: 'active',
        },
      });
      if (existing) {
        conversationId = existing.id;
      } else {
        const conv = await prisma.conversation.create({
          data: {
            organizationId: orgId,
            customerIdentifier: data.customerIdentifier,
            customerName: data.customerName,
            customerPhone: data.customerPhone,
          },
        });
        conversationId = conv.id;
      }
    }

    const message = await prisma.message.create({
      data: {
        conversationId,
        direction: data.direction || 'inbound',
        senderType: 'customer',
        content: data.content,
      },
    });

    await prisma.conversation.update({
      where: { id: conversationId },
      data: { lastMessageAt: new Date() },
    });

    return { message, conversationId };
  }

  async generateAiReply(conversationId: string, orgId: string) {
    const lastMessage = await prisma.message.findFirst({
      where: { conversationId, senderType: 'customer' },
      orderBy: { createdAt: 'desc' },
    });
    if (!lastMessage) throw ApiError.badRequest('لا توجد رسالة للرد عليها');

    const result = await aiBrainService.generateSalesReply(conversationId, lastMessage.content, orgId);

    const reply = await prisma.message.create({
      data: {
        conversationId,
        direction: 'outbound',
        senderType: 'ai',
        content: String(result.reply),
        aiConfidenceScore: result.confidence,
        aiModeUsed: result.mode,
        aiModelUsed: 'deepseek',
      },
    });

    await prisma.conversation.update({
      where: { id: conversationId },
      data: { lastMessageAt: new Date() },
    });

    return { reply, confidence: result.confidence };
  }

  async resolve(conversationId: string, orgId: string) {
    const conv = await prisma.conversation.findFirst({ where: { id: conversationId, organizationId: orgId } });
    if (!conv) throw ApiError.notFound('المحادثة غير موجودة');
    return prisma.conversation.update({ where: { id: conversationId }, data: { status: 'resolved' } });
  }
}

export const conversationService = new ConversationService();

