import { Router } from 'express';
import { teamController } from '../controllers/team.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { z } from 'zod';

const router = Router();
router.use(authenticate);

// Validation schemas
const inviteMemberSchema = z.object({
  email: z.string().email('البريد الإلكتروني غير صالح'),
  role: z.enum(['admin', 'editor', 'viewer'], { message: 'الصلاحية غير صالحة' }),
});

const updateRoleSchema = z.object({
  role: z.enum(['admin', 'editor', 'viewer'], { message: 'الصلاحية غير صالحة' }),
});

// بيانات الفريق
router.get('/', teamController.getTeam.bind(teamController));

// دعوة عضو جديد
router.post('/invite', validate(inviteMemberSchema), teamController.invite.bind(teamController));

// إزالة عضو
router.delete('/members/:id', teamController.removeMember.bind(teamController));

// تغيير صلاحية عضو
router.put('/members/:id/role', validate(updateRoleSchema), teamController.updateMemberRole.bind(teamController));

export default router;
