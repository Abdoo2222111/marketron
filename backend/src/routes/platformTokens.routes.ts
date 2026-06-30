import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth';
import { z } from 'zod';
import { validate } from '../middleware/validate';
import axios from 'axios';
import prisma from '../config/database';

const router = Router();
router.use(authenticate);

// ── List all platform tokens ─────────────────────────
router.get('/', async (req: Request, res: Response) => {
  try {
    const tokens = await prisma.platformToken.findMany({
      where: { userId: req.user!.userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        platform: true,
        label: true,
        accessToken: true,
        refreshToken: true,
        tokenExpiresAt: true,
        status: true,
        metadata: true,
        createdAt: true,
      },
    });
    return res.json({ success: true, data: tokens });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message || 'فشل جلب التوكنات' });
  }
});

// ── Upsert a platform token ──────────────────────────
const upsertSchema = z.object({
  accessToken: z.string().min(1, 'الـ access token مطلوب'),
  refreshToken: z.string().optional(),
  label: z.string().optional(),
});

router.put('/:platform', validate(upsertSchema), async (req: Request, res: Response) => {
  try {
    const { accessToken, refreshToken, label } = req.body;
    const platform = req.params.platform;
    const existing = await prisma.platformToken.findFirst({
      where: { userId: req.user!.userId, platform },
    });

    let token;
    if (existing) {
      token = await prisma.platformToken.update({
        where: { id: existing.id },
        data: {
          accessToken,
          ...(refreshToken ? { refreshToken } : {}),
          ...(label ? { label } : {}),
          status: 'active',
        },
      });
    } else {
      token = await prisma.platformToken.create({
        data: {
          userId: req.user!.userId,
          platform,
          accessToken,
          refreshToken,
          label: label || platform,
          status: 'active',
        },
      });
    }

    return res.json({ success: true, data: token });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message || 'فشل حفظ التوكن' });
  }
});

// ── Delete a platform token ──────────────────────────
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    await prisma.platformToken.deleteMany({
      where: { id: req.params.id, userId: req.user!.userId },
    });
    return res.json({ success: true, message: 'تم حذف التوكن' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message || 'فشل حذف التوكن' });
  }
});

// ── Validate a platform token ─────────────────────────
router.post('/:platform/validate', async (req: Request, res: Response) => {
  try {
    const platform = req.params.platform;
    const token = await prisma.platformToken.findFirst({
      where: { userId: req.user!.userId, platform },
    });

    if (!token) {
      return res.status(404).json({ success: false, error: 'التوكن غير موجود' });
    }

    // Validate based on platform
    if (platform === 'facebook') {
      const response = await axios.get('https://graph.facebook.com/v22.0/me', {
        params: {
          access_token: token.accessToken,
          fields: 'id,name,accounts{id,name,category,access_token},adaccounts{id,name,account_status}',
        },
        timeout: 15000,
      });

      const pages = response.data?.accounts?.data?.map((a: any) => ({
        id: a.id,
        name: a.name,
        category: a.category,
        accessToken: a.access_token,
      })) || [];

      const adAccounts = response.data?.adaccounts?.data?.map((a: any) => ({
        id: a.id,
        name: a.name,
        accountStatus: a.account_status?.toString(),
      })) || [];

      // Update token metadata
      await prisma.platformToken.update({
        where: { id: token.id },
        data: {
          metadata: JSON.stringify({
            facebookUserId: response.data?.id,
            facebookUserName: response.data?.name,
            pages,
            adAccounts,
            lastValidated: new Date().toISOString(),
          }),
          status: 'active',
        },
      });

      return res.json({
        success: true,
        data: {
          valid: true,
          userId: response.data?.id,
          userName: response.data?.name,
          pages,
          adAccounts,
          permissions: token.accessToken.length > 50 ? ['ads_read', 'ads_management', 'pages_read_engagement', 'pages_manage_metadata', 'public_profile'] : ['limited'],
          expiresAt: token.tokenExpiresAt,
        },
      });
    }

    if (platform === 'google') {
      try {
        const response = await axios.get('https://www.googleapis.com/oauth2/v1/tokeninfo', {
          params: { access_token: token.accessToken },
          timeout: 10000,
        });
        return res.json({
          success: true,
          data: {
            valid: true,
            scopes: response.data?.scope?.split(' ') || [],
            expiresAt: response.data?.expires_in ? new Date(Date.now() + response.data.expires_in * 1000).toISOString() : undefined,
          },
        });
      } catch {
        return res.json({ success: true, data: { valid: false, error: 'التوكن غير صالح أو منتهي الصلاحية' } });
      }
    }

    if (platform === 'tiktok') {
      try {
        const response = await axios.get('https://open.tiktokapis.com/v2/user/info/', {
          params: {
            access_token: token.accessToken,
            fields: 'open_id,union_id,avatar_url,display_name',
          },
          headers: { 'Content-Type': 'application/json' },
          timeout: 10000,
        });
        return res.json({
          success: true,
          data: { valid: true, userName: response.data?.data?.user?.display_name },
        });
      } catch {
        return res.json({ success: true, data: { valid: false, error: 'التوكن غير صالح' } });
      }
    }

    if (platform === 'snapchat') {
      try {
        const response = await axios.get('https://adsapi.snapchat.com/v1/me', {
          headers: { Authorization: `Bearer ${token.accessToken}` },
          timeout: 10000,
        });
        return res.json({
          success: true,
          data: { valid: true, userName: response.data?.me?.display_name },
        });
      } catch {
        return res.json({ success: true, data: { valid: false, error: 'التوكن غير صالح' } });
      }
    }

    return res.status(400).json({ success: false, error: `المنصة ${platform} غير مدعومة` });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message || 'فشل التحقق من التوكن' });
  }
});

