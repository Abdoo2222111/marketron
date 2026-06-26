import { Router } from 'express';
import { campaignController } from '../controllers/campaign.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// All campaign routes require authentication
router.use(authenticate);

router.get('/stats', campaignController.getStats.bind(campaignController));
router.get('/', campaignController.list.bind(campaignController));
router.post('/', campaignController.create.bind(campaignController));
router.get('/:id', campaignController.getById.bind(campaignController));
router.put('/:id', campaignController.update.bind(campaignController));
router.delete('/:id', campaignController.delete.bind(campaignController));
router.post('/:id/duplicate', campaignController.duplicate.bind(campaignController));
router.post('/:id/pause', campaignController.pause.bind(campaignController));
router.post('/:id/activate', campaignController.activate.bind(campaignController));
router.get('/:id/insights', campaignController.getInsights.bind(campaignController));

export default router;
