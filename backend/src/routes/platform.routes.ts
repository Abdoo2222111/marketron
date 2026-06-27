import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth';
import { platformService } from '../services/platform.service';
import { validate } from '../middleware/validate';
import { z } from 'zod';
import { config } from '../config';

const router = Router();
router.use(authenticate);

// ── List all connections ─────────────────────────────────
router.get('/', async (req: Request, res: Response) => {
  try {
    const connections = await platformService.listConnections(req.user!.userId);
    res.json({ success: true, data: connections });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'فشل جلب الاتصالات' });
  }
});

// ── Connect Facebook ─────────────────────────────────────
const connectFacebookSchema = z.object({
  accessToken: z.string().min(1, 'رمز الوصول مطلوب'),
  pageId: z.string().optional(),
});

router.post('/facebook', validate(connectFacebookSchema), async (req: Request, res: Response) => {
  try {
    const result = await platformService.connectFacebook(req.user!.userId, req.body);
    res.json({ success: true, data: result, message: 'تم ربط فيسبوك بنجاح' });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// ── Connect Instagram ────────────────────────────────────
const connectInstagramSchema = z.object({
  accessToken: z.string().min(1),
  accountId: z.string().optional(),
});

router.post('/instagram', validate(connectInstagramSchema), async (req: Request, res: Response) => {
  try {
    const result = await platformService.connectInstagram(req.user!.userId, req.body);
    res.json({ success: true, data: result, message: 'تم ربط إنستجرام بنجاح' });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// ── Connect WhatsApp (Evolution API) ─────────────────────
const connectWhatsAppSchema = z.object({
  instanceName: z.string().min(1, 'اسم الـ instance مطلوب'),
  phoneNumber: z.string().optional(),
});

router.post('/whatsapp', validate(connectWhatsAppSchema), async (req: Request, res: Response) => {
  try {
    const result = await platformService.connectWhatsApp(req.user!.userId, req.body);
    res.json({ success: true, data: result, message: 'تم بدء ربط واتساب - امسح الـ QR code' });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// ── Connect Telegram ─────────────────────────────────────
const connectTelegramSchema = z.object({
  botToken: z.string().min(1, 'رمز البوت مطلوب'),
});

router.post('/telegram', validate(connectTelegramSchema), async (req: Request, res: Response) => {
  try {
    const result = await platformService.connectTelegram(req.user!.userId, req.body);
    res.json({ success: true, data: result, message: 'تم ربط تيليجرام بنجاح' });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// ── Disconnect a platform ────────────────────────────────
router.delete('/:platform', async (req: Request, res: Response) => {
  try {
    const result = await platformService.disconnect(req.user!.userId, req.params.platform);
    res.json({ success: true, ...result });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// ── Get WhatsApp QR code ─────────────────────────────────
router.get('/whatsapp/qr', async (req: Request, res: Response) => {
  try {
    const result = await platformService.getWhatsAppQR(req.user!.userId);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// ── Get Facebook pages ───────────────────────────────────
router.get('/facebook/pages', async (req: Request, res: Response) => {
  try {
    const pages = await platformService.getFacebookPages(req.user!.userId);
    res.json({ success: true, data: pages });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// ── Sync messages from a platform ────────────────────────
router.post('/:platform/sync', async (req: Request, res: Response) => {
  try {
    const result = await platformService.syncMessages(req.user!.userId, req.params.platform);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// ── Refresh platform token ──────────────────────────────
router.post('/:platform/refresh', async (req: Request, res: Response) => {
  try {
    const platform = req.params.platform;
    if (platform === 'facebook' || platform === 'instagram') {
      const result = await platformService.refreshFacebookToken(req.user!.userId, platform);
      res.json({ success: true, data: result });
    } else {
      res.status(400).json({ success: false, error: 'تحديث الرمز غير متاح لهذه المنصة' });
    }
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// ── Send a message ───────────────────────────────────────
router.post('/:platform/send', async (req: Request, res: Response) => {
  const { recipientId, text } = req.body;
  if (!recipientId || !text) {
    res.status(400).json({ success: false, error: 'recipientId و text مطلوبان' });
    return;
  }
  try {
    const result = await platformService.sendMessage(req.user!.userId, req.params.platform, recipientId, text);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// ── Get Facebook OAuth URL ───────────────────────────────
router.get('/facebook/oauth-url', (req: Request, res: Response) => {
  if (!config.meta.appId) {
    res.json({
      success: false,
      error: 'Facebook App ID غير مُهيأ. استخدم رمز الوصول (Page Access Token) بدلاً منه.',
      useTokenInstead: true,
    });
    return;
  }
  const redirectUri = encodeURIComponent(`${config.frontendUrl}/settings/facebook/callback`);
  const scope = encodeURIComponent('pages_messaging,pages_show_list,pages_manage_metadata,email');
  const url = `https://www.facebook.com/${config.meta.apiVersion}/dialog/oauth?client_id=${config.meta.appId}&redirect_uri=${redirectUri}&scope=${scope}&response_type=code`;
  res.json({ success: true, data: { url } });
});

export default router;
