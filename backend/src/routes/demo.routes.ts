import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth';
import { demoDataService } from '../services/demoData.service';

const router = Router();

// Trigger demo data seeding for the authenticated user
router.post('/seed', authenticate, async (req: Request, res: Response) => {
  try {
    const result = await demoDataService.seedForUser(req.user!.userId);
    res.json({ success: true, ...result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'فشلت إضافة البيانات التجريبية' });
  }
});

export default router;
