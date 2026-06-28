import { Router, Request, Response } from 'express';
import { notificationController } from '../controllers/notification.controller';
import { authenticate } from '../middleware/auth';
import { notificationService } from '../services/notification.service';

const router = Router();
router.use(authenticate);

router.get('/', notificationController.list.bind(notificationController));
router.put('/:id/read', notificationController.markAsRead.bind(notificationController));
router.put('/read-all', notificationController.markAllAsRead.bind(notificationController));

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const prisma = (await import('../config/database')).default;
    await prisma.notification.deleteMany({ where: { id: req.params.id, userId: req.user!.userId } });
    return res.json({ success: true, message: 'تم حذف الإشعار' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message || 'فشل حذف الإشعار' });
  }
});

router.delete('/', async (req: Request, res: Response) => {
  try {
    const count = await notificationService.deleteAll(req.user!.userId);
    return res.json({ success: true, message: `تم حذف ${count} إشعار` });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message || 'فشل حذف الإشعارات' });
  }
});

router.post('/test', async (req: Request, res: Response) => {
  try {
    const { type, title, message, link } = req.body;
    const notification = await notificationService.create({
      userId: req.user!.userId,
      title: title || 'إشعار تجريبي',
      message: message || 'هذا إشعار تجريبي من MARKETRON',
      type: type || 'info',
      link,
    });
    return res.json({ success: true, data: notification });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
