import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth';
import { socialInboxService } from '../services/socialInbox.service';
import { validate } from '../middleware/validate';
import { z } from 'zod';
import logger from '../utils/logger';

const router = Router();

const createInboxSchema = z.object({
  name: z.string().min(1, 'اسم الصندوق مطلوب'),
  platform: z.enum([
    'whatsapp',
    'messenger',
    'instagram',
    'facebook',
    'tiktok',
    'snapchat',
    'telegram',
    'twitter',
  ]),
  phoneNumber: z.string().optional(),
  platformAccountId: z.string().optional(),
});

const sendReplySchema = z.object({
  text: z.string().min(1, 'نص الرد مطلوب'),
});

router.get('/inboxes', authenticate, async (req: Request, res: Response) => {
  try {
    const inboxes = await socialInboxService.listInboxes(req.user!.userId);
    res.json({ success: true, data: inboxes });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'فشل جلب الصناديق' });
  }
});

router.post('/inboxes', authenticate, validate(createInboxSchema), async (req: Request, res: Response) => {
  try {
    const inbox = await socialInboxService.createInbox(req.user!.userId, req.body);
    res.status(201).json({ success: true, data: inbox });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'فشل إنشاء الصندوق' });
  }
});

router.get('/inboxes/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const inbox = await socialInboxService.getInbox(req.user!.userId, req.params.id);
    res.json({ success: true, data: inbox });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'فشل جلب الصندوق' });
  }
});

router.delete('/inboxes/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const result = await socialInboxService.deleteInbox(req.user!.userId, req.params.id);
    res.json({ success: true, ...result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'فشل حذف الصندوق' });
  }
});

router.post('/inboxes/:id/sync', authenticate, async (req: Request, res: Response) => {
  try {
    const result = await socialInboxService.syncInbox(req.user!.userId, req.params.id);
    res.json({ success: true, ...result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'فشلت المزامنة' });
  }
});

router.get('/messages', authenticate, async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const messages = await socialInboxService.listMessages(req.user!.userId, {
      inboxId: req.query.inboxId as string,
      platform: req.query.platform as string,
      status: req.query.status as string,
      page,
      limit,
    });
    res.json({ success: true, ...messages });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'فشل جلب الرسائل' });
  }
});

router.patch('/messages/:id/read', authenticate, async (req: Request, res: Response) => {
  try {
    const result = await socialInboxService.markAsRead(req.user!.userId, req.params.id);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'فشل تحديث الرسالة' });
  }
});

router.post('/messages/read-all', authenticate, async (req: Request, res: Response) => {
  try {
    const result = await socialInboxService.markAllAsRead(req.user!.userId, req.body.inboxId);
    res.json({ success: true, ...result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'فشل تحديث الكل' });
  }
});

router.post('/messages/:id/reply', authenticate, validate(sendReplySchema), async (req: Request, res: Response) => {
  try {
    const reply = await socialInboxService.sendReply(req.user!.userId, req.params.id, req.body.text);
    res.json({ success: true, data: reply });
  } catch (error: any) {
    const status = error.statusCode || 500;
    res.status(status).json({ success: false, error: error.message || 'فشل إرسال الرد' });
  }
});

router.post('/whatsapp/:inboxId/qr', authenticate, async (req: Request, res: Response) => {
  try {
    const result = await socialInboxService.generateWhatsAppQR(req.user!.userId, req.params.inboxId);
    res.json({ success: true, ...result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'فشل إنشاء QR code' });
  }
});

router.get('/whatsapp/:inboxId/status', authenticate, async (req: Request, res: Response) => {
  try {
    const result = await socialInboxService.getWhatsAppStatus(req.user!.userId, req.params.inboxId);
    res.json({ success: true, data: result });
  } catch (error: any) {
    const status = error.statusCode || 500;
    res.status(status).json({ success: false, error: error.message || 'فشل جلب الحالة' });
  }
});

