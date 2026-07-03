import { Router, Request, Response } from 'express';
import axios from 'axios';
import { authenticate } from '../middleware/auth';
import { authService } from '../services/auth.service';
import { authController } from '../controllers/auth.controller';
import { creditsService } from '../services/credits.service';
import { config } from '../config';
import prisma from '../config/database';
import { validate } from '../middleware/validate';
import { z } from 'zod';
import logger from '../utils/logger';

const router = Router();

// ── Validation Schemas ─────────────────────────────────
const registerSchema = z.object({
  name: z.string().min(1, 'الاسم مطلوب'),
  email: z.string().email('البريد الإلكتروني غير صحيح'),
  password: z.string().min(6, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'),
  phone: z.string().optional(),
  company: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email('البريد الإلكتروني غير صحيح'),
  password: z.string().min(1, 'كلمة المرور مطلوبة'),
});

// ── Register ────────────────────────────────────────────
router.post('/register', validate(registerSchema), async (req: Request, res: Response) => {
  try {
    const result = await authService.register(req.body);
    res.status(201).json({
      success: true,
      data: {
        user: result.user,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      },
      message: 'تم إنشاء الحساب بنجاح',
    });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message || 'فشل التسجيل' });
  }
});

// ── Login ───────────────────────────────────────────────
router.post('/login', validate(loginSchema), async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    res.json({
      success: true,
      data: {
        user: result.user,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      },
      message: 'تم تسجيل الدخول بنجاح',
    });
  } catch (error: any) {
    res.status(401).json({ success: false, error: error.message || 'فشل تسجيل الدخول' });
  }
});

// ── Refresh Token ───────────────────────────────────────
router.post('/refresh', async (req: Request, res: Response) => {
  const refreshToken = req.cookies?.refreshToken || req.body.refreshToken;
  if (!refreshToken) {
    res.status(401).json({ success: false, error: 'رمز التحديث مطلوب' });
    return;
  }
  try {
    const tokens = await authService.refreshToken(refreshToken);
    res.json({ success: true, data: { accessToken: tokens.accessToken } });
  } catch (error: any) {
    res.status(401).json({ success: false, error: 'رمز التحديث غير صالح' });
  }
});

// ── Get Profile ─────────────────────────────────────────
router.get('/me', authenticate, async (req: Request, res: Response) => {
  try {
    const user = await authService.getProfile(req.user!.userId);
    res.json({ success: true, data: user });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'فشل جلب الملف الشخصي' });
  }
});

// ── Update Profile ──────────────────────────────────────
router.put('/me', authenticate, async (req: Request, res: Response) => {
  try {
    const user = await authService.updateProfile(req.user!.userId, req.body);
    res.json({ success: true, data: user, message: 'تم تحديث الملف الشخصي' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'فشل تحديث الملف الشخصي' });
  }
});

// ── Change Password ─────────────────────────────────────
router.put('/change-password', authenticate, async (req: Request, res: Response) => {
  try {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      res.status(400).json({ success: false, error: 'كلمة المرور الحالية والجديدة مطلوبتان' });
      return;
    }
    const result = await authService.changePassword(req.user!.userId, oldPassword, newPassword);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message || 'فشل تغيير كلمة المرور' });
  }
});

// ── Forgot Password ─────────────────────────────────────
router.post('/forgot-password', async (req: Request, res: Response) => {
  try {
    const result = await authService.forgotPassword(req.body.email);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.json({ success: true, message: 'إذا كان البريد موجوداً، سيتم إرسال رابط إعادة التعيين' });
  }
});

// ── Reset Password ──────────────────────────────────────
router.post('/reset-password', async (req: Request, res: Response) => {
  try {
    const { token, newPassword } = req.body;
    const result = await authService.resetPassword(token, newPassword);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// ── Logout ──────────────────────────────────────────────
router.post('/logout', (req: Request, res: Response) => {
  res.clearCookie('refreshToken');
  res.json({ success: true, message: 'تم تسجيل الخروج بنجاح' });
});

// ══════════════════════════════════════════════════════════
// Google OAuth
// ══════════════════════════════════════════════════════════

// ── Google OAuth: Get authorization URL ─────────────────
router.get('/google', (req: Request, res: Response) => {
  if (!config.google.clientId) {
    return res.status(400).json({
      success: false,
      error: 'Google OAuth not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET.',
    });
  }
  const redirectUri = encodeURIComponent(config.google.redirectUri);
  const scope = encodeURIComponent('openid email profile');
  const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${config.google.clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&prompt=consent`;
  return res.json({ success: true, data: { url } });
});

// ── Google OAuth: Callback ──────────────────────────────
router.post('/google/callback', async (req: Request, res: Response) => {
  const { code } = req.body;
  if (!code) {
    return res.status(400).json({ success: false, error: 'Authorization code is required' });
  }

  try {
    const tokenRes = await axios.post('https://oauth2.googleapis.com/token', {
      code,
      client_id: config.google.clientId,
      client_secret: config.google.clientSecret,
      redirect_uri: config.google.redirectUri,
      grant_type: 'authorization_code',
    });

    const { access_token } = tokenRes.data;
    const userRes = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    const googleUser = userRes.data;
    const result = await authService.googleAuth({
      id: googleUser.id,
      email: googleUser.email,
      name: googleUser.name,
      picture: googleUser.picture,
    });

    return res.json({
      success: true,
      data: {
        user: result.user,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      },
      message: 'تم تسجيل الدخول بنجاح عبر Google',
    });
  } catch (error: any) {
    logger.error('Google OAuth failed', { error: error.message });
    return res.status(400).json({ success: false, error: 'فشل تسجيل الدخول عبر Google' });
  }
});

// ══════════════════════════════════════════════════════════
// Credits & Tokens
// ══════════════════════════════════════════════════════════

router.get('/credits/balance', authenticate, async (req: Request, res: Response) => {
  try {
    const balance = await creditsService.getBalance(req.user!.userId);
    res.json({ success: true, data: { balance } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'فشل جلب الرصيد' });
  }
});

router.get('/credits/stats', authenticate, async (req: Request, res: Response) => {
  try {
    const stats = await creditsService.getStats(req.user!.userId);
    res.json({ success: true, data: stats });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'فشل جلب الإحصائيات' });
  }
});

router.get('/credits/transactions', authenticate, async (req: Request, res: Response) => {
  try {
    const transactions = await creditsService.getTransactions(req.user!.userId);
    res.json({ success: true, data: transactions });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'فشل جلب المعاملات' });
  }
});

router.post('/credits/purchase', authenticate, async (req: Request, res: Response) => {
  const { amount } = req.body;
  if (!amount || amount < 1) {
    return res.status(400).json({ success: false, error: 'الكمية يجب أن تكون 1 على الأقل' });
  }
  try {
    const newBalance = await creditsService.addCredits(
      req.user!.userId,
      amount,
      'purchase',
      `شراء ${amount} توكن`
    );
    return res.json({ success: true, data: { balance: newBalance }, message: `تم شحن ${amount} توكن بنجاح` });
  } catch (error: any) {
    return res.status(400).json({ success: false, error: error.message });
  }
});

// TEMP: Delete user by email (remove after use)
router.post('/reset-user', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, error: 'Email is required' });
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });
    await prisma.user.delete({ where: { id: user.id } });
    return res.json({ success: true, message: `User ${email} deleted` });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
