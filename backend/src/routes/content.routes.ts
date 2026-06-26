import { Router } from 'express';
import { contentController } from '../controllers/content.controller';
import { authenticate } from '../middleware/auth';
import { uploadSingle } from '../middleware/multerUpload';

const router = Router();

router.use(authenticate);

router.get('/', contentController.list.bind(contentController));
router.post('/', uploadSingle, contentController.create.bind(contentController));
router.post('/generate', contentController.generate.bind(contentController));
router.get('/:id', contentController.getById.bind(contentController));
router.delete('/:id', contentController.delete.bind(contentController));

export default router;
