import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth';
import { aiRateLimiter } from '../middleware/rateLimiter';
import * as creativeGen from '../services/creativeGeneration.service';

const router = Router();
router.use(authenticate);
router.use(aiRateLimiter);

router.post('/generate-ad', async (req: Request, res: Response) => {
  try {
    const { productDescription, platform, language, tone, targetAudience, objective, provider } = req.body;
    if (!productDescription) {
      res.status(400).json({ success: false, error: 'productDescription is required' });
      return;
    }
    const data = await creativeGen.generateAdCreative(req.user!.userId, {
      productDescription, platform, language, tone, targetAudience, objective, provider,
    });
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/generate-variants', async (req: Request, res: Response) => {
  try {
    const { productDescription, platform, language, count, provider } = req.body;
    if (!productDescription) {
      res.status(400).json({ success: false, error: 'productDescription is required' });
      return;
    }
    const data = await creativeGen.generateAdVariants(req.user!.userId, {
      productDescription, platform, language, count, provider,
    });
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/generate-visual-prompt', async (req: Request, res: Response) => {
  try {
    const { productDescription, style, platform, provider } = req.body;
    if (!productDescription) {
      res.status(400).json({ success: false, error: 'productDescription is required' });
      return;
    }
    const data = await creativeGen.generateVisualPrompt(req.user!.userId, {
      productDescription, style, platform, provider,
    });
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
