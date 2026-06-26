import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth';
import { workspaceService } from '../services/workspace.service';
import { validate } from '../middleware/validate';
import { z } from 'zod';

const router = Router();

const createWorkspaceSchema = z.object({
  companyName: z.string().min(1, 'اسم الشركة مطلوب'),
  companySize: z.string().optional(),
  industry: z.string().optional(),
  country: z.string().optional(),
  city: z.string().optional(),
  vatNumber: z.string().optional(),
});

const addClientSchema = z.object({
  email: z.string().email('البريد الإلكتروني غير صحيح'),
  name: z.string().min(1, 'اسم العميل مطلوب'),
  role: z.string().optional(),
});

router.post('/', authenticate, validate(createWorkspaceSchema), async (req: Request, res: Response) => {
  try {
    const workspace = await workspaceService.createWorkspace(req.user!.userId, req.body);
    res.status(201).json({ success: true, data: workspace });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'فشل إنشاء مساحة العمل' });
  }
});

router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const workspace = await workspaceService.getWorkspace(req.user!.userId);
    if (!workspace) {
      res.status(404).json({ success: false, error: 'لم يتم إنشاء مساحة عمل بعد' });
      return;
    }
    res.json({ success: true, data: workspace });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'فشل جلب مساحة العمل' });
  }
});

router.put('/', authenticate, async (req: Request, res: Response) => {
  try {
    const workspace = await workspaceService.updateWorkspace(req.user!.userId, req.body);
    res.json({ success: true, data: workspace });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'فشل تحديث مساحة العمل' });
  }
});

router.post('/clients', authenticate, validate(addClientSchema), async (req: Request, res: Response) => {
  try {
    const client = await workspaceService.addClientToWorkspace(req.user!.userId, req.body);
    res.status(201).json({ success: true, data: client });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'فشل إضافة العميل' });
  }
});

router.delete('/clients/:clientId', authenticate, async (req: Request, res: Response) => {
  try {
    const result = await workspaceService.removeClientFromWorkspace(req.user!.userId, req.params.clientId);
    res.json({ success: true, ...result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'فشل إزالة العميل' });
  }
});

router.get('/stats', authenticate, async (req: Request, res: Response) => {
  try {
    const stats = await workspaceService.getWorkspaceStats(req.user!.userId);
    res.json({ success: true, data: stats });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'فشل جلب الإحصائيات' });
  }
});

export default router;
