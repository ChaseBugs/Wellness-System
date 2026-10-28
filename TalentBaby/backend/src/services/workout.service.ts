import { WorkoutRepository, Workout } from '../repositories/workout.repository';

export class WorkoutService {
  private workoutRepository: WorkoutRepository;

  constructor() {
    this.workoutRepository = new WorkoutRepository();
  }

  async getWorkoutsByTrimester(trimester: number): Promise<Workout[]> {
    return await this.workoutRepository.findByTrimester(trimester);
  }

  async getAllWorkouts(): Promise<Workout[]> {
    return await this.workoutRepository.findAll();
  }

  async getWorkout(id: number): Promise<Workout> {
    const workout = await this.workoutRepository.findById(id);
    if (!workout) {
      throw new Error('Workout not found');
    }
    return workout;
  }
}
