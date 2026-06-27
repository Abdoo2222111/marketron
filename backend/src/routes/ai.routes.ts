// @ts-nocheck
import { Router, Request, Response } from 'express';
import { aiController } from '../controllers/ai.controller';
import { authenticate } from '../middleware/auth';
import { aiRateLimiter } from '../middleware/rateLimiter';
import { aiService, PROVIDER_MODELS, type AiProviderName } from '../integrations/aiService';
import { creditsService } from '../services/credits.service';
import prisma from '../config/database';

const router = Router();

// جميع endpoints تتطلب مصادقة + rate limiting خاص بالذكاء الاصطناعي
router.use(authenticate);
router.use(aiRateLimiter);

// ── List available AI providers and models ──────────────
router.get('/providers', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      default: process.env.AI_DEFAULT_PROVIDER || 'openai',
      providers: aiService.getProviderInfo(),
      available: aiService.getAvailableProviders(),
    },
  });
});

// ── Generate text with specific provider/model ──────────
router.post('/generate', async (req: Request, res: Response) => {
  const { prompt, provider, model, systemPrompt, temperature, maxTokens } = req.body;
  if (!prompt) {
    return res.status(400).json({ success: false, error: 'prompt مطلوب' });
  }

  try {
    // Deduct credits BEFORE generating
    await creditsService.spendForAi(req.user!.userId, `AI generation via ${provider || 'default'}`);

    const result = await aiService.generateText(prompt, {
      provider: provider as AiProviderName,
      model,
      systemPrompt,
      temperature,
      maxTokens,
    });

    // Store the generation in DB
    await prisma.aiGeneration.create({
      data: {
        userId: req.user!.userId,
        type: 'text_generation',
        inputData: JSON.stringify({ prompt, provider: result.provider, model: result.model }),
        outputData: result.text,
        modelUsed: result.model,
        tokensUsed: result.tokensUsed,
      },
    });

    return res.json({
      success: true,
      data: {
        text: result.text,
        provider: result.provider,
        model: result.model,
        tokensUsed: result.tokensUsed,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// ── Get AI generation history ───────────────────────────
router.get('/history', async (req: Request, res: Response) => {
  try {
    const generations = await prisma.aiGeneration.findMany({
      where: { userId: req.user!.userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    res.json({ success: true, data: generations });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'فشل جلب السجل' });
  }
});

// توليد نصوص إعلانية
router.post('/generate-text', aiController.generateText.bind(aiController));

// توليد صور إعلانية (أوصاف)
router.post('/generate-image', aiController.generateImage.bind(aiController));

// تحليل أداء حملة
router.post('/analyze-campaign', aiController.analyzeCampaign.bind(aiController));

// تقديم توصيات للتحسين
router.post('/recommend', aiController.getRecommendations.bind(aiController));

// تحليل "ليه مش بتبيع؟"
router.post('/why-not-selling', aiController.whyNotSelling.bind(aiController));

export default router;

