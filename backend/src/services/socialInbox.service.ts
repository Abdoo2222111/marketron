import prisma from '../config/database';
import { ApiError } from '../utils/apiError';
import { evolutionApi } from '../integrations/evolutionApi';
import { metaGraph } from '../integrations/metaGraph';
import { generateAI } from '../integrations/openai';
import logger from '../utils/logger';

export type SocialPlatform =
  | 'whatsapp'
  | 'messenger'
  | 'instagram'
  | 'facebook'
  | 'tiktok'
  | 'snapchat'
  | 'telegram'
  | 'twitter';

export class SocialInboxService {
  // ── Inbox CRUD ────────────────────────────────────────
  async createInbox(
    userId: string,
    data: {
      name: string;
      platform: SocialPlatform;
      phoneNumber?: string;
      platformAccountId?: string;
    }
  ) {
    const inbox = await prisma.socialInbox.create({
      data: {
        userId,
        name: data.name,
        platform: data.platform,
        phoneNumber: data.phoneNumber,
        platformAccountId: data.platformAccountId,
        webhookToken: this.generateWebhookToken(),
        settings: JSON.stringify({
          autoReply: true,
          aiEnabled: true,
          workingHoursOnly: false,
        }),
      },
    });

    // Auto-connect platform-specific resources
    if (data.platform === 'whatsapp') {
      await this.initWhatsAppSession(userId, inbox.id, data.name);
    }

    return inbox;
  }

