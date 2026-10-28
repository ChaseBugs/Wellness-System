import { Router } from 'express';
import { CalculatorController } from '../controllers/calculator.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();
const calculatorController = new CalculatorController();

router.post('/due-date', authenticate, calculatorController.calculateDueDate.bind(calculatorController));
router.post('/ovulation', authenticate, calculatorController.calculateOvulation.bind(calculatorController));
router.post('/weight-gain', authenticate, calculatorController.calculateWeightGain.bind(calculatorController));
router.get('/baby-size/:week', authenticate, calculatorController.getBabySizeComparison.bind(calculatorController));

// Import and add name generator routes
import { NameGeneratorController } from '../controllers/nameGenerator.controller';
const nameGeneratorController = new NameGeneratorController();

router.get('/name-generator', authenticate, nameGeneratorController.generateNames.bind(nameGeneratorController));
router.get('/name-search', authenticate, nameGeneratorController.searchNames.bind(nameGeneratorController));
router.get('/popular-names', authenticate, nameGeneratorController.getPopularNames.bind(nameGeneratorController));

export default router;
