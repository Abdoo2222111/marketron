import prisma from '../config/database';
import { ApiError } from '../utils/apiError';
import { config } from '../config';
import { metaGraph } from '../integrations/metaGraph';
import { evolutionApi } from '../integrations/evolutionApi';
import logger from '../utils/logger';

// ============================================================
// Platform Connection Service
// يدير ربط وفصل كل المنصات (Facebook, WhatsApp, Instagram, etc)
// ============================================================

export class PlatformService {
  // ── List all connections for a user ─────────────────────
  async listConnections(userId: string) {
    const connections = await prisma.platformConnection.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    // Return with platform-specific status
    return connections.map(c => ({
      ...c,
      // Mask token for security
      accessToken: c.accessToken ? '••••••' + c.accessToken.slice(-6) : '',
    }));
  }

  // ── Get a specific connection ───────────────────────────
  async getConnection(userId: string, platform: string) {
    const conn = await prisma.platformConnection.findFirst({
      where: { userId, platform },
    });
    return conn;
  }

  async getConnectionById(userId: string, id: string) {
    const conn = await prisma.platformConnection.findFirst({
      where: { id, userId },
    });
    return conn;
  }

  // ── Connect Facebook (OAuth or token) ──────────────────
  async connectFacebook(userId: string, data: { accessToken: string; pageId?: string }) {
    let pageInfo: any = { id: data.pageId || 'me', name: 'Facebook Page' };

    // Try to verify the token, but don't block if it's expired (user can refresh later)
    try {
      const axios = require('axios');
      const pageId = data.pageId || 'me';
      const res = await axios.get(`https://graph.facebook.com/${config.meta.apiVersion}/${pageId}`, {
        params: {
          fields: 'id,name,access_token',
          access_token: data.accessToken,
        },
      });
      pageInfo = res.data;
    } catch (error: any) {
      logger.warn('Facebook token verification failed, storing anyway', { error: error.message });
      // Store the connection anyway — user can update token later
    }

    // Delete existing Facebook connection
    await prisma.platformConnection.deleteMany({
      where: { userId, platform: 'facebook' },
    });

    const connection = await prisma.platformConnection.create({
      data: {
        userId,
        platform: 'facebook',
        accessToken: data.accessToken,
        platformAccountId: pageInfo.id,
        platformAccountName: pageInfo.name,
        status: 'active',
      },
    });

    logger.info(`Facebook connected for user ${userId}: ${pageInfo.name}`);
    return {
      id: connection.id,
      platform: 'facebook',
      platformAccountId: pageInfo.id,
      platformAccountName: pageInfo.name,
      status: 'active',
    };
  }

  // ── Connect Instagram ───────────────────────────────────
  async connectInstagram(userId: string, data: { accessToken: string; accountId?: string }) {
    await prisma.platformConnection.deleteMany({
      where: { userId, platform: 'instagram' },
    });

    const connection = await prisma.platformConnection.create({
      data: {
        userId,
        platform: 'instagram',
        accessToken: data.accessToken,
        platformAccountId: data.accountId || 'me',
        platformAccountName: 'Instagram Account',
        status: 'active',
      },
    });

    return {
      id: connection.id,
      platform: 'instagram',
      status: 'active',
    };
  }

  // ── Connect WhatsApp (Evolution API) ────────────────────
  async connectWhatsApp(userId: string, data: { instanceName: string; phoneNumber?: string }) {
    if (!evolutionApi.isEnabled()) {
      throw ApiError.badRequest('Evolution API غير مُهيأ. ضع WHATSAPP_EVOLUTION_API_URL و WHATSAPP_EVOLUTION_API_KEY في .env');
    }

    // Try to create instance on Evolution API
    try {
      await evolutionApi.createInstance(data.instanceName);
    } catch (error: any) {
      // Instance may already exist, try to connect
      logger.info(`Evolution instance ${data.instanceName} may already exist, trying to connect`);
    }

    // Get QR code
    const connectData = await evolutionApi.connectInstance(data.instanceName);
    const qrCode = connectData?.qrcode || connectData?.base64 || null;

    await prisma.platformConnection.deleteMany({
      where: { userId, platform: 'whatsapp' },
    });

    const connection = await prisma.platformConnection.create({
      data: {
        userId,
        platform: 'whatsapp',
        accessToken: data.instanceName, // Store instance name as token
        platformAccountId: data.instanceName,
        platformAccountName: data.phoneNumber || data.instanceName,
        status: qrCode ? 'pending' : 'active',
      },
    });

    return {
      id: connection.id,
      platform: 'whatsapp',
      instanceName: data.instanceName,
      qrCode,
      status: qrCode ? 'pending' : 'active',
    };
  }