  async listInboxes(userId: string) {
    return prisma.socialInbox.findMany({
      where: { userId },
      include: {
        _count: { select: { messages: { where: { status: 'unread' } } } },
        whatsAppSessions: { take: 1, orderBy: { createdAt: 'desc' } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getInbox(userId: string, inboxId: string) {
    const inbox = await prisma.socialInbox.findFirst({
      where: { id: inboxId, userId },
      include: {
        _count: { select: { messages: true } },
        whatsAppSessions: { take: 1, orderBy: { createdAt: 'desc' } },
      },
    });
    if (!inbox) throw ApiError.notFound('صندوق الرسائل غير موجود');
    return inbox;
  }

  async deleteInbox(userId: string, inboxId: string) {
    const inbox = await prisma.socialInbox.findFirst({
      where: { id: inboxId, userId },
    });
    if (!inbox) throw ApiError.notFound('صندوق الرسائل غير موجود');
    await prisma.socialInbox.delete({ where: { id: inboxId } });
    return { message: 'تم حذف صندوق الرسائل بنجاح' };
  }

  // ── Messages ──────────────────────────────────────────
  async listMessages(
    userId: string,
    params: {
      inboxId?: string;
      platform?: string;
      status?: string;
      page: number;
      limit: number;
    }
  ) {
    const { page, limit, inboxId, platform, status } = params;
    const skip = (page - 1) * limit;
    const where: any = { userId };
    if (inboxId) where.inboxId = inboxId;
    if (platform) where.platform = platform;
    if (status) where.status = status;

    const [messages, total] = await Promise.all([
      prisma.socialMessage.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: { inbox: { select: { name: true, platform: true } } },
      }),
      prisma.socialMessage.count({ where }),
    ]);

    return { messages, total, page, limit };
  }

  async markAsRead(userId: string, messageId: string) {
    const msg = await prisma.socialMessage.findFirst({
      where: { id: messageId, userId },
    });
    if (!msg) throw ApiError.notFound('الرسالة غير موجودة');
    return prisma.socialMessage.update({
      where: { id: messageId },
      data: { status: 'read', readAt: new Date() },
    });
  }

  async markAllAsRead(userId: string, inboxId?: string) {
    const where: any = { userId, status: 'unread' };
    if (inboxId) where.inboxId = inboxId;
    await prisma.socialMessage.updateMany({
      where,
      data: { status: 'read', readAt: new Date() },
    });
    return { message: 'تم تحديد الكل كمقروء' };
  }

  async sendReply(userId: string, messageId: string, text: string) {
    const original = await prisma.socialMessage.findFirst({
      where: { id: messageId, userId },
      include: { inbox: true },
    });
    if (!original) throw ApiError.notFound('الرسالة غير موجودة');

    // Send to real platform
    await this.sendToPlatform(original.inbox, original, text);

    // Create outbound message
    const reply = await prisma.socialMessage.create({
      data: {
        inboxId: original.inboxId,
        userId,
        platform: original.platform,
        direction: 'outbound',
        status: 'read',
        senderName: 'أنت',
        messageText: text,
        metadata: JSON.stringify({ replyTo: messageId }),
      },
    });

    // Mark original as replied
    await prisma.socialMessage.update({
      where: { id: messageId },
      data: { status: 'replied', repliedAt: new Date() },
    });

    return reply;
  }

  // ── Platform-specific sending ─────────────────────────
  private async sendToPlatform(inbox: any, message: any, text: string) {
    const platform = inbox.platform as SocialPlatform;

    try {
      switch (platform) {
        case 'whatsapp': {
          if (!inbox.phoneNumber && !message.phoneNumber) {
            throw new Error('رقم الهاتف مطلوب لإرسال رسالة واتساب');
          }
          const phone = message.phoneNumber || inbox.phoneNumber;
          await evolutionApi.sendText(
            inbox.settings?.instanceName || inbox.name,
            phone,
            text
          );
          break;
        }

        case 'messenger':
        case 'facebook': {
          if (!message.senderId) {
            throw new Error('معرّف المرسل مطلوب لإرسال رسالة فيسبوك');
          }
          await metaGraph.sendMessage(message.senderId, text, inbox.platformAccountId || 'me');
          break;
        }

        case 'instagram': {
          if (!message.senderId) {
            throw new Error('معرّف المرسل مطلوب لإرسال رسالة إنستجرام');
          }
          await metaGraph.sendInstagramMessage(message.senderId, text);
          break;
        }

        case 'telegram': {
          // TODO: implement Telegram bot integration
          logger.warn('Telegram sending not yet implemented');
          break;
        }

        case 'tiktok':
        case 'snapchat':
        case 'twitter': {
          // These platforms don't support direct message replies via simple APIs
          logger.warn(`${platform} direct reply not supported in this integration`);
          break;
        }

        default:
          logger.warn(`Unknown platform: ${platform}`);
      }
    } catch (error: any) {
      logger.error('sendToPlatform failed', { platform, error: error.message });
      // Still save the reply locally even if platform send fails
      // Caller can decide whether to throw
    }
  }

  // ── WhatsApp ──────────────────────────────────────────
  private async initWhatsAppSession(userId: string, inboxId: string, instanceName: string) {
    if (!evolutionApi.isEnabled()) return;

    try {
      await evolutionApi.createInstance(instanceName);
    } catch (error: any) {
      // Instance may already exist
      logger.info(`Evolution instance ${instanceName} may already exist`);
    }

    const connect = await evolutionApi.connectInstance(instanceName);
    await prisma.whatsAppSession.upsert({
      where: { inboxId },
      update: {
        qrCode: connect?.qrcode || connect?.base64,
        qrCodeExpiresAt: new Date(Date.now() + 5 * 60 * 1000),
        status: 'pending',
      },
      create: {
        inboxId,
        userId,
        qrCode: connect?.qrcode || connect?.base64,
        qrCodeExpiresAt: new Date(Date.now() + 5 * 60 * 1000),
        status: 'pending',
      },
    });
  }

  async generateWhatsAppQR(userId: string, inboxId: string) {
    const inbox = await prisma.socialInbox.findFirst({
      where: { id: inboxId, userId, platform: 'whatsapp' },
    });
    if (!inbox) throw ApiError.notFound('حساب واتساب غير موجود');

    if (evolutionApi.isEnabled()) {
      const connect = await evolutionApi.connectInstance(inbox.name);
      const qrCodeUrl =
        connect?.qrcode ||
        connect?.base64 ||
        `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
          inbox.webhookToken || ''
        )}`;

      const session = await prisma.whatsAppSession.upsert({
        where: { inboxId },
        update: {
          qrCode: qrCodeUrl,
          qrCodeExpiresAt: new Date(Date.now() + 5 * 60 * 1000),
          status: 'pending',
        },
        create: {
          inboxId,
          userId,
          qrCode: qrCodeUrl,
          qrCodeExpiresAt: new Date(Date.now() + 5 * 60 * 1000),
          status: 'pending',
        },
      });

      return {
        qrCodeUrl: session.qrCode,
        expiresIn: 300,
        instanceName: inbox.name,
      };
    }

    // Fallback static QR
    const qrData = `whatsapp://connect?token=${inbox.webhookToken}&userId=${userId}`;
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
      qrData
    )}`;

    await prisma.whatsAppSession.upsert({
      where: { inboxId },
      update: {
        qrCode: qrCodeUrl,
        qrCodeExpiresAt: new Date(Date.now() + 5 * 60 * 1000),
        status: 'pending',
      },
      create: {
        inboxId,
        userId,
        qrCode: qrCodeUrl,
        qrCodeExpiresAt: new Date(Date.now() + 5 * 60 * 1000),
        status: 'pending',
      },
    });

    return { qrCodeUrl, expiresIn: 300 };
  }

  async getWhatsAppStatus(userId: string, inboxId: string) {
    const session = await prisma.whatsAppSession.findFirst({
      where: { inboxId, userId },
    });
    if (!session) throw ApiError.notFound('جلسة واتساب غير موجودة');

    let state = session.status;
    const inbox = await prisma.socialInbox.findFirst({
      where: { id: inboxId, userId },
    });

    if (inbox && evolutionApi.isEnabled()) {
      try {
        const remoteState = await evolutionApi.getConnectionState(inbox.name);
        state = remoteState?.state || session.status;
      } catch (error: any) {
        logger.error('getWhatsAppStatus remote check failed', { error: error.message });
      }
    }

    return {
      status: state,
      qrCode: session.qrCode,
      lastConnectedAt: session.lastConnectedAt,
    };
  }

  // ── Sync from platforms ───────────────────────────────
  async syncInbox(userId: string, inboxId: string) {
    const inbox = await prisma.socialInbox.findFirst({
      where: { id: inboxId, userId },
    });
    if (!inbox) throw ApiError.notFound('صندوق الرسائل غير موجود');

    switch (inbox.platform as SocialPlatform) {
      case 'messenger':
      case 'facebook':
        return this.syncMetaConversations(userId, inbox);
      case 'instagram':
        return this.syncInstagramMessages(userId, inbox);
      case 'whatsapp':
        return this.syncWhatsAppMessages(userId, inbox);
      default:
        return { message: 'المزامنة غير متاحة لهذه المنصة بعد' };
    }
  }

  private async syncMetaConversations(userId: string, inbox: any) {
    if (!metaGraph.isEnabled()) {
      return { message: 'Meta Graph API not configured' };
    }

    const conversations = await metaGraph.getConversations(
      inbox.platformAccountId || 'me'
    );

    for (const conversation of conversations) {
      const sender = conversation.senders?.data?.[0];
      const lastMessage = conversation.messages?.data?.[0];
      if (!lastMessage) continue;

      const existing = await prisma.socialMessage.findFirst({
        where: { platformMessageId: lastMessage.id },
      });

      const data = {
        inboxId: inbox.id,
        userId,
        platform: inbox.platform,
        direction: lastMessage.from?.id === sender?.id ? 'inbound' : 'outbound',
        status: (conversation.unread_count || 0) > 0 ? 'unread' : 'read',
        senderName: lastMessage.from?.name || sender?.name || 'Unknown',
        senderId: lastMessage.from?.id || sender?.id,
        messageText: lastMessage.message || '',
        platformMessageId: lastMessage.id,
        metadata: JSON.stringify({ conversationId: conversation.id }),
      };

      if (existing) {
        await prisma.socialMessage.update({
          where: { id: existing.id },
          data: {
            messageText: lastMessage.message || '',
            status: (conversation.unread_count || 0) > 0 ? 'unread' : 'read',
          },
        });
      } else {
        await prisma.socialMessage.create({ data });
      }
    }

    await prisma.socialInbox.update({
      where: { id: inbox.id },
      data: { lastSyncedAt: new Date() },
    });

    return { message: `Synced ${conversations.length} conversations` };
  }

  private async syncInstagramMessages(userId: string, inbox: any) {
    if (!metaGraph.isEnabled()) {
      return { message: 'Meta Graph API not configured' };
    }

    const messages = await metaGraph.getInstagramMessages();
    for (const msg of messages) {
      const existing = await prisma.socialMessage.findFirst({
        where: { platformMessageId: msg.id },
      });
      if (existing) {
        await prisma.socialMessage.update({
          where: { id: existing.id },
          data: { messageText: msg.message || '' },
        });
      } else {
        await prisma.socialMessage.create({
          data: {
            inboxId: inbox.id,
            userId,
            platform: 'instagram',
            direction: 'inbound',
            status: 'unread',
            senderName: msg.from?.username || 'Instagram User',
            senderId: msg.from?.id,
            messageText: msg.message || '',
            platformMessageId: msg.id,
            metadata: JSON.stringify({}),
          },
        });
      }
    }

    await prisma.socialInbox.update({
      where: { id: inbox.id },
      data: { lastSyncedAt: new Date() },
    });

    return { message: `Synced ${messages.length} Instagram messages` };
  }

  private async syncWhatsAppMessages(userId: string, inbox: any) {
    // WhatsApp messages come via webhooks, not polling
    // But we can check connection state
    const state = await evolutionApi.getConnectionState(inbox.name);
    if (state?.state === 'CONNECTED') {
      await prisma.whatsAppSession.updateMany({
        where: { inboxId: inbox.id },
        data: { status: 'connected', lastConnectedAt: new Date() },
      });
    }
    return { message: 'WhatsApp state synced', state: state?.state };
  }

  // ── Webhook ──────────────────────────────────────────
  async handleWebhook(inboxId: string, payload: any) {
    const inbox = await prisma.socialInbox.findUnique({
      where: { id: inboxId },
    });
    if (!inbox) throw ApiError.notFound('صندوق الرسائل غير موجود');

    // Support both Evolution API and generic webhook formats
    const isEvolution = !!payload.data;
    const normalized = isEvolution
      ? this.normalizeEvolutionPayload(payload)
      : payload;

    const message = await prisma.socialMessage.create({
      data: {
        inboxId,
        userId: inbox.userId,
        platform: inbox.platform,
        direction: 'inbound',
        status: 'unread',
        senderName: normalized.senderName || normalized.from || 'Unknown',
        senderId: normalized.senderId || normalized.from,
        phoneNumber: normalized.phoneNumber || normalized.from,
        messageText: normalized.text || normalized.message || '',
        mediaUrl: normalized.mediaUrl,
        platformMessageId: normalized.messageId,
        metadata: JSON.stringify(normalized.metadata || {}),
      },
    });

    // Auto-reply check
    await this.checkAutoReply(inbox.userId, message, inbox.platform);

    return { message: 'تم استلام الرسالة' };
  }

  private normalizeEvolutionPayload(payload: any) {
    const data = payload.data || payload;
    const message = data.message || data;
    return {
      senderName: message.senderName || data.pushName || message.remoteJid,
      senderId: message.remoteJid,
      phoneNumber: message.remoteJid?.split('@')?.[0],
      text: message.conversation || message.extendedTextMessage?.text || message.caption,
      mediaUrl: message.imageMessage?.url || message.videoMessage?.url || message.audioMessage?.url,
      messageId: message.id || data.key?.id,
      metadata: payload,
    };
  }

  // ── AI Auto-reply ─────────────────────────────────────
  private async checkAutoReply(userId: string, message: any, platform: string) {
    const rules = await prisma.aiReplyRule.findMany({
      where: {
        userId,
        isActive: true,
        OR: [{ platform: platform }, { platform: null }],
      },
      orderBy: { priority: 'desc' },
      include: { agent: true },
    });

    for (const rule of rules) {
      if (this.matchesRule(rule, message)) {
        const replyText = rule.useAi
          ? await this.generateAiReply(rule, message)
          : rule.responseTemplate || 'شكراً لتواصلك، سنرد عليك قريباً';

        await prisma.socialMessage.create({
          data: {
            inboxId: message.inboxId,
            userId,
            platform: message.platform,
            direction: 'outbound',
            status: 'read',
            messageText: replyText,
            replyFromAi: true,
            aiReplyText: replyText,
            aiAgentId: rule.agentId,
            metadata: JSON.stringify({ ruleId: rule.id, autoReply: true }),
          },
        });

        await prisma.socialMessage.update({
          where: { id: message.id },
          data: {
            status: 'replied',
            repliedAt: new Date(),
            aiReplyText: replyText,
            replyFromAi: true,
          },
        });

        // Try to send to platform
        const inbox = await prisma.socialInbox.findUnique({
          where: { id: message.inboxId },
        });
        if (inbox) {
          try {
            await this.sendToPlatform(inbox, message, replyText);
          } catch (error: any) {
            logger.error('Auto-reply platform send failed', { error: error.message });
          }
        }

        break;
      }
    }
  }

  private matchesRule(rule: any, message: any): boolean {
    if (rule.triggerType === 'all') return true;
    if (rule.triggerType === 'keyword' && rule.triggerValue && message.messageText) {
      const keywords = rule.triggerValue
        .split(',')
        .map((k: string) => k.trim().toLowerCase());
      return keywords.some((kw: string) =>
        message.messageText.toLowerCase().includes(kw)
      );
    }
    return false;
  }

  private async generateAiReply(rule: any, message: any): Promise<string> {
    const prompt =
      rule.aiPrompt ||
      `أنت مندوب خدمة عملاء عربي مهذب لمنصة MARKETRON. رد على رسالة العميل التالية باختصار ووضوح:

رسالة العميل: "${message.messageText}"`;

    if (!process.env.OPENAI_API_KEY) {
      logger.warn('OPENAI_API_KEY not set, returning fallback AI reply');
      return `شكراً لتواصلك مع MARKETRON! تم استلام رسالتك: "${message.messageText}". سيتواصل معك فريقنا قريباً.`;
    }

    try {
      return await generateAI(prompt);
    } catch (error: any) {
      logger.error('generateAiReply failed', { error: error.message });
      return rule.responseTemplate || 'شكراً لتواصلك مع MARKETRON، سنتواصل معك قريباً.';
    }
  }

  private generateWebhookToken(): string {
    return `whk_${Math.random().toString(36).substring(2, 15)}_${Date.now()}`;
  }
}

export const socialInboxService = new SocialInboxService();
