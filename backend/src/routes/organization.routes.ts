import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth';
import { organizationService } from '../services/organization.service';

const router = Router();

router.use(authenticate);

router.get('/', async (req: Request, res: Response) => {
  try {
    const orgs = await organizationService.list(req.user!.userId);
    res.json({ success: true, data: orgs });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const org = await organizationService.create(req.body);
    res.status(201).json({ success: true, data: org, message: 'تم إنشاء المؤسسة' });
  } catch (e: any) {
    res.status(400).json({ success: false, error: e.message });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const org = await organizationService.getById(req.params.id);
    res.json({ success: true, data: org });
  } catch (e: any) {
    res.status(404).json({ success: false, error: e.message });
  }
});

router.put('/:id', async (req: Request, res: Response) => {
  try {
    const org = await organizationService.update(req.params.id, req.body);
    res.json({ success: true, data: org, message: 'تم تحديث المؤسسة' });
  } catch (e: any) {
    res.status(400).json({ success: false, error: e.message });
  }
});

// Business Profile
router.get('/:id/business-profile', async (req: Request, res: Response) => {
  try {
    const bp = await organizationService.getBusinessProfile(req.params.id);
    res.json({ success: true, data: bp });
  } catch (e: any) {
    res.status(404).json({ success: false, error: e.message });
  }
});

router.put('/:id/business-profile', async (req: Request, res: Response) => {
  try {
    const bp = await organizationService.updateBusinessProfile(req.params.id, req.body);
    res.json({ success: true, data: bp, message: 'تم تحديث ملف النشاط' });
  } catch (e: any) {
    res.status(400).json({ success: false, error: e.message });
  }
});

// Persona Config
router.get('/:id/persona', async (req: Request, res: Response) => {
  try {
    const pc = await organizationService.getPersonaConfig(req.params.id);
    res.json({ success: true, data: pc });
  } catch (e: any) {
    res.status(404).json({ success: false, error: e.message });
  }
});

router.put('/:id/persona', async (req: Request, res: Response) => {
  try {
    const pc = await organizationService.updatePersonaConfig(req.params.id, req.body);
    res.json({ success: true, data: pc, message: 'تم تحديث إعدادات الشخصية' });
  } catch (e: any) {
    res.status(400).json({ success: false, error: e.message });
  }
});

export default router;
