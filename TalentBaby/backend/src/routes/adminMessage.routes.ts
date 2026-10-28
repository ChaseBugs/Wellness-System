import { Router } from 'express';
import { AdminMessageController } from '../controllers/adminMessage.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();
const ctrl = new AdminMessageController();

// Public-ish (authenticated users see published messages)
router.get('/published', authenticate, ctrl.getPublished.bind(ctrl));

// Admin operations
router.get('/',     authenticate, ctrl.getAll.bind(ctrl));
router.get('/:id',  authenticate, ctrl.getById.bind(ctrl));
router.post('/',    authenticate, ctrl.create.bind(ctrl));
router.put('/:id',  authenticate, ctrl.update.bind(ctrl));
router.delete('/:id', authenticate, ctrl.delete.bind(ctrl));

export default router;
