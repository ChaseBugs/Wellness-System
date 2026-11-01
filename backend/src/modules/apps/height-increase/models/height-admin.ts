/** GET /apps/height-increase/admin/stats: the legacy dashboard payload. */
export interface HeightAdminStats {
  totals: {
    users: number;
    activeUsers: number;
    exercises: number;
    plans: number;
    articles: number;
    logsToday: number;
    notifications: number;
  };
  latestLogs: Array<{
    id: string;
    userEmail: string;
    date: string;
    heightCm: number | null;
    weightKg: number | null;
    workoutMinutes: number;
    sleepHours: number | null;
  }>;
  charts: {
    workoutByDay: Array<{ label: string; entries: number; workoutMinutes: number; averageSleepHours: number }>;
    contentMix: Array<{ label: string; value: number }>;
    users: Array<{ label: string; value: number }>;
  };
}

/** A training-plan exercise as the legacy admin sends it. */
export interface LegacyPlanExercise {
  exercise: string;
  order?: number;
  durationSeconds?: number;
  reps?: number;
  sets?: number;
  restSeconds?: number;
}