  // ── Connect Telegram ────────────────────────────────────
  async connectTelegram(userId: string, data: { botToken: string }) {
    // Verify bot token
    let botInfo: any = null;
    try {
      const axios = require('axios');
      const res = await axios.get(`https://api.telegram.org/bot${data.botToken}/getMe`);
      if (!res.data?.ok) throw new Error('Invalid bot token');
      botInfo = res.data.result;
    } catch (error: any) {
      throw ApiError.badRequest('رمز البوت غير صالح');
    }

    await prisma.platformConnection.deleteMany({
      where: { userId, platform: 'telegram' },
    });

    const connection = await prisma.platformConnection.create({
      data: {
        userId,
        platform: 'telegram',
        accessToken: data.botToken,
        platformAccountId: String(botInfo.id),
        platformAccountName: botInfo.username,
        status: 'active',
      },
    });

    return {
      id: connection.id,
      platform: 'telegram',
      platformAccountName: `@${botInfo.username}`,
      status: 'active',
    };
  }

  // ── Disconnect a platform ───────────────────────────────
  async disconnect(userId: string, platform: string) {
    const conn = await prisma.platformConnection.findFirst({
      where: { userId, platform },
    });
    if (!conn) throw ApiError.notFound('المنصة غير مربوطة');

    // For WhatsApp, logout from Evolution API
    if (platform === 'whatsapp' && evolutionApi.isEnabled()) {
      try {
        await evolutionApi.logout(conn.platformAccountId);
      } catch (error: any) {
        logger.warn('Evolution logout failed', { error: error.message });
      }
    }

    await prisma.platformConnection.delete({
      where: { id: conn.id },
    });

    return { message: `تم فصل ${platform} بنجاح` };
  }

  // ── Get WhatsApp QR code ────────────────────────────────
  async getWhatsAppQR(userId: string) {
    const conn = await prisma.platformConnection.findFirst({
      where: { userId, platform: 'whatsapp' },
    });
    if (!conn) throw ApiError.notFound('واتساب غير مربوط');

    if (!evolutionApi.isEnabled()) {
      throw ApiError.badRequest('Evolution API غير مُهيأ');
    }

    const connectData = await evolutionApi.connectInstance(conn.platformAccountId);
    const qrCode = connectData?.qrcode || connectData?.base64 || null;
    const state = await evolutionApi.getConnectionState(conn.platformAccountId);

    // Update status
    const status = state?.state === 'CONNECTED' ? 'active' : 'pending';
    await prisma.platformConnection.update({
      where: { id: conn.id },
      data: { status },
    });

    return {
      qrCode,
      status: state?.state || 'DISCONNECTED',
      instanceName: conn.platformAccountId,
    };
  }

  // ── Get Facebook pages ──────────────────────────────────
  async getFacebookPages(userId: string) {
    const conn = await prisma.platformConnection.findFirst({
      where: { userId, platform: 'facebook' },
    });
    if (!conn) throw ApiError.notFound('فيسبوك غير مربوط');

    try {
      const axios = require('axios');
      const res = await axios.get(`https://graph.facebook.com/${config.meta.apiVersion}/me/accounts`, {
        params: {
          fields: 'id,name,access_token,category',
          access_token: conn.accessToken,
        },
      });
      return res.data.data || [];
    } catch (error: any) {
      logger.error('Failed to fetch Facebook pages', { error: error.message });
      throw ApiError.badRequest('فشل جلب صفحات فيسبوك');
    }
  }

  // ── Sync messages from a platform ───────────────────────
  async syncMessages(userId: string, platform: string) {
    const conn = await prisma.platformConnection.findFirst({
      where: { userId, platform },
    });
    if (!conn) throw ApiError.notFound(`${platform} غير مربوط`);

    switch (platform) {
      case 'facebook':
      case 'messenger':
        return this.syncFacebookMessages(userId, conn);
      case 'instagram':
        return this.syncInstagramMessages(userId, conn);
      case 'whatsapp':
        return this.syncWhatsAppMessages(userId, conn);
      default:
        return { message: 'المزامنة غير متاحة لهذه المنصة' };
    }
  }

