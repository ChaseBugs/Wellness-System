import type { PageQuery } from "../../../../utils/pagination.js";

export const CARE_LOG_TYPES = ["feeding", "sleep", "diaper"] as const;
export type CareLogType = (typeof CARE_LOG_TYPES)[number];

/**
 * `details` by type — feeding: { method: "breast" | "bottle" | "solid", side?, amountMl?, food? };
 * sleep: { location? }; diaper: { kind: "wet" | "dirty" | "mixed" }.
 */
export interface CareLog {
  id: string;
  childId: string;
  logType: CareLogType;
  startedAt: Date;
  endedAt: Date | null;
  details: Record<string, unknown>;
  notes: string | null;
  recordedBy: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCareLogInput {
  logType: CareLogType;
  startedAt: string;
  endedAt?: string;
  details?: Record<string, unknown>;
  notes?: string;
}

export type UpdateCareLogInput = Partial<Omit<CreateCareLogInput, "logType">>;

export interface CareLogQuery extends PageQuery {
  logType?: CareLogType;
  from?: string;
  to?: string;
}

export interface CareLogResponse {
  id: string;
  logType: CareLogType;
  startedAt: Date;
  endedAt: Date | null;
  durationMinutes: number | null;
  details: Record<string, unknown>;
  notes: string | null;
}

export interface CareDaySummaryResponse {
  date: string;
  feedings: number;
  feedingMl: number;
  sleepMinutes: number;
  diapers: number;
}
