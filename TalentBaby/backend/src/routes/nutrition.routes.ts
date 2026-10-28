import { Router } from 'express';
import { NutritionController } from '../controllers/nutrition.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();
const nutritionController = new NutritionController();

router.get('/', authenticate, nutritionController.getAllNutrition.bind(nutritionController));
router.get('/trimester/:trimester', authenticate, nutritionController.getNutritionByTrimester.bind(nutritionController));
router.get('/:id', authenticate, nutritionController.getNutrition.bind(nutritionController));

export default router;
