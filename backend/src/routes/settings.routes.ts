import { Router } from 'express';
import { settingsController } from '../controllers/settings.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { z } from 'zod';

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

// بيانات الفوترة
router.get('/billing', settingsController.getBilling.bind(settingsController));

// قائمة الفواتير
router.get('/invoices', settingsController.getInvoices.bind(settingsController));

// إعدادات الفريق
router.get('/team', settingsController.getTeamSettings.bind(settingsController));

// تحديث الملف الشخصي
router.put('/profile', validate(updateProfileSchema), settingsController.updateProfile.bind(settingsController));

export default router;
