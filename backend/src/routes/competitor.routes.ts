import { Router } from 'express';
import { competitorController } from '../controllers/competitor.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', competitorController.list.bind(competitorController));
router.post('/', competitorController.create.bind(competitorController));
router.post('/compare', competitorController.compare.bind(competitorController));
router.get('/:id', competitorController.getById.bind(competitorController));
router.delete('/:id', competitorController.delete.bind(competitorController));
router.get('/:id/ads', competitorController.getAds.bind(competitorController));

export default router;
