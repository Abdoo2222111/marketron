import { Router, Request, Response } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { seed } from '../services/seed.service';

const router = Router();

router.post('/', authenticate, authorize('admin'), async (_req: Request, res: Response) => {
  try {
    await seed();
    res.json({ success: true, message: 'Database seeded successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Seed failed' });
  }
});

export default router;
