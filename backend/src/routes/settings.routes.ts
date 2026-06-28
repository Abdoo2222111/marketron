import { Router, Request, Response } from 'express';
import { settingsController } from '../controllers/settings.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { z } from 'zod';
import { aiProviderService } from '../services/aiProvider.service';

const router = Router();
router.use(authenticate);

// Validation schemas
const updateProfileSchema = z.object({
  name: z.string().min(2, 'الاسم قصير جداً').optional(),
  phone: z.string().optional(),
  company: z.string().optional(),
  avatar: z.string().url('رابط الصورة غير صالح').optional(),
  settings: z.record(z.any()).optional(),
});

const aiProviderSchema = z.object({
  apiKey: z.string().min(1, 'مفتاح API مطلوب'),
  baseUrl: z.string().optional(),
  defaultModel: z.string().optional(),
  isActive: z.boolean().optional(),
});

// بيانات الفوترة
router.get('/billing', settingsController.getBilling.bind(settingsController));

// قائمة الفواتير
router.get('/invoices', settingsController.getInvoices.bind(settingsController));

// إعدادات الفريق
router.get('/team', settingsController.getTeamSettings.bind(settingsController));

// تحديث الملف الشخصي
router.put('/profile', validate(updateProfileSchema), settingsController.updateProfile.bind(settingsController));

// ── AI Provider Settings ──────────────────────────────
router.get('/ai-providers', async (req: Request, res: Response) => {
  try {
    const configs = await aiProviderService.getProviderConfigs(req.user!.userId);
    res.json({ success: true, data: configs });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.put('/ai-providers/:provider', validate(aiProviderSchema), async (req: Request, res: Response) => {
  try {
    const result = await aiProviderService.upsertProviderConfig(req.user!.userId, req.params.provider, req.body);
    res.json({ success: true, data: result, message: 'تم حفظ الإعدادات' });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.delete('/ai-providers/:provider', async (req: Request, res: Response) => {
  try {
    await aiProviderService.deleteProviderConfig(req.user!.userId, req.params.provider);
    res.json({ success: true, message: 'تم حذف الإعدادات' });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

export default router;
