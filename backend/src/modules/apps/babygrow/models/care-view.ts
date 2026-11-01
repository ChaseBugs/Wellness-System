/**
 * Typed views over babygrow.care_logs for the TalentBaby screens. Feeding, sleep and diaper entries
 * share one table (log_type + details jsonb); these DTOs give each its own fields.
 */
export const FEEDING_TYPES = ["breast", "bottle", "formula", "solid", "pumping"] as const;
export const SLEEP_TYPES = ["nap", "night"] as const;
export const DIAPER_TYPES = ["wet", "dirty", "mixed", "dry"] as const;

export interface FeedingInput {
  feedingType: (typeof FEEDING_TYPES)[number];
  startTime: string;
  endTime?: string;
  amountMl?: number;
  side?: "left" | "right" | "both";
  notes?: string;
}

export interface FeedingResponse {
  id: string;
  childId: string;
  feedingType: string;
  feedingDate: string;
  startTime: Date;
  endTime: Date | null;
  durationMinutes: number | null;
  amountMl: number | null;
  amountOz: number | null;
  side: string | null;
  notes: string | null;
  createdAt: Date;
}

export interface SleepInput {
  sleepType: (typeof SLEEP_TYPES)[number];
  startTime: string;
  endTime?: string;
  qualityRating?: number;
  notes?: string;
}

export interface SleepResponse {
  id: string;
  childId: string;
  sleepType: string;
  startTime: Date;
  endTime: Date | null;
  durationMinutes: number | null;
  qualityRating: number | null;
  notes: string | null;
  createdAt: Date;
}

export interface DiaperInput {
  diaperType: (typeof DIAPER_TYPES)[number];
  changeTime: string;
  notes?: string;
}

export interface DiaperResponse {
  id: string;
  childId: string;
  diaperType: string;
  changeTime: Date;
  notes: string | null;
  createdAt: Date;
}
