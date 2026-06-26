import { Router } from 'express';
import { marketResearchController } from '../controllers/marketResearch.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.post('/analyze', marketResearchController.analyze.bind(marketResearchController));
router.get('/reports', marketResearchController.getReports.bind(marketResearchController));
router.get('/reports/:id', marketResearchController.getReportById.bind(marketResearchController));
router.delete('/reports/:id', marketResearchController.deleteReport.bind(marketResearchController));

export default router;
