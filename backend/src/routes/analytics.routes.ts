import { Router } from 'express';
import { analyticsController } from '../controllers/analytics.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/overview', analyticsController.getOverview.bind(analyticsController));
router.get('/audience', analyticsController.getAudience.bind(analyticsController));
router.get('/timing', analyticsController.getTiming.bind(analyticsController));
router.get('/cost', analyticsController.getCost.bind(analyticsController));
router.get('/custom', analyticsController.getCustom.bind(analyticsController));
router.post('/save', analyticsController.saveReport.bind(analyticsController));
router.delete('/:id', analyticsController.deleteReport.bind(analyticsController));
router.get('/export/:id', analyticsController.exportReport.bind(analyticsController));

export default router;
