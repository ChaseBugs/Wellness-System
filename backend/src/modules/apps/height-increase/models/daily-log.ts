export const MOODS = ["great", "good", "okay", "tired", "bad"] as const;
export const GOAL_TYPES = ["height", "weight", "workout", "sleep", "custom"] as const;
export const GOAL_STATUSES = ["active", "completed", "cancelled"] as const;

export interface CompletedExercise {
  exerciseId?: string;
  title?: string;
  durationSeconds?: number;
  calories?: number;
}

export interface DailyLog {
  id: string;
  userId: string;
  logDate: string;
  heightCm: number | null;
  weightKg: number | null;
  sleepHours: number | null;
  waterGlasses: number | null;
  mood: (typeof MOODS)[number] | null;
  workoutMinutes: number;
  completedExercises: CompletedExercise[];
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/** One log per day: saving the same date again updates the fields sent. */
export interface UpsertDailyLogInput {
  date: string;
  heightCm?: number | null;
  weightKg?: number | null;
  sleepHours?: number | null;
  waterGlasses?: number | null;
  mood?: DailyLog["mood"];
  workoutMinutes?: number;
  completedExercises?: CompletedExercise[];
  notes?: string | null;
}

export interface DailyLogResponse {
  id: string;
  date: string;
  heightCm: number | null;
  weightKg: number | null;
  sleepHours: number | null;
  waterGlasses: number | null;
  mood: DailyLog["mood"];
  workoutMinutes: number;
  completedExercises: CompletedExercise[];
  notes: string | null;
}

export interface ReportResponse {
  summary: {
    workoutMinutes: number;
    averageSleepHours: number;
    streakDays: number;
    currentHeightCm: number | null;
    targetHeightCm: number | null;
  };
  logs: DailyLogResponse[];
}

export interface Goal {
  id: string;
  userId: string;
  title: string;
  goalType: (typeof GOAL_TYPES)[number];
  targetValue: number | null;
  currentValue: number;
  unit: string | null;
  startsAt: Date | null;
  dueAt: Date | null;
  status: (typeof GOAL_STATUSES)[number];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateGoalInput {
  title: string;
  type?: Goal["goalType"];
  targetValue?: number | null;
  currentValue?: number;
  unit?: string | null;
  startsAt?: string | null;
  dueAt?: string | null;
}

export type UpdateGoalInput = Partial<CreateGoalInput> & { status?: Goal["status"] };

export interface GoalResponse {
  id: string;
  title: string;
  type: Goal["goalType"];
  targetValue: number | null;
  currentValue: number;
  unit: string | null;
  startsAt: Date | null;
  dueAt: Date | null;
  status: Goal["status"];
}
