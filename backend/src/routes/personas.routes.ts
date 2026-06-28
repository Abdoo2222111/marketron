import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth';
import { personaInjector, type SectionType } from '../integrations/persona-injector';

const router = Router();
router.use(authenticate);

router.get('/', async (_req: Request, res: Response) => {
  try {
    const personas = personaInjector.getAllPersonas();
    return res.json({ success: true, data: personas });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message || 'فشل جلب الشخصيات' });
  }
});

router.get('/:section', async (req: Request, res: Response) => {
  try {
    const persona = personaInjector.getPersona(req.params.section as SectionType);
    if (!persona) return res.status(404).json({ success: false, error: 'الشخصية غير موجودة' });
    return res.json({ success: true, data: persona });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message || 'فشل جلب الشخصية' });
  }
});

router.put('/:section', async (req: Request, res: Response) => {
  try {
    const { customPrompt } = req.body;
    const prisma = (await import('../config/database')).default;
    const record = await prisma.personaOverride.upsert({
      where: { section_userId: { section: req.params.section, userId: req.user!.userId } },
      create: { section: req.params.section, customPrompt, userId: req.user!.userId },
      update: { customPrompt },
    });
    return res.json({ success: true, data: record });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message || 'فشل تحديث الشخصية' });
  }
});

router.delete('/:section', async (req: Request, res: Response) => {
  try {
    const prisma = (await import('../config/database')).default;
    await prisma.personaOverride.deleteMany({
      where: { section: req.params.section, userId: req.user!.userId },
    });
    return res.json({ success: true, message: 'تم إعادة الشخصية للافتراضي' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message || 'فشل إعادة الشخصية' });
  }
});

export default router;
