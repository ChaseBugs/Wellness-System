import type { AppCode } from "../../../../config/app-catalog.js";

export type SessionStatus = "in_progress" | "completed" | "abandoned";

export interface Session {
  id: string;
  userId: string;
  appCode: AppCode;
  routineId: string | null;
  status: SessionStatus;
  totalSteps: number;
  completedSteps: number;
  durationSeconds: number | null;
  perceivedEffort: number | null;
  notes: string | null;
  startedAt: Date;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface StartSessionInput {
  routineId: string;
}

export interface CompleteSessionInput {
  completedSteps: number;
  durationSeconds: number;
  perceivedEffort?: number;
  notes?: string;
}

export interface SessionResponse {
  id: string;
  appCode: AppCode;
  routineId: string | null;
  status: SessionStatus;
  totalSteps: number;
  completedSteps: number;
  durationSeconds: number | null;
  perceivedEffort: number | null;
  notes: string | null;
  startedAt: Date;
  completedAt: Date | null;
}

export interface DayActivity {
  date: string;
  sessions: number;
  minutes: number;
}

export interface ProgressResponse {
  appCode: AppCode;
  currentStreakDays: number;
  totalCompletedSessions: number;
  thisWeek: { sessions: number; minutes: number };
  last7Days: DayActivity[];
}
