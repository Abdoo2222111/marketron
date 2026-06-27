import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth';
import prisma from '../config/database';
import { aiBrainService } from '../services/aiBrain.service';

const router = Router();

router.use(authenticate);

router.post('/chat', async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user!.userId } });
    if (!user?.organizationId) return void res.status(400).json({ success: false, error: 'الرجاء إنشاء مؤسسة أولاً' });

    const { message, history } = req.body;
    if (!message) return void res.status(400).json({ success: false, error: 'الرسالة مطلوبة' });

    const result = await aiBrainService.sandboxReply(user.organizationId, message, history || []);
    res.json({ success: true, data: result });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message });
  }
});

router.post('/campaign-draft', async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user!.userId } });
    if (!user?.organizationId) return void res.status(400).json({ success: false, error: 'الرجاء إنشاء مؤسسة أولاً' });

    const { brief } = req.body;
    if (!brief) return void res.status(400).json({ success: false, error: 'ملخص الحملة مطلوب' });

    const draft = await aiBrainService.generateCampaignDraft(user.organizationId, brief);
    res.json({ success: true, data: draft });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message });
  }
});

router.post('/enrich', async (req: Request, res: Response) => {
  try {
    const { url } = req.body;
    if (!url) return void res.status(400).json({ success: false, error: 'الرابط مطلوب' });

    const result = await aiBrainService.autoEnrichBusinessProfile(url);
    res.json({ success: true, data: result, message: result ? 'تم استخراج البيانات' : 'تعذر استخراج البيانات' });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message });
  }
});

export default router;
