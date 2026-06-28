import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth';
import { aiRateLimiter } from '../middleware/rateLimiter';
import { engineRouter } from '../integrations/engine-router';
import type { SectionType } from '../integrations/persona-injector';

const router = Router();
router.use(authenticate);
router.use(aiRateLimiter);

router.post('/generate', async (req: Request, res: Response) => {
  try {
    const { section, prompt, type, model, temperature, maxTokens, size, extraParams } = req.body;
    if (!prompt || !section || !type) {
      return res.status(400).json({ success: false, error: 'prompt, section, type مطلوبة' });
    }
    const result = await engineRouter.route({
      section: section as SectionType,
      prompt,
      type,
      model,
      temperature,
      maxTokens,
      size,
      userId: req.user!.userId,
      orgId: (req as any).orgId,
      extraParams,
    });
    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message || 'فشل التوليد' });
  }
});

export default router;
