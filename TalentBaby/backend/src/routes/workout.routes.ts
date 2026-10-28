import { Router } from 'express';
import { WorkoutController } from '../controllers/workout.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();
const workoutController = new WorkoutController();

router.get('/', authenticate, workoutController.getAllWorkouts.bind(workoutController));
router.get('/trimester/:trimester', authenticate, workoutController.getWorkoutsByTrimester.bind(workoutController));
router.get('/:id', authenticate, workoutController.getWorkout.bind(workoutController));

export default router;
