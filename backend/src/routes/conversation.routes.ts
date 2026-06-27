import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth';
import { conversationService } from '../services/conversation.service';
import { aiBrainService } from '../services/aiBrain.service';

const router = Router();

router.use(authenticate);

router.get('/', async (req: Request, res: Response) => {
  try {
    const { status } = req.query;
    const convs = await conversationService.list(req.user!.userId, status as string);
    res.json({ success: true, data: convs });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const conv = await conversationService.getById(req.params.id, req.user!.userId);
    res.json({ success: true, data: conv });
  } catch (e: any) {
    res.status(404).json({ success: false, error: e.message });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const result = await conversationService.createMessage(req.user!.userId, req.body);
    res.status(201).json({ success: true, data: result });
  } catch (e: any) {
    res.status(400).json({ success: false, error: e.message });
  }
});

router.post('/:id/ai-reply', async (req: Request, res: Response) => {
  try {
    const result = await conversationService.generateAiReply(req.params.id, req.user!.userId);
    res.json({ success: true, data: result });
  } catch (e: any) {
    res.status(400).json({ success: false, error: e.message });
  }
});

router.post('/:id/resolve', async (req: Request, res: Response) => {
  try {
    const conv = await conversationService.resolve(req.params.id, req.user!.userId);
    res.json({ success: true, data: conv, message: 'تم إنهاء المحادثة' });
  } catch (e: any) {
    res.status(404).json({ success: false, error: e.message });
  }
});

export default router;
