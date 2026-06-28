import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth';
import { aiRateLimiter } from '../middleware/rateLimiter';
import {
  generateImage,
  generateVideo,
  generateAudio,
  transcribeAudio,
  generateEmbeddings,
  analyzeImage,
  listModels,
} from '../integrations/pollinationsService';

const router = Router();

router.use(authenticate);
router.use(aiRateLimiter);

router.get('/models', async (_req: Request, res: Response) => {
  try {
    const models = await listModels();
    return res.json({ success: true, data: models });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message || 'فشل جلب النماذج' });
  }
});

router.post('/image', async (req: Request, res: Response) => {
  try {
    const { prompt, model, negativePrompt, size, n, quality, style } = req.body;
    if (!prompt) return res.status(400).json({ success: false, error: 'prompt مطلوب' });
    const result = await generateImage({ prompt, model, negativePrompt, size, n, quality, style });
    return res.json({ success: true, data: result });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message || 'فشل توليد الصورة' });
  }
});

router.post('/video', async (req: Request, res: Response) => {
  try {
    const { prompt, model, imageUrl, size } = req.body;
    if (!prompt) return res.status(400).json({ success: false, error: 'prompt مطلوب' });
    const result = await generateVideo({ prompt, model, imageUrl, size });
    return res.json({ success: true, data: result });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message || 'فشل توليد الفيديو' });
  }
});

router.post('/audio', async (req: Request, res: Response) => {
  try {
    const { text, model, voice, format } = req.body;
    if (!text) return res.status(400).json({ success: false, error: 'text مطلوب' });
    const result = await generateAudio({ text, model, voice, format });
    return res.json({ success: true, data: result });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message || 'فشل توليد الصوت' });
  }
});

router.post('/transcribe', async (req: Request, res: Response) => {
  try {
    const { audio, model, language, filename } = req.body;
    if (!audio) return res.status(400).json({ success: false, error: 'audio مطلوب (base64)' });
    const result = await transcribeAudio({ audio, model, language, filename });
    return res.json({ success: true, data: result });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message || 'فشل نسخ الصوت' });
  }
});

router.post('/embeddings', async (req: Request, res: Response) => {
  try {
    const { input, model, dimensions } = req.body;
    if (!input) return res.status(400).json({ success: false, error: 'input مطلوب' });
    const result = await generateEmbeddings({ input, model, dimensions });
    return res.json({ success: true, data: result });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message || 'فشل توليد التضمينات' });
  }
});

router.post('/vision', async (req: Request, res: Response) => {
  try {
    const { imageUrl, prompt, model } = req.body;
    if (!imageUrl) return res.status(400).json({ success: false, error: 'imageUrl مطلوب' });
    const text = await analyzeImage({ imageUrl, prompt, model });
    return res.json({ success: true, data: { text, model: model || 'gemini-3-flash' } });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message || 'فشل تحليل الصورة' });
  }
});

export default router;
