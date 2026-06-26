import { Router } from 'express';
import { notificationController } from '../controllers/notification.controller';
import { authenticate } from '../middleware/auth';

const router = Router();
router.use(authenticate);

// قائمة الإشعارات (مع ترقيم)
router.get('/', notificationController.list.bind(notificationController));

// تحديد إشعار كمقروء
router.put('/:id/read', notificationController.markAsRead.bind(notificationController));

// تحديد جميع الإشعارات كمقروءة
router.put('/read-all', notificationController.markAllAsRead.bind(notificationController));

export default router;
