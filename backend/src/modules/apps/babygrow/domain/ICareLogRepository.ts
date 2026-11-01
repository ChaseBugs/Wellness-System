import type { CareDaySummaryResponse, CareLog, CareLogQuery, CreateCareLogInput, UpdateCareLogInput } from "../models/care-log.js";

export interface ICareLogRepository {
  list(childId: string, query: CareLogQuery): Promise<{ items: CareLog[]; total: number }>;
  create(childId: string, recordedBy: string, input: CreateCareLogInput): Promise<CareLog>;
  update(id: string, childId: string, input: UpdateCareLogInput): Promise<CareLog | null>;
  delete(id: string, childId: string): Promise<boolean>;
  /** Totals for one calendar day in the caregiver's timezone. */
  daySummary(childId: string, date: string, timezone: string): Promise<CareDaySummaryResponse>;
}
