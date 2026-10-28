import { Router } from 'express';
import { ChecklistController } from '../controllers/checklist.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();
const checklistController = new ChecklistController();

router.get('/', authenticate, checklistController.getChecklists.bind(checklistController));
router.get('/:id', authenticate, checklistController.getChecklist.bind(checklistController));
router.post('/', authenticate, checklistController.createChecklist.bind(checklistController));
router.put('/:id', authenticate, checklistController.updateChecklist.bind(checklistController));
router.delete('/:id', authenticate, checklistController.deleteChecklist.bind(checklistController));

router.get('/:checklistId/items', authenticate, checklistController.getChecklistItems.bind(checklistController));
router.post('/items', authenticate, checklistController.addChecklistItem.bind(checklistController));
router.put('/items/:itemId', authenticate, checklistController.updateChecklistItem.bind(checklistController));
router.delete('/:checklistId/items/:itemId', authenticate, checklistController.deleteChecklistItem.bind(checklistController));

export default router;
