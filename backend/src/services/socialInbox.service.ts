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
        platformAccountId: data.platformAccountId ?? '',
        webhookToken: this.generateWebhookToken(),
        settings: JSON.stringify({
          autoReply: true,
          aiEnabled: true,
          workingHoursOnly: false,
        }),
      },
    });

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

    if (inbox.platform === 'whatsapp' && evolutionApi.isEnabled()) {
      try {
        await evolutionApi.logout(inbox.name ?? undefined);
        await evolutionApi.deleteInstance(inbox.name ?? undefined);
      } catch (error: any) {
        logger.warn('Evolution cleanup failed', { error: error.message });
      }
    }

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
    const where: any = {};
    if (userId) where.inbox = { userId };
    if (inboxId) where.inboxId = inboxId;
    if (status) where.status = status;

    const [messages, total] = await Promise.all([
      prisma.socialMessage.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: { inbox: { select: { platform: true, platformAccountName: true } } },
      }),
      prisma.socialMessage.count({ where }),
    ]);

    return { messages, total, page, limit };
  }

  async markAsRead(userId: string, messageId: string) {
    const msg = await prisma.socialMessage.findFirst({
      where: { id: messageId, userId } as any,
    });
    if (!msg) throw ApiError.notFound('الرسالة غير موجودة');
    return prisma.socialMessage.update({
      where: { id: messageId },
      data: { status: 'read', readAt: new Date() } as any,
    });
  }

  async markAllAsRead(userId: string, inboxId?: string) {
    const where: any = { status: 'unread' };
    if (inboxId) {
      where.inboxId = inboxId;
    } else {
      where.inbox = { userId };
    }
    await prisma.socialMessage.updateMany({
      where,
      data: { status: 'read', readAt: new Date() } as any,
    });
    return { message: 'تم تحديد الكل كمقروء' };
  }

  async sendReply(userId: string, messageId: string, text: string) {
    const original = await prisma.socialMessage.findFirst({
      where: { id: messageId, inbox: { userId } } as any,
      include: { inbox: true },
    });
    if (!original) throw ApiError.notFound('الرسالة غير موجودة');

    await this.sendToPlatform(original.inbox, original, text);

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
      } as any,
    });

    await prisma.socialMessage.update({
      where: { id: messageId },
      data: { status: 'replied', repliedAt: new Date() } as any,
    });

    return reply;
  }

  // ── Platform-specific sending ─────────────────────────
  private async sendToPlatform(inbox: any, message: any, text: string) {
    const platform = inbox.platform as SocialPlatform;

    try {
      switch (platform) {
        case 'whatsapp': {
          const phone = message.phoneNumber || inbox.phoneNumber;
          if (!phone) {
            throw new Error('رقم الهاتف مطلوب لإرسال رسالة واتساب');
          }
          const cleanPhone = phone.replace(/[^0-9]/g, '');
          await evolutionApi.sendText(
            inbox.name,
            cleanPhone,
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
          logger.warn('Telegram sending not yet implemented');
          break;
        }

        case 'tiktok':
        case 'snapchat':
        case 'twitter': {
          logger.warn(`${platform} direct reply not supported in this integration`);
          break;
        }

        default:
          logger.warn(`Unknown platform: ${platform}`);
      }
    } catch (error: any) {
      logger.error('sendToPlatform failed', { platform, error: error.message });
    }
  }

  // ── WhatsApp ──────────────────────────────────────────
  private async initWhatsAppSession(userId: string, inboxId: string, instanceName: string) {
    if (!evolutionApi.isEnabled()) return;

    try {
      const result = await evolutionApi.createInstance(instanceName);
      const qrCode = result?.qrcode?.base64 || result?.qrcode?.code || '';

      if (qrCode) {
        await prisma.whatsAppSession.upsert({
          where: { inboxId },
          update: { instance: instanceName, qrCode, qrCodeExpiresAt: new Date(Date.now() + 5 * 60 * 1000), status: 'pending' } as any,
          create: { inboxId, userId, instance: instanceName, qrCode, qrCodeExpiresAt: new Date(Date.now() + 5 * 60 * 1000), status: 'pending' } as any,
        });
      }

      await evolutionApi.setWebhook(
        instanceName,
        `${process.env.WEBHOOK_BASE_URL || 'https://marketron-backend-production.up.railway.app'}/api/v1/social/webhook/evolution`
      );
    } catch (error: any) {
      if (error?.response?.status === 409 || error?.response?.data?.message?.includes('already exists')) {
        logger.info(`Evolution instance ${instanceName} already exists, connecting...`);
        try {
          const connect = await evolutionApi.connectInstance(instanceName);
          const qrCode = connect?.qrcode?.base64 || connect?.qrcode?.code || '';
          if (qrCode) {
            await prisma.whatsAppSession.upsert({
              where: { inboxId },
              update: { instance: instanceName, qrCode, qrCodeExpiresAt: new Date(Date.now() + 5 * 60 * 1000), status: 'pending' } as any,
              create: { inboxId, userId, instance: instanceName, qrCode, qrCodeExpiresAt: new Date(Date.now() + 5 * 60 * 1000), status: 'pending' } as any,
            });
          }
        } catch (connectError: any) {
          logger.error('Failed to reconnect existing instance', { error: connectError.message });
        }
      } else {
        logger.error('Evolution initWhatsAppSession failed', { error: error.message });
      }
    }
  }

  async generateWhatsAppQR(userId: string, inboxId: string) {
    const inbox = await prisma.socialInbox.findFirst({
      where: { id: inboxId, userId, platform: 'whatsapp' },
    });
    if (!inbox) throw ApiError.notFound('حساب واتساب غير موجود');

    if (evolutionApi.isEnabled()) {
      try {
        const connect = await evolutionApi.connectInstance(inbox.name ?? undefined);
        const qrCode = connect?.qrcode?.base64 || connect?.qrcode?.code || connect?.base64 || connect?.qrcode || '';

        if (qrCode) {
          const session = await prisma.whatsAppSession.upsert({
            where: { inboxId },
            update: { instance: inbox.name, qrCode, qrCodeExpiresAt: new Date(Date.now() + 5 * 60 * 1000), status: 'pending' } as any,
            create: { inboxId, userId, instance: inbox.name, qrCode, qrCodeExpiresAt: new Date(Date.now() + 5 * 60 * 1000), status: 'pending' } as any,
          });

          await evolutionApi.setWebhook(
            inbox.name ?? '',
            `${process.env.WEBHOOK_BASE_URL || 'https://marketron-backend-production.up.railway.app'}/api/v1/social/webhook/evolution`
          );

          return { qrCodeUrl: session.qrCode, expiresIn: 300, instanceName: inbox.name };
        }

        const state = await evolutionApi.getConnectionState(inbox.name ?? undefined);
        if (state?.state === 'CONNECTED') {
          await prisma.whatsAppSession.upsert({
            where: { inboxId },
            update: { instance: inbox.name, status: 'connected', lastConnectedAt: new Date() } as any,
            create: { inboxId, userId, instance: inbox.name, status: 'connected', lastConnectedAt: new Date() } as any,
          });
          return { status: 'connected', instanceName: inbox.name };
        }
      } catch (error: any) {
        logger.error('generateWhatsAppQR failed', { error: error.message });
        throw ApiError.badRequest('فشل الاتصال بخادم Evolution API. تأكد من تكوينه بشكل صحيح');
      }
    }

    const qrData = `whatsapp://connect?token=${inbox.webhookToken}&userId=${userId}`;
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrData)}`;

    await prisma.whatsAppSession.upsert({
      where: { inboxId },
      update: { instance: inbox.name, qrCode: qrCodeUrl, qrCodeExpiresAt: new Date(Date.now() + 5 * 60 * 1000), status: 'pending' } as any,
      create: { inboxId, userId, instance: inbox.name, qrCode: qrCodeUrl, qrCodeExpiresAt: new Date(Date.now() + 5 * 60 * 1000), status: 'pending' } as any,
    });

    return { qrCodeUrl, expiresIn: 300 };
  }

  async getWhatsAppStatus(userId: string, inboxId: string) {
    const session = await prisma.whatsAppSession.findFirst({
      where: { inboxId, userId } as any,
    });
    if (!session) throw ApiError.notFound('جلسة واتساب غير موجودة');

    let state = session.status;
    const inbox = await prisma.socialInbox.findFirst({
      where: { id: inboxId, userId },
    });

    if (inbox && evolutionApi.isEnabled()) {
      try {
        const remoteState = await evolutionApi.getConnectionState(inbox.name ?? undefined);
        const remoteStatus = remoteState?.state || '';
        if (remoteStatus === 'CONNECTED' || remoteStatus === 'open') {
          state = 'connected';
        } else if (remoteStatus === 'connecting' || remoteStatus === 'QRCODE') {
          state = 'pending';
        } else if (remoteStatus === 'close' || remoteStatus === 'disconnected') {
          state = 'disconnected';
        }
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

  // ── Evolution Webhook Handlers ────────────────────────

  async updateWhatsAppQR(instanceName: string, qrCode: string) {
    const inbox = await prisma.socialInbox.findFirst({
      where: { name: instanceName, platform: 'whatsapp' },
    });
    if (!inbox) return;

    await prisma.whatsAppSession.upsert({
      where: { inboxId: inbox.id } as any,
      update: {
        instance: instanceName,
        qrCode,
        qrCodeExpiresAt: new Date(Date.now() + 5 * 60 * 1000),
        status: 'pending',
      },
      create: {
        inboxId: inbox.id,
        userId: inbox.userId,
        instance: instanceName,
        qrCode,
        qrCodeExpiresAt: new Date(Date.now() + 5 * 60 * 1000),
        status: 'pending',
      },
    });
  }

  async updateWhatsAppConnectionState(instanceName: string, state: string) {
    const inbox = await prisma.socialInbox.findFirst({
      where: { name: instanceName, platform: 'whatsapp' },
    });
    if (!inbox) return;

    const statusMap: Record<string, string> = {
      open: 'connected',
      connecting: 'pending',
      close: 'disconnected',
      disconnected: 'disconnected',
      QRCODE: 'pending',
    };

    const newStatus = statusMap[state] || 'pending';

    await prisma.whatsAppSession.updateMany({
      where: { inboxId: inbox.id },
      data: {
        status: newStatus,
        ...(newStatus === 'connected' ? { lastConnectedAt: new Date() } : {}),
      } as any,
    });

    await prisma.socialInbox.update({
      where: { id: inbox.id },
      data: {
        qrCodeUrl: state === 'QRCODE' ? undefined : null,
      },
    });

    // Auto-create a default AI reply rule on first connection
    if (newStatus === 'connected') {
      const existingRule = await prisma.aiReplyRule.findFirst({
        where: { userId: inbox.userId, platform: 'whatsapp', triggerType: 'all' },
      });
      if (!existingRule) {
        await prisma.aiReplyRule.create({
          data: {
            userId: inbox.userId,
            platform: 'whatsapp',
            triggerType: 'all',
            useAi: true,
            isActive: true,
            priority: 100,
            responseTemplate: 'شكراً لتواصلك معنا! سنقوم بالرد عليك في أقرب وقت ممكن.',
          },
        });
        logger.info(`Auto-created default AI reply rule for WhatsApp user ${inbox.userId}`);
      }
    }
  }

  async receiveEvolutionMessage(data: {
    instance: string;
    remoteJid: string;
    fromMe: boolean;
    text: string;
    mediaUrl?: string;
    pushName: string;
    messageId: string;
    messageTimestamp?: string;
  }) {
    if (data.fromMe) return;

    const inbox = await prisma.socialInbox.findFirst({
      where: { name: data.instance, platform: 'whatsapp' },
    });
    if (!inbox) {
      logger.warn(`No inbox found for Evolution instance: ${data.instance}`);
      return;
    }

    const phoneNumber = data.remoteJid.split('@')[0];
    const existingMessage = data.messageId
      ? await prisma.socialMessage.findFirst({ where: { platformMessageId: data.messageId } as any })
      : null;

    if (existingMessage) return;

    const message = await prisma.socialMessage.create({
      data: {
        inboxId: inbox.id,
        userId: inbox.userId,
        platform: 'whatsapp',
        direction: 'inbound',
        status: 'unread',
        senderName: data.pushName || phoneNumber || 'Unknown',
        senderId: data.remoteJid,
        phoneNumber,
        messageText: data.text || '',
        mediaUrl: data.mediaUrl || null,
        platformMessageId: data.messageId,
        metadata: JSON.stringify({
          remoteJid: data.remoteJid,
          messageTimestamp: data.messageTimestamp,
        }),
      } as any,
    });

    await this.checkAutoReply(inbox.userId, message, 'whatsapp');
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
        where: { platformMessageId: lastMessage.id } as any,
      });

      const data: any = {
        inboxId: inbox.id,
        userId,
        platform: inbox.platform,
        direction: lastMessage.from?.id === sender?.id ? 'inbound' : 'outbound' as const,
        status: (conversation.unread_count || 0) > 0 ? 'unread' as const : 'read' as const,
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
          } as any,
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
        where: { platformMessageId: msg.id } as any,
      });
      if (existing) {
        await prisma.socialMessage.update({
          where: { id: existing.id },
          data: { messageText: msg.message || '' } as any,
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
          } as any,
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
    if (!evolutionApi.isEnabled()) {
      return { message: 'Evolution API not configured' };
    }

    try {
      const chats = await evolutionApi.fetchChats(inbox.name);
      let count = 0;

      if (Array.isArray(chats)) {
        for (const chat of chats.slice(0, 10)) {
          const remoteJid = chat.jid || chat.id;
          if (!remoteJid) continue;

          const messages = await evolutionApi.fetchMessages(inbox.name, remoteJid, 1, 20);
          if (messages?.length) {
            for (const msg of messages.slice(0, 5)) {
              const key = msg.key || {};
              const existing = key.id
                ? await prisma.socialMessage.findFirst({ where: { platformMessageId: key.id } as any })
                : null;
              if (existing) continue;

              const messageContent = msg.message?.conversation || msg.message?.extendedTextMessage?.text || '';
              const phone = key.remoteJid?.split('@')[0] || '';

              await prisma.socialMessage.create({
                data: {
                  inboxId: inbox.id,
                  userId,
                  platform: 'whatsapp',
                  direction: key.fromMe ? 'outbound' : 'inbound',
                  status: 'read',
                  senderName: key.fromMe ? 'أنت' : phone || 'Unknown',
                  senderId: key.remoteJid,
                  phoneNumber: phone,
                  messageText: messageContent,
                  platformMessageId: key.id,
                  metadata: JSON.stringify({ synced: true }),
                } as any,
              });
              count++;
            }
          }
        }
      }

      await prisma.socialInbox.update({
        where: { id: inbox.id },
        data: { lastSyncedAt: new Date() },
      });

      return { message: `Synced ${count} WhatsApp messages` };
    } catch (error: any) {
      logger.error('WhatsApp sync failed', { error: error.message });
      const state = await evolutionApi.getConnectionState(inbox.name ?? undefined);
      return { message: `WhatsApp state: ${state?.state || 'unknown'}`, state: state?.state };
    }
  }

  // ── Webhook ──────────────────────────────────────────
  async handleWebhook(inboxId: string, payload: any) {
    const inbox = await prisma.socialInbox.findUnique({
      where: { id: inboxId },
    });
    if (!inbox) throw ApiError.notFound('صندوق الرسائل غير موجود');

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
      } as any,
    });

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
      text: message.conversation || message.extendedTextMessage?.text || message.caption || message.imageMessage?.caption || message.videoMessage?.caption,
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
          } as any,
        });

        await prisma.socialMessage.update({
          where: { id: message.id },
          data: {
            status: 'replied',
            repliedAt: new Date(),
            aiReplyText: replyText,
            replyFromAi: true,
          } as any,
        });

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

    try {
      const reply = await generateAI(prompt);
      if (reply && !reply.includes('AI service unavailable')) {
        return reply;
      }
    } catch (error: any) {
      logger.error('generateAiReply failed', { error: error.message });
    }
    return rule.responseTemplate || `شكراً لتواصلك مع MARKETRON! تم استلام رسالتك: "${message.messageText}". سيتواصل معك فريقنا قريباً.`;
  }

  private generateWebhookToken(): string {
    return `whk_${Math.random().toString(36).substring(2, 15)}_${Date.now()}`;
  }
}

export const socialInboxService = new SocialInboxService();

