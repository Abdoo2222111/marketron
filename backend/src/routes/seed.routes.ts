import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

router.post('/', async (_req: Request, res: Response) => {
  try {
    const { seed } = await import('../services/seed.service');
    await seed();
    res.json({ success: true, message: 'Database seeded successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Seed failed' });
  } finally {
    await prisma.$disconnect();
  }
});

export default router;