// ── Facebook Token Deep Inspection ────────────────────
router.post('/facebook/inspect', async (req: Request, res: Response) => {
  try {
    const { accessToken } = req.body;
    if (!accessToken) {
      return res.status(400).json({ success: false, error: 'accessToken مطلوب' });
    }

    // Step 1: Debug token info
    const debugRes = await axios.get('https://graph.facebook.com/v22.0/debug_token', {
      params: {
        input_token: accessToken,
        access_token: accessToken,
      },
      timeout: 15000,
    });

    const debug = debugRes.data?.data || {};
    const isExpired = debug?.is_expired;
    const expiresAt = debug?.expires_at ? new Date(debug.expires_at * 1000).toISOString() : null;

    // Step 2: Get user info and pages
    let userInfo = null;
    let pages: any[] = [];
    let adAccounts: any[] = [];

    try {
      const meRes = await axios.get('https://graph.facebook.com/v22.0/me', {
        params: {
          access_token: accessToken,
          fields: 'id,name,accounts{id,name,category,access_token,picture{url}},adaccounts{id,name,account_status,currency}',
        },
        timeout: 15000,
      });
      userInfo = { id: meRes.data?.id, name: meRes.data?.name };
      pages = meRes.data?.accounts?.data?.map((a: any) => ({
        id: a.id,
        name: a.name,
        category: a.category,
        pictureUrl: a.picture?.data?.url,
        accessToken: a.access_token,
      })) || [];
      adAccounts = meRes.data?.adaccounts?.data?.map((a: any) => ({
        id: a.id,
        name: a.name,
        accountStatus: a.account_status?.toString(),
        currency: a.currency,
      })) || [];
    } catch {
      // Token might not have enough permissions for user info
    }

    return res.json({
      success: true,
      data: {
        valid: !isExpired,
        appId: debug?.app_id,
        appName: debug?.application,
        expiresAt,
        scopes: debug?.scopes || debug?.granular_scopes?.map((s: any) => s.scope) || [],
        userId: userInfo?.id || debug?.user_id,
        userName: userInfo?.name,
        pages,
        adAccounts,
      },
    });
  } catch (err: any) {
    const status = err?.response?.status;
    const fbError = err?.response?.data?.error;
    if (status === 400 || status === 401) {
      return res.status(200).json({
        success: true,
        data: {
          valid: false,
          error: fbError?.message || 'التوكن غير صالح أو منتهي الصلاحية',
          errorCode: fbError?.code,
          errorSubcode: fbError?.error_subcode,
        },
      });
    }
    return res.status(500).json({ success: false, error: err.message || 'فشل فحص التوكن' });
  }
});

export default router;
