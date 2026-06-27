// @ts-nocheck
import prisma from '../config/database';
import { ApiError } from '../utils/apiError';
import { config } from '../config';
import { metaGraph } from '../integrations/metaGraph';
import { evolutionApi } from '../integrations/evolutionApi';
import logger from '../utils/logger';

// ============================================================
// Platform Connection Service
// يدير ربط وفصل كل المنصات (Facebook, Instagram, WhatsApp, etc)
// ============================================================

const FB_TOKEN_EXPIRY_MS = 60 * 24 * 60 * 60 * 1000; // 60 days for long-lived tokens

function getFacebookError(error: any): string | null {
  const status = error?.response?.status;
  const code = error?.response?.data?.error?.code;
  const message = error?.response?.data?.error?.message || error.message;
  if (status === 403) {
    if (code === 190) return `انتهت صلاحية رمز الوصول. اربط فيسبوك مجدداً.`;
    if (code === 10) return `الرمز لا يملك صلاحية pages_messaging.`;
    return `خطأ في فيسبوك: ${message}`;
  }
  return null;
}

export class PlatformService {
  // ── List all connections for a user ─────────────────────
  async listConnections(userId: string) {
    const connections = await prisma.platformConnection.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return connections.map(c => {
      const isExpired = c.tokenExpiresAt && new Date() > c.tokenExpiresAt;
      return {
        id: c.id,
        platform: c.platform,
        platformAccountId: c.platformAccountId,
        platformAccountName: c.platformAccountName,
        status: isExpired ? 'expired' : c.status,
        createdAt: c.createdAt,
        tokenExpiresAt: c.tokenExpiresAt,
      };
    });
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

  // ── Verify a Facebook token with Graph API ──────────────
  private async verifyFacebookToken(token: string, pageId?: string) {
    const axios = require('axios');
    const pid = pageId || 'me';
    const res = await axios.get(`https://graph.facebook.com/${config.meta.apiVersion}/${pid}`, {
      params: { fields: 'id,name,access_token', access_token: token },
    });
    return res.data;
  }

  // ── Connect Facebook (OAuth or token) ──────────────────
  async connectFacebook(userId: string, data: { accessToken: string; pageId?: string }) {
    let pageInfo: any = { id: data.pageId || 'me', name: 'Facebook Page' };
    let verifyError: string | null = null;

    try {
      pageInfo = await this.verifyFacebookToken(data.accessToken, data.pageId);
    } catch (error: any) {
      const fbErr = getFacebookError(error);
      verifyError = fbErr || `تعذر التحقق من الرمز: ${error.message}`;
    }

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
        tokenExpiresAt: new Date(Date.now() + FB_TOKEN_EXPIRY_MS),
        status: verifyError ? 'error' : 'active',
      },
    });

    return {
      id: connection.id,
      platform: 'facebook',
      platformAccountId: pageInfo.id,
      platformAccountName: pageInfo.name,
      status: verifyError ? 'error' : 'active',
      warning: verifyError,
    };
  }

  // ── Connect Instagram ───────────────────────────────────
  async connectInstagram(userId: string, data: { accessToken: string; accountId?: string }) {
    let verifyError: string | null = null;

    try {
      const axios = require('axios');
      const accId = data.accountId || 'me';
      await axios.get(`https://graph.facebook.com/${config.meta.apiVersion}/${accId}`, {
        params: { fields: 'id,name', access_token: data.accessToken },
      });
    } catch (error: any) {
      verifyError = `تعذر التحقق من الرمز: ${error.message}`;
    }

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
        tokenExpiresAt: new Date(Date.now() + FB_TOKEN_EXPIRY_MS),
        status: verifyError ? 'error' : 'active',
      },
    });

    return {
      id: connection.id,
      platform: 'instagram',
      status: verifyError ? 'error' : 'active',
      warning: verifyError,
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

  // ── Refresh a Facebook/Instagram token (exchange short-lived for long-lived) ──
  async refreshFacebookToken(userId: string, platform?: string) {
    const plat = platform || 'facebook';
    const conn = await prisma.platformConnection.findFirst({
      where: { userId, platform: plat },
    });
    if (!conn) throw ApiError.notFound(`${plat} غير مربوط`);

    try {
      const axios = require('axios');
      if (!config.meta.appId || !config.meta.appSecret) {
        throw ApiError.badRequest('META_APP_ID و META_APP_SECRET غير مُهيئين في الخادم');
      }
      const res = await axios.get('https://graph.facebook.com/v22.0/oauth/access_token', {
        params: {
          grant_type: 'fb_exchange_token',
          client_id: config.meta.appId,
          client_secret: config.meta.appSecret,
          fb_exchange_token: conn.accessToken,
        },
      });
      const newToken = res.data.access_token;
      const expiresIn = (res.data.expires_in || 60 * 24 * 60) * 1000;

      await prisma.platformConnection.update({
        where: { id: conn.id },
        data: {
          accessToken: newToken,
          tokenExpiresAt: new Date(Date.now() + expiresIn),
          status: 'active',
        },
      });

      logger.info(`Facebook token refreshed for user ${userId}`);
      return { message: 'تم تحديث رمز فيسبوك بنجاح', expiresAt: new Date(Date.now() + expiresIn) };
    } catch (error: any) {
      logger.error('Facebook token refresh failed', { error: error.message });
      const fbErr = getFacebookError(error);
      throw ApiError.badRequest(fbErr || 'فشل تحديث رمز فيسبوك. اربط الحساب مجدداً.');
    }
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
      const fbErr = getFacebookError(error);
      throw ApiError.badRequest(fbErr || 'فشل جلب صفحات فيسبوك');
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

    // Check token expiry before making API call
    const isExpired = conn.tokenExpiresAt && new Date() > conn.tokenExpiresAt;
    if (isExpired) {
      throw ApiError.badRequest('انتهت صلاحية رمز فيسبوك. استخدم "تحديث الرمز" أو اربط الحساب مجدداً.');
    }

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
      const fbErr = getFacebookError(error);
      throw ApiError.badRequest(fbErr || `فشل المزامنة: ${error.message}`);
    }
  }

  private async syncInstagramMessages(userId: string, conn: any) {
    // Instagram uses the Facebook Page Access Token for the Instagram Business Account
    // We need the Instagram Business Account ID from the connection
    const axios = require('axios');

    try {
      // Try to get Instagram Business Account ID if not stored
      let igAccountId = conn.platformAccountId;
      if (igAccountId === 'me' || !igAccountId) {
        const pagesRes = await axios.get(`https://graph.facebook.com/${config.meta.apiVersion}/me/accounts`, {
          params: { fields: 'id,name,instagram_business_account{id,username}', access_token: conn.accessToken },
        });
        for (const page of pagesRes.data.data || []) {
          if (page.instagram_business_account?.id) {
            igAccountId = page.instagram_business_account.id;
            break;
          }
        }
        if (!igAccountId || igAccountId === 'me') {
          return { message: 'لا يوجد حساب إنستجرام تجاري مرتبط بهذه الصفحة', count: 0 };
        }
      }

      // Fetch conversations
      const res = await axios.get(`https://graph.facebook.com/${config.meta.apiVersion}/${igAccountId}/conversations`, {
        params: {
          fields: 'id,updated_time,messages{id,created_time,from,to,message}',
          access_token: conn.accessToken,
          limit: 50,
        },
      });

      const conversations = res.data.data || [];
      let syncedCount = 0;

      let inbox = await prisma.socialInbox.findFirst({
        where: { userId, platform: 'instagram', platformAccountId: igAccountId },
      });
      if (!inbox) {
        inbox = await prisma.socialInbox.create({
          data: {
            userId,
            name: conn.platformAccountName || 'Instagram',
            platform: 'instagram',
            platformAccountId: igAccountId,
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
            const isInbound = msg.from?.id !== igAccountId;
            await prisma.socialMessage.create({
              data: {
                inboxId: inbox.id,
                userId,
                platform: 'instagram',
                direction: isInbound ? 'inbound' : 'outbound',
                status: isInbound ? 'unread' : 'read',
                senderName: msg.from?.name || 'Unknown',
                senderId: msg.from?.id,
                messageText: msg.message || '',
                platformMessageId: msg.id,
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

      return { message: `تمت مزامنة ${syncedCount} رسالة إنستجرام`, count: syncedCount };
    } catch (error: any) {
      logger.error('Instagram sync failed', { error: error.message });
      const fbErr = getFacebookError(error);
      throw ApiError.badRequest(fbErr || `فشل مزامنة إنستجرام: ${error.message}`);
    }
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
        try {
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
        } catch (error: any) {
          const fbErr = getFacebookError(error);
          throw ApiError.badRequest(fbErr || `فشل إرسال الرسالة: ${error.message}`);
        }
      }

      case 'whatsapp': {
        if (!evolutionApi.isEnabled()) {
          throw ApiError.badRequest('Evolution API غير مُهيأ');
        }
        await evolutionApi.sendText(conn.platformAccountId, recipientId, text);
        return { success: true };
      }

      case 'telegram': {
        try {
          const res = await axios.post(
            `https://api.telegram.org/bot${conn.accessToken}/sendMessage`,
            { chat_id: recipientId, text }
          );
          return { success: true, messageId: res.data.result?.message_id };
        } catch (error: any) {
          throw ApiError.badRequest(`فشل إرسال رسالة تيليجرام: ${error?.response?.data?.description || error.message}`);
        }
      }

      default:
        throw ApiError.badRequest(`إرسال الرسائل غير مدعوم لـ ${platform}`);
    }
  }
}

export const platformService = new PlatformService();

