import { Router } from 'express';
import { MaterialController } from '../controllers/material.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();
const materialController = new MaterialController();

router.get('/', authenticate, materialController.getMaterials.bind(materialController));
router.get('/baby/:babyId/recommendations', authenticate, materialController.getRecommendations.bind(materialController));

export default router;