// ── Generic webhook (custom per-inbox) ────────────────
router.post('/webhook/:inboxId', async (req: Request, res: Response) => {
  try {
    const result = await socialInboxService.handleWebhook(req.params.inboxId, req.body);
    res.json({ success: true, ...result });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// ── Evolution API global webhook receiver ─────────────
router.post('/webhook/evolution', async (req: Request, res: Response) => {
  try {
    const payload = req.body;
    const event = payload.event;
    const instance = payload.instance;
    const data = payload.data;

    logger.info(`Evolution webhook received: event=${event}, instance=${instance}`);

    if (event === 'qrcode.updated' || event === 'QRCODE_UPDATED') {
      const qrCode = data?.qrcode?.code || data?.qrcode?.base64;
      if (qrCode && instance) {
        await socialInboxService.updateWhatsAppQR(instance, qrCode);
      }
    }

    if (event === 'messages.upsert' || event === 'MESSAGES_UPSERT') {
      if (instance && data) {
        const key = data.key || {};
        const remoteJid = key.remoteJid || '';
        const message = data.message || {};
        const messageType = data.messageType || 'conversation';
        const pushName = data.pushName || '';

        let text = '';
        if (message.conversation) text = message.conversation;
        else if (message.extendedTextMessage?.text) text = message.extendedTextMessage.text;
        else if (message.imageMessage?.caption) text = message.imageMessage.caption;
        else if (message.videoMessage?.caption) text = message.videoMessage.caption;

        const mediaUrl =
          message.imageMessage?.url ||
          message.videoMessage?.url ||
          message.audioMessage?.url ||
          message.documentMessage?.url;

        await socialInboxService.receiveEvolutionMessage({
          instance,
          remoteJid,
          fromMe: key.fromMe || false,
          text,
          mediaUrl,
          pushName,
          messageId: key.id,
          messageTimestamp: data.messageTimestamp,
        });
      }
    }

    if (event === 'connection.update' || event === 'CONNECTION_UPDATE') {
      const state = data?.state;
      if (state && instance) {
        await socialInboxService.updateWhatsAppConnectionState(instance, state);
      }
    }

    res.json({ success: true });
  } catch (error: any) {
    logger.error('Evolution webhook processing error', { error: error.message });
    res.status(200).json({ success: true });
  }
});

router.get('/webhook/meta', async (req: Request, res: Response) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === process.env.FACEBOOK_WEBHOOK_VERIFY_TOKEN) {
    logger.info('Meta webhook verified');
    res.status(200).send(challenge);
  } else {
    res.status(403).json({ success: false, error: 'Verification failed' });
  }
});

router.post('/ai-reply', authenticate, async (req: Request, res: Response) => {
  const { messageText, tone = 'professional' } = req.body;
  if (!messageText) {
    return res.status(400).json({ success: false, error: 'messageText مطلوب' });
  }

  const { generateAI } = await import('../integrations/openai');
  try {
    const suggestion = await generateAI(
      `أنت مندوب خدمة عملاء عربي لـ MARKETRON. اكتب رداً قصيراً ومهذباً (${tone}) على الرسالة التالية:\n"${messageText}"`
    );
    return res.json({ success: true, data: { suggestion } });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/integrations/status', async (_req: Request, res: Response) => {
  try {
    const { evolutionApi } = await import('../integrations/evolutionApi');
    const { metaGraph } = await import('../integrations/metaGraph');
    const { OPENAI_API_KEY } = await import('../config');

    res.json({
      success: true,
      data: {
        whatsapp: {
          provider: 'Evolution API',
          configured: evolutionApi.isEnabled(),
          config: evolutionApi.getConfig(),
        },
        meta: {
          provider: 'Meta Graph API (Facebook / Messenger / Instagram)',
          configured: metaGraph.isEnabled(),
        },
        openai: {
          provider: 'OpenAI',
          configured: !!OPENAI_API_KEY,
        },
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'فشل جلب حالة التكاملات' });
  }
});

export default router;
