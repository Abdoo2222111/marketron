import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth';
import prisma from '../config/database';
import { organizationService } from '../services/organization.service';
import { aiBrainService } from '../services/aiBrain.service';

const router = Router();

router.use(authenticate);

router.post('/start', async (req: Request, res: Response) => {
  try {
    const { name, domainSlug, industry, productsServices, sourceUrl } = req.body;
    const user = await prisma.user.findUnique({ where: { id: req.user!.userId } });
    if (!user) return void res.status(404).json({ success: false, error: 'المستخدم غير موجود' });

    if (user.organizationId) {
      return void res.json({ success: true, data: { organizationId: user.organizationId, existing: true }, message: 'لديك مؤسسة بالفعل' });
    }

    const org = await organizationService.create({ name: name || user.company || 'نشاطي التجاري', domainSlug, mode: 'client' });

    if (industry || productsServices) {
      await organizationService.updateBusinessProfile(org.id, { industry, productsServices, sourceUrl, enrichedByAi: false });
    }

    if (sourceUrl) {
      const enrichment = await aiBrainService.autoEnrichBusinessProfile(sourceUrl);
      if (enrichment) {
        await organizationService.updateBusinessProfile(org.id, { ...enrichment, sourceUrl, enrichedByAi: true, productsServices: JSON.stringify(enrichment.productsServices || []) });
      }
    }

    await prisma.user.update({ where: { id: user.id }, data: { organizationId: org.id } });

    res.status(201).json({ success: true, data: { organizationId: org.id }, message: 'تم إنشاء المؤسسة' });
  } catch (e: any) {
    res.status(400).json({ success: false, error: e.message });
  }
});

router.post('/step-2', async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user!.userId } });
    if (!user?.organizationId) return void res.status(400).json({ success: false, error: 'الرجاء إكمال الخطوة الأولى أولاً' });

    const { productsServices, priceRange, targetAudience, toneOfVoice, faqs } = req.body;
    await organizationService.updateBusinessProfile(user.organizationId, {
      productsServices: JSON.stringify(productsServices || []),
      priceRange,
      targetAudience: JSON.stringify(targetAudience || {}),
      toneOfVoice,
      faqs: JSON.stringify(faqs || []),
    });

    res.json({ success: true, data: { organizationId: user.organizationId }, message: 'تم حفظ بيانات النشاط' });
  } catch (e: any) {
    res.status(400).json({ success: false, error: e.message });
  }
});

router.post('/step-3', async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user!.userId } });
    if (!user?.organizationId) return void res.status(400).json({ success: false, error: 'الرجاء إكمال الخطوات السابقة' });

    const { sourceUrl } = req.body;
    if (!sourceUrl) return void res.json({ success: true, data: null, message: 'لم يتم توفير رابط' });

    const enrichment = await aiBrainService.autoEnrichBusinessProfile(sourceUrl);
    if (enrichment) {
      await organizationService.updateBusinessProfile(user.organizationId, { ...enrichment, sourceUrl, enrichedByAi: true, productsServices: JSON.stringify(enrichment.productsServices || []) });
    }

    res.json({ success: true, data: enrichment, message: enrichment ? 'تم استخراج البيانات' : 'تعذر استخراج البيانات' });
  } catch (e: any) {
    res.status(400).json({ success: false, error: e.message });
  }
});

router.post('/step-4', async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user!.userId } });
    if (!user?.organizationId) return void res.status(400).json({ success: false, error: 'الرجاء إكمال الخطوات السابقة' });

    const { agentName, greetingMessage, activeMode } = req.body;
    await organizationService.updatePersonaConfig(user.organizationId, { agentName, greetingMessage, activeMode });

    const context = await aiBrainService.buildBusinessContext(user.organizationId);

    res.json({ success: true, data: { context, organizationId: user.organizationId }, message: 'تم تفعيل الوكيل الذكي' });
  } catch (e: any) {
    res.status(400).json({ success: false, error: e.message });
  }
});

router.get('/status', async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      include: { organization: { include: { businessProfile: true, personaConfig: true } } },
    });
    if (!user) return void res.status(404).json({ success: false, error: 'المستخدم غير موجود' });

    const steps = {
      step1: !!user.organizationId,
      step2: !!(user.organization?.businessProfile?.productsServices && user.organization.businessProfile.productsServices !== '[]'),
      step3: !!(user.organization?.businessProfile?.enrichedByAi),
      step4: !!(user.organization?.personaConfig?.agentName),
    };

    res.json({ success: true, data: { organization: user.organization, steps, completed: Object.values(steps).every(Boolean) } });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message });
  }
});

export default router;
