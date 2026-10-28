import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { WorkoutService } from '../services/workout.service';

export class WorkoutController {
  private workoutService: WorkoutService;

  constructor() {
    this.workoutService = new WorkoutService();
  }

  async getWorkoutsByTrimester(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const trimester = parseInt(req.params.trimester, 10);
      const workouts = await this.workoutService.getWorkoutsByTrimester(trimester);

      res.status(200).json({
        message: 'Workouts retrieved successfully',
        data: workouts,
      });
    } catch (error) {
      next(error);
    }
  }

  async getAllWorkouts(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const workouts = await this.workoutService.getAllWorkouts();

      res.status(200).json({
        message: 'All workouts retrieved successfully',
        data: workouts,
      });
    } catch (error) {
      next(error);
    }
  }

  async getWorkout(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      const workout = await this.workoutService.getWorkout(id);

      res.status(200).json({
        message: 'Workout retrieved successfully',
        data: workout,
      });
    } catch (error) {
      next(error);
    }
  }
}
