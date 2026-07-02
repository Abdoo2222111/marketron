import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);
router.use((req, res, next) => {
  if (req.user?.role !== 'admin') {
    res.status(403).json({ success: false, error: 'Unauthorized: Admin access required' });
    return;
  }
  next();
});

router.post('/', async (_req: Request, res: Response) => {
  try {
    const { seed } = await import('../../prisma/seed');
    await seed();
    res.json({ success: true, message: 'Database seeded successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Seed failed' });
  }
});

export default router;
