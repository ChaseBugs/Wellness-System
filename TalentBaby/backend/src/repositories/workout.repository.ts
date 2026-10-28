import { prisma } from '../config/prisma';

export interface Workout {
  id: number;
  title: string;
  description: string;
  trimester: number; // 1, 2, or 3
  duration_minutes: number;
  difficulty_level: string; // 'beginner', 'intermediate', 'advanced'
  video_url?: string;
  thumbnail_url?: string;
  instructions: string;
  benefits: string[];
  precautions: string[];
  created_at: Date;
  updated_at: Date;
}

export class WorkoutRepository {
  async findByTrimester(trimester: number): Promise<Workout[]> {
    const rows = await prisma.pregnancy_workouts.findMany({
      where: { trimester },
      orderBy: { title: 'asc' },
    });
    return rows as unknown as Workout[];
  }

  async findAll(): Promise<Workout[]> {
    const rows = await prisma.pregnancy_workouts.findMany({
      orderBy: [{ trimester: 'asc' }, { title: 'asc' }],
    });
    return rows as unknown as Workout[];
  }

  async findById(id: number): Promise<Workout | null> {
    const row = await prisma.pregnancy_workouts.findUnique({ where: { id } });
    return row as unknown as Workout | null;
  }

  async create(workoutData: Partial<Workout>): Promise<Workout> {
    const row = await prisma.pregnancy_workouts.create({
      data: {
        title: workoutData.title!,
        description: workoutData.description ?? null,
        trimester: workoutData.trimester!,
        duration_minutes: workoutData.duration_minutes ?? null,
        difficulty_level: workoutData.difficulty_level ?? null,
        video_url: workoutData.video_url ?? null,
        thumbnail_url: workoutData.thumbnail_url ?? null,
        instructions: workoutData.instructions ?? null,
        benefits: workoutData.benefits ?? [],
        precautions: workoutData.precautions ?? [],
      },
    });
    return row as unknown as Workout;
  }
}
