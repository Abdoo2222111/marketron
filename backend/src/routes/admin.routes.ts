import { Router } from 'express';
import { adminController } from '../controllers/admin.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// جميع endpoints تتطلب مصادقة + صلاحية Admin
router.use(authenticate);
router.use((req, res, next) => {
  if (req.user?.role !== 'admin') {
    res.status(403).json({ success: false, error: 'غير مصرح، هذه الصلاحية للمدير فقط' });
    return;
  }
  next();
});

// لوحة تحكم المدير
router.get('/dashboard', adminController.getDashboard.bind(adminController));

// قائمة المستخدمين
router.get('/users', adminController.listUsers.bind(adminController));

// تفاصيل مستخدم
router.get('/users/:id', adminController.getUserById.bind(adminController));

// حظر/إلغاء حظر مستخدم
router.post('/users/:id/toggle-status', adminController.toggleUserStatus.bind(adminController));

// إحصائيات المنصة (مختصرة)
router.get('/stats', adminController.getDashboard.bind(adminController));

export default router;
