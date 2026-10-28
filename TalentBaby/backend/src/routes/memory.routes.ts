import { Router } from 'express';
import { MemoryController } from '../controllers/memory.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();
const memoryController = new MemoryController();

router.get('/baby/:babyId', authenticate, memoryController.getMemories.bind(memoryController));
router.get('/baby/:babyId/timeline', authenticate, memoryController.getTimeline.bind(memoryController));
router.post('/', authenticate, memoryController.createMemory.bind(memoryController));
router.get('/:id', authenticate, memoryController.getMemory.bind(memoryController));
router.put('/:id', authenticate, memoryController.updateMemory.bind(memoryController));
router.delete('/:id', authenticate, memoryController.deleteMemory.bind(memoryController));

export default router;
