import type { ActivityLog, CompleteActivityInput, DailyPlanSlot, DifficultyFeedback } from "../models/library.js";

export interface IActivityRepository {
  createLog(childId: string, contentId: string, recordedBy: string, input: CompleteActivityInput): Promise<ActivityLog>;
  /** Updates the child's most recent completion of this activity; null when it was never completed. */
  setLatestDifficulty(childId: string, contentId: string, feedback: DifficultyFeedback): Promise<ActivityLog | null>;
  listLogs(childId: string, limit: number): Promise<ActivityLog[]>;
  /** Completions per activity across all children (adds to the seeded popularity count). */
  completionCounts(contentIds: string[]): Promise<Map<string, number>>;
  findPlan(childId: string, planDate: string): Promise<DailyPlanSlot[]>;
  /** Replaces the day's plan atomically (concurrent generators keep the first complete plan). */
  savePlan(childId: string, planDate: string, slots: Array<{ slot: number; contentId: string }>): Promise<DailyPlanSlot[]>;
  completeSlot(childId: string, planDate: string, slot: number): Promise<DailyPlanSlot | null>;
}
