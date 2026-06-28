import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth';
import { apiKeyVaultService } from '../services/apiKeyVault.service';

const router = Router();
router.use(authenticate);

router.get('/', async (req: Request, res: Response) => {
  try {
    const keys = await apiKeyVaultService.list(req.user!.userId, (req as any).orgId);
    return res.json({ success: true, data: keys });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message || 'فشل جلب المفاتيح' });
  }
});

router.put('/:provider', async (req: Request, res: Response) => {
  try {
    const { apiKey, baseUrl, defaultModel, label, isDefaultForType } = req.body;
    if (!apiKey) return res.status(400).json({ success: false, error: 'apiKey مطلوب' });
    const record = await apiKeyVaultService.upsert({
      provider: req.params.provider as any,
      apiKey,
      baseUrl,
      defaultModel,
      label,
      isDefaultForType,
      userId: req.user!.userId,
      orgId: (req as any).orgId,
    });
    return res.json({ success: true, data: record });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message || 'فشل حفظ المفتاح' });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const deleted = await apiKeyVaultService.delete(req.params.id, req.user!.userId);
    if (!deleted) return res.status(404).json({ success: false, error: 'المفتاح غير موجود' });
    return res.json({ success: true, message: 'تم حذف المفتاح' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message || 'فشل حذف المفتاح' });
  }
});

router.post('/test', async (req: Request, res: Response) => {
  try {
    const { provider, apiKey, baseUrl } = req.body;
    if (!provider || !apiKey) return res.status(400).json({ success: false, error: 'provider و apiKey مطلوبان' });
    const result = await apiKeyVaultService.test(provider, apiKey, baseUrl);
    return res.json({ success: true, data: result });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message || 'فشل اختبار المفتاح' });
  }
});

export default router;
