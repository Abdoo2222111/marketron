import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth';
import { aiAgentService } from '../services/aiAgent.service';
import { validate } from '../middleware/validate';
import { z } from 'zod';

const router = Router();

const createAgentSchema = z.object({
  name: z.string().min(1, 'اسم الوكيل مطلوب'),
  type: z.string().min(1, 'نوع الوكيل مطلوب'),
  description: z.string().optional(),
  systemPrompt: z.string().optional(),
  temperature: z.number().min(0).max(2).optional(),
  maxTokens: z.number().min(100).max(8000).optional(),
});

const sendMessageSchema = z.object({
  content: z.string().min(1, 'نص الرسالة مطلوب'),
});

const createRuleSchema = z.object({
  name: z.string().min(1, 'اسم القاعدة مطلوب'),
  platform: z.enum(['whatsapp', 'messenger', 'instagram']).optional(),
  triggerType: z.enum(['keyword', 'sentiment', 'all']),
  triggerValue: z.string().optional(),
  responseTemplate: z.string().optional(),
  useAi: z.boolean().default(true),
  aiPrompt: z.string().optional(),
  agentId: z.string().optional(),
});

router.get('/types', (_req: Request, res: Response) => {
  try {
    const types = aiAgentService.getAgentTypes();
    res.json({ success: true, data: types });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'فشل جلب أنواع الوكلاء' });
  }
});

router.post('/', authenticate, validate(createAgentSchema), async (req: Request, res: Response) => {
  try {
    const agent = await aiAgentService.createAgent(req.user!.userId, req.body);
    res.status(201).json({ success: true, data: agent });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'فشل إنشاء الوكيل' });
  }
});

router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const agents = await aiAgentService.listAgents(req.user!.userId);
    res.json({ success: true, data: agents });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'فشل جلب الوكلاء' });
  }
});

router.get('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const agent = await aiAgentService.getAgent(req.user!.userId, req.params.id);
    res.json({ success: true, data: agent });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'فشل جلب الوكيل' });
  }
});

router.put('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const agent = await aiAgentService.updateAgent(req.user!.userId, req.params.id, req.body);
    res.json({ success: true, data: agent });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'فشل تحديث الوكيل' });
  }
});

router.delete('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const result = await aiAgentService.deleteAgent(req.user!.userId, req.params.id);
    res.json({ success: true, ...result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'فشل حذف الوكيل' });
  }
});

router.post('/:id/chat', authenticate, validate(sendMessageSchema), async (req: Request, res: Response) => {
  try {
    const result = await aiAgentService.sendMessage(req.user!.userId, req.params.id, req.body.content);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'فشل إرسال الرسالة' });
  }
});

router.get('/:id/conversation', authenticate, async (req: Request, res: Response) => {
  try {
    const conversation = await aiAgentService.getConversation(req.user!.userId, req.params.id);
    res.json({ success: true, ...conversation });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'فشل جلب المحادثة' });
  }
});

router.delete('/:id/conversation', authenticate, async (req: Request, res: Response) => {
  try {
    const result = await aiAgentService.clearConversation(req.user!.userId, req.params.id);
    res.json({ success: true, ...result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'فشل مسح المحادثة' });
  }
});

router.post('/reply-rules', authenticate, validate(createRuleSchema), async (req: Request, res: Response) => {
  try {
    const rule = await aiAgentService.createReplyRule(req.user!.userId, req.body);
    res.status(201).json({ success: true, data: rule });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'فشل إنشاء القاعدة' });
  }
});

router.get('/reply-rules', authenticate, async (req: Request, res: Response) => {
  try {
    const rules = await aiAgentService.listReplyRules(req.user!.userId);
    res.json({ success: true, data: rules });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'فشل جلب القواعد' });
  }
});

router.put('/reply-rules/:ruleId', authenticate, async (req: Request, res: Response) => {
  try {
    const rule = await aiAgentService.updateReplyRule(req.user!.userId, req.params.ruleId, req.body);
    res.json({ success: true, data: rule });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'فشل تحديث القاعدة' });
  }
});

router.delete('/reply-rules/:ruleId', authenticate, async (req: Request, res: Response) => {
  try {
    const result = await aiAgentService.deleteReplyRule(req.user!.userId, req.params.ruleId);
    res.json({ success: true, ...result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'فشل حذف القاعدة' });
  }
});

export default router;
