import type { HeightAdminStats } from "../models/height-admin.js";

export interface IHeightAdminStatsRepository {
  totals(): Promise<HeightAdminStats["totals"]>;
  latestLogs(limit: number): Promise<HeightAdminStats["latestLogs"]>;
  /** One row per day that has logs, oldest first. */
  logsPerDay(days: number): Promise<Array<{ day: string; entries: number; workoutMinutes: number; averageSleepHours: number | null }>>;
}