  private async syncFacebookMessages(userId: string, conn: any) {
    const axios = require('axios');
    try {
      const res = await axios.get(
        `https://graph.facebook.com/${config.meta.apiVersion}/${conn.platformAccountId}/conversations`,
        {
          params: {
            fields: 'id,link,updated_time,message_count,unread_count,senders,messages{id,created_time,from,to,message}',
            access_token: conn.accessToken,
            limit: 50,
          },
        }
      );

      const conversations = res.data.data || [];
      let syncedCount = 0;

      // Find or create inbox
      let inbox = await prisma.socialInbox.findFirst({
        where: { userId, platform: 'facebook', platformAccountId: conn.platformAccountId },
      });
      if (!inbox) {
        inbox = await prisma.socialInbox.create({
          data: {
            userId,
            name: conn.platformAccountName || 'Facebook',
            platform: 'facebook',
            platformAccountId: conn.platformAccountId,
            webhookToken: `whk_${Math.random().toString(36).substring(2, 15)}_${Date.now()}`,
          },
        });
      }

      for (const conv of conversations) {
        const messages = conv.messages?.data || [];
        for (const msg of messages) {
          const existing = await prisma.socialMessage.findFirst({
            where: { platformMessageId: msg.id },
          });
          if (!existing) {
            const isInbound = msg.from?.id !== conn.platformAccountId;
            await prisma.socialMessage.create({
              data: {
                inboxId: inbox.id,
                userId,
                platform: 'facebook',
                direction: isInbound ? 'inbound' : 'outbound',
                status: isInbound ? 'unread' : 'read',
                senderName: msg.from?.name || 'Unknown',
                senderId: msg.from?.id,
                messageText: msg.message || '',
                platformMessageId: msg.id,
                metadata: JSON.stringify({ conversationId: conv.id }),
              },
            });
            syncedCount++;
          }
        }
      }

      await prisma.socialInbox.update({
        where: { id: inbox.id },
        data: { lastSyncedAt: new Date() },
      });

      return { message: `تمت مزامنة ${syncedCount} رسالة`, count: syncedCount };
    } catch (error: any) {
      logger.error('Facebook sync failed', { error: error.message });
      throw ApiError.badRequest(`فشل المزامنة: ${error.message}`);
    }
  }

  private async syncInstagramMessages(userId: string, conn: any) {
    return { message: 'مزامنة إنستجرام ستكون متاحة قريباً' };
  }

  private async syncWhatsAppMessages(userId: string, conn: any) {
    if (!evolutionApi.isEnabled()) {
      return { message: 'Evolution API غير مُهيأ' };
    }
    const state = await evolutionApi.getConnectionState(conn.platformAccountId);
    return { message: `حالة الاتصال: ${state?.state || 'غير معروف'}` };
  }

  // ── Send a message to a platform ────────────────────────
  async sendMessage(userId: string, platform: string, recipientId: string, text: string) {
    const conn = await prisma.platformConnection.findFirst({
      where: { userId, platform },
    });
    if (!conn) throw ApiError.notFound(`${platform} غير مربوط`);

    const axios = require('axios');

    switch (platform) {
      case 'facebook':
      case 'messenger': {
        const res = await axios.post(
          `https://graph.facebook.com/${config.meta.apiVersion}/${conn.platformAccountId}/messages`,
          {
            recipient: { id: recipientId },
            messaging_type: 'RESPONSE',
            message: { text },
            access_token: conn.accessToken,
          }
        );
        return { success: true, messageId: res.data.message_id };
      }

      case 'whatsapp': {
        if (!evolutionApi.isEnabled()) {
          throw ApiError.badRequest('Evolution API غير مُهيأ');
        }
        await evolutionApi.sendText(conn.platformAccountId, recipientId, text);
        return { success: true };
      }

      case 'telegram': {
        const res = await axios.post(
          `https://api.telegram.org/bot${conn.accessToken}/sendMessage`,
          {
            chat_id: recipientId,
            text,
          }
        );
        return { success: true, messageId: res.data.result?.message_id };
      }

      default:
        throw ApiError.badRequest(`إرسال الرسائل غير مدعوم لـ ${platform}`);
    }
  }
}

export const platformService = new PlatformService();
